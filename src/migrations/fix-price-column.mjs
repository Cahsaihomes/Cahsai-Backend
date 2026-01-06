import sequelize from "../config/database.mjs";

async function updatePriceColumn() {
  try {
    console.log("🔄 Updating price column to DECIMAL(15,2)...");
    
    // Update the column to support larger values
    await sequelize.query(`
      ALTER TABLE \`Posts\` MODIFY COLUMN \`price\` DECIMAL(15,2) NULL
    `);
    
    console.log("✅ Price column updated successfully!");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    try {
      await sequelize.close();
    } catch (e) {
      // ignore close errors
    }
    process.exit(0);
  }
}

updatePriceColumn();
