export default (sequelize, DataTypes) => {
  const ChatMessage = sequelize.define("ChatMessage", {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    chatId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    senderId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: true },
    imageUrl: { type: DataTypes.STRING, allowNull: true },
    // message type for labeling in UI
    type: {
      type: DataTypes.ENUM("text", "image", "video", "tour_update", "system"),
      allowNull: false,
      defaultValue: "text",
    },
    videoUrl: { type: DataTypes.STRING, allowNull: true },
    meta: { type: DataTypes.JSON, allowNull: true },
    // optional reply threading
    replyToId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  });
  return ChatMessage;
};
