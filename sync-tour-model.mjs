import sequelize from './src/config/database.mjs';
import TourRequestModel from './src/models/tourModel/tour.model.mjs';
import { DataTypes } from 'sequelize';

try {
  console.log('🔄 Syncing TourRequest model with database...');
  
  const TourRequest = TourRequestModel(sequelize, DataTypes);
  
  // Sync without dropping existing tables
  await TourRequest.sync({ alter: true });
  
  console.log('✅ TourRequest model synced successfully!');
  
} catch (error) {
  console.error('❌ Error syncing model:', error.message);
} finally {
  await sequelize.close();
  process.exit(0);
}
