import { sequelize } from "../models/userModel/index.mjs";
import { DataTypes } from "sequelize";

export const up = async () => {
  const transaction = await sequelize.transaction();
  try {
    // Add new columns to tours table
    await sequelize.queryInterface.addColumn(
      "TourRequests",
      "claim_fee",
      {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: "Fee paid to claim the lead"
      },
      { transaction }
    );

    await sequelize.queryInterface.addColumn(
      "TourRequests",
      "claim_fee_paid",
      {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: "Whether the claim fee has been paid"
      },
      { transaction }
    );

    await sequelize.queryInterface.addColumn(
      "TourRequests",
      "payment_intent_id",
      {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "Stripe Payment Intent ID for the claim fee"
      },
      { transaction }
    );

    await sequelize.queryInterface.addColumn(
      "TourRequests",
      "claimed_by_agent_id",
      {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: "Agent who claimed the lead"
      },
      { transaction }
    );

    await sequelize.queryInterface.addColumn(
      "TourRequests",
      "claimed_at",
      {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Timestamp when the lead was claimed"
      },
      { transaction }
    );

    await sequelize.queryInterface.addColumn(
      "TourRequests",
      "payment_status",
      {
        type: DataTypes.ENUM("pending", "success", "failed"),
        defaultValue: "pending",
        comment: "Status of the payment (pending, success, failed)"
      },
      { transaction }
    );

    await sequelize.queryInterface.addColumn(
      "TourRequests",
      "claim_status",
      {
        type: DataTypes.ENUM("unclaimed", "claimed"),
        defaultValue: "unclaimed",
        comment: "Status of the lead claim"
      },
      { transaction }
    );

    await transaction.commit();
    console.log("✅ Migration: Added payment columns to tours table");
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Migration failed:", error);
    throw error;
  }
};

export const down = async () => {
  const transaction = await sequelize.transaction();
  try {
    const columns = [
      "claim_fee",
      "claim_fee_paid",
      "payment_intent_id",
      "claimed_by_agent_id",
      "claimed_at",
      "payment_status",
      "claim_status"
    ];

    for (const column of columns) {
      await sequelize.queryInterface.removeColumn(
        "TourRequests",
        column,
        { transaction }
      );
    }

    await transaction.commit();
    console.log("✅ Migration rollback: Removed payment columns from tours table");
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Migration rollback failed:", error);
    throw error;
  }
};
