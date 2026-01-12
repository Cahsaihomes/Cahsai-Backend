import sequelize from "./src/config/database.mjs";

async function removeForeignKey() {
  const queryInterface = sequelize.getQueryInterface();
  
  try {
    console.log("🔄 Attempting to remove foreign key constraint...");
    
    // First, let's check the current constraints
    const constraints = await queryInterface.showConstraint("TourRequests");
    console.log("Current constraints:", constraints);
    
    // Try to remove the foreign key
    await queryInterface.removeConstraint(
      "TourRequests",
      "TourRequests_ibfk_1"
    );
    
    console.log("✅ Foreign key constraint removed successfully!");
    console.log("✅ Tours can now be created with postIds from Posts or MlsProperty tables");
    
  } catch (error) {
    console.error("❌ Error removing foreign key:", error.message);
    
    if (error.message.includes("does not exist")) {
      console.log("⚠️ Constraint may already be removed");
    }
  } finally {
    await sequelize.close();
  }
}

removeForeignKey();
