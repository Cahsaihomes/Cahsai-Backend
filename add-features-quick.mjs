import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function addFeaturesColumn() {
  let connection;
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });

    console.log('✅ Connected to database');
    console.log('Adding features column to Posts table...');
    
    try {
      await connection.execute(`
        ALTER TABLE Posts ADD COLUMN features JSON NULL AFTER linkedPostId
      `);
      console.log('✅ Features column added successfully!');
    } catch (error) {
      if (error.message.includes('Duplicate column')) {
        console.log('✅ Features column already exists!');
      } else {
        throw error;
      }
    }

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

addFeaturesColumn();
