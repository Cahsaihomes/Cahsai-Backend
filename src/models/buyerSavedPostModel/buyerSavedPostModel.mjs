import { DataTypes } from "sequelize";

export default (sequelize) => {
  const BuyerSavedPost = sequelize.define("SavedPost", {
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

  return BuyerSavedPost;
};
