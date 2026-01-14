import sequelize from "../../config/database.mjs";
import UserModel from "./user.model.mjs";
import PaymentDetailsModel from "./paymentDetails.model.mjs";
import AgentModel from "./agent.model.mjs";
import CreatorModel from "./creator.model.mjs";
import NotificationPreferenceModel from "./notification-preference.model.mjs";
import { Post, setupAssociations } from "../postModel/index.mjs";
import LeadPaymentModel from "../leadPaymentModel/leadPayment.model.mjs";
import { DataTypes } from "sequelize";
import UserRoleModel from "../roleModel/userRole.model.mjs";

const User = UserModel(sequelize);
const PaymentDetails = PaymentDetailsModel(sequelize);
const AgentTable = AgentModel(sequelize);
const CreatorTable = CreatorModel(sequelize);
const NotificationPreferenceTable = NotificationPreferenceModel(sequelize);
const LeadPayment = LeadPaymentModel(sequelize);
const UserRole = UserRoleModel(sequelize, DataTypes);

User.hasMany(PaymentDetails, {
  foreignKey: "userId",
  as: "PaymentDetails",
  onDelete: "CASCADE",
});
PaymentDetails.belongsTo(User, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

User.hasOne(AgentTable, {
  foreignKey: "userId",
  as: "AgentTable",
  onDelete: "CASCADE",
});
AgentTable.belongsTo(User, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

User.hasOne(CreatorTable, {
  foreignKey: "userId",
  as: "CreatorTable",
  onDelete: "CASCADE",
});
CreatorTable.belongsTo(User, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

User.hasOne(NotificationPreferenceTable, {
  foreignKey: "userId",
  as: "NotificationPreference",
  onDelete: "CASCADE",
});
NotificationPreferenceTable.belongsTo(User, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

// User-Role associations
User.hasMany(UserRole, {
  foreignKey: "userId",
  as: "userRoles",
  onDelete: "CASCADE",
});
UserRole.belongsTo(User, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

// Setup postModel associations
setupAssociations(User);

export {
  sequelize,
  User,
  UserRole,
  PaymentDetails,
  AgentTable,
  CreatorTable,
  NotificationPreferenceTable,
  Post,
  LeadPayment,
};
