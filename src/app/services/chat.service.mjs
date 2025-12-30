import * as chatRepo from "../repositories/chat.repo.mjs";
import * as messageRepo from "../repositories/message.repo.mjs";
import * as likeRepo from "../repositories/messageLike.repo.mjs";
// Chats are no longer tied to posts

/**
 * Buyer must initiate. If the chat already exists for (buyer, post, agent) reuse it.
 */
export const startOrSendFirstMessage = async ({ user, otherUserId, content, imageUrl, type = "text", videoUrl, meta, replyToId }) => {
  if (!user) throw new Error("Unauthorized");
  if (!otherUserId) throw new Error("otherUserId required");

  // Infer buyer/agent roles by current user role
  const isBuyer = user.role === "buyer";
  const buyerId = isBuyer ? user.id : otherUserId;
  const agentId = isBuyer ? otherUserId : user.id;

  // Find existing chat or create new by participants
  let chat = await chatRepo.findByParticipants(buyerId, agentId);
  if (!chat) chat = await chatRepo.createChat({ buyerId, agentId });

  const message = await messageRepo.createMessage({
    chatId: chat.id,
    senderId: user.id,
    content: content || null,
    imageUrl: imageUrl || null,
    type,
    videoUrl: videoUrl || null,
    meta: meta || null,
    replyToId: replyToId || null,
  });

  // (Optional) emit socket event here if you pass io (or do in socket handlers)
  return { chat, message };
};

/** Send message in existing chat (buyer or agent must belong to chat) */
export const sendMessageToChat = async ({ user, chatId, content, imageUrl, type = "text", videoUrl, meta, replyToId }) => {
  if (!user) throw new Error("Unauthorized");
  const chat = await chatRepo.findById(chatId);
  if (!chat) throw new Error("Chat not found");
  if (![chat.buyerId, chat.agentId].includes(user.id))
    throw new Error("Not a participant");

  const message = await messageRepo.createMessage({
    chatId,
    senderId: user.id,
    content: content || null,
    imageUrl: imageUrl || null,
    type,
    videoUrl: videoUrl || null,
    meta: meta || null,
    replyToId: replyToId || null,
  });

  return message;
};

/** List chats for a user */
export const listChatsForUser = async (userId) => {
  return await chatRepo.listByUser(userId);
};

/** List messages with simple cursor pagination by id */
export const listMessages = async ({ userId, chatId, cursor, limit = 30 }) => {
  const chat = await chatRepo.findById(chatId);
  if (!chat) throw new Error("Chat not found");
  if (![chat.buyerId, chat.agentId].includes(userId))
    throw new Error("Not a participant");

  return await messageRepo.listMessages({ chatId, cursor, limit });
};

/** Likes */
export const likeMessage = async (userId, messageId) => {
  // Ensure user is participant of that message's chat
  const msg = await messageRepo.findById(messageId);
  if (!msg) throw new Error("Message not found");
  const chat = await chatRepo.findById(msg.chatId);
  if (![chat.buyerId, chat.agentId].includes(userId))
    throw new Error("Not a participant");

  return await likeRepo.likeMessage(userId, messageId);
};

export const unlikeMessage = async (userId, messageId) => {
  const msg = await messageRepo.findById(messageId);
  if (!msg) throw new Error("Message not found");
  const chat = await chatRepo.findById(msg.chatId);
  if (![chat.buyerId, chat.agentId].includes(userId))
    throw new Error("Not a participant");

  return await likeRepo.unlikeMessage(userId, messageId);
};
