
import { Sequelize } from "sequelize";
import config from "./config.mjs";

const sequelize = new Sequelize(
  config.DB_NAME,
  config.DB_USER,
  config.DB_PASS,
  {
    host: config.DB_HOST,
    port: config.DB_PORT ? Number(config.DB_PORT) : 3306,
    dialect: config.DB_DIALECT,
    pool: {
      max: 50,
      min: 5,
      acquire: 60000,
      idle: 10000
    },
    logging: false
  }
);

export default sequelize;
