import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function fixForeignKeyConstraint() {
  let connection;
  try {
    console.log('🔄 Connecting to database...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });

    console.log('✅ Connected to database');

    // Step 1: Disable foreign key checks
    console.log('📌 Disabling foreign key checks...');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');

    // Step 2: Clean up orphaned records in TourRequests
    console.log('🧹 Removing orphaned TourRequests (postId that don\'t exist in Posts)...');
    try {
      const [result] = await connection.execute(`
        DELETE FROM TourRequests 
        WHERE postId IS NOT NULL AND postId NOT IN (
          SELECT id FROM Posts
        )
      `);
      console.log(`✅ Deleted ${result.affectedRows} orphaned TourRequest records`);
    } catch (error) {
      console.log('⚠️ Could not clean up orphaned records:', error.message);
    }

    // Step 3: Re-enable foreign key checks
    console.log('📌 Re-enabling foreign key checks...');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');

    console.log('✅ Foreign key constraint fix completed!');
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (connection) {
      try {
        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
      } catch (e) {
        // ignore
      }
      await connection.end();
    }
    process.exit(1);
  }
}

fixForeignKeyConstraint();
