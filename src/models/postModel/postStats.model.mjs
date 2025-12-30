export default (sequelize, DataTypes) => {
  const PostStats = sequelize.define("PostStats", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    postId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    saves: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    shares: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  });
  return PostStats;
};
