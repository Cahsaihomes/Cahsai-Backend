import * as buyerSavedPostService from "../app/services/buyerSavedPost.service.mjs";

export const savePostController = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Please login first" });
    }

    const { postId } = req.body;
    if (!postId) {
      return res
        .status(400)
        .json({ success: false, message: "Post ID is required" });
    }

    const userId = req.user.id;
    const savedPost = await buyerSavedPostService.savePost(userId, postId);
    res.status(201).json({ success: true, data: savedPost });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getSavedPostsController = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Please login first" });
    }
    const userId = req.user.id;
    const posts = await buyerSavedPostService.getSavedPosts(userId);
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const unsavePostController = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Please login first" });
    }

    const { postId } = req.body;
    if (!postId) {
      return res
        .status(400)
        .json({ success: false, message: "Post ID is required" });
    }

    const userId = req.user.id;

    await buyerSavedPostService.unsavePost(userId, postId);
    res
      .status(200)
      .json({ success: true, message: "Post unsaved successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const saveTourController = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Please login first" });
    }

    const { tourId } = req.body;
    if (!tourId) {
      return res
        .status(400)
        .json({ success: false, message: "Tour ID is required" });
    }

    const userId = req.user.id;
    const savedTour = await buyerSavedPostService.saveTour(userId, tourId);
    res.status(201).json({ success: true, data: savedTour });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const unsaveTourController = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Please login first" });
    }

    const { tourId } = req.body;
    if (!tourId) {
      return res
        .status(400)
        .json({ success: false, message: "Tour ID is required" });
    }

    const userId = req.user.id;

    await buyerSavedPostService.unsavedTour(userId, tourId);
    res
      .status(200)
      .json({ success: true, message: "Tour unsaved successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getSavedToursController = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Please login first" });
    }
    const userId = req.user.id;
    const tours = await buyerSavedPostService.getSavedTours(userId);
    res.status(200).json({ success: true, data: tours });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
