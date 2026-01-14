import { DataTypes } from "sequelize";

export default (sequelize) => {
  const UserRole = sequelize.define(
    "UserRole",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        comment: "Reference to user",
      },
      roleId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "roles",
          key: "id",
        },
        onDelete: "CASCADE",
        comment: "Reference to role",
      },
    },
    {
      tableName: "user_roles",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["userId", "roleId"],
          name: "unique_user_role",
        },
        {
          fields: ["userId"],
          name: "idx_user_role_userid",
        },
        {
          fields: ["roleId"],
          name: "idx_user_role_roleid",
        },
      ],
    }
  );

  return UserRole;
};
