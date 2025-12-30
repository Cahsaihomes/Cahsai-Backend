import { BuyerShare } from "../../models/buyerSharePostModel/index.mjs";
import { Post } from "../../models/postModel/index.mjs";
import { User } from "../../models/userModel/index.mjs";

export const createSharedPost = async (userId, postId) => {
  return await BuyerShare.create({ userId, postId });
};

export const getSharedPostsByUser = async (userId) => {
  return await BuyerShare.findAll({
    where: { userId },
    include: [
      { model: Post, as: "post" },
      { model: User, as: "user" },
    ],
  });
};

export const removeSharedPost = async (userId, postId) => {
  return await BuyerShare.destroy({ where: { userId, postId } });
};

export const isPostShared = async (userId, postId) => {
  return await BuyerShare.findOne({ where: { userId, postId } });
};
