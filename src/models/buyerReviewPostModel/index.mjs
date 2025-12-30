import sequelize from "../../config/database.mjs";
import { DataTypes } from "sequelize";

import BuyerReviewPostModel from "./buyerReviewPost.model.mjs";
import PostModel from "../postModel/post.model.mjs";
import UserModel from "../userModel/user.model.mjs";

const BuyerReviewPost = BuyerReviewPostModel(sequelize, DataTypes);
const Post = PostModel(sequelize, DataTypes);
const User = UserModel(sequelize, DataTypes);

BuyerReviewPost.belongsTo(Post, {
  foreignKey: "postId",
  as: "post",
  onDelete: "CASCADE",
});
BuyerReviewPost.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
  onDelete: "CASCADE",
});

export { sequelize, BuyerReviewPost, Post, User };
