import sequelize from "../config/database.mjs";

async function addMissingTourFields() {
  const queryInterface = sequelize.getQueryInterface();
  const table = "TourRequests";

  try {
    console.log("🔄 Attempting to add missing TourRequest fields...");

    const columns = await queryInterface.describeTable(table);
    const fieldsToAdd = [];

    // Check and prepare fields to add
    if (!columns.voicemailLeft) fieldsToAdd.push("voicemailLeft");
    if (!columns.scheduledCallTime) fieldsToAdd.push("scheduledCallTime");

    if (fieldsToAdd.length === 0) {
      console.log("✅ All fields already exist");
      return;
    }

    // Add voicemailLeft
    if (fieldsToAdd.includes("voicemailLeft")) {
      await queryInterface.addColumn(table, "voicemailLeft", {
        type: sequelize.Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: true,
      });
      console.log("✅ voicemailLeft field added");
    }

    // Add scheduledCallTime
    if (fieldsToAdd.includes("scheduledCallTime")) {
      await queryInterface.addColumn(table, "scheduledCallTime", {
        type: sequelize.Sequelize.DATE,
        allowNull: true,
      });
      console.log("✅ scheduledCallTime field added");
    }

    console.log("✅ All missing fields added successfully!");
  } catch (error) {
    console.error("❌ Error adding fields:", error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

addMissingTourFields();
