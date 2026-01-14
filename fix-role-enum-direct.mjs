import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function migrateDatabase() {
  let connection;
  try {
    console.log('🔧 Connecting to database...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      ssl: 'require'
    });
    
    console.log('✅ Connected to database');
    
    // Check current enum
    console.log('📋 Checking current role column...');
    const [checkRows] = await connection.query(`
      SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'role' AND TABLE_SCHEMA = ?
    `, [process.env.DB_NAME]);
    
    if (checkRows.length > 0) {
      console.log('📋 Current role column type:', checkRows[0].COLUMN_TYPE);
    }
    
    // Update the enum
    console.log('🔄 Updating role column to add new enum values...');
    await connection.query(`
      ALTER TABLE \`users\` 
      MODIFY COLUMN \`role\` ENUM('buyer', 'agent', 'admin', 'creator', 'finance_admin', 'creator_admin', 'moderator_admin') NOT NULL
    `);
    
    console.log('✅ Successfully updated role column');
    
    // Verify
    console.log('✔️  Verifying the change...');
    const [verifyRows] = await connection.query(`
      SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'role' AND TABLE_SCHEMA = ?
    `, [process.env.DB_NAME]);
    
    if (verifyRows.length > 0) {
      console.log('✅ Updated role column type:', verifyRows[0].COLUMN_TYPE);
    }
    
    console.log('✅ Migration completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

migrateDatabase();
