import sequelize from "../../config/database.mjs";

async function migrate() {
  const transaction = await sequelize.transaction();
  try {
    console.log("🔧 [MIGRATION] Starting: Update role enum values in users table...");
    
    // First, check current enum
    console.log("📋 [MIGRATION] Checking current role column...");
    const checkResult = await sequelize.query(`
      SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'role'
    `);
    console.log("📋 [MIGRATION] Current role column type:", checkResult[0][0]?.COLUMN_TYPE || 'NOT FOUND');
    
    // Modify the enum
    console.log("🔄 [MIGRATION] Modifying role column to add new enum values...");
    await sequelize.query(`
      ALTER TABLE \`users\` 
      MODIFY COLUMN \`role\` ENUM('buyer', 'agent', 'admin', 'creator', 'finance_admin', 'creator_admin', 'moderator_admin') NOT NULL
    `, { transaction });
    
    console.log("✅ [MIGRATION] Successfully updated role column enum");
    
    // Verify the change
    console.log("✔️  [MIGRATION] Verifying the change...");
    const verifyResult = await sequelize.query(`
      SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'role'
    `);
    console.log("📋 [MIGRATION] Updated role column type:", verifyResult[0][0]?.COLUMN_TYPE || 'NOT FOUND');
    
    await transaction.commit();
    console.log("✅ [MIGRATION] Migration completed successfully!");
    return true;
  } catch (error) {
    await transaction.rollback();
    console.error("❌ [MIGRATION] Migration failed:", error.message);
    console.error(error);
    return false;
  }
}

(async () => {
  try {
    const success = await migrate();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  }
})();
