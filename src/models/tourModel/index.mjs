import sequelize from "../../config/database.mjs";
import TourRequestModel from "./tour.model.mjs";
import PostModel from "../postModel/post.model.mjs";
import UserModel from "../userModel/user.model.mjs";
import MlsPropertyModel from "../mlsPropertyModel/mlsProperty.model.mjs";
import { DataTypes } from "sequelize";
import tourRejectionModel from "./tourRejection.model.mjs";


const TourRequest = TourRequestModel(sequelize, DataTypes);
const Post = PostModel(sequelize);
const User = UserModel(sequelize);
const MlsProperty = MlsPropertyModel(sequelize, DataTypes);
const TourRejection = tourRejectionModel(sequelize, DataTypes);


// Associations for tours
// Post association - for posts that originated from the Posts table
Post.hasMany(TourRequest, {
  foreignKey: "postId",
  as: "tours",
  onDelete: "CASCADE",
  constraints: false, // Disable constraint to allow postId to reference other tables
});

TourRequest.belongsTo(Post, { 
  foreignKey: "postId", 
  as: "post",
  constraints: false // Disable constraint to allow postId to reference other tables
});

// Note: For MlsProperty, we use a custom approach since postId is numeric but needs to match listingId (string)
// We'll handle the lookup manually in the service layer instead of using association

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

export { TourRequest, TourRejection, Post, User, MlsProperty };
