#!/usr/bin/env node
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: 'require'
  });

  try {
    console.log('Executing ALTER TABLE...');
    await conn.execute(`
      ALTER TABLE users 
      CHANGE COLUMN role role ENUM('buyer', 'agent', 'admin', 'creator', 'finance_admin', 'creator_admin', 'moderator_admin') NOT NULL DEFAULT 'buyer'
    `);
    console.log('✅ SUCCESS!');
    process.exit(0);
  } catch (e) {
    console.error('❌ ERROR:', e.message);
    process.exit(1);
  } finally {
    await conn.end();
  }
})();
