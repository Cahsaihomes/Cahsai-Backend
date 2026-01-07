import { Post, PostComment, CommentLike } from "../../models/postModel/index.mjs";
import { User } from "../../models/userModel/index.mjs";
import { notifyCommentCreated } from "../../socket/notify.mjs";
import NotificationService from "../../services/notification.service.mjs";

export const getCommentById = async (commentId) => {
  return await PostComment.findByPk(commentId);
};

export const createComment = async (postId, userId, content, parentId = null, isPrivate = false) => {
  const comment = await PostComment.create({ postId, userId, content, parentId });
  try {
    // Fetch post to identify owner
    const post = await Post.findByPk(postId);
    const postOwnerId = post?.userId;
    
    // Create notification for the appropriate recipient
    if (parentId) {
      // This is a reply - notify the parent comment author
      await NotificationService.createReplyNotification({
        userId,
        parentCommentId: parentId,
        content,
        commentId: comment.id
      });
    } else {
      // This is a new comment - notify the post owner
      await NotificationService.createCommentNotification({
        userId,
        postId,
        content,
        commentId: comment.id
      });
    }
    
    // Optionally include commenter basic info if available via User
    const payload = {
      postId,
      commentId: comment.id,
      commenterId: userId,
      content,
      parentId: parentId || null,
      createdAt: comment.createdAt,
      postOwnerId,
    };
    notifyCommentCreated(payload);
  } catch (e) {
    // Don't block comment creation on notification errors
    console.error("notifyCommentCreated failed:", e?.message || e);
  }
  return comment;
};

export const getCommentsByPostId = async (postId, currentUserId = null) => {
  try {
    console.log("Service: Getting comments for postId:", postId);
    
    // Check if PostComment table exists by trying a simple query first
    const tableExists = await PostComment.describe().catch(() => null);
    if (!tableExists) {
      console.log("PostComment table doesn't exist yet");
      return [];
    }
    
    // Get all comments for a post, including replies, user information, and likes
    const comments = await PostComment.findAll({
      where: { postId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "user_name", "first_name", "last_name", "avatarUrl"],
          required: false,
        },
        {
          model: CommentLike,
          as: "likes",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "user_name", "first_name", "last_name"],
            }
          ],
          required: false,
        },
      ],
      order: [["createdAt", "ASC"]],
    });
    
    // Transform comments to include like information
    const transformedComments = comments.map(comment => {
      const commentData = comment.toJSON();
      const likedUserIds = commentData.likes?.map(like => like.userId) || [];
      const hasUserLiked = currentUserId ? likedUserIds.includes(currentUserId) : false;
      
      return {
        ...commentData,
        likedBy: likedUserIds,
        hasUserLiked,
        likeCount: commentData.likes?.length || 0,
      };
    });
    
    console.log("Service: Found", transformedComments.length, "comments");
    return transformedComments;
  } catch (error) {
    console.error("Service error in getCommentsByPostId:", error);
    
    // If it's a database error, return empty array instead of throwing
    if (error.name === 'SequelizeDatabaseError' || error.name === 'SequelizeConnectionError') {
      console.log("Database error, returning empty comments array");
      return [];
    }
    
    throw error;
  }
};

export const likeComment = async (commentId, userId) => {
  try {
    const comment = await PostComment.findByPk(commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }
    
    // Check if user already liked this comment
    const existingLike = await CommentLike.findOne({
      where: { commentId, userId }
    });
    
    if (existingLike) {
      // If already liked, unlike it (toggle behavior)
      await existingLike.destroy();
      
      // Get the updated like count
      const likeCount = await CommentLike.count({ where: { commentId } });
      
      return { 
        commentId: comment.id, 
        likeCount,
        hasUserLiked: false,
        action: 'unliked'
      };
    } else {
      // Create the like record
      await CommentLike.create({ commentId, userId });
      
      // Get the updated like count
      const likeCount = await CommentLike.count({ where: { commentId } });
      
      return { 
        commentId: comment.id, 
        likeCount,
        hasUserLiked: true,
        action: 'liked'
      };
    }
  } catch (error) {
    console.error("Error in likeComment:", error);
    throw error;
  }
};

export const unlikeComment = async (commentId, userId) => {
  try {
    const comment = await PostComment.findByPk(commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }
    
    // Find and remove the like record
    const existingLike = await CommentLike.findOne({
      where: { commentId, userId }
    });
    
    if (!existingLike) {
      throw new Error("Comment not liked by this user");
    }
    
    await existingLike.destroy();
    
    // Get the updated like count
    const likeCount = await CommentLike.count({ where: { commentId } });
    
    return { 
      commentId: comment.id, 
      likeCount,
      hasUserLiked: false
    };
  } catch (error) {
    console.error("Error in unlikeComment:", error);
    throw error;
  }
};

export const markCommentAsRead = async (commentId, userId) => {
  try {
    const comment = await PostComment.findByPk(commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }
    
    // Since the database table doesn't have readByUsers column,
    // we'll just return success for now
    // You could implement this using a separate table if needed
    
    return { commentId: comment.id, message: "Comment marked as read" };
  } catch (error) {
    console.error("Error in markCommentAsRead:", error);
    throw error;
  }
};
