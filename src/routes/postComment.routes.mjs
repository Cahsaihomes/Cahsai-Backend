import express from "express";
import * as postCommentController from "../controllers/postComment.controller.mjs";
import { isAuthenticated } from "../middlewares/authMiddleware.mjs";

const router = express.Router();

// Create comment by postId
router.post("/create/:postId", isAuthenticated, postCommentController.createComment);
// Reply to a comment by commentId
router.post("/reply/:commentId", isAuthenticated, postCommentController.replyComment);
// Get comments by postId
router.get("/:postId", postCommentController.getCommentsByPostId);
// Like/Unlike comment
router.post("/like/:commentId", isAuthenticated, postCommentController.likeComment);
router.post("/unlike/:commentId", isAuthenticated, postCommentController.unlikeComment);
// Mark comment as read
router.post("/read/:commentId", isAuthenticated, postCommentController.markCommentAsRead);

export default router;
