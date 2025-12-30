import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "AgentTable",
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
      brokerageName: { type: DataTypes.STRING, allowNull: true },
      mlsLicenseNumber: { type: DataTypes.STRING, allowNull: true },
      mlsAssociation: { type: DataTypes.STRING, allowNull: true },
      linkedinUrl: { type: DataTypes.STRING, allowNull: true },
      instagramUsername: { type: DataTypes.STRING, allowNull: true },
      areasServed: { type: DataTypes.JSON, allowNull: true },
      specializations: { type: DataTypes.JSON, allowNull: true },
    },
    {
      tableName: "agent_table",
      timestamps: true,
    }
  );
};
