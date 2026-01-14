import sequelize from "./src/config/database.mjs";

(async () => {
  try {
    console.log("🔧 Starting migration: Increase role column size...");
    
    await sequelize.query(`
      ALTER TABLE \`users\` 
      MODIFY COLUMN \`role\` VARCHAR(50) DEFAULT NULL
    `);
    
    console.log("✅ Successfully increased 'role' column size to VARCHAR(50)");
    
    // Verify the change
    const result = await sequelize.query(`
      SHOW COLUMNS FROM \`users\` WHERE Field = 'role'
    `);
    
    console.log("📋 Column info:", result[0][0]);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
})();
