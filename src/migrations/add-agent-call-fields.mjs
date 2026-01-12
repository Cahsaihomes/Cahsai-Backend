import sequelize from "../config/database.mjs";

async function addAgentCallFields() {
  const queryInterface = sequelize.getQueryInterface();
  const table = "TourRequests";

  try {
    console.log("🔄 Attempting to add agent call fields to TourRequest table...");

    const columns = await queryInterface.describeTable(table);
    const fieldsToAdd = [];

    // Check and prepare fields to add
    if (!columns.callSid) fieldsToAdd.push("callSid");
    if (!columns.agentCallStatus) fieldsToAdd.push("agentCallStatus");
    if (!columns.agentCallTime) fieldsToAdd.push("agentCallTime");
    if (!columns.timerExpiresAt) fieldsToAdd.push("timerExpiresAt");

    if (fieldsToAdd.length === 0) {
      console.log("✅ All agent call fields already exist");
      return;
    }

    // Add callSid
    if (fieldsToAdd.includes("callSid")) {
      await queryInterface.addColumn(table, "callSid", {
        type: sequelize.Sequelize.STRING,
        allowNull: true,
      });
      console.log("✅ callSid field added");
    }

    // Add agentCallStatus
    if (fieldsToAdd.includes("agentCallStatus")) {
      await queryInterface.addColumn(table, "agentCallStatus", {
        type: sequelize.Sequelize.ENUM("pending", "ringing", "answered", "no-answer", "voicemail"),
        allowNull: true,
      });
      console.log("✅ agentCallStatus field added");
    }

    // Add agentCallTime
    if (fieldsToAdd.includes("agentCallTime")) {
      await queryInterface.addColumn(table, "agentCallTime", {
        type: sequelize.Sequelize.DATE,
        allowNull: true,
      });
      console.log("✅ agentCallTime field added");
    }

    // Add timerExpiresAt
    if (fieldsToAdd.includes("timerExpiresAt")) {
      await queryInterface.addColumn(table, "timerExpiresAt", {
        type: sequelize.Sequelize.DATE,
        allowNull: true,
      });
      console.log("✅ timerExpiresAt field added");
    }

    console.log("✅ All agent call fields added successfully!");
  } catch (error) {
    console.error("❌ Error adding agent call fields:", error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

addAgentCallFields();
