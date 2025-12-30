export default (sequelize, DataTypes) => {
  const Chat = sequelize.define(
    "Chat",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      // postId is optional now; chats are not tied to a post
      postId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
      buyerId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      agentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    },
    {
      // Unique per participant pair
      indexes: [{ unique: true, fields: ["buyerId", "agentId"] }],
    }
  );
  return Chat;
};
