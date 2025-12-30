import PostLikeModel from "../../models/postModel/postLike.model.mjs";
import sequelize from "../../config/database.mjs";

const PostLike = PostLikeModel(sequelize, sequelize.Sequelize.DataTypes || require("sequelize").DataTypes);

export const getPostLikeCount = async (postId) => {
  return await PostLike.count({ where: { postId } });
};
