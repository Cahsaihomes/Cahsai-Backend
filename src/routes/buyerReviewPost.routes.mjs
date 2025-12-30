import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.mjs";
import {
  createReviewController,
  deleteReviewController,
  updateReviewController,
  getReviewsByPostController,
} from "../controllers/buyerReviewPost.controller.mjs";

const router = express.Router();

router.post("/review", isAuthenticated, createReviewController);
router.get("/fetch-all", isAuthenticated, getReviewsByPostController);
router.put("/update", isAuthenticated, updateReviewController);
router.delete("/delete", isAuthenticated, deleteReviewController);

export default router;
