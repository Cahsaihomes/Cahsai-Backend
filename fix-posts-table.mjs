// Script to check and add missing columns to Posts table
import sequelize from "./src/config/database.mjs";

async function fixPostsTable() {
  try {
    console.log("🔍 Checking Posts table structure...");
    
    // Get existing columns
    const result = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'Posts' AND TABLE_SCHEMA = ?
    `, {
      replacements: [process.env.DB_NAME || 'cahsai'],
      type: sequelize.QueryTypes.SELECT
    });
    
    const existingColumns = result.map(r => r.COLUMN_NAME);
    console.log("Existing columns:", existingColumns);
    
    // Define columns to add
    const columnsToAdd = [
      { name: 'street', sql: 'VARCHAR(255)' },
      { name: 'unit', sql: 'VARCHAR(255)' },
      { name: 'state', sql: 'VARCHAR(255)' },
      { name: 'propertyType', sql: 'VARCHAR(255)' },
      { name: 'lotSize', sql: 'VARCHAR(255)' },
      { name: 'yearBuilt', sql: 'INT' },
      { name: 'hoaFees', sql: 'DECIMAL(10, 2)' },
      { name: 'agentName', sql: 'VARCHAR(255)' },
      { name: 'brokerageName', sql: 'VARCHAR(255)' },
      { name: 'stateDisclosures', sql: 'TEXT' },
      { name: 'publishToWatchHomes', sql: 'TINYINT(1) DEFAULT 0' },
      { name: 'postType', sql: 'VARCHAR(255)' },
      { name: 'linkedPostId', sql: 'INT UNSIGNED' },
    ];
    
    // Add missing columns
    for (const column of columnsToAdd) {
      if (!existingColumns.includes(column.name)) {
        try {
          console.log(`Adding column: ${column.name}`);
          await sequelize.query(`ALTER TABLE Posts ADD COLUMN ${column.name} ${column.sql}`);
          console.log(`✅ Added ${column.name}`);
        } catch (error) {
          console.log(`⚠️ Error adding ${column.name}:`, error.message);
        }
      } else {
        console.log(`ℹ️ Column ${column.name} already exists`);
      }
    }
    
    console.log("\n✅ All columns added successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

fixPostsTable();
