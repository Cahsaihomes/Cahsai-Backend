/**
 * Migration: Add buyer confirmation call tracking fields to TourRequest
 * 
 * Adds fields to track:
 * - Buyer confirmation call SID from Twilio
 * - Buyer call status (ringing, answered, no-answer, voicemail)
 * - When the buyer call was made
 */

import sequelize from "../config/database.mjs";

async function addBuyerCallFields() {
  try {
    console.log("🔄 Attempting to add buyer call fields to TourRequest table...");
    
    // Add the columns
    await sequelize.query(`
      ALTER TABLE \`TourRequests\` 
      ADD COLUMN \`buyerCallSid\` VARCHAR(50) NULL,
      ADD COLUMN \`buyerCallStatus\` ENUM('pending', 'ringing', 'answered', 'no-answer', 'voicemail') NULL,
      ADD COLUMN \`buyerCallTime\` DATETIME NULL
    `);
    
    console.log("✅ Buyer call fields added successfully!");
    
  } catch (error) {
    if (error.message && error.message.includes("Duplicate column")) {
      console.log("✅ Buyer call fields already exist!");
    } else if (error.message && error.message.includes("ETIMEDOUT")) {
      console.log("❌ Database connection timeout. Make sure your database is accessible.");
    } else {
      console.error("❌ Error:", error.message);
    }
  } finally {
    try {
      await sequelize.close();
    } catch (e) {
      // ignore close errors
    }
    process.exit(0);
  }
}

addBuyerCallFields();
