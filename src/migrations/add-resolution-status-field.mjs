import sequelize from "../config/database.mjs";

async function addResolutionStatusField() {
  const queryInterface = sequelize.getQueryInterface();
  const table = "TourRequests";

  try {
    console.log("🔄 Attempting to add resolutionStatus field to TourRequest table...");

    // Check if column exists
    const columns = await queryInterface.describeTable(table);
    
    if (columns.resolutionStatus) {
      console.log("✅ resolutionStatus field already exists");
      return;
    }

    // Add the column
    await queryInterface.addColumn(table, "resolutionStatus", {
      type: sequelize.Sequelize.ENUM("unresolved", "resolved", "pending"),
      defaultValue: "pending",
      allowNull: true,
    });

    console.log("✅ resolutionStatus field added successfully!");
  } catch (error) {
    console.error("❌ Error adding resolutionStatus field:", error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

addResolutionStatusField();
