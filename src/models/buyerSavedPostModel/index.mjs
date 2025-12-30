import sequelize from "../../config/database.mjs";
import { DataTypes } from "sequelize";
import buyerSavedPostModel from "./buyerSavedPostModel.mjs";
import buyerSavedTourModel from "./buyerSavedTourModel.mjs";

// Initialize model
const BuyerSavedPost = buyerSavedPostModel(sequelize, DataTypes);
const BuyerSavedTour = buyerSavedTourModel(sequelize, DataTypes);

// Associations
BuyerSavedPost.belongsTo(sequelize.models.User, {
  foreignKey: "userId",
  as: "user",
  onDelete: "CASCADE",
});
BuyerSavedPost.belongsTo(sequelize.models.Post, {
  foreignKey: "postId",
  as: "post",
  onDelete: "CASCADE",
});

BuyerSavedTour.belongsTo(sequelize.models.User, {
  foreignKey: "userId",
  as: "user",
  onDelete: "CASCADE",
});
BuyerSavedTour.belongsTo(sequelize.models.TourRequest, {
  foreignKey: "tourId",
  as: "tour",
  onDelete: "CASCADE",
});

// Export everything
export { sequelize, BuyerSavedPost, BuyerSavedTour };
