import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "AdminConfig",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      adminId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 15,
      },
      tourPrice: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0,
      },
      agentCommission: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0,
      },
      creatorCommission: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0,
      },
    },
    {
      tableName: "admin_configs",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["adminId"],
        },
        {
          unique: true,
          fields: ["id"],
        },
      ],
    }
  );
};