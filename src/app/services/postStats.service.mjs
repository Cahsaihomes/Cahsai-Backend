import { PostStats, Post } from "../../models/postModel/index.mjs";

import PostLikeModel from "../../models/postModel/postLike.model.mjs";
import sequelize from "../../config/database.mjs";

const incrementCounter = async (postId, field) => {
  // Check if post exists before creating stats
  const postExists = await Post.findByPk(postId);
  if (!postExists) throw new Error("Post does not exist");

  let stats = await PostStats.findOne({ where: { postId } });
  if (!stats) {
    stats = await PostStats.create({ postId, [field]: 1 });
  } else {
    stats[field] += 1;
    await stats.save();
  }
  return stats;
};

export const incrementViews = (postId) => incrementCounter(postId, "views");
export const incrementSaves = (postId) => incrementCounter(postId, "saves");
export const incrementShares = (postId) => incrementCounter(postId, "shares");

// Like/Unlike Post Logic
const PostLike = PostLikeModel(
  sequelize,
  PostStats.sequelize.Sequelize.DataTypes ||
    sequelize.Sequelize.DataTypes ||
    require("sequelize").DataTypes
);

export const likePost = async (userId, postId) => {
  // Check if already liked
  const existing = await PostLike.findOne({ where: { userId, postId } });
  if (existing) {
    throw new Error("Already liked");
  }
  await PostLike.create({ userId, postId });
  // Optionally, update like count in PostStats or return count
  const likeCount = await PostLike.count({ where: { postId } });
  return { postId, likeCount };
};

export const unlikePost = async (userId, postId) => {
  const deleted = await PostLike.destroy({ where: { userId, postId } });
  if (!deleted) {
    throw new Error("Not liked yet");
  }
  // Optionally, update like count in PostStats or return count
  const likeCount = await PostLike.count({ where: { postId } });
  return { postId, likeCount };
};

export const getLikes = async (userId) => {
  return await PostLike.findAll({
    where: { userId },
  });
};
