export const clearChatMessages = async (chatId) => {
  if (!chatId) throw new Error("chatId required");
  await ChatMessage.destroy({ where: { chatId } });
  return true;
};
import { ChatMessage } from "../../models/chatMessageModel/index.mjs";
import { User } from "../../models/userModel/index.mjs";
import { Op } from "sequelize";

export const createMessage = ({ chatId, senderId, content, imageUrl, type = "text", videoUrl, meta, replyToId }) =>
  ChatMessage.create({ chatId, senderId, content, imageUrl, type, videoUrl, meta, replyToId });

export const findById = (id) =>
  ChatMessage.findByPk(id, {
    include: [
      {
        model: User,
        as: "sender",
        attributes: [
          "id",
          "first_name",
          "last_name",
          "user_name",
          "avatarUrl",
          "role",
        ],
      },
      { model: ChatMessage, as: "replyTo" },
    ],
  });

export const listMessages = async ({ chatId, cursor, limit }) => {
  const where = { chatId };
  if (cursor) where.id = { [Op.lt]: cursor };

  const rows = await ChatMessage.findAll({
    where,
    include: [
      {
        model: User,
        as: "sender",
        attributes: [
          "id",
          "first_name",
          "last_name",
          "user_name",
          "avatarUrl",
          "role",
        ],
      },
      { model: ChatMessage, as: "replyTo" },
    ],
    order: [["id", "ASC"]],
    limit,
  });
  // Compute labels for UI clarity
  const labelFor = (msg) => {
    switch (msg.type) {
      case "video":
        return "[Video Sent]";
      case "tour_update":
        return "[Tour Update]";
      case "image":
        return "[Image Sent]";
      case "system":
        return "[System]";
      default:
        return undefined;
    }
  };
  return rows.map((r) => ({ ...r.toJSON(), label: labelFor(r) }));
};

export const getLatestMessages = async ({ chatId, limit = 1 }) => {
  const rows = await ChatMessage.findAll({
    where: { chatId },
    include: [
      {
        model: User,
        as: "sender",
        attributes: [
          "id",
          "first_name",
          "last_name",
          "user_name",
          "avatarUrl",
          "role",
        ],
      },
      { model: ChatMessage, as: "replyTo" },
    ],
    order: [["id", "DESC"]],
    limit,
  });
  // Compute labels for UI clarity
  const labelFor = (msg) => {
    switch (msg.type) {
      case "video":
        return "[Video Sent]";
      case "tour_update":
        return "[Tour Update]";
      case "image":
        return "[Image Sent]";
      case "system":
        return "[System]";
      default:
        return undefined;
    }
  };
  return rows.map((r) => ({ ...r.toJSON(), label: labelFor(r) }));
};
