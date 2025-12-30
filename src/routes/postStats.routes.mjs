
// routes/postStatsRoutes.js
import express from "express";
import * as postStatsController from "../controllers/postStats.controller.mjs";
import { isAuthenticated } from "../middlewares/authMiddleware.mjs";

const router = express.Router();

router.post("/increment-views/:id", postStatsController.incrementViews);
router.post("/increment-saves/:id", postStatsController.incrementSaves);
router.post("/increment-shares/:id", postStatsController.incrementShares);
// Get view count for a post
router.get("/view-count/:id", postStatsController.getViewCount);
// Like/Unlike Post
router.post("/like/:postId", isAuthenticated, postStatsController.likePost);
router.post("/unlike/:postId", isAuthenticated, postStatsController.unlikePost);
router.get(
  "/fetch-all",
  isAuthenticated,
  postStatsController.getLikeDislikeController
);

export default router;
