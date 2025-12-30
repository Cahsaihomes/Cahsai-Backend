import sequelize from "../../config/database.mjs";
import { DataTypes } from "sequelize";

import MessageLikeModel from "./messageLike.model.mjs";
import ChatMessageModel from "../chatMessageModel/chatMessage.model.mjs";
import UserModel from "../userModel/user.model.mjs";

const MessageLike = MessageLikeModel(sequelize, DataTypes);
const ChatMessage = ChatMessageModel(sequelize, DataTypes);
const User = UserModel(sequelize, DataTypes);

MessageLike.belongsTo(ChatMessage, {
  foreignKey: "messageId",
  as: "message",
  onDelete: "CASCADE",
});
MessageLike.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
  onDelete: "CASCADE",
});

ChatMessage.hasMany(MessageLike, {
  foreignKey: "messageId",
  as: "likes",
  onDelete: "CASCADE",
});

export { sequelize, MessageLike, ChatMessage, User };
