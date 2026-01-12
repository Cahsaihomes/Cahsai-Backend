import { sequelize } from "../models/userModel/index.mjs";
import { DataTypes } from "sequelize";

export const up = async () => {
  const transaction = await sequelize.transaction();
  try {
    await sequelize.queryInterface.createTable(
      "LeadPayments",
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        leadId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: "TourRequests",
            key: "id",
          },
          onDelete: "CASCADE",
        },
        agentId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: "Users",
            key: "id",
          },
          onDelete: "CASCADE",
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
        createdAt: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
        updatedAt: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        transaction,
        comment: "Audit table for lead claim payments",
      }
    );

    await transaction.commit();
    console.log("✅ Migration: Created LeadPayments audit table");
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Migration failed:", error);
    throw error;
  }
};

export const down = async () => {
  const transaction = await sequelize.transaction();
  try {
    await sequelize.queryInterface.dropTable("LeadPayments", { transaction });
    await transaction.commit();
    console.log("✅ Migration rollback: Dropped LeadPayments table");
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Migration rollback failed:", error);
    throw error;
  }
};
