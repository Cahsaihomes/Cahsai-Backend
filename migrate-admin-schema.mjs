import sequelize from "./src/config/database.mjs";

async function migrateAdminSchema() {
  try {
    console.log("🔄 Starting admin schema migration...");

    // Sync all models
    await sequelize.sync({ alter: false });
    console.log("✅ Models synced successfully");

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration error:", error.message);
    process.exit(1);
  }
}

migrateAdminSchema();
