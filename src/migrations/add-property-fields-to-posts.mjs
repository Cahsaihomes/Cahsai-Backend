// Migration script to add property fields to Posts table
import sequelize from "../config/database.mjs";

async function migratePostsTable() {
  try {
    console.log("🔄 Starting Posts table migration...");

    // Check if columns exist and add them if they don't
    const columnsToAdd = [
      { name: 'street', type: 'VARCHAR(255)' },
      { name: 'unit', type: 'VARCHAR(255)' },
      { name: 'state', type: 'VARCHAR(255)' },
      { name: 'propertyType', type: 'VARCHAR(255)' },
      { name: 'lotSize', type: 'VARCHAR(255)' },
      { name: 'yearBuilt', type: 'INT' },
      { name: 'hoaFees', type: 'DECIMAL(10, 2)' },
      { name: 'agentName', type: 'VARCHAR(255)' },
      { name: 'brokerageName', type: 'VARCHAR(255)' },
      { name: 'stateDisclosures', type: 'TEXT' },
      { name: 'publishToWatchHomes', type: 'TINYINT(1) DEFAULT 0' },
      { name: 'postType', type: 'VARCHAR(255)' },
      { name: 'linkedPostId', type: 'INT UNSIGNED' },
    ];

    for (const column of columnsToAdd) {
      try {
        await sequelize.query(
          `ALTER TABLE Posts ADD COLUMN ${column.name} ${column.type}`
        );
        console.log(`✅ Added column: ${column.name}`);
      } catch (error) {
        if (error.message.includes('Duplicate column')) {
          console.log(`ℹ️ Column ${column.name} already exists`);
        } else {
          throw error;
        }
      }
    }

    console.log("🎉 Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migratePostsTable();
