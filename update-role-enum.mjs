import sequelize from "./src/config/database.mjs";

(async () => {
  try {
    console.log("🔧 Starting migration: Update role enum values...");
    
    await sequelize.query(`
      ALTER TABLE \`users\` 
      MODIFY COLUMN \`role\` ENUM('buyer', 'agent', 'admin', 'creator', 'finance_admin', 'creator_admin', 'moderator_admin') NOT NULL
    `);
    
    console.log("✅ Successfully updated role column to include finance_admin, creator_admin, moderator_admin");
    
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
