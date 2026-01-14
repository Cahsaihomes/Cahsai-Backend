

import cron from "node-cron";
import { TourRequest, TourRejection, User } from "../models/tourModel/index.mjs";
import { Op } from "sequelize";
import { emitAgentRotated, emitTourExpired } from "../socket/tourEvents.mjs";

// Helper: Find nearby agents (same area, not already shown)
async function findNearbyAgents(postedAgentId, location, excludedAgentIds = []) {
  try {
    return await User.findAll({
      where: {
        id: { [Op.ne]: postedAgentId, [Op.notIn]: excludedAgentIds },
        role: "agent",
        areasServed: { [Op.like]: `%${location}%` },
      },
      attributes: ['id', 'first_name', 'last_name', 'email'],
      limit: 1,
      raw: true,
    });
  } catch (error) {
    console.error(`❌ Error finding nearby agents for location ${location}:`, error.message);
    return [];
  }
}

// Helper: Notify agent via Socket.IO
function notifyAgent(agentId, tour) {
  emitAgentRotated(agentId, {
    id: tour.id,
    post: tour.post,
    buyer: tour.buyer,
    agent: tour.agent,
    status: tour.status,
    expiredStatus: tour.expiredStatus,
    createdAt: tour.createdAt,
    timeLeft: 15 * 60,
  });
}


cron.schedule("*/5 * * * *", async () => {
  try {
    const expiryTime = new Date(Date.now() - 15 * 60 * 1000);
    console.log("[CRON] Running tour expiry check at", new Date().toISOString());

    // Step 1: Expire old tours
    await TourRequest.update(
      { expiredStatus: "expired" },
      {
        where: {
          createdAt: { [Op.lt]: expiryTime },
          expiredStatus: "active",
        },
      }
    );

    // Step 2: Rotate agents for pending tours (with batch limit to prevent blocking)
    const pendingTours = await TourRequest.findAll({
      where: {
        createdAt: { [Op.lt]: expiryTime },
        expiredStatus: "active",
        status: { [Op.ne]: "confirmed" },
      },
      attributes: [
        "id",
        "postId",
        "buyerId",
        "agentId",
        "date",
        "time",
        "status",
        "bookingStatus",
        "activeLead",
        "timerExpiresAt",
        "expiredStatus",
        "createdAt",
        "updatedAt",
      ],
      raw: true,
      limit: 50, // Process only 50 per cycle to avoid blocking
    }).catch(error => {
      console.error("❌ [CRON] Error fetching pending tours:", error.message);
      return [];
    });

    console.log(`[CRON] Processing ${pendingTours.length} pending tours`);

    for (const tour of pendingTours) {
      try {
        // Step 3: Track agents already shown
        const rejections = await TourRejection.findAll({
          where: { tourRequestId: tour.id },
          attributes: ['agentId'],
          raw: true,
        });
        const shownAgentIds = rejections.map(r => r.agentId);
        if (!shownAgentIds.includes(tour.agentId)) {
          shownAgentIds.push(tour.agentId);
        }

        // Step 4: Find next nearby agent
        const nearbyAgents = await findNearbyAgents(tour.agentId, tour.location, shownAgentIds);
        if (nearbyAgents && nearbyAgents.length > 0) {
          const nextAgent = nearbyAgents[0];
          // Assign next agent using update (not save) for performance
          await TourRequest.update(
            { agentId: nextAgent.id },
            { where: { id: tour.id } }
          );
          // Record rejection for previous agent
          await TourRejection.create({
            tourRequestId: tour.id,
            agentId: tour.agentId,
            reason: "No response/timed out",
          });
          // Step 5: Notify next agent
          notifyAgent(nextAgent.id, tour);
        } else {
          // Step 6: Mark expired and notify
          await TourRequest.update(
            { expiredStatus: "expired" },
            { where: { id: tour.id } }
          );
          emitTourExpired(tour.id, {
            id: tour.id,
            status: tour.status,
            expiredStatus: "expired",
            createdAt: tour.createdAt,
            timeLeft: 0,
          });
        }
      } catch (tourError) {
        console.error(`❌ [CRON] Error processing tour ${tour.id}:`, tourError.message);
      }
    }
    console.log("[CRON] Tour expiry check completed successfully");
  } catch (error) {
    console.error("❌ [CRON] Critical error in tour expiry job:", error.message);
  }
});