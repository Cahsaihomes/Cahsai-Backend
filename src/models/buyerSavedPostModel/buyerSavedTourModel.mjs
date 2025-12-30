import { DataTypes } from "sequelize";

export default (sequelize) => {
  const BuyerSavedTour = sequelize.define("SavedTour", {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    tourId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  });

  return BuyerSavedTour;
};
