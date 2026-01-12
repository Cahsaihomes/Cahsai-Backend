import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function addColumnsDirectly() {
  let connection;
  try {
    console.log("🔗 Connecting to MySQL database...");
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
    });

    console.log("✅ Connected to database");

    // SQL commands to add missing columns
    const columns = [
      { name: 'resolutionStatus', sql: "ALTER TABLE TourRequests ADD COLUMN resolutionStatus ENUM('unresolved', 'resolved', 'pending') DEFAULT 'pending'" },
      { name: 'voicemailLeft', sql: "ALTER TABLE TourRequests ADD COLUMN voicemailLeft BOOLEAN DEFAULT FALSE" },
      { name: 'callSid', sql: "ALTER TABLE TourRequests ADD COLUMN callSid VARCHAR(50)" },
      { name: 'agentCallStatus', sql: "ALTER TABLE TourRequests ADD COLUMN agentCallStatus ENUM('pending', 'ringing', 'answered', 'no-answer', 'voicemail')" },
      { name: 'agentCallTime', sql: "ALTER TABLE TourRequests ADD COLUMN agentCallTime DATETIME" },
      { name: 'buyerCallSid', sql: "ALTER TABLE TourRequests ADD COLUMN buyerCallSid VARCHAR(50)" },
      { name: 'buyerCallStatus', sql: "ALTER TABLE TourRequests ADD COLUMN buyerCallStatus ENUM('pending', 'ringing', 'answered', 'no-answer', 'voicemail')" },
      { name: 'buyerCallTime', sql: "ALTER TABLE TourRequests ADD COLUMN buyerCallTime DATETIME" },
      { name: 'scheduledCallTime', sql: "ALTER TABLE TourRequests ADD COLUMN scheduledCallTime DATETIME" },
    ];

    for (const col of columns) {
      try {
        await connection.execute(col.sql);
        console.log(`✅ Added column: ${col.name}`);
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log(`⏭️  Column ${col.name} already exists`);
        } else {
          console.error(`❌ Error adding ${col.name}: ${err.message}`);
        }
      }
    }

    console.log("\n✅ All columns processed successfully!");

  } catch (error) {
    console.error("❌ Connection error:", error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log("🔌 Database connection closed");
    }
  }
}

addColumnsDirectly();
