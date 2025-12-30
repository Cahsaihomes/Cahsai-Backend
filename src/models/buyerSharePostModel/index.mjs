import sequelize from "../../config/database.mjs";
import { DataTypes } from "sequelize";
import buyerSharePostModel from "./buyerSharePost.model.mjs";
import postModel from "../postModel/post.model.mjs";
import userModel from "../userModel/user.model.mjs";

// Initialize models
const BuyerShare = buyerSharePostModel(sequelize, DataTypes);
const Post = postModel(sequelize, DataTypes);
const User = userModel(sequelize, DataTypes);

// Associations
BuyerShare.belongsTo(Post, {
  foreignKey: "postId",
  as: "post",
  onDelete: "CASCADE",
});
BuyerShare.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
  onDelete: "CASCADE",
});

export { sequelize, BuyerShare, Post, User };
