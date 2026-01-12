import sequelize from "./src/config/database.mjs";

async function runMigration() {
  const queryInterface = sequelize.getQueryInterface();
  const table = "TourRequests";

  try {
    console.log("🔄 Checking TourRequests table...");

    // Check if column exists
    const columns = await queryInterface.describeTable(table);
    
    const missingColumns = [];
    
    if (!columns.resolutionStatus) {
      missingColumns.push('resolutionStatus');
    }
    if (!columns.voicemailLeft) {
      missingColumns.push('voicemailLeft');
    }
    if (!columns.callSid) {
      missingColumns.push('callSid');
    }
    if (!columns.agentCallStatus) {
      missingColumns.push('agentCallStatus');
    }
    if (!columns.agentCallTime) {
      missingColumns.push('agentCallTime');
    }
    if (!columns.buyerCallSid) {
      missingColumns.push('buyerCallSid');
    }
    if (!columns.buyerCallStatus) {
      missingColumns.push('buyerCallStatus');
    }
    if (!columns.buyerCallTime) {
      missingColumns.push('buyerCallTime');
    }
    if (!columns.scheduledCallTime) {
      missingColumns.push('scheduledCallTime');
    }

    if (missingColumns.length === 0) {
      console.log("✅ All columns already exist");
      await sequelize.close();
      return;
    }

    console.log(`📋 Missing columns: ${missingColumns.join(', ')}`);
    console.log("🔧 Adding missing columns...\n");

    // Add resolutionStatus
    if (missingColumns.includes('resolutionStatus')) {
      await queryInterface.addColumn(table, "resolutionStatus", {
        type: sequelize.Sequelize.ENUM("unresolved", "resolved", "pending"),
        defaultValue: "pending",
        allowNull: true,
      });
      console.log("✅ Added resolutionStatus");
    }

    // Add voicemailLeft
    if (missingColumns.includes('voicemailLeft')) {
      await queryInterface.addColumn(table, "voicemailLeft", {
        type: sequelize.Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: true,
      });
      console.log("✅ Added voicemailLeft");
    }

    // Add callSid
    if (missingColumns.includes('callSid')) {
      await queryInterface.addColumn(table, "callSid", {
        type: sequelize.Sequelize.STRING,
        allowNull: true,
      });
      console.log("✅ Added callSid");
    }

    // Add agentCallStatus
    if (missingColumns.includes('agentCallStatus')) {
      await queryInterface.addColumn(table, "agentCallStatus", {
        type: sequelize.Sequelize.ENUM("pending", "ringing", "answered", "no-answer", "voicemail"),
        allowNull: true,
      });
      console.log("✅ Added agentCallStatus");
    }

    // Add agentCallTime
    if (missingColumns.includes('agentCallTime')) {
      await queryInterface.addColumn(table, "agentCallTime", {
        type: sequelize.Sequelize.DATE,
        allowNull: true,
      });
      console.log("✅ Added agentCallTime");
    }

    // Add scheduledCallTime
    if (missingColumns.includes('scheduledCallTime')) {
      await queryInterface.addColumn(table, "scheduledCallTime", {
        type: sequelize.Sequelize.DATE,
        allowNull: true,
      });
      console.log("✅ Added scheduledCallTime");
    }

    // Add buyerCallSid
    if (missingColumns.includes('buyerCallSid')) {
      await queryInterface.addColumn(table, "buyerCallSid", {
        type: sequelize.Sequelize.STRING,
        allowNull: true,
      });
      console.log("✅ Added buyerCallSid");
    }

    // Add buyerCallStatus
    if (missingColumns.includes('buyerCallStatus')) {
      await queryInterface.addColumn(table, "buyerCallStatus", {
        type: sequelize.Sequelize.ENUM("pending", "ringing", "answered", "no-answer", "voicemail"),
        allowNull: true,
      });
      console.log("✅ Added buyerCallStatus");
    }

    // Add buyerCallTime
    if (missingColumns.includes('buyerCallTime')) {
      await queryInterface.addColumn(table, "buyerCallTime", {
        type: sequelize.Sequelize.DATE,
        allowNull: true,
      });
      console.log("✅ Added buyerCallTime");
    }

    console.log("\n✅ All missing columns added successfully!");
  } catch (error) {
    console.error("❌ Error during migration:", error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

runMigration().catch(console.error);
