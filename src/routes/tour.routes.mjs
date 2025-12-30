import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.mjs";
import {
  claimTourRequest,
  createTourRequest,
  deleteTourRequest,
  getAgentToursDay,
  getAgentToursMonth,
  getAgentToursWeek,
  getAllTours,
  getPaginatedTours,
  getTours,
  rejectTourRequest,
  updateTourStatus,
  getTourLeads,
  getExpiredTours,
  getTourStatus,
} from "../controllers/tour.controller.mjs";
import {
  getSavedToursController,
  saveTourController,
  unsaveTourController,
} from "../controllers/buyerSavedPost.controller.mjs";

const router = express.Router();

router.post("/book-tour", isAuthenticated, createTourRequest);
router.get("/get-all-tours", isAuthenticated, getAllTours);
router.get("/get-paginated-tours", getPaginatedTours);
router.delete("/delete/:id", deleteTourRequest);
router.patch("/claim-tour/:id", isAuthenticated, claimTourRequest);
router.patch("/update-status/:id", isAuthenticated, updateTourStatus);
router.post("/reject-tour/:id", isAuthenticated, rejectTourRequest);
router.get("/get-tours", isAuthenticated, getTours);
// expire lead after 15 minutes and show to other agents in same zipcode/location
router.get("/leads", isAuthenticated, getTourLeads);
router.get("/agent-tours/day", isAuthenticated, getAgentToursDay);
router.get("/agent-tours/week", isAuthenticated, getAgentToursWeek);
router.get("/expired-tours", isAuthenticated, getExpiredTours);

// Get current agent, status, and timing for a specific tour
router.get("/tour/:id/status", isAuthenticated, getTourStatus);
router.get("/agent-tours/month", isAuthenticated, getAgentToursMonth);

router.post("/save", isAuthenticated, saveTourController);
router.get("/fetch-all", isAuthenticated, getSavedToursController);
router.delete("/unsave", isAuthenticated, unsaveTourController);

export default router;
