import sequelize from "../config/database.mjs";

async function addForeignKeys() {
  const queryInterface = sequelize.getQueryInterface();

  try {
    console.log("🔄 Adding foreign key constraints...");

    // Check if constraints exist
    const tourTable = await queryInterface.describeTable("TourRequests");
    const constraints = await queryInterface.showConstraints("TourRequests");

    console.log("Existing constraints:", constraints.map(c => c.constraintName));

    // Add FK for postId if not exists
    try {
      await queryInterface.addConstraint("TourRequests", {
        fields: ["postId"],
        type: "FOREIGN KEY",
        references: {
          table: "Posts",
          field: "id",
        },
        onDelete: "CASCADE",
        name: "fk_tourrequest_postid",
      });
      console.log("✅ Added FK for postId");
    } catch (e) {
      if (e.message.includes("Duplicate key")) {
        console.log("⚠️  FK for postId already exists");
      } else {
        throw e;
      }
    }

    // Add FK for buyerId
    try {
      await queryInterface.addConstraint("TourRequests", {
        fields: ["buyerId"],
        type: "FOREIGN KEY",
        references: {
          table: "users",
          field: "id",
        },
        onDelete: "CASCADE",
        name: "fk_tourrequest_buyerid",
      });
      console.log("✅ Added FK for buyerId");
    } catch (e) {
      if (e.message.includes("Duplicate key")) {
        console.log("⚠️  FK for buyerId already exists");
      } else {
        throw e;
      }
    }

    // Add FK for agentId
    try {
      await queryInterface.addConstraint("TourRequests", {
        fields: ["agentId"],
        type: "FOREIGN KEY",
        references: {
          table: "users",
          field: "id",
        },
        onDelete: "SET NULL",
        name: "fk_tourrequest_agentid",
      });
      console.log("✅ Added FK for agentId");
    } catch (e) {
      if (e.message.includes("Duplicate key")) {
        console.log("⚠️  FK for agentId already exists");
      } else {
        throw e;
      }
    }

    console.log("✅ Foreign key constraints added successfully!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    // Don't throw, constraints might already exist
  } finally {
    await sequelize.close();
  }
}

addForeignKeys().then(() => process.exit(0));
