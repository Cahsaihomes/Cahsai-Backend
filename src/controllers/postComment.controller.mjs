export const replyComment = async (req, res) => {
  try {
    const { content, isPrivate } = req.body;
    const { commentId } = req.params;
    if (!content || !commentId) {
      return res.status(400).json({ success: false, message: "content and commentId are required" });
    }
    // Get parent comment to find postId
    const { getCommentById } = await import("../app/services/postComment.service.mjs");
    const parentComment = await getCommentById(commentId);
    if (!parentComment) {
      return res.status(404).json({ success: false, message: "Parent comment not found" });
    }
    const postId = parentComment.postId;
    const reply = await postCommentService.createComment(postId, req.user.id, content, commentId, isPrivate);
    return res.status(201).json({ success: true, data: reply });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};
import * as postCommentService from "../app/services/postComment.service.mjs";

export const createComment = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ success: false, message: "Request body is missing" });
    }
    const { content, parentId, isPrivate } = req.body;
    const { postId } = req.params;
    if (!postId || !content) {
      return res.status(400).json({ success: false, message: "postId and content are required in request" });
    }
    const comment = await postCommentService.createComment(postId, req.user.id, content, parentId, isPrivate);
    return res.status(201).json({ success: true, data: comment });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const getCommentsByPostId = async (req, res) => {
  try {
    const { postId } = req.params;
    const currentUserId = req.user?.id || null; // Get current user if authenticated
    
    console.log("Getting comments for postId:", postId, "Type:", typeof postId);
    
    if (!postId) {
      return res.status(400).json({ success: false, message: "postId is required" });
    }
    
    // Convert postId to number
    const postIdNum = parseInt(postId);
    if (isNaN(postIdNum)) {
      return res.status(400).json({ success: false, message: "postId must be a valid number" });
    }
    
    console.log("Fetching comments for postId:", postIdNum);
    const comments = await postCommentService.getCommentsByPostId(postIdNum, currentUserId);
    // Build a map for all comments
    const commentMap = {};
    comments.forEach((c) => {
      const comment = c.toJSON ? c.toJSON() : c;
      comment.replies = [];
      commentMap[comment.id] = comment;
    });
    // Assign replies to their parent
    Object.values(commentMap).forEach((comment) => {
      if (comment.parentId && commentMap[comment.parentId]) {
        commentMap[comment.parentId].replies.push(comment);
      }
    });
    // Helper to count all descendants (replies) recursively
    function countReplies(comment) {
      let count = 0;
      for (const reply of comment.replies) {
        count += 1 + countReplies(reply);
      }
      return count;
    }
    // Only return top-level comments (parentId === null), add commentCount
    const roots = Object.values(commentMap)
      .filter((c) => c.parentId === null)
      .map((c) => ({ ...c, commentCount: 1 + countReplies(c) }));
    return res.status(200).json({ success: true, data: roots });
  } catch (err) {
    console.error("Error in getCommentsByPostId:", err);
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;
    
    if (!commentId) {
      return res.status(400).json({ success: false, message: "commentId is required" });
    }
    
    const result = await postCommentService.likeComment(commentId, userId);
    
    // Log the action for debugging
    console.log(`User ${userId} ${result.action} comment ${commentId}. New like count: ${result.likeCount}`);
    
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error("Error in likeComment controller:", err);
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const unlikeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;
    
    if (!commentId) {
      return res.status(400).json({ success: false, message: "commentId is required" });
    }
    
    // Deprecated: Use likeComment instead for toggle behavior
    console.warn("unlikeComment endpoint is deprecated. Use likeComment for toggle behavior.");
    
    const result = await postCommentService.unlikeComment(commentId, userId);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error("Error in unlikeComment controller:", err);
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const markCommentAsRead = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;
    
    if (!commentId) {
      return res.status(400).json({ success: false, message: "commentId is required" });
    }
    
    const result = await postCommentService.markCommentAsRead(commentId, userId);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error("Error in markCommentAsRead controller:", err);
    return res.status(400).json({ success: false, message: err.message });
  }
};
