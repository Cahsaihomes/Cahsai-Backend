import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "CreatorTable",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      location: { type: DataTypes.STRING, allowNull: true },
      bio: { type: DataTypes.STRING, allowNull: true },
      identity_verification: { type: DataTypes.JSON, allowNull: true },
      cnicUrl: { type: DataTypes.STRING, allowNull: true },
      passportUrl: { type: DataTypes.STRING, allowNull: true },
      isIdentityVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      tableName: "creator_table",
      timestamps: true,
    }
  );
};
