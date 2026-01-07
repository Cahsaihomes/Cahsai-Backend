import { DataTypes } from "sequelize";

export default (sequelize) => {
  const MlsProperty = sequelize.define(
    "MlsProperty",
    {
      listingId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      listingKeyNumeric: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      mlsStatus: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      propertyType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      propertySubType: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      // Address
      streetNumber: { type: DataTypes.STRING, allowNull: true },
      streetName: { type: DataTypes.STRING, allowNull: true },
      city: { type: DataTypes.STRING, allowNull: true },
      state: { type: DataTypes.STRING, allowNull: true },
      postalCode: { type: DataTypes.STRING, allowNull: true },
      county: { type: DataTypes.STRING, allowNull: true },

      // Pricing
      listPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
      closePrice: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
      originalListDate: { type: DataTypes.DATE, allowNull: true },
      closeDate: { type: DataTypes.DATE, allowNull: true },
      daysOnMarket: { type: DataTypes.INTEGER, allowNull: true },

      // Details
      bedrooms: { type: DataTypes.INTEGER, allowNull: true },
      bathroomsFull: { type: DataTypes.INTEGER, allowNull: true },
      bathroomsHalf: { type: DataTypes.INTEGER, allowNull: true },
      roomsTotal: { type: DataTypes.INTEGER, allowNull: true },
      livingAreaSqFt: { type: DataTypes.INTEGER, allowNull: true },
      lotSizeAcres: { type: DataTypes.DECIMAL(10, 4), allowNull: true },
      yearBuilt: { type: DataTypes.INTEGER, allowNull: true },

      photosCount: { type: DataTypes.INTEGER, allowNull: true },
      lotSizeSquareFeet: { type: DataTypes.INTEGER, allowNull: true },
      publicRemarks: { type: DataTypes.TEXT, allowNull: true },

      // Coordinates
      latitude: { type: DataTypes.DECIMAL(12, 8), allowNull: true },
      longitude: { type: DataTypes.DECIMAL(12, 8), allowNull: true },

      // Features & agent as JSON to preserve original arrays/objects
      features: { type: DataTypes.JSON, allowNull: true },
      agent: { type: DataTypes.JSON, allowNull: true },
    },
    {
      tableName: "MlsProperties",
      timestamps: true,
      indexes: [
        { unique: true, fields: ["listingId"] },
        { fields: ["listingKeyNumeric"] },
      ],
    }
  );

  return MlsProperty;
};