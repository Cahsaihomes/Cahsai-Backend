
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
  getFeedPosts,
  promotePost,
  incrementTotalViews,
  getTotalViews,
} from "../controllers/post.controller.mjs";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024,
    files: 10,
  },
  fileFilter: (_req, file, cb) => {
    const isImage = file.fieldname === "post_images" && file.mimetype.startsWith("image/");
    const isVideo = file.fieldname === "post_videos" && file.mimetype.startsWith("video/");

    if (isImage || isVideo) {
      cb(null, true);
      return;
    }

    cb(new Error("Invalid file type for upload field."));
  },
});

const postMediaUpload = (req, res, next) => {
  upload.fields([
    { name: "post_images", maxCount: 5 },
    { name: "post_videos", maxCount: 5 },
  ])(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
      return res.status(status).json({
        status: "error",
        message:
          error.code === "LIMIT_FILE_SIZE"
            ? "File is too large. Maximum size is 100MB per file."
            : error.message,
      });
    }

    return res.status(400).json({
      status: "error",
      message: error.message || "Invalid media upload.",
    });
  });
};

const router = express.Router();
// Increment totalViews for a post
router.post("/increment-total-views/:id", incrementTotalViews);
// Get totalViews for a post
router.get("/get-total-views/:id", getTotalViews);

router.post(
  "/create-post",
  isAuthenticated,
  postMediaUpload,
  createPost
);
router.get("/my-posts", isAuthenticated, getUserPosts);
router.get("/user/:userId", getPostsByUserId);
router.get("/get-paginated-posts", getPaginatedPosts);
router.get("/feed", getFeedPosts);
router.get("/get-all-posts", getAllPosts);
router.put(
  "/update-post/:id",
  isAuthenticated,
  postMediaUpload,
  updatePost
);
router.delete("/delete-post/:id", isAuthenticated, deletePost);
router.get("/agent-posts-performance", isAuthenticated, getPostPerformance);
router.get("/agent-post-conversion", isAuthenticated, getPostConversion);
// Promote a post (set isPromoted true)
router.put("/promote-post/:id", isAuthenticated, promotePost);
export default router;
