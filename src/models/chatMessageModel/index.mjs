import sequelize from "../../config/database.mjs";
import { DataTypes } from "sequelize";

import ChatMessageModel from "./chatMessage.model.mjs";
import ChatModel from "../chatModel/chat.model.mjs";
import UserModel from "../userModel/user.model.mjs";

const ChatMessage = ChatMessageModel(sequelize, DataTypes);
const Chat = ChatModel(sequelize, DataTypes);
const User = UserModel(sequelize, DataTypes);

ChatMessage.belongsTo(Chat, {
  foreignKey: "chatId",
  as: "chat",
  onDelete: "CASCADE",
});
ChatMessage.belongsTo(User, {
  foreignKey: "senderId",
  as: "sender",
  onDelete: "CASCADE",
});

Chat.hasMany(ChatMessage, {
  foreignKey: "chatId",
  as: "messages",
  onDelete: "CASCADE",
});

// Reply association (self-reference)
ChatMessage.belongsTo(ChatMessage, {
  foreignKey: "replyToId",
  as: "replyTo",
  onDelete: "SET NULL",
});

export { sequelize, ChatMessage, Chat, User };
