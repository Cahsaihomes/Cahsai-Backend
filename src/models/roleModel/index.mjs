import sequelize from "../../config/database.mjs";
import { DataTypes } from "sequelize";
import RoleModel from "./role.model.mjs";
import UserRoleModel from "./userRole.model.mjs";

const Role = RoleModel(sequelize, DataTypes);
const UserRole = UserRoleModel(sequelize, DataTypes);

// Setup associations
Role.hasMany(UserRole, {
  foreignKey: "roleId",
  as: "userRoles",
  onDelete: "CASCADE",
});

UserRole.belongsTo(Role, {
  foreignKey: "roleId",
  as: "role",
  onDelete: "CASCADE",
});

export { sequelize, Role, UserRole };
