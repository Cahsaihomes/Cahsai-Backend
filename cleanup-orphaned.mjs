import sequelize from "./src/config/database.mjs";

async function cleanupOrphanedRecords() {
  try {
    console.log("🔄 Cleaning up orphaned records...");
    
    // Query to delete orphaned TourRequests
    await sequelize.query(`
      DELETE FROM TourRequests 
      WHERE postId IS NOT NULL AND postId NOT IN (
        SELECT id FROM Posts WHERE id IS NOT NULL
      )
    `);
    
    console.log("✅ Orphaned records cleaned successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Cleanup error:", error.message);
    process.exit(1);
  }
}

cleanupOrphanedRecords();
