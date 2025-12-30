import express from "express";

import {
  getSharedPostsController,
  sharePostController,
  unsharePostController,
} from "../controllers/buyerSharePost.controller.mjs";
import { isAuthenticated } from "../middlewares/authMiddleware.mjs";

const router = express.Router();

router.post("/share", isAuthenticated, sharePostController);
router.get("/fetch-all", isAuthenticated, getSharedPostsController);
router.delete("/unshare", isAuthenticated, unsharePostController);

export default router;
