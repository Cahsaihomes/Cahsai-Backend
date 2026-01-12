import LeadPaymentModel from "./leadPayment.model.mjs";
import { TourRequest } from "../tourModel/index.mjs";
import { User } from "../userModel/index.mjs";

export const setupLeadPaymentModel = (sequelize) => {
  const LeadPayment = LeadPaymentModel(sequelize);

  // Set up associations
  LeadPayment.belongsTo(TourRequest, {
    foreignKey: "leadId",
    as: "lead",
    onDelete: "CASCADE",
  });

  LeadPayment.belongsTo(User, {
    foreignKey: "agentId",
    as: "agent",
    onDelete: "CASCADE",
  });

  return LeadPayment;
};

export default LeadPaymentModel;
