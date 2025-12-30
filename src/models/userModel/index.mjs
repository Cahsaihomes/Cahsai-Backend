import sequelize from "../../config/database.mjs";
import UserModel from "./user.model.mjs";
import PaymentDetailsModel from "./paymentDetails.model.mjs";
import AgentModel from "./agent.model.mjs";
import CreatorModel from "./creator.model.mjs";
import NotificationPreferenceModel from "./notification-preference.model.mjs";

const User = UserModel(sequelize);
const PaymentDetails = PaymentDetailsModel(sequelize);
const AgentTable = AgentModel(sequelize);
const CreatorTable = CreatorModel(sequelize);
const NotificationPreferenceTable = NotificationPreferenceModel(sequelize);

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

export {
  sequelize,
  User,
  PaymentDetails,
  AgentTable,
  CreatorTable,
  NotificationPreferenceTable,
};
