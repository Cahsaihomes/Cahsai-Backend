import sequelize from './src/config/database.mjs';

try {
  const result = await sequelize.query('DESCRIBE TourRequests;');
  const columns = result[0];
  
  console.log('\n=== TourRequests Table Columns ===');
  columns.forEach(col => {
    if (col.Field.includes('buyer') || col.Field.includes('Call')) {
      console.log(`${col.Field}: ${col.Type} (Null: ${col.Null})`);
    }
  });
  
  // Check specifically for buyerCallTime
  const buyerCallTime = columns.find(col => col.Field === 'buyerCallTime');
  if (buyerCallTime) {
    console.log('\n✅ buyerCallTime column EXISTS');
  } else {
    console.log('\n❌ buyerCallTime column DOES NOT EXIST');
  }
  
} catch (error) {
  console.error('Error:', error.message);
} finally {
  await sequelize.close();
  process.exit(0);
}
