import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function fixRoleEnum() {
  let connection;
  try {
    console.log('🔧 [FIX] Connecting to database...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 1,
      queueLimit: 0,
      ssl: 'require',
      enableKeepAlive: true
    });
    
    console.log('✅ [FIX] Connected to database');
    
    // Step 1: Check current state
    console.log('\n📋 [FIX] Step 1: Checking current role column...');
    const [checkRows] = await connection.query(`
      SELECT COLUMN_TYPE, COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'role' AND TABLE_SCHEMA = DATABASE()
    `);
    
    if (checkRows.length > 0) {
      console.log('📋 [FIX] Current column type:', checkRows[0].COLUMN_TYPE);
    } else {
      console.log('❌ [FIX] Column not found!');
      process.exit(1);
    }
    
    // Step 2: Drop the old enum and create new one
    console.log('\n🔄 [FIX] Step 2: Modifying column...');
    
    try {
      // Disable foreign key checks temporarily
      await connection.query('SET FOREIGN_KEY_CHECKS=0');
      
      const alterQuery = `
        ALTER TABLE users 
        CHANGE COLUMN role role ENUM('buyer', 'agent', 'admin', 'creator', 'finance_admin', 'creator_admin', 'moderator_admin') NOT NULL DEFAULT 'buyer'
      `;
      
      console.log('Executing:', alterQuery);
      await connection.query(alterQuery);
      
      // Re-enable foreign key checks
      await connection.query('SET FOREIGN_KEY_CHECKS=1');
      
      console.log('✅ [FIX] Column successfully modified');
    } catch (alterError) {
      console.error('❌ [FIX] Error during ALTER:', alterError.message);
      await connection.query('SET FOREIGN_KEY_CHECKS=1');
      throw alterError;
    }
    
    // Step 3: Verify the change
    console.log('\n✔️  [FIX] Step 3: Verifying the change...');
    const [verifyRows] = await connection.query(`
      SELECT COLUMN_TYPE, COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'role' AND TABLE_SCHEMA = DATABASE()
    `);
    
    if (verifyRows.length > 0) {
      console.log('✅ [FIX] Updated column type:', verifyRows[0].COLUMN_TYPE);
      
      if (verifyRows[0].COLUMN_TYPE.includes('finance_admin')) {
        console.log('✅ [FIX] Enum values correctly include finance_admin!');
      } else {
        console.log('⚠️  [FIX] WARNING: Enum values may not include all new values');
        console.log('Full type:', verifyRows[0].COLUMN_TYPE);
      }
    }
    
    // Step 4: Test insert
    console.log('\n🧪 [FIX] Step 4: Testing with a test insert...');
    try {
      await connection.query(`
        INSERT INTO users (first_name, last_name, email, contact, password, role, is_admin, admin_status, emailVerified, acceptedTerms, isDeleted)
        VALUES ('test', 'test', 'test_finance_' + UNIX_TIMESTAMP() + '@test.com', 'test@test.com', 'hashed', 'finance_admin', true, 'active', true, true, false)
      `);
      console.log('✅ [FIX] Test insert successful! finance_admin role works!');
      
      // Clean up test record
      await connection.query(`DELETE FROM users WHERE email LIKE 'test_finance_%'`);
      console.log('✅ [FIX] Test record cleaned up');
    } catch (insertError) {
      console.error('❌ [FIX] Test insert failed:', insertError.message);
      throw insertError;
    }
    
    console.log('\n✅ [FIX] All steps completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ [FIX] Fix failed:', error.message);
    console.error('Error code:', error.code);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

fixRoleEnum();
