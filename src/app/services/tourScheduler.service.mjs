import schedule from "node-schedule";
import { TourRequest, User, Post } from "../../models/tourModel/index.mjs";
import { makeAgentCall, sendSMS, makeBuyerCall } from "../../config/twilio.mjs";
import tourRepo from "../repositories/tour.repo.mjs";

// Store job references for cleanup
const scheduledJobs = new Map();

/**
 * Schedule a tour request flow:
 * 1. Immediately call buyer to confirm the lead
 * 2. After 2 minutes, check if still pending
 * 3. If still pending, call the agent
 * @param {number} tourId - Tour request ID
 * @param {number} agentId - Agent's user ID
 * @returns {void}
 */
export const scheduleTourFollowup = async (tourId, agentId) => {
  try {
    console.log(`\n🔔 [SCHEDULER] Starting tour followup for tour ID: ${tourId}`);
    console.log(`📍 [SCHEDULER] Step 1: Calling buyer immediately...`);
    
    // Step 1: Call buyer immediately for confirmation
    await callBuyerForConfirmation(tourId);
    console.log(`✅ [SCHEDULER] Buyer call initiated for tour ${tourId}`);

    // Step 2: Schedule agent call check after 2 minutes
    console.log(`⏰ [SCHEDULER] Scheduling agent call for 2 minutes from now...`);
    const scheduledTime = new Date(Date.now() + 2 * 60 * 1000);
    console.log(`📅 [SCHEDULER] Agent call scheduled for: ${scheduledTime.toISOString()}`);
    
    const job = schedule.scheduleJob(scheduledTime, async () => {
      try {
        console.log(`\n🔔 [SCHEDULER] 2-minute timer TRIGGERED for tour ${tourId}`);
        await handleTourFollowupCall(tourId, agentId);
      } catch (error) {
        console.error(`❌ [SCHEDULER] Error in scheduled tour followup for tour ${tourId}:`, error);
      }
    });

    if (!job) {
      console.error(`❌ [SCHEDULER] Failed to create schedule job for tour ${tourId}`);
      // Fallback: Schedule agent call in the next iteration
      setTimeout(async () => {
        try {
          console.log(`\n⏰ [SCHEDULER] Fallback: 2-minute timer triggered for tour ${tourId}`);
          await handleTourFollowupCall(tourId, agentId);
        } catch (error) {
          console.error(`❌ [SCHEDULER] Error in fallback agent call for tour ${tourId}:`, error);
        }
      }, 2 * 60 * 1000);
    }

    // Store the job reference for potential cancellation
    scheduledJobs.set(`tour-${tourId}`, job);
    console.log(`✅ [SCHEDULER] Tour flow scheduled: buyer call done, agent call in 2 minutes`);
  } catch (error) {
    console.error(`❌ [SCHEDULER] Error scheduling tour followup:`, error);
  }
};

/**
 * Call buyer to confirm the lead/tour request
 * @param {number} tourId - Tour request ID
 * @returns {Promise<void>}
 */
