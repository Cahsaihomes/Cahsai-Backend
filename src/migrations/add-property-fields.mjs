import sequelize from "../config/database.mjs";

async function addMissingColumns() {
  try {
    console.log("🔄 Adding missing property fields to Posts table...");
    
    const missingColumns = [
      { name: 'street', type: 'VARCHAR(255)', after: 'is_verified_manager' },
      { name: 'unit', type: 'VARCHAR(50)', after: 'street' },
      { name: 'state', type: 'VARCHAR(100)', after: 'unit' },
      { name: 'propertyType', type: 'VARCHAR(100)', after: 'state' },
      { name: 'lotSize', type: 'VARCHAR(100)', after: 'propertyType' },
      { name: 'yearBuilt', type: 'INT', after: 'lotSize' },
      { name: 'hoaFees', type: 'DECIMAL(10,2)', after: 'yearBuilt' },
      { name: 'agentName', type: 'VARCHAR(255)', after: 'hoaFees' },
      { name: 'brokerageName', type: 'VARCHAR(255)', after: 'agentName' },
      { name: 'stateDisclosures', type: 'TEXT', after: 'brokerageName' },
      { name: 'publishToWatchHomes', type: 'TINYINT(1)', after: 'stateDisclosures' },
      { name: 'postType', type: 'VARCHAR(100)', after: 'publishToWatchHomes' },
      { name: 'linkedPostId', type: 'INT UNSIGNED', after: 'postType' },
      { name: 'features', type: 'JSON', after: 'linkedPostId' }
    ];

    for (const col of missingColumns) {
      try {
        await sequelize.query(`
          ALTER TABLE \`Posts\` ADD COLUMN \`${col.name}\` ${col.type} NULL AFTER \`${col.after}\`
        `);
        console.log(`✅ Added column: ${col.name}`);
      } catch (error) {
        if (error.message && error.message.includes('Duplicate column')) {
          console.log(`⏭️  Column already exists: ${col.name}`);
        } else {
          throw error;
        }
      }
    }
    
    console.log("✅ All missing columns added successfully!");
    
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

addMissingColumns();
