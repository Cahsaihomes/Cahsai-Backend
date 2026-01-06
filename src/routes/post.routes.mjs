
import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.mjs";
import {
  createPost,
  deletePost,
  getAllPosts,
  getPostPerformance,
  getPaginatedPosts,
  getUserPosts,
  getPostsByUserId,
  updatePost,
  getPostConversion,
  promotePost,
  incrementTotalViews,
  getTotalViews,
} from "../controllers/post.controller.mjs";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();
// Increment totalViews for a post
router.post("/increment-total-views/:id", incrementTotalViews);
// Get totalViews for a post
router.get("/get-total-views/:id", getTotalViews);

router.post(
  "/create-post",
  isAuthenticated,
  upload.fields([{ name: "post_images" }, { name: "post_videos" }]),
  createPost
);
router.get("/my-posts", isAuthenticated, getUserPosts);
router.get("/user/:userId", getPostsByUserId);
router.get("/get-paginated-posts", getPaginatedPosts);
router.get("/get-all-posts", getAllPosts);
router.put(
  "/update-post/:id",
  isAuthenticated,
  upload.fields([{ name: "post_images" }, { name: "post_videos" }]),
  updatePost
);
router.delete("/delete-post/:id", isAuthenticated, deletePost);
router.get("/agent-posts-performance", isAuthenticated, getPostPerformance);
router.get("/agent-post-conversion", isAuthenticated, getPostConversion);
// Promote a post (set isPromoted true)
router.put("/promote-post/:id", isAuthenticated, promotePost);
export default router;
