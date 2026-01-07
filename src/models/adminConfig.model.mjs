import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "AdminConfig",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      leadClaimPrice: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 2.00, // Default $2.00
        comment: 'Price in dollars for lead claims'
      },
      creatorCommission: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 50.00, // Default 50%
        comment: 'Commission percentage for creators'
      },
      agentCommission: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 50.00, // Default 50%
        comment: 'Commission percentage for agents'
      },
    },
    {
      tableName: "admin_config",
      timestamps: true,
    }
  );
};