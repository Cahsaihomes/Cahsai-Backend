import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.mjs";
import {
  getAgentClaimedTourController,
  getAgentCustomersController,
  getAgentDashboardController,
  getUpcomingToursController,
  getVideoAnalyticsController,
  getCreatorDashboardController,
  getCreatorVideoAnalyticsController,
  getTopPerformingClipController,
  getAllClipsSortedByViewsController,
  editTopPerformingClipController,
  deleteTopPerformingClipController,
  getCreatorClipsStatsController,
  getCreatorEarningsStatsController
} from "../controllers/dashboard.controller.mjs";

const router = express.Router();

router.get("/stats",isAuthenticated, getAgentDashboardController);
router.get("/customers",isAuthenticated, getAgentCustomersController);
router.get("/upcoming-tours",isAuthenticated, getUpcomingToursController);
router.get("/claimed-tours",isAuthenticated, getAgentClaimedTourController);
router.get("/video-analytics",isAuthenticated, getVideoAnalyticsController);
// creator dashboard routes
router.get("/creator-dashboard/stats",isAuthenticated, getCreatorDashboardController);
router.get("/creator-dashboard/video-analytics",isAuthenticated, getCreatorVideoAnalyticsController);
router.get("/creator-dashboard/top-performing-clip",isAuthenticated, getTopPerformingClipController);
router.put("/creator-dashboard/top-performing-clip/:id", isAuthenticated, editTopPerformingClipController);
router.delete("/creator-dashboard/top-performing-clip/:id", isAuthenticated, deleteTopPerformingClipController);
// all video clips sorted by views (top first)
router.get("/creator-dashboard/all-clips-sorted-by-views", isAuthenticated, getAllClipsSortedByViewsController);
// creator clips stats route

// creator earnings/conversion/lead stats
router.get("/creator-dashboard/earnings-stats", isAuthenticated, getCreatorEarningsStatsController);
router.get("/creator-dashboard/clip-stats", isAuthenticated, getCreatorClipsStatsController);





export default router;
