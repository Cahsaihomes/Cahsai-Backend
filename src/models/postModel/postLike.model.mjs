export default (sequelize, DataTypes) => {
  const PostLike = sequelize.define(
    "PostLike",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      postId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    },
    {
      indexes: [{ unique: true, fields: ["postId", "userId"] }],
    }
  );
  return PostLike;
};
