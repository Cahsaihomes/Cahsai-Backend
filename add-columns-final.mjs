#!/usr/bin/env node

import sequelize from "./src/config/database.mjs";

async function addMissingColumns() {
  try {
    await sequelize.authenticate();
    await sequelize.query('SET FOREIGN_KEY_CHECKS=0');
    
    const alters = [
      "ALTER TABLE `TourRequests` ADD COLUMN `callSid` VARCHAR(255) NULL",
      "ALTER TABLE `TourRequests` ADD COLUMN `agentCallStatus` ENUM('pending', 'ringing', 'answered', 'no-answer', 'voicemail') NULL",
      "ALTER TABLE `TourRequests` ADD COLUMN `agentCallTime` DATETIME NULL",
      "ALTER TABLE `TourRequests` ADD COLUMN `resolutionStatus` ENUM('unresolved', 'resolved', 'pending') DEFAULT 'pending'",
      "ALTER TABLE `TourRequests` ADD COLUMN `voicemailLeft` BOOLEAN DEFAULT false",
      "ALTER TABLE `TourRequests` ADD COLUMN `scheduledCallTime` DATETIME NULL",
      "ALTER TABLE `TourRequests` ADD COLUMN `buyerCallSid` VARCHAR(255) NULL",
      "ALTER TABLE `TourRequests` ADD COLUMN `buyerCallStatus` ENUM('pending', 'ringing', 'answered', 'no-answer', 'voicemail') NULL",
      "ALTER TABLE `TourRequests` ADD COLUMN `buyerCallTime` DATETIME NULL"
    ];

    for (const sql of alters) {
      try {
        await sequelize.query(sql);
        console.log(`✅ ${sql.split('ADD COLUMN')[1].split(' ')[1]}`);
      } catch (err) {
        if (err.message.includes('Duplicate column')) {
          console.log(`⚠️  Column already exists`);
        } else {
          console.error(`❌ Error:`, err.message);
        }
      }
    }

    await sequelize.query('SET FOREIGN_KEY_CHECKS=1');
    await sequelize.query('COMMIT');
    
    console.log('\n✅ All columns added and committed!');
  } catch (err) {
    console.error('Fatal error:', err);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

addMissingColumns();
