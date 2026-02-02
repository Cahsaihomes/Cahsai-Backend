import { Post } from "../../models/postModel/index.mjs";
import { TourRequest } from "../../models/tourModel/index.mjs";
import * as buyerSavedPostRepo from "../repositories/buyerSavedPost.repo.mjs";

export const savePost = async (userId, postId) => {
  // ✅ Check if Post exists
  const postExists = await Post.findByPk(postId);
  if (!postExists) {
    throw new Error("Post not found");
  }

  // ✅ Check if already saved
  const existing = await buyerSavedPostRepo.isPostSaved(userId, postId);
  if (existing) {
    throw new Error("Post already saved");
  }

  return await buyerSavedPostRepo.createSavedPost(userId, postId);
};

export const getSavedPosts = async (userId) => {
  const savedItems = await buyerSavedPostRepo.getSavedPostsByUser(userId);
  
  // Enrich each saved item with full post data
  return await Promise.all(
    savedItems.map(async (item) => {
      const post = await Post.findByPk(item.postId);
      if (!post) return null;
      
      const raw = post.toJSON ? post.toJSON() : post;
      return {
        ...item.toJSON ? item.toJSON() : item,
        post: {
          ...raw,
          discoveryStay: raw.discoveryStay || false,
        },
      };
    })
  ).then(items => items.filter(i => i !== null));
};

export const unsavePost = async (userId, postId) => {
  // ✅ Check if Post exists
  const postExists = await Post.findByPk(postId);
  if (!postExists) {
    throw new Error("Post not found");
  }

  // ✅ Check if user already saved it
  const existing = await buyerSavedPostRepo.isPostSaved(userId, postId);
  if (!existing) {
    throw new Error("Post not found in saved list");
  }

  return await buyerSavedPostRepo.removeSavedPost(userId, postId);
};

export const saveTour = async (userId, tourId) => {
  const exists = await TourRequest.findByPk(tourId);
  if (!exists) {
    throw new Error("Tour not found");
  }

  const existing = await buyerSavedPostRepo.isTourSaved(userId, tourId);
  if (existing) {
    throw new Error("Tour already saved");
  }

  return await buyerSavedPostRepo.createSavedTour(userId, tourId);
};

export const getSavedTours = async (userId) => {
  return await buyerSavedPostRepo.getSavedToursByUser(userId);
};

export const unsavedTour = async (userId, tourId) => {
  const exists = await TourRequest.findByPk(tourId);
  if (!exists) {
    throw new Error("Tour not found");
  }

  const existing = await buyerSavedPostRepo.isTourSaved(userId, tourId);
  if (!existing) {
    throw new Error("Tour not found in saved list");
  }

  return await buyerSavedPostRepo.removeSavedTour(userId, tourId);
};