export const callBuyerForConfirmation = async (tourId) => {
  try {
    console.log(`📞 [SCHEDULER] Fetching tour ${tourId} details...`);
    
    // Fetch tour details - try without includes first if there's an error
    let tour;
    try {
      tour = await TourRequest.findByPk(tourId, {
        include: [
          { model: User, as: "buyer" },
          { model: Post, as: "post" }
        ]
      });
    } catch (err) {
      console.warn(`⚠️  [SCHEDULER] Could not fetch with associations, trying without: ${err.message}`);
      tour = await TourRequest.findByPk(tourId);
    }

    if (!tour) {
      console.error(`❌ [SCHEDULER] Tour ${tourId} not found`);
      return;
    }

    // Get buyer phone
    let buyer = tour.buyer;
    if (!buyer) {
      buyer = await User.findByPk(tour.buyerId);
    }
    
    if (!buyer) {
      console.error(`❌ [SCHEDULER] Buyer ${tour.buyerId} not found`);
      await tourRepo.updateTourRequest(tourId, {
        buyerCallStatus: "no-answer",
        buyerCallTime: new Date(),
      });
      return;
    }

    if (!buyer.contact) {
      console.error(`❌ [SCHEDULER] Buyer ${tour.buyerId} has no phone number (contact field is empty)`);
      await tourRepo.updateTourRequest(tourId, {
        buyerCallStatus: "no-answer",
        buyerCallTime: new Date(),
      });
      return;
    }

    // Get property address for confirmation message
    let post = tour.post;
    if (!post) {
      post = await Post.findByPk(tour.postId);
    }
    const propertyAddress = post?.location || "the property";

    // Get agent details for greeting
    let agent = await User.findByPk(tour.agentId);
    const agentName = agent?.firstName || "an agent";

    console.log(`📞 [SCHEDULER] Calling buyer ${tour.buyerId} (${buyer.contact}) for tour ${tourId}, property: ${propertyAddress}, agent: ${agentName}`);

    // Make the buyer confirmation call
    let buyerCallSid;
    try {
      buyerCallSid = await makeBuyerCall(buyer.contact, tourId, propertyAddress, agentName);
    } catch (callError) {
      console.error(`❌ [SCHEDULER] Failed to create buyer call for tour ${tourId}: ${callError.message}`);
      await tourRepo.updateTourRequest(tourId, {
        buyerCallStatus: "no-answer",
        buyerCallTime: new Date(),
      });
      return;
    }
    
    if (!buyerCallSid) {
      console.error(`❌ [SCHEDULER] No Call SID returned for buyer call`);
      return;
    }

    console.log(`✅ [SCHEDULER] Buyer call created with SID: ${buyerCallSid}`);

    // Update tour with buyer call information
    await tourRepo.updateTourRequest(tourId, {
      buyerCallSid,
      buyerCallStatus: "ringing",
      buyerCallTime: new Date(),
    });

    console.log(`✅ [SCHEDULER] Tour ${tourId} updated with buyer call info`);

    // Check if buyer confirmed within 30 seconds
    setTimeout(async () => {
      try {
        await checkBuyerConfirmation(tourId);
      } catch (error) {
        console.error(`Error checking buyer confirmation for tour ${tourId}:`, error);
      }
    }, 30000); // Check after 30 seconds
  } catch (error) {
    console.error(`❌ [SCHEDULER] Error calling buyer for tour ${tourId}:`, error);
  }
};

/**
 * Check if buyer answered/confirmed the tour
 * @param {number} tourId - Tour request ID
 * @returns {Promise<void>}
 */
export const checkBuyerConfirmation = async (tourId) => {
  try {
    const tour = await TourRequest.findByPk(tourId);
    if (!tour) return;

    // If buyer didn't answer, we'll proceed to agent call anyway at 2 min mark
    if (tour.buyerCallStatus === "ringing" || tour.buyerCallStatus === "no-answer") {
      await tourRepo.updateTourRequest(tourId, {
        buyerCallStatus: "no-answer",
      });
      console.log(`Buyer did not answer for tour ${tourId}, will call agent at 2 minute mark`);
    } else if (tour.buyerCallStatus === "answered") {
      console.log(`Buyer confirmed tour ${tourId}`);
    }
  } catch (error) {
    console.error(`Error checking buyer confirmation:`, error);
  }
};

/**
 * Handle the actual follow-up call to agent
 * @param {number} tourId - Tour request ID
 * @param {number} agentId - Agent's user ID
 * @returns {Promise<void>}
 */
