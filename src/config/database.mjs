
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
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 10,
      min: 2,
      acquire: 120000,
      idle: 30000,
      evict: 60000
    },
    connectTimeout: 120000,
    requestTimeout: 120000,
    timezone: '+00:00',
    logging: false,
    retry: {
      max: 5,
      timeout: 10000,
      match: [/ETIMEDOUT/, /EHOSTUNREACH/, /ECONNREFUSED/, /ENOTFOUND/]
    }
  }
);

export default sequelize;
