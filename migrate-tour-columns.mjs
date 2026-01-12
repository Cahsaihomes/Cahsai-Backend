#!/usr/bin/env node

/**
 * Migration script to add all missing columns to TourRequests table
 * Adds: callSid, agentCallStatus, agentCallTime, resolutionStatus, voicemailLeft, 
 *       scheduledCallTime, buyerCallSid, buyerCallStatus, buyerCallTime
 */

import sequelize from "./src/config/database.mjs";

async function runMigration() {
  try {
    console.log("🔄 Connecting to database...");
    await sequelize.authenticate();
    console.log("✅ Database connected");

    const queryInterface = sequelize.getQueryInterface();
    const table = "TourRequests";

    console.log(`\n📋 Checking existing columns in ${table} table...`);
    const columns = await queryInterface.describeTable(table);
    
    const existingColumns = Object.keys(columns);
    console.log("Existing columns:", existingColumns);

    const columnsToAdd = [
      { name: 'callSid', exists: columns.callSid },
      { name: 'agentCallStatus', exists: columns.agentCallStatus },
      { name: 'agentCallTime', exists: columns.agentCallTime },
      { name: 'resolutionStatus', exists: columns.resolutionStatus },
      { name: 'voicemailLeft', exists: columns.voicemailLeft },
      { name: 'scheduledCallTime', exists: columns.scheduledCallTime },
      { name: 'buyerCallSid', exists: columns.buyerCallSid },
      { name: 'buyerCallStatus', exists: columns.buyerCallStatus },
      { name: 'buyerCallTime', exists: columns.buyerCallTime },
    ];

    console.log("\n📊 Column Status:");
    const missingColumns = columnsToAdd.filter(col => !col.exists);
    
    columnsToAdd.forEach(col => {
      const status = col.exists ? "✅ EXISTS" : "❌ MISSING";
      console.log(`  ${status}: ${col.name}`);
    });

    if (missingColumns.length === 0) {
      console.log("\n✅ All columns already exist! No migration needed.");
      process.exit(0);
    }

    console.log(`\n🔧 Adding ${missingColumns.length} missing column(s)...\n`);

    // Add missing columns
    for (const col of missingColumns) {
      try {
        switch (col.name) {
          case 'callSid':
            await queryInterface.addColumn(table, 'callSid', {
              type: sequelize.Sequelize.STRING,
              allowNull: true,
            });
            console.log("✅ Added callSid");
            break;

          case 'agentCallStatus':
            await queryInterface.addColumn(table, 'agentCallStatus', {
              type: sequelize.Sequelize.ENUM('pending', 'ringing', 'answered', 'no-answer', 'voicemail'),
              allowNull: true,
            });
            console.log("✅ Added agentCallStatus");
            break;

          case 'agentCallTime':
            await queryInterface.addColumn(table, 'agentCallTime', {
              type: sequelize.Sequelize.DATE,
              allowNull: true,
            });
            console.log("✅ Added agentCallTime");
            break;

          case 'resolutionStatus':
            await queryInterface.addColumn(table, 'resolutionStatus', {
              type: sequelize.Sequelize.ENUM('unresolved', 'resolved', 'pending'),
              defaultValue: 'pending',
              allowNull: false,
            });
            console.log("✅ Added resolutionStatus");
            break;

          case 'voicemailLeft':
            await queryInterface.addColumn(table, 'voicemailLeft', {
              type: sequelize.Sequelize.BOOLEAN,
              defaultValue: false,
              allowNull: false,
            });
            console.log("✅ Added voicemailLeft");
            break;

          case 'scheduledCallTime':
            await queryInterface.addColumn(table, 'scheduledCallTime', {
              type: sequelize.Sequelize.DATE,
              allowNull: true,
            });
            console.log("✅ Added scheduledCallTime");
            break;

          case 'buyerCallSid':
            await queryInterface.addColumn(table, 'buyerCallSid', {
              type: sequelize.Sequelize.STRING,
              allowNull: true,
            });
            console.log("✅ Added buyerCallSid");
            break;

          case 'buyerCallStatus':
            await queryInterface.addColumn(table, 'buyerCallStatus', {
              type: sequelize.Sequelize.ENUM('pending', 'ringing', 'answered', 'no-answer', 'voicemail'),
              allowNull: true,
            });
            console.log("✅ Added buyerCallStatus");
            break;

          case 'buyerCallTime':
            await queryInterface.addColumn(table, 'buyerCallTime', {
              type: sequelize.Sequelize.DATE,
              allowNull: true,
            });
            console.log("✅ Added buyerCallTime");
            break;
        }
      } catch (error) {
        if (error.message && error.message.includes('Duplicate column')) {
          console.log(`⚠️  ${col.name} already exists (skipping)`);
        } else {
          throw error;
        }
      }
    }

    console.log("\n✅ Migration completed successfully!");
    console.log("🎉 All missing columns have been added to the TourRequests table.");
    
  } catch (error) {
    console.error("\n❌ Migration failed:");
    console.error("Error:", error.message);
    console.error("\nFull error:", error);
    process.exit(1);
  } finally {
    try {
      await sequelize.close();
    } catch (e) {
      // Ignore close errors
    }
  }
}

runMigration();
