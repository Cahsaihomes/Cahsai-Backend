import { User } from '../userModel/index.mjs';
import rentalApplicationModel from './rentalApplication.model.mjs';
import sequelize from '../../config/database.mjs';

const RentalApplication = rentalApplicationModel(sequelize);

// Associations
User.hasMany(RentalApplication, {
  foreignKey: 'userId',
  as: 'rentalApplications',
  onDelete: 'CASCADE',
});

RentalApplication.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
  onDelete: 'CASCADE',
});

export { RentalApplication };
export default { RentalApplication };
