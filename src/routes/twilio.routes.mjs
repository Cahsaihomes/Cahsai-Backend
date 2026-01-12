import express from "express";
import {
  handleCallEvent,
  handleCallStatusCallback,
  handleCallResponse,
  getTourCallStatus,
  handleBuyerConfirmationScript,
  handleAgentConfirmationScript,
} from "../controllers/twilio.controller.mjs";

const router = express.Router();

// Webhook endpoints for Twilio callbacks
// These handle call events and status updates
router.post("/call-handler", handleCallEvent);
router.post("/call-status", handleCallStatusCallback);
router.post("/call-response", handleCallResponse);

// Interactive voice scripts for buyer and agent confirmation
router.get("/buyer-confirmation", handleBuyerConfirmationScript);
router.post("/buyer-confirmation", handleBuyerConfirmationScript);
router.get("/agent-confirmation", handleAgentConfirmationScript);
router.post("/agent-confirmation", handleAgentConfirmationScript);

// Get tour call status (frontend endpoint)
router.get("/tour/:tourId/call-status", getTourCallStatus);

export default router;
