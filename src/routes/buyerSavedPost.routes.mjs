import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.mjs";
import {
  getSavedPostsController,
  savePostController,
  unsavePostController,
} from "../controllers/buyerSavedPost.controller.mjs";

const router = express.Router();

router.post("/save", isAuthenticated, savePostController);
router.get("/fetch-all", isAuthenticated, getSavedPostsController);
router.delete("/unsave", isAuthenticated, unsavePostController);

export default router;
