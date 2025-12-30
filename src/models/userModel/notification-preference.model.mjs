import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "NotificationPreference",
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
      isAll: { type: DataTypes.BOOLEAN, defaultValue: false },
      isPush: { type: DataTypes.BOOLEAN, defaultValue: false },
      isEmail: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      tableName: "notification-preference",
      timestamps: true,
    }
  );
};
