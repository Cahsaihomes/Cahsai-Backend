import { TourRequest, User, Post } from "../models/tourModel/index.mjs";
import tourRepo from "../app/repositories/tour.repo.mjs";
import twilio from "twilio";
import { sendSMS } from "../config/twilio.mjs";

const VoiceResponse = twilio.twiml.VoiceResponse;

/**
 * Handle incoming Twilio call events
 * Called when agent answers/declines/misses the call
 */
export const handleCallEvent = async (req, res) => {
  try {
    const { tourId } = req.query;
    const { CallStatus, CallSid, Digits } = req.body;

    if (!tourId) {
      return res.status(400).json({ error: "Tour ID required" });
    }

    const tour = await TourRequest.findByPk(tourId);
    if (!tour) {
      return res.status(404).json({ error: "Tour not found" });
    }

    console.log(`Call event for tour ${tourId}: ${CallStatus}`);

    // Update call status based on Twilio event
    let updateData = { callSid: CallSid };

    switch (CallStatus) {
      case "ringing":
        updateData.agentCallStatus = "ringing";
        break;

      case "in-progress":
      case "completed":
        updateData.agentCallStatus = "answered";
        updateData.resolutionStatus = "resolved";
        console.log(`Agent answered call for tour ${tourId}`);
        break;

      case "no-answer":
      case "failed":
      case "busy":
        updateData.agentCallStatus = "no-answer";
        updateData.voicemailLeft = true;
        updateData.resolutionStatus = "unresolved";
        console.log(`Agent did not answer call for tour ${tourId}`);
        break;

      default:
        console.log(`Unknown call status: ${CallStatus}`);
    }

    await tourRepo.updateTourRequest(tourId, updateData);

    // Send TwiML response for call handling
    const twiml = generateCallTwiML(CallStatus, tour);
    res.type("text/xml");
    return res.send(twiml.toString());
  } catch (error) {
    console.error("Error handling call event:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Handle call status callback from Twilio
 * This is called when call completes
 */
export const handleCallStatusCallback = async (req, res) => {
  try {
    const { tourId, type } = req.query;
    const { CallStatus, CallSid, CallDuration } = req.body;

    if (!tourId) {
      return res.status(200).send("OK");
    }

    console.log(
      `📞 [CALLBACK] Call status update for tour ${tourId} (${type}): ${CallStatus}, Duration: ${CallDuration}s`
    );

    let tour;
    let retries = 3;
    
    // Retry logic for database connection issues
    while (retries > 0) {
      try {
        tour = await TourRequest.findByPk(tourId);
        break;
      } catch (err) {
        retries--;
        if (retries === 0) {
          console.error(`❌ [CALLBACK] Failed to fetch tour ${tourId} after 3 retries:`, err.message);
          // Return OK to Twilio anyway so it doesn't retry
          return res.status(200).send("OK");
        }
        // Wait 500ms before retrying
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    if (!tour) {
      console.warn(`⚠️  [CALLBACK] Tour ${tourId} not found in database`);
      return res.status(200).send("OK");
    }

    const updateData = {
      callSid: CallSid,
    };

    // Update the correct call status field based on call type
    if (type === "buyer") {
      // Buyer call status
      if (CallStatus === "completed" && CallDuration && parseInt(CallDuration) > 10) {
        updateData.buyerCallStatus = "answered";
        console.log(`✅ [CALLBACK] Buyer call completed successfully for tour ${tourId}`);
      } else if (
        CallStatus === "no-answer" ||
        (CallStatus === "completed" && (!CallDuration || parseInt(CallDuration) <= 5))
      ) {
        updateData.buyerCallStatus = "no-answer";
        console.log(`❌ [CALLBACK] Buyer call not answered for tour ${tourId}`);
      }
    } else if (type === "agent") {
      // Agent call status
      if (CallStatus === "completed" && CallDuration && parseInt(CallDuration) > 10) {
        // Call lasted more than 10 seconds = likely answered and discussed
        updateData.agentCallStatus = "answered";
        updateData.resolutionStatus = "resolved";
        updateData.status = "Confirmed Claimed";
        console.log(`✅ [CALLBACK] Agent call completed successfully for tour ${tourId}`);
      } else if (
        CallStatus === "no-answer" ||
        (CallStatus === "completed" && (!CallDuration || parseInt(CallDuration) <= 5))
      ) {
        // No answer or very short call
        updateData.agentCallStatus = "no-answer";
        updateData.resolutionStatus = "unresolved";
        updateData.voicemailLeft = true;
        console.log(`❌ [CALLBACK] Agent call not answered for tour ${tourId}`);
      }
    }

    // Update with retry logic
    retries = 3;
    while (retries > 0) {
      try {
        await tourRepo.updateTourRequest(tourId, updateData);
        break;
      } catch (err) {
        retries--;
        if (retries === 0) {
          console.error(`❌ [CALLBACK] Failed to update tour ${tourId} after 3 retries:`, err.message);
          // Still return OK to Twilio
          return res.status(200).send("OK");
        }
        // Wait 500ms before retrying
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`✅ [CALLBACK] Tour ${tourId} updated successfully`);

    // Send notification to agent if agent call was missed
    if (type === "agent" && updateData.voicemailLeft) {
      try {
        await notifyAgentMissedCall(tour);
      } catch (notifyErr) {
        console.error(`⚠️  [CALLBACK] Error notifying agent for tour ${tourId}:`, notifyErr.message);
        // Don't fail the response, just log the error
      }
    }

    return res.status(200).send("OK");
  } catch (error) {
    console.error("❌ [CALLBACK] Error handling call status callback:", error.message);
    return res.status(200).send("OK"); // Always return 200 to Twilio
  }
};

/**
 * Handle agent response to call (IVR input)
 * Agent can press 1 to accept, 2 to reject
 */
export const handleCallResponse = async (req, res) => {
  try {
    const { tourId } = req.query;
    const { Digits } = req.body;

    if (!tourId) {
      const twiml = new VoiceResponse();
      twiml.say("Invalid request");
      res.type("text/xml");
      return res.send(twiml.toString());
    }

    const tour = await TourRequest.findByPk(tourId);
    if (!tour) {
      const twiml = new VoiceResponse();
      twiml.say("Tour not found");
      res.type("text/xml");
      return res.send(twiml.toString());
    }

    const agent = await User.findByPk(tour.agentId);
    const buyer = await User.findByPk(tour.buyerId);

    const twiml = new VoiceResponse();

    if (Digits === "1") {
      // Agent accepts the call
      console.log(`Agent accepted tour ${tourId}`);

      await tourRepo.updateTourRequest(tourId, {
        resolutionStatus: "resolved",
        status: "Confirmed Claimed",
        agentCallStatus: "answered",
      });

      twiml.say("Thank you for accepting this tour request. You are now connected to the buyer details.");
      twiml.gather({
        numDigits: 1,
        action: `/api/twilio/tour-menu?tourId=${tourId}`,
      }).say("Press 1 to confirm, or 2 to hang up");

      // Notify buyer
      if (buyer && buyer.phone) {
        await sendSMS(
          buyer.phone,
          `Great! Agent ${agent?.firstName || "an agent"} has accepted your tour request for ${tour.date} at ${tour.time}.`
        );
      }
    } else if (Digits === "2") {
      // Agent rejects the call
      console.log(`Agent rejected tour ${tourId}`);

      await tourRepo.updateTourRequest(tourId, {
        resolutionStatus: "unresolved",
        agentCallStatus: "no-answer",
      });

      twiml.say("Tour request rejected. Goodbye.");

      // Notify buyer
      if (buyer && buyer.phone) {
        await sendSMS(
          buyer.phone,
          `The agent was unable to accept your tour request at this time. We will try another agent soon.`
        );
      }
    } else {
      twiml.say("Invalid selection. Please try again.");
      twiml.gather({
        numDigits: 1,
        action: `/api/twilio/call-response?tourId=${tourId}`,
      }).say("Press 1 to accept or 2 to reject the tour request");
    }

    res.type("text/xml");
    return res.send(twiml.toString());
  } catch (error) {
    console.error("Error handling call response:", error);
    const twiml = new VoiceResponse();
    twiml.say("An error occurred. Goodbye.");
    res.type("text/xml");
    return res.send(twiml.toString());
  }
};

/**
 * Generate TwiML response for call handling
 */
const generateCallTwiML = (callStatus, tour) => {
  const twiml = new VoiceResponse();

  if (callStatus === "initiated" || callStatus === "ringing") {
    // Call is ringing, wait for answer
    twiml.say("Connecting you to a tour request. Please hold.");
  } else if (callStatus === "in-progress") {
    // Call answered
    twiml.say(
      "You have received a tour request. Press 1 to accept or 2 to reject."
    );
    twiml.gather({
      numDigits: 1,
      action: `/api/twilio/call-response?tourId=${tour.id}`,
    });
  } else if (
    callStatus === "completed" ||
    callStatus === "no-answer" ||
    callStatus === "failed"
  ) {
    // Call ended or not answered
    twiml.say("Thank you.");
  }

  return twiml;
};

/**
 * Notify agent about missed call via SMS
 */
const notifyAgentMissedCall = async (tour) => {
  try {
    const agent = await User.findByPk(tour.agentId);
    const buyer = await User.findByPk(tour.buyerId);

    if (agent && agent.phone) {
      const buyerName = buyer?.firstName || "A buyer";
      await sendSMS(
        agent.phone,
        `You missed a tour request from ${buyerName}. Tour scheduled for ${tour.date} at ${tour.time}. Please call them back ASAP. Tour ID: ${tour.id}`
      );
    }
  } catch (error) {
    console.error("Error notifying agent of missed call:", error);
  }
};

/**
 * Get tour call status (for front-end polling)
 */
export const getTourCallStatus = async (req, res) => {
  try {
    const { tourId } = req.params;

    const tour = await TourRequest.findByPk(tourId);
    if (!tour) {
      return res.status(404).json({ error: "Tour not found" });
    }

    return res.status(200).json({
      status: "success",
      data: {
        tourId: tour.id,
        callSid: tour.callSid,
        agentCallStatus: tour.agentCallStatus,
        resolutionStatus: tour.resolutionStatus,
        voicemailLeft: tour.voicemailLeft,
        agentCallTime: tour.agentCallTime,
      },
    });
  } catch (error) {
    console.error("Error getting tour call status:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Play buyer confirmation script and collect response
 * Asks buyer to confirm the tour (Press 1 for yes, 2 for no)
 */
export const handleBuyerConfirmationScript = async (req, res) => {
  try {
    // Accept both GET and POST requests
    const queryParams = req.method === 'GET' ? req.query : req.body;
    const { tourId, Digits } = queryParams;
    const response = new VoiceResponse();

    if (!tourId) {
      console.error("❌ [BUYER SCRIPT] Tour ID not found in request");
      response.say("Error: Tour ID not found.");
      return res.type('text/xml').send(response.toString());
    }

    let tour;
    try {
      tour = await TourRequest.findByPk(tourId, {
        include: [
          { model: Post, as: "post" },
          { model: User, as: "agent" }
        ]
      });
    } catch (dbErr) {
      console.warn(`⚠️  [BUYER SCRIPT] Could not fetch with associations: ${dbErr.message}`);
      tour = await TourRequest.findByPk(tourId);
    }

    if (!tour) {
      console.error(`❌ [BUYER SCRIPT] Tour ${tourId} not found in database`);
      response.say("Error: Tour not found.");
      return res.type('text/xml').send(response.toString());
    }

    // If no digits pressed yet, play the confirmation message
    if (!Digits) {
      let agent = tour.agent;
      if (!agent && tour.agentId) {
        agent = await User.findByPk(tour.agentId);
      }
      
      let property = tour.post?.location;
      if (!property && tour.postId) {
        const post = await Post.findByPk(tour.postId);
        property = post?.location;
      }
      property = property || "the property";
      const agentName = agent?.firstName || "an agent";

      console.log(`📞 [BUYER SCRIPT] Playing confirmation script for tour ${tourId}, agent: ${agentName}, property: ${property}`);

      // Play the greeting and confirmation request
      response.say(
        {
          voice: 'alice',
          language: 'en-US'
        },
        `Hello! Thank you for requesting a tour. An agent named ${agentName} will show you ${property}. ` +
        `Press 1 to confirm you want to proceed with this tour, or press 2 if you would like to cancel.`
      );

      // Gather keypad input (1 or 2)
      response.gather({
        numDigits: 1,
        method: 'GET',
        action: `/api/twilio/buyer-confirmation?tourId=${tourId}`,
        timeout: 10
      });

      // If no input, repeat
      response.say("Sorry, I did not hear your response. Please try again.");
      response.redirect(`/api/twilio/buyer-confirmation?tourId=${tourId}`);
    } else {
      // User pressed a key
      console.log(`📞 [BUYER SCRIPT] Buyer response: ${Digits} for tour ${tourId}`);

      if (Digits === '1') {
        // Buyer confirmed
        await tourRepo.updateTourRequest(tourId, {
          buyerCallStatus: 'answered',
          status: 'Awaiting Call'
        });
        response.say('Great! Your tour is confirmed. The agent will contact you shortly.');
        response.hangup();
        console.log(`✅ [BUYER SCRIPT] Buyer confirmed tour ${tourId}`);
      } else if (Digits === '2') {
        // Buyer cancelled
        await tourRepo.updateTourRequest(tourId, {
          buyerCallStatus: 'no-answer',
          status: 'Unresponsive',
          expiredStatus: 'expired'
        });
        response.say('Thank you. Your tour has been cancelled.');
        response.hangup();
        console.log(`❌ [BUYER SCRIPT] Buyer cancelled tour ${tourId}`);
      } else {
        response.say('Invalid response. Please press 1 to confirm or 2 to cancel.');
        response.gather({
          numDigits: 1,
          method: 'GET',
          action: `/api/twilio/buyer-confirmation?tourId=${tourId}`,
          timeout: 10
        });
      }
    }

    res.type('text/xml').send(response.toString());
  } catch (error) {
    console.error("❌ [BUYER SCRIPT] Error in buyer confirmation script:", error);
    const response = new VoiceResponse();
    response.say("Sorry, there was an error processing your request.");
    response.hangup();
    res.type('text/xml').send(response.toString());
  }
};

/**
 * Play agent confirmation script and collect response
 * Asks agent to accept or decline the lead (Press 1 for accept, 2 for decline)
 */
export const handleAgentConfirmationScript = async (req, res) => {
  try {
    // Accept both GET and POST requests
    const queryParams = req.method === 'GET' ? req.query : req.body;
    const { tourId, Digits } = queryParams;
    const response = new VoiceResponse();

    if (!tourId) {
      console.error("❌ [AGENT SCRIPT] Tour ID not found in request");
      response.say("Error: Tour ID not found.");
      return res.type('text/xml').send(response.toString());
    }

    let tour;
    try {
      tour = await TourRequest.findByPk(tourId, {
        include: [
          { model: Post, as: "post" },
          { model: User, as: "buyer" }
        ]
      });
    } catch (dbErr) {
      console.warn(`⚠️  [AGENT SCRIPT] Could not fetch with associations: ${dbErr.message}`);
      tour = await TourRequest.findByPk(tourId);
    }

    if (!tour) {
      console.error(`❌ [AGENT SCRIPT] Tour ${tourId} not found in database`);
      response.say("Error: Tour not found.");
      return res.type('text/xml').send(response.toString());
    }

    // If no digits pressed yet, play the offer message
    if (!Digits) {
      let buyer = tour.buyer;
      if (!buyer && tour.buyerId) {
        buyer = await User.findByPk(tour.buyerId);
      }
      
      let property = tour.post?.location;
      if (!property && tour.postId) {
        const post = await Post.findByPk(tour.postId);
        property = post?.location;
      }
      property = property || "the property";
      const buyerName = buyer?.firstName || "a buyer";

      console.log(`📞 [AGENT SCRIPT] Playing offer script for tour ${tourId}, buyer: ${buyerName}, property: ${property}`);

      // Play the offer
      response.say(
        {
          voice: 'alice',
          language: 'en-US'
        },
        `You have a new tour lead! A buyer named ${buyerName} has requested a tour of ${property} on ${tour.date} at ${tour.time}. ` +
        `Press 1 to accept this lead, or press 2 to decline.`
      );

      // Gather keypad input (1 or 2)
      response.gather({
        numDigits: 1,
        method: 'GET',
        action: `/api/twilio/agent-confirmation?tourId=${tourId}`,
        timeout: 10
      });

      // If no input, repeat
      response.say("Sorry, I did not hear your response. Please try again.");
      response.redirect(`/api/twilio/agent-confirmation?tourId=${tourId}`);
    } else {
      // User pressed a key
      console.log(`📞 [AGENT SCRIPT] Agent response: ${Digits} for tour ${tourId}`);

      if (Digits === '1') {
        // Agent accepted
        await tourRepo.updateTourRequest(tourId, {
          agentCallStatus: 'answered',
          status: 'Confirmed Claimed',
          bookingStatus: 'confirmed',
          resolutionStatus: 'resolved'
        });
        response.say('Excellent! You have claimed this lead. The buyer will expect to hear from you soon.');
        response.hangup();
        console.log(`✅ [AGENT SCRIPT] Agent accepted tour ${tourId}`);
      } else if (Digits === '2') {
        // Agent declined
        await tourRepo.updateTourRequest(tourId, {
          agentCallStatus: 'no-answer',
          status: 'Needs Follow-up',
          resolutionStatus: 'unresolved'
        });
        response.say('Thank you. This lead will be offered to another agent.');
        response.hangup();
        console.log(`❌ [AGENT SCRIPT] Agent declined tour ${tourId}`);
      } else {
        response.say('Invalid response. Please press 1 to accept or 2 to decline.');
        response.gather({
          numDigits: 1,
          method: 'GET',
          action: `/api/twilio/agent-confirmation?tourId=${tourId}`,
          timeout: 10
        });
      }
    }

    res.type('text/xml').send(response.toString());
  } catch (error) {
    console.error("❌ [AGENT SCRIPT] Error in agent confirmation script:", error);
    const response = new VoiceResponse();
    response.say("Sorry, there was an error processing your request.");
    response.hangup();
    res.type('text/xml').send(response.toString());
  }
};
