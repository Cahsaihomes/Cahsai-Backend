import * as buyerReviewPostService from "../app/services/buyerReviewPost.service.mjs";

export const createReviewController = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "buyer") {
      return res
        .status(401)
        .json({ success: false, message: "Only buyers can post reviews" });
    }

    const { postId, rating, comment } = req.body;
    if (!postId || rating === undefined) {
      return res
        .status(400)
        .json({ success: false, message: "Post ID and rating are required" });
    }
    if (rating < 0 || rating > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Rating must be between 0 and 5" });
    }

    const review = await buyerReviewPostService.createReview(
      req.user.id,
      postId,
      rating,
      comment
    );
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateReviewController = async (req, res) => {
  try {
    const { postId, rating, comment } = req.body;
    if (!postId) {
      return res
        .status(400)
        .json({ success: false, message: "Post ID is required" });
    }
    if (!comment) {
      return res
        .status(400)
        .json({ success: false, message: "Comment is required" });
    }

    if (rating === undefined) {
      return res
        .status(400)
        .json({ success: false, message: "Rating is required" });
    }

    if (rating < 0 || rating > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Rating must be between 0 and 5" });
    }
    const review = await buyerReviewPostService.updateReview(
      req.user.id,
      postId,
      rating,
      comment
    );
    res.status(200).json({ success: true, data: review });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteReviewController = async (req, res) => {
  try {
    const { postId } = req.body;
    if (!postId) {
      return res
        .status(400)
        .json({ success: false, message: "Post ID is required" });
    }
    await buyerReviewPostService.deleteReview(req.user.id, postId);
    res
      .status(200)
      .json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getReviewsByPostController = async (req, res) => {
  try {
    const { postId } = req.body;

    if (!postId) {
      return res
        .status(400)
        .json({ success: false, message: "Post ID is required" });
    }

    const reviews = await buyerReviewPostService.getReviewsByPost(postId);

    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
