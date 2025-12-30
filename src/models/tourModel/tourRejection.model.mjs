export default (sequelize, DataTypes) => {
  const TourRejection = sequelize.define("TourRejection", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tourRequestId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    agentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  });

  return TourRejection;
};
