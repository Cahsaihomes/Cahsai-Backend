import {
  BuyerSavedPost,
  BuyerSavedTour,
} from "../../models/buyerSavedPostModel/index.mjs";
import { Post } from "../../models/postModel/index.mjs";
import { User } from "../../models/userModel/index.mjs";

export const createSavedPost = async (userId, postId) => {
  return await BuyerSavedPost.create({ userId, postId });
};

export const getSavedPostsByUser = async (userId) => {
  return await BuyerSavedPost.findAll({
    where: { userId },
    // include: [
    //   { model: Post, as: "post" },
    //   { model: User, as: "user" },
    // ],
  });
};

export const removeSavedPost = async (userId, postId) => {
  return await BuyerSavedPost.destroy({ where: { userId, postId } });
};

export const isPostSaved = async (userId, postId) => {
  return await BuyerSavedPost.findOne({ where: { userId, postId } });
};

export const isTourSaved = async (userId, tourId) => {
  return await BuyerSavedTour.findOne({ where: { userId, tourId } });
};

export const removeSavedTour = async (userId, tourId) => {
  return await BuyerSavedTour.destroy({ where: { userId, tourId } });
};

export const createSavedTour = async (userId, tourId) => {
  return await BuyerSavedTour.create({ userId, tourId });
};

export const getSavedToursByUser = async (userId) => {
  return await BuyerSavedTour.findAll({
    where: { userId },
  });
};
