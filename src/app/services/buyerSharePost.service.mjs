import { Post } from "../../models/postModel/index.mjs";
import * as buyerShareRepo from "../repositories/buyerSharePost.repo.mjs";

export const sharePost = async (userId, postId) => {
  // ✅ Check if Post exists
  const postExists = await Post.findByPk(postId);
  if (!postExists) {
    throw new Error("Post not found");
  }

  // ✅ Check if already shared
  const existing = await buyerShareRepo.isPostShared(userId, postId);
  if (existing) {
    throw new Error("Post already shared");
  }

  return await buyerShareRepo.createSharedPost(userId, postId);
};

export const getSharedPosts = async (userId) => {
  const sharedItems = await buyerShareRepo.getSharedPostsByUser(userId);
  
  // Enrich each shared item with post data containing discoveryStay
  return sharedItems.map(item => {
    const data = item.toJSON ? item.toJSON() : item;
    return {
      ...data,
      post: {
        ...data.post,
        discoveryStay: data.post?.discoveryStay || false,
      },
    };
  });
};

export const unsharePost = async (userId, postId) => {
  // ✅ Check if Post exists
  const postExists = await Post.findByPk(postId);
  if (!postExists) {
    throw new Error("Post not found");
  }

  // ✅ Check if user already shared it
  const existing = await buyerShareRepo.isPostShared(userId, postId);
  if (!existing) {
    throw new Error("Post not found in shared list");
  }

  return await buyerShareRepo.removeSharedPost(userId, postId);
};
