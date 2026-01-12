import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      first_name: { type: DataTypes.STRING, allowNull: false },
      last_name: { type: DataTypes.STRING, allowNull: false },
      user_name: { type: DataTypes.STRING, allowNull: true },
      avatarUrl: { type: DataTypes.STRING, allowNull: true },
      email: { type: DataTypes.STRING, allowNull: false },
      contact: { type: DataTypes.STRING, allowNull: false },
      password: { type: DataTypes.STRING, allowNull: false },
      role: {
        type: DataTypes.ENUM("buyer", "agent", "admin", "creator"),
        allowNull: false,
      },
      // Store IDs of users that follow this user
      followers_ids: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      following_ids: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      performancePoints: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      acceptedTerms: { type: DataTypes.BOOLEAN, defaultValue: false },
      AccessToken: { type: DataTypes.STRING, allowNull: true },
      otp: { type: DataTypes.STRING, allowNull: true },
      otpExpiry: { type: DataTypes.DATE, allowNull: true },
      emailVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
      isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
      stripeAccountId: { type: DataTypes.STRING, allowNull: true },
      isRentalCompany: { type: DataTypes.BOOLEAN, defaultValue: false, allowNull: true },
    },
    {
      tableName: "users",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["email"],
          name: "unique_email",
        },
        {
          unique: true,
          fields: ["contact"],
          name: "unique_contact",
        },
      ],
    }
  );
};
