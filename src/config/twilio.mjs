import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
const baseUrl = process.env.TWILIO_BASE_URL || process.env.BASE_URL || "https://your-domain.com";
const voicemailUrl = process.env.TWILIO_VOICEMAIL_URL || `${baseUrl}/api/twilio/voicemail`;
const callHandlerUrl = process.env.TWILIO_CALL_HANDLER_URL || `${baseUrl}/api/twilio/agent-confirmation`;
const buyerCallHandlerUrl = process.env.TWILIO_BUYER_CALL_HANDLER_URL || `${baseUrl}/api/twilio/buyer-confirmation`;

if (!accountSid || !authToken || !phoneNumber) {
  console.warn("Twilio configuration incomplete. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env");
}

const client = twilio(accountSid, authToken);

export { client, phoneNumber, voicemailUrl, callHandlerUrl, buyerCallHandlerUrl, baseUrl };

/**
 * Make a call to a buyer to confirm the lead
 * @param {string} buyerPhone - Buyer's phone number in E.164 format (ignored, uses hardcoded)
 * @param {string} tourId - Tour request ID
 * @param {string} propertyAddress - Property address for confirmation
 * @param {string} agentName - Agent's name for greeting
 * @returns {Promise<string>} Call SID
 */
export const makeBuyerCall = async (buyerPhone, tourId, propertyAddress, agentName = "an agent") => {
  try {
    // const testNumber = '+923037533267'; 
    console.log(`🔧 [TWILIO] Creating buyer call to ${buyerPhone} (hardcoded) for tour ${tourId}, property: ${propertyAddress}, agent: ${agentName}`);

    const call = await client.calls.create({
      to: buyerPhone,
      from: phoneNumber,
      url: `${buyerCallHandlerUrl}?tourId=${tourId}`,
      method: "GET",
      timeout: 30, // Ring for 30 seconds
      record: false,
      statusCallback: `${baseUrl}/api/twilio/call-status?tourId=${tourId}&type=buyer`,
      statusCallbackMethod: "POST",
      statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
    });

    console.log(`✅ [TWILIO] Buyer call created: ${call.sid} to ${testNumber}`);
    return call.sid;
  } catch (error) {
    console.error("❌ [TWILIO] Error making buyer confirmation call:", error.message);
    throw error;
  }
};

/**
 * Make a call to an agent with voicemail capability
 * @param {string} agentPhone - Agent's phone number in E.164 format (ignored, uses hardcoded)
 * @param {string} tourId - Tour request ID
 * @param {string} buyerName - Buyer's name for call message
 * @param {string} propertyAddress - Property address for call message
 * @returns {Promise<string>} Call SID
 */
export const makeAgentCall = async (agentPhone, tourId, buyerName, propertyAddress = "the property") => {
  try {
    // const testNumber = '+923037533267';
    console.log(`🔧 [TWILIO] Creating agent call to ${agentPhone} for tour ${tourId}, buyer: ${buyerName}, property: ${propertyAddress}`);

    const call = await client.calls.create({
      to: agentPhone,
      from: phoneNumber,
      url: `${callHandlerUrl}?tourId=${tourId}`,
      method: "GET",
      timeout: 30, // Ring for 30 seconds before voicemail
      record: false,
      machineDetection: "Enable",
      machineDetectionTimeout: 3000,
      // Store tourId as a URL parameter to reference in handler
      callerId: phoneNumber,
      statusCallback: `${baseUrl}/api/twilio/call-status?tourId=${tourId}&type=agent`,
      statusCallbackMethod: "POST",
      statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
    });

    console.log(`✅ [TWILIO] Agent call created: ${call.sid} to ${testNumber}`);
    return call.sid;
  } catch (error) {
    console.error("❌ [TWILIO] Error making agent call:", error.message);
    throw error;
  }
};

/**
 * Get call status
 * @param {string} callSid - Twilio Call SID
 * @returns {Promise<object>} Call status information
 */
export const getCallStatus = async (callSid) => {
  try {
    const call = await client.calls(callSid).fetch();
    return {
      sid: call.sid,
      status: call.status,
      duration: call.duration,
      direction: call.direction,
      answeredBy: call.answeredBy,
    };
  } catch (error) {
    console.error("Error fetching call status:", error);
    throw error;
  }
};

/**
 * Send a text message
 * @param {string} toPhone - Recipient phone number
 * @param {string} message - Message content
 * @returns {Promise<string>} Message SID
 */
export const sendSMS = async (toPhone, message) => {
  try {
    const result = await client.messages.create({
      body: message,
      from: phoneNumber,
      to: toPhone,
    });
    return result.sid;
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw error;
  }
};
