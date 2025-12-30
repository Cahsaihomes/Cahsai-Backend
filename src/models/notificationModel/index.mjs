import sequelize from "../../config/database.mjs";
import { DataTypes } from "sequelize";
import NotificationModel from "./notification.model.mjs";
import userModel from "../userModel/user.model.mjs";

// Initialize models
const User = userModel(sequelize);
const Notification = NotificationModel(sequelize, DataTypes);

// Associations - disable automatic foreign key creation since we created them manually
User.hasMany(Notification, {
  foreignKey: "userId",
  as: "notifications",
  constraints: false
});
Notification.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
  constraints: false
});

User.hasMany(Notification, {
  foreignKey: "fromUserId", 
  as: "sentNotifications",
  constraints: false
});
Notification.belongsTo(User, {
  foreignKey: "fromUserId",
  as: "fromUser",
  constraints: false
});

// Export everything
export { sequelize, Notification, User };