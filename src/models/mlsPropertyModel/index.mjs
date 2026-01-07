import sequelize from "../../config/database.mjs";
import { DataTypes } from "sequelize";
import mlsPropertyModel from "./mlsProperty.model.mjs";

const MlsProperty = mlsPropertyModel(sequelize, DataTypes);

export { sequelize, MlsProperty };
