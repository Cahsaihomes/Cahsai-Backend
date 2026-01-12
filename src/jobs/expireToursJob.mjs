

import cron from "node-cron";
import { TourRequest, TourRejection, User } from "../models/tourModel/index.mjs";
import { Op } from "sequelize";
import { emitAgentRotated, emitTourExpired } from "../socket/tourEvents.mjs";

// Helper: Find nearby agents (same area, not already shown)
async function findNearbyAgents(postedAgentId, location, excludedAgentIds = []) {
  return await User.findAll({
    where: {
      id: { [Op.ne]: postedAgentId, [Op.notIn]: excludedAgentIds },
      role: "agent",
      areasServed: { [Op.like]: `%${location}%` },
    },
  });
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
  const expiryTime = new Date(Date.now() - 15 * 60 * 1000);

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

  // Step 2: Rotate agents for pending tours
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
  }).catch(error => {
    console.error("❌ Error fetching pending tours:", error.message);
    return [];
  });

  for (const tour of pendingTours) {
    // Step 3: Track agents already shown
    const rejections = await TourRejection.findAll({ where: { tourRequestId: tour.id } });
    const shownAgentIds = rejections.map(r => r.agentId);
    if (!shownAgentIds.includes(tour.agentId)) {
      shownAgentIds.push(tour.agentId);
    }

    // Step 4: Find next nearby agent
    const nearbyAgents = await findNearbyAgents(tour.agentId, tour.location, shownAgentIds);
    if (nearbyAgents.length > 0) {
      const nextAgent = nearbyAgents[0];
      // Assign next agent
      tour.agentId = nextAgent.id;
      await tour.save();
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
      tour.expiredStatus = "expired";
      await tour.save();
      emitTourExpired(tour.id, {
        id: tour.id,
        post: tour.post,
        buyer: tour.buyer,
        agent: tour.agent,
        status: tour.status,
        expiredStatus: "expired",
        createdAt: tour.createdAt,
        timeLeft: 0,
      });
    }
  }
});