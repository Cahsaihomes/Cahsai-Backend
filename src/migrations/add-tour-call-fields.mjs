/**
 * Migration: Add Twilio call tracking fields to TourRequest
 * 
 * Adds fields to track:
 * - Call SID from Twilio
 * - Agent call status (ringing, answered, no-answer, voicemail)
 * - When the call was made
 * - Resolution status (resolved/unresolved)
 * - Whether voicemail was left
 * - Scheduled call time
 */

import db from "../config/database.mjs";

async function migrateAddTourCallFields() {
  try {
    const sequelize = db.sequelize;
    const queryInterface = sequelize.getQueryInterface();

    console.log("Starting migration: Add Twilio call fields to TourRequest...");

    // Add columns
    const columns = {
      callSid: {
        type: db.Sequelize.STRING(50),
        allowNull: true,
        defaultValue: null,
      },
      agentCallStatus: {
        type: db.Sequelize.ENUM(
          "pending",
          "ringing",
          "answered",
          "no-answer",
          "voicemail"
        ),
        allowNull: true,
        defaultValue: null,
      },
      agentCallTime: {
        type: db.Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
      resolutionStatus: {
        type: db.Sequelize.ENUM("unresolved", "resolved", "pending"),
        allowNull: false,
        defaultValue: "pending",
      },
      voicemailLeft: {
        type: db.Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      scheduledCallTime: {
        type: db.Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
    };

    // Add each column
    for (const [columnName, columnConfig] of Object.entries(columns)) {
      try {
        await queryInterface.addColumn("TourRequests", columnName, columnConfig);
        console.log(`✓ Added column: ${columnName}`);
      } catch (error) {
        if (
          error.message.includes("already exists") ||
          error.message.includes("Duplicate")
        ) {
          console.log(`⚠ Column already exists: ${columnName}`);
        } else {
          throw error;
        }
      }
    }

    console.log("✓ Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("✗ Migration failed:", error.message);
    process.exit(1);
  }
}

migrateAddTourCallFields();
