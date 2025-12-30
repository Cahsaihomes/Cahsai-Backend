import * as buyerShareService from "../app/services//buyerSharePost.service.mjs";

export const sharePostController = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "buyer") {
      return res
        .status(401)
        .json({ success: false, message: "Only buyers can share posts" });
    }

    const { postId } = req.body;
    if (!postId) {
      return res
        .status(400)
        .json({ success: false, message: "Post ID is required" });
    }

    const userId = req.user.id;
    const sharedPost = await buyerShareService.sharePost(userId, postId);

    res.status(201).json({ success: true, data: sharedPost });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getSharedPostsController = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "buyer") {
      return res
        .status(401)
        .json({ success: false, message: "Only buyers can view shares" });
    }

    const userId = req.user.id;
    const posts = await buyerShareService.getSharedPosts(userId);

    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const unsharePostController = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "buyer") {
      return res
        .status(401)
        .json({ success: false, message: "Only buyers can unshare posts" });
    }

    const { postId } = req.body;
    if (!postId) {
      return res
        .status(400)
        .json({ success: false, message: "Post ID is required" });
    }

    const userId = req.user.id;
    await buyerShareService.unsharePost(userId, postId);

    res
      .status(200)
      .json({ success: true, message: "Post unshared successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