export const handleTourFollowupCall = async (tourId, agentId) => {
  try {
    // Fetch tour details
    const tour = await TourRequest.findByPk(tourId);
    if (!tour) {
      console.error(`❌ [SCHEDULER] Tour ${tourId} not found`);
      return;
    }

    console.log(`📋 [SCHEDULER] Tour ${tourId} status check: agentCallStatus=${tour.agentCallStatus}, status=${tour.status}`);

    // If already claimed by agent (already answered), don't make the call
    // Only skip if agent has ALREADY answered
    if (tour.agentCallStatus === "answered") {
      console.log(`⏭️  [SCHEDULER] Tour ${tourId} agent already answered, skipping agent call`);
      return;
    }

    // Fetch agent details
    const agent = await User.findByPk(agentId);
    if (!agent) {
      console.error(`❌ [SCHEDULER] Agent ${agentId} not found`);
      await tourRepo.updateTourRequest(tourId, {
        resolutionStatus: "unresolved",
        agentCallStatus: "no-answer",
      });
      return;
    }

    if (!agent.contact) {
      console.error(`❌ [SCHEDULER] Agent ${agentId} has no phone number (contact field is empty)`);
      await tourRepo.updateTourRequest(tourId, {
        resolutionStatus: "unresolved",
        agentCallStatus: "no-answer",
      });
      return;
    }

    // Fetch buyer details for call message
    const buyer = await User.findByPk(tour.buyerId);
    const buyerName = buyer?.firstName || "A buyer";

    // Fetch property address for call message
    let post = tour.post;
    if (!post) {
      post = await Post.findByPk(tour.postId);
    }
    const propertyAddress = post?.location || "the property";

    console.log(`📞 [SCHEDULER] Making automatic call to agent ${agentId} (${agent.contact}) for tour ${tourId}, buyer: ${buyerName}, property: ${propertyAddress}`);

    // Make the call with error handling
    let callSid;
    try {
      callSid = await makeAgentCall(agent.contact, tourId, buyerName, propertyAddress);
    } catch (callError) {
      console.error(`❌ [SCHEDULER] Failed to create agent call for tour ${tourId}: ${callError.message}`);
      await tourRepo.updateTourRequest(tourId, {
        resolutionStatus: "unresolved",
        agentCallStatus: "no-answer",
      });
      return;
    }

    if (!callSid) {
      console.error(`❌ [SCHEDULER] No Call SID returned for agent call`);
      return;
    }

    // Update tour with call information
    await tourRepo.updateTourRequest(tourId, {
      callSid,
      agentCallStatus: "ringing",
      agentCallTime: new Date(),
      status: "Awaiting Call",
    });

    console.log(`✅ [SCHEDULER] Agent call initiated for tour ${tourId}, Call SID: ${callSid}`);

    // Set a timeout for call completion (after 60 seconds, check status)
    // If not answered, mark as voicemail/no-answer
    setTimeout(async () => {
      try {
        await checkCallCompletion(tourId, callSid, agentId);
      } catch (error) {
        console.error(`Error checking call completion for tour ${tourId}:`, error);
      }
    }, 60000); // Check after 60 seconds
  } catch (error) {
    console.error(`❌ [SCHEDULER] Error handling tour followup call for tour ${tourId}:`, error.message);
    // Mark as unresolved if something goes wrong
    try {
      await tourRepo.updateTourRequest(tourId, {
        resolutionStatus: "unresolved",
      });
    } catch (updateError) {
      console.error(`Error updating tour ${tourId}:`, updateError);
    }
  }
};

/**
 * Check if the call was answered and update status accordingly
 * @param {number} tourId - Tour request ID
 * @param {string} callSid - Twilio Call SID
 * @param {number} agentId - Agent's user ID
 * @returns {Promise<void>}
 */
export const checkCallCompletion = async (tourId, callSid, agentId) => {
  try {
    // Note: In production, use Twilio's API to check actual call status
    // For now, we'll rely on the webhook callbacks
    console.log(`Checking call completion for tour ${tourId}`);

    const tour = await TourRequest.findByPk(tourId);
    if (!tour) return;

    // If still pending after the call, mark as voicemail left
    if (tour.agentCallStatus === "ringing" || tour.agentCallStatus === "no-answer") {
      await tourRepo.updateTourRequest(tourId, {
        agentCallStatus: "voicemail",
        voicemailLeft: true,
        resolutionStatus: "unresolved",
      });

      // Optionally send SMS to agent about the missed call
      const agent = await User.findByPk(agentId);
      if (agent && agent.contact) {
        const buyer = await User.findByPk(tour.buyerId);
        const buyerName = buyer?.firstName || "A buyer";
        await sendSMS(
          agent.contact,
          `You missed a tour request from ${buyerName} for property. Please call them back. Tour ID: ${tourId}`
        );
      }
    }
  } catch (error) {
    console.error(`Error checking call completion:`, error);
  }
};

/**
 * Cancel a scheduled tour followup
 * @param {number} tourId - Tour request ID
 * @returns {void}
 */
export const cancelTourFollowup = (tourId) => {
  const jobKey = `tour-${tourId}`;
  const job = scheduledJobs.get(jobKey);
  if (job) {
    job.cancel();
    scheduledJobs.delete(jobKey);
    console.log(`Cancelled scheduled followup for tour ${tourId}`);
  }
};

/**
 * Cancel all scheduled jobs (useful for graceful shutdown)
 * @returns {void}
 */
export const cancelAllScheduledJobs = () => {
  scheduledJobs.forEach((job) => {
    job.cancel();
  });
  scheduledJobs.clear();
  console.log("All scheduled tour followup jobs cancelled");
};
