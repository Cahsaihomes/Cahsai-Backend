// Get view count for a post
import { PostStats } from "../models/postModel/index.mjs";

import * as postStats from "../app/services/postStats.service.mjs";

export const incrementViews = async (req, res) => {
  try {
    const { id } = req.params;
    const stats = await postStats.incrementViews(id);
    return res.status(200).json({ status: "success", data: stats });
  } catch (error) {
    if (error.message === "Post does not exist") {
      return res.status(404).json({ status: "error", message: "Post not found. Please provide a valid postId." });
    }
    console.error("Error incrementing views:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
};

export const incrementSaves = async (req, res) => {
  try {
    const { id } = req.params;
    const stats = await postStats.incrementSaves(id);
    return res.status(200).json({ status: "success", data: stats });
  } catch (error) {
    console.error("Error incrementing saves:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
};

export const incrementShares = async (req, res) => {
  try {
    const { id } = req.params;
    const stats = await postStats.incrementShares(id);
    return res.status(200).json({ status: "success", data: stats });
  } catch (error) {
    console.error("Error incrementing shares:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
};

// Like/Unlike Post
export const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    if (!postId) {
      return res
        .status(400)
        .json({ success: false, message: "Post ID is required" });
    }
    const result = await postStats.likePost(req.user.id, Number(postId));
    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const unlikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    if (!postId) {
      return res
        .status(400)
        .json({ success: false, message: "Post ID is required" });
    }
    const result = await postStats.unlikePost(req.user.id, Number(postId));
    return res.status(200).json({
      statusCode: 200,
      success: true,
      postId: result.postId,
      likeCount: result.likeCount,
    });
  } catch (err) {
    return res
      .status(400)
      .json({ statusCode: 400, success: false, message: err.message });
  }
};

export const getLikeDislikeController = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Please login first" });
    }
    const userId = req.user.id;
    const data = await postStats.getLikes(userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getViewCount = async (req, res) => {
  try {
    const { id } = req.params;
    const stats = await PostStats.findOne({ where: { postId: id } });
    const views = stats ? stats.views : 0;
    return res.status(200).json({ status: "success", postId: id, views });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};