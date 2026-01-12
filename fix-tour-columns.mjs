#!/usr/bin/env node

import sequelize from "./src/config/database.mjs";

async function addColumnsWithSQL() {
  try {
    await sequelize.authenticate();
    console.log("🔄 Connected to database, adding columns with raw SQL...\n");
    
    const columns = [
      { name: 'callSid', sql: "ALTER TABLE TourRequests ADD COLUMN callSid VARCHAR(255) NULL" },
      { name: 'agentCallStatus', sql: "ALTER TABLE TourRequests ADD COLUMN agentCallStatus ENUM('pending', 'ringing', 'answered', 'no-answer', 'voicemail') NULL" },
      { name: 'agentCallTime', sql: "ALTER TABLE TourRequests ADD COLUMN agentCallTime DATETIME NULL" },
      { name: 'resolutionStatus', sql: "ALTER TABLE TourRequests ADD COLUMN resolutionStatus ENUM('unresolved', 'resolved', 'pending') DEFAULT 'pending' NOT NULL" },
      { name: 'voicemailLeft', sql: "ALTER TABLE TourRequests ADD COLUMN voicemailLeft BOOLEAN DEFAULT false NOT NULL" },
      { name: 'scheduledCallTime', sql: "ALTER TABLE TourRequests ADD COLUMN scheduledCallTime DATETIME NULL" },
      { name: 'buyerCallSid', sql: "ALTER TABLE TourRequests ADD COLUMN buyerCallSid VARCHAR(255) NULL" },
      { name: 'buyerCallStatus', sql: "ALTER TABLE TourRequests ADD COLUMN buyerCallStatus ENUM('pending', 'ringing', 'answered', 'no-answer', 'voicemail') NULL" },
      { name: 'buyerCallTime', sql: "ALTER TABLE TourRequests ADD COLUMN buyerCallTime DATETIME NULL" }
    ];
    
    for (const col of columns) {
      try {
        await sequelize.query(col.sql);
        console.log(`✅ Added ${col.name}`);
      } catch (err) {
        if (err.message.includes('Duplicate column')) {
          console.log(`⚠️  ${col.name} already exists`);
        } else {
          console.error(`❌ Error adding ${col.name}:`, err.message);
        }
      }
    }
    
    console.log("\n✅ All columns processed!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Fatal error:", err.message);
    process.exit(1);
  } finally {
    try {
      await sequelize.close();
    } catch (e) {
      // ignore
    }
  }
}

addColumnsWithSQL();
