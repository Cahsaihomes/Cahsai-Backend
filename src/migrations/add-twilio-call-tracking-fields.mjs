import { sequelize } from "../models/userModel/index.mjs";
import { DataTypes } from "sequelize";

export const up = async () => {
  const transaction = await sequelize.transaction();
  try {
    // Add Twilio call tracking fields
    const columns = [
      {
        name: "callSid",
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Twilio call SID for agent call",
      },
      {
        name: "agentCallStatus",
        type: DataTypes.ENUM("pending", "ringing", "answered", "no-answer", "voicemail"),
        allowNull: true,
        comment: "Status of agent call",
      },
      {
        name: "agentCallTime",
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Timestamp of agent call",
      },
      {
        name: "resolutionStatus",
        type: DataTypes.ENUM("unresolved", "resolved", "pending"),
        defaultValue: "pending",
        comment: "Resolution status of the tour",
      },
      {
        name: "voicemailLeft",
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: "Whether voicemail was left",
      },
      {
        name: "scheduledCallTime",
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Scheduled follow-up call time",
      },
      {
        name: "buyerCallSid",
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Twilio call SID for buyer call",
      },
      {
        name: "buyerCallStatus",
        type: DataTypes.ENUM("pending", "ringing", "answered", "no-answer", "voicemail"),
        allowNull: true,
        comment: "Status of buyer call",
      },
      {
        name: "buyerCallTime",
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Timestamp of buyer call",
      },
    ];

    // Check which columns already exist and only add missing ones
    for (const column of columns) {
      try {
        await sequelize.queryInterface.addColumn(
          "TourRequests",
          column.name,
          {
            type: column.type,
            allowNull: column.allowNull,
            defaultValue: column.defaultValue,
            comment: column.comment,
          },
          { transaction }
        );
        console.log(`✅ Added column: ${column.name}`);
      } catch (error) {
        if (error.message.includes("Duplicate column")) {
          console.log(`⏭️ Column already exists: ${column.name}`);
        } else {
          throw error;
        }
      }
    }

    await transaction.commit();
    console.log("✅ Migration: Added Twilio call tracking fields to TourRequests");
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Migration failed:", error.message);
    throw error;
  }
};

export const down = async () => {
  const transaction = await sequelize.transaction();
  try {
    const columns = [
      "callSid",
      "agentCallStatus",
      "agentCallTime",
      "resolutionStatus",
      "voicemailLeft",
      "scheduledCallTime",
      "buyerCallSid",
      "buyerCallStatus",
      "buyerCallTime",
    ];

    for (const column of columns) {
      try {
        await sequelize.queryInterface.removeColumn(
          "TourRequests",
          column,
          { transaction }
        );
        console.log(`✅ Removed column: ${column}`);
      } catch (error) {
        if (error.message.includes("Unknown column")) {
          console.log(`⏭️ Column doesn't exist: ${column}`);
        } else {
          throw error;
        }
      }
    }

    await transaction.commit();
    console.log("✅ Migration rollback: Removed Twilio call tracking fields");
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Migration rollback failed:", error.message);
    throw error;
  }
};
