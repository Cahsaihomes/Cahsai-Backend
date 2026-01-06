import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const RentalApplication = sequelize.define('RentalApplication', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    fullName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    dateOfBirth: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    currentAddress: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    desiredMoveInDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    monthlyIncome: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    employmentStatus: {
      type: DataTypes.ENUM('employed', 'self-employed', 'student', 'retired', 'unemployed'),
      allowNull: false,
    },
    employerName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    lengthOfEmployment: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    numAdults: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    numMinors: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    hasPets: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    petType: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    petBreed: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    petWeight: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    governmentId: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: 'Cloudinary URL for government ID file',
    },
    proofOfIncomeFile: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: 'Cloudinary URL for proof of income file',
    },
    studentLetter: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Cloudinary URL for student letter',
    },
    guarantorDocs: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Cloudinary URL for guarantor documents',
    },
    petVaccinationRecords: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Cloudinary URL for pet vaccination records',
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    propertyId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
  }, {
    tableName: 'rental_applications',
    timestamps: true,
    indexes: [
      { fields: ['email'] },
      { fields: ['userId'] },
      { fields: ['propertyId'] },
      { fields: ['status'] },
    ],
  });

  return RentalApplication;
};
