import { DataTypes } from "sequelize";

export default (sequelize) => {
  const LeadPayment = sequelize.define(
    "LeadPayment",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      leadId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: "Tour Request (Lead) ID",
      },
      agentId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: "Agent who claimed the lead",
      },
      paymentIntentId: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        comment: "Stripe Payment Intent ID",
      },
      propertyPrice: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        comment: "Property price associated with the lead",
      },
      claimFee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: "Amount paid to claim the lead",
      },
      paymentStatus: {
        type: DataTypes.ENUM("pending", "success", "failed"),
        defaultValue: "pending",
        comment: "Payment status from Stripe",
      },
      stripeResponse: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Full Stripe API response for audit purposes",
      },
    },
    {
      tableName: "LeadPayments",
      timestamps: true,
      comment: "Audit table for lead claim payments",
    }
  );

  return LeadPayment;
};
