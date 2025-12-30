import sequelize from "../../config/database.mjs";
import { DataTypes } from "sequelize";

import ChatModel from "./chat.model.mjs";
import PostModel from "../postModel/post.model.mjs";
import UserModel from "../userModel/user.model.mjs";

const Chat = ChatModel(sequelize, DataTypes);
const Post = PostModel(sequelize, DataTypes);
const User = UserModel(sequelize, DataTypes);

Chat.belongsTo(Post, { foreignKey: "postId", as: "post", onDelete: "CASCADE" });
Chat.belongsTo(User, {
  foreignKey: "buyerId",
  as: "buyer",
  onDelete: "CASCADE",
});
Chat.belongsTo(User, {
  foreignKey: "agentId",
  as: "agent",
  onDelete: "CASCADE",
});

export { sequelize, Chat, Post, User };
