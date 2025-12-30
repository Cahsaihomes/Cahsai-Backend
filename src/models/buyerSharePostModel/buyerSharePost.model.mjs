export default (sequelize, DataTypes) => {
  const BuyerShare = sequelize.define("BuyerShare", {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    postId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  });

  return BuyerShare;
};
