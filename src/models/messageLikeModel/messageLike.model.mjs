export default (sequelize, DataTypes) => {
  const MessageLike = sequelize.define(
    "MessageLike",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      messageId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    },
    {
      indexes: [{ unique: true, fields: ["messageId", "userId"] }],
    }
  );
  return MessageLike;
};
