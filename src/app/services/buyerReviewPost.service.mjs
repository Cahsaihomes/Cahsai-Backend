import { Post } from "../../models/postModel/index.mjs";
import * as buyerReviewPostRepo from "../repositories/buyerReviewPost.repo.mjs";

// Create Review
export const createReview = async (userId, postId, rating, comment) => {
  const postExists = await Post.findByPk(postId);
  if (!postExists) {
    throw new Error("Post not found");
  }

  // ✅ Only allow one review per user per post
  return await buyerReviewPostRepo.createReview(
    userId,
    postId,
    rating,
    comment
  );
};

// Get Reviews by user
export const getReviews = async (userId) => {
  return await buyerReviewPostRepo.getReviewsByUser(userId);
};

export const updateReview = async (userId, postId, rating, comment) => {
  const existing = await buyerReviewPostRepo.getReviewByUserAndPost(
    userId,
    postId
  );
  if (!existing) {
    throw new Error("Review not found");
  }

  return await buyerReviewPostRepo.updateReview(
    userId,
    postId,
    rating,
    comment
  );
};

// Delete Review
export const deleteReview = async (userId, postId) => {
  const existing = await buyerReviewPostRepo.getReviewByUserAndPost(
    userId,
    postId
  );
  if (!existing) {
    throw new Error("Review not found");
  }

  return await buyerReviewPostRepo.deleteReview(userId, postId);
};
export const getReviewsByPost = async (postId) => {
  return await buyerReviewPostRepo.findReviewsByPost(postId);
};
