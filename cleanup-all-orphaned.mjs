import sequelize from "./src/config/database.mjs";

async function cleanupAllOrphanedRecords() {
  try {
    console.log("🔄 Cleaning up all orphaned records...");
    
    // Disable foreign key checks temporarily
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
    console.log("📌 Foreign key checks disabled");
    
    // List of tables with postId foreign key
    const tablesToClean = [
      'TourRequests',
      'SavedPost',
      'BuyerShare',
      'PostComment',
      'PostLike',
      'PostStats',
      'Chats',
      'BuyerReviewPost'
    ];

    for (const table of tablesToClean) {
      try {
        const [result] = await sequelize.query(`
          DELETE FROM \`${table}\` 
          WHERE postId IS NOT NULL AND postId NOT IN (
            SELECT id FROM Posts WHERE id IS NOT NULL
          )
        `);
        console.log(`✅ ${table}: Deleted ${result.affectedRows} orphaned records`);
      } catch (error) {
        if (error.message.includes("no such table")) {
          console.log(`⚠️ ${table}: Table does not exist`);
        } else {
          console.log(`⚠️ ${table}: ${error.message}`);
        }
      }
    }

    // Re-enable foreign key checks
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
    console.log("📌 Foreign key checks re-enabled");
    
    console.log("✅ All orphaned records cleaned successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Cleanup error:", error.message);
    // Try to re-enable checks before exiting
    try {
      await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
    } catch (e) {
      // ignore
    }
    process.exit(1);
  }
}

cleanupAllOrphanedRecords();
