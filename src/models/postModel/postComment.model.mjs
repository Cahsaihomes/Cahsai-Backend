export default (sequelize, DataTypes) => {
  const PostComment = sequelize.define(
    "PostComment",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      postId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      parentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true }, // null for top-level comments
      content: { type: DataTypes.TEXT, allowNull: false },
    },
    {
      indexes: [
        { fields: ["postId"] },
        { fields: ["parentId"] },
        { fields: ["userId"] },
      ],
    }
  );
  return PostComment;
};
