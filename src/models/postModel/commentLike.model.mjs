export default (sequelize, DataTypes) => {
  const CommentLike = sequelize.define(
    "CommentLike",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      commentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    },
    {
      indexes: [
        { unique: true, fields: ["commentId", "userId"] }, // Prevent duplicate likes
        { fields: ["commentId"] },
        { fields: ["userId"] },
      ],
    }
  );
  return CommentLike;
};