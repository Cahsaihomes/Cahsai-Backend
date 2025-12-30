import sequelize from "../../config/database.mjs";
import TourRequestModel from "./tour.model.mjs";
import PostModel from "../postModel/post.model.mjs";
import UserModel from "../userModel/user.model.mjs";
import { DataTypes } from "sequelize";
import tourRejectionModel from "./tourRejection.model.mjs";


const TourRequest = TourRequestModel(sequelize, DataTypes);
const Post = PostModel(sequelize);
const User = UserModel(sequelize);
const TourRejection = tourRejectionModel(sequelize, DataTypes);


// Associations for tours
Post.hasMany(TourRequest, {
  foreignKey: "postId",
  as: "tours",
  onDelete: "CASCADE",
});

TourRequest.belongsTo(Post, { foreignKey: "postId", as: "post" });

User.hasMany(TourRequest, { foreignKey: "buyerId", as: "buyerTours" });
TourRequest.belongsTo(User, { foreignKey: "buyerId", as: "buyer" });

User.hasMany(TourRequest, { foreignKey: "agentId", as: "agentTours" });
TourRequest.belongsTo(User, { foreignKey: "agentId", as: "agent" });

// Associations for tour rejections
TourRequest.hasMany(TourRejection, {
  foreignKey: "tourRequestId",
  as: "rejections",
  onDelete: "CASCADE",
});
TourRejection.belongsTo(TourRequest, {
  foreignKey: "tourRequestId",
  as: "tourRequest",
});

User.hasMany(TourRejection, { foreignKey: "agentId", as: "agentRejections" });
TourRejection.belongsTo(User, { foreignKey: "agentId", as: "agent" });

export { TourRequest, TourRejection, Post, User };
