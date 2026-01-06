import sequelize from "../../config/database.mjs";
import AdminConfigModel from "./adminConfig.model.mjs";

const AdminConfig = AdminConfigModel(sequelize);

export { AdminConfig };