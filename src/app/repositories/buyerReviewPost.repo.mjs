import { BuyerReviewPost } from "../../models/buyerReviewPostModel/index.mjs";
import { Post } from "../../models/postModel/index.mjs";
import { User } from "../../models/userModel/index.mjs";

export const createReview = async (userId, postId, rating, comment) => {
  // const existing = await BuyerReviewPost.findOne({ where: { userId, postId } });
  // if (existing) {
  //   throw new Error(
  //     "You have already reviewed this post."
  //   );
  // }

  return await BuyerReviewPost.create({ userId, postId, rating, comment });
};

export const updateReview = async (userId, postId, rating, comment) => {
  const review = await BuyerReviewPost.findOne({ where: { userId, postId } });
  if (!review) {
    throw new Error("No review found to update.");
  }

  await review.update({ rating, comment });
  return review;
};

export const deleteReview = async (userId, postId) => {
  const review = await BuyerReviewPost.findOne({ where: { userId, postId } });
  if (!review) {
    throw new Error("No review found to delete.");
  }

  await review.destroy();
  return true;
};

export const getReviewsByUser = async (userId) => {
  return await BuyerReviewPost.findAll({
    where: { userId },
    include: [
      { model: Post, as: "post" },
      { model: User, as: "user" },
    ],
  });
};

export const getReviewByUserAndPost = async (userId, postId) => {
  return await BuyerReviewPost.findOne({
    where: { userId, postId },
    include: [
      { model: Post, as: "post" },
      { model: User, as: "user" },
    ],
  });
};
export const findReviewsByPost = async (postId) => {
  return await BuyerReviewPost.findAll({
    where: { postId },
    include: [
      {
        model: User,
        as: "user",
      },
      {
        model: Post,
        as: "post",
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};
