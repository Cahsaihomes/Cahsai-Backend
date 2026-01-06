import sequelize from "../config/database.mjs";

async function addFeaturesColumn() {
  try {
    console.log("🔄 Attempting to add features column to Posts table...");
    
    // Try to add the column
    await sequelize.query(`
      ALTER TABLE \`Posts\` ADD COLUMN \`features\` JSON NULL AFTER \`linkedPostId\`
    `);
    
    console.log("✅ Features column added successfully!");
    
  } catch (error) {
    if (error.message && error.message.includes("Duplicate column")) {
      console.log("✅ Features column already exists!");
    } else if (error.message && error.message.includes("ETIMEDOUT")) {
      console.log("❌ Database connection timeout. Make sure your database is accessible.");
    } else {
      console.error("❌ Error:", error.message);
    }
  } finally {
    try {
      await sequelize.close();
    } catch (e) {
      // ignore close errors
    }
    process.exit(0);
  }
}

addFeaturesColumn();
