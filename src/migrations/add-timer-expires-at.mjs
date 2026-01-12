import sequelize from "../config/database.mjs";

async function addTimerExpiresAt() {
  const queryInterface = sequelize.getQueryInterface();
  const table = "TourRequests";

  try {
    console.log("🔄 Attempting to add timerExpiresAt field...");

    const columns = await queryInterface.describeTable(table);
    
    if (columns.timerExpiresAt) {
      console.log("✅ timerExpiresAt field already exists");
      return;
    }

    await queryInterface.addColumn(table, "timerExpiresAt", {
      type: sequelize.Sequelize.DATE,
      allowNull: true,
    });

    console.log("✅ timerExpiresAt field added successfully!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

addTimerExpiresAt();
