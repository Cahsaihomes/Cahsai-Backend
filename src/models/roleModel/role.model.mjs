import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Role = sequelize.define(
    "Role",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        comment: "Role name (e.g., super_admin, finance, creator)",
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Description of the role's responsibilities",
      },
      permissions: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: "JSON array of permission strings",
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
    },
    {
      tableName: "roles",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["name"],
          name: "unique_role_name",
        },
      ],
    }
  );

  return Role;
};
