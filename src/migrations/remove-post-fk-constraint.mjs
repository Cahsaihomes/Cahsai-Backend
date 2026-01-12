import sequelize from "../config/database.mjs";

export const up = async () => {
  const queryInterface = sequelize.getQueryInterface();
  
  try {
    console.log("Dropping foreign key constraint on TourRequests.postId...");
    
    // Drop the foreign key constraint
    await queryInterface.removeConstraint(
      "TourRequests",
      "TourRequests_ibfk_1"
    );
    
    console.log("✅ Foreign key constraint removed successfully");
  } catch (error) {
    console.error("Error dropping foreign key:", error.message);
    // If the constraint doesn't exist, continue anyway
    if (error.message.includes("does not exist")) {
      console.log("⚠️ Constraint doesn't exist, skipping...");
    } else {
      throw error;
    }
  }
};

export const down = async () => {
  const queryInterface = sequelize.getQueryInterface();
  
  try {
    console.log("Adding back foreign key constraint on TourRequests.postId...");
    
    // Add the foreign key constraint back
    await queryInterface.addConstraint(
      "TourRequests",
      {
        fields: ["postId"],
        type: "foreign key",
        name: "TourRequests_ibfk_1",
        references: {
          table: "Posts",
          field: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      }
    );
    
    console.log("✅ Foreign key constraint added back successfully");
  } catch (error) {
    console.error("Error adding foreign key:", error.message);
    throw error;
  }
};
