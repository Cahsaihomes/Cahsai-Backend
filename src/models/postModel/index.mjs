import sequelize from "../../config/database.mjs";
import { DataTypes } from "sequelize";
import PostStatsModel from "./postStats.model.mjs";
import PostModel from "./post.model.mjs";
import PostCommentModel from "./postComment.model.mjs";
import CommentLikeModel from "./commentLike.model.mjs";
import userModel from "../userModel/user.model.mjs";

// Initialize models

const User = userModel(sequelize);
const Post = PostModel(sequelize, DataTypes);
const PostStats = PostStatsModel(sequelize, DataTypes);
const PostComment = PostCommentModel(sequelize, DataTypes);
const CommentLike = CommentLikeModel(sequelize, DataTypes);

User.hasMany(Post, {
  foreignKey: "userId",
  as: "posts", // user.posts[]
  onDelete: "CASCADE",
});

Post.belongsTo(User, {
  foreignKey: "userId",
  as: "user", // post.user
  onDelete: "CASCADE",
});

// Associations
Post.hasOne(PostStats, {
  foreignKey: "postId",
  as: "stats",
  onDelete: "CASCADE",
});
PostStats.belongsTo(Post, {
  foreignKey: "postId",
  onDelete: "CASCADE",
});

Post.hasMany(PostComment, {
  foreignKey: "postId",
  as: "comments",
  onDelete: "CASCADE",
});
PostComment.belongsTo(Post, {
  foreignKey: "postId",
  onDelete: "CASCADE",
});

User.hasMany(PostComment, {
  foreignKey: "userId",
  as: "comments",
  onDelete: "CASCADE",
});
PostComment.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
  onDelete: "CASCADE",
});

PostComment.hasMany(PostComment, {
  foreignKey: "parentId",
  as: "replies",
  onDelete: "CASCADE",
});
PostComment.belongsTo(PostComment, {
  foreignKey: "parentId",
  as: "parent",
});

// Comment like associations
PostComment.hasMany(CommentLike, {
  foreignKey: "commentId",
  as: "likes",
  onDelete: "CASCADE",
});
CommentLike.belongsTo(PostComment, {
  foreignKey: "commentId",
  onDelete: "CASCADE",
});

User.hasMany(CommentLike, {
  foreignKey: "userId",
  as: "commentLikes",
  onDelete: "CASCADE",
});
CommentLike.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
  onDelete: "CASCADE",
});

// Export everything
export { sequelize, Post, PostStats, PostComment, CommentLike, User };
