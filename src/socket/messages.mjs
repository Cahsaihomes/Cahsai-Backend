import * as chatRepo from "../app/repositories/chat.repo.mjs";
import * as messageRepo from "../app/repositories/message.repo.mjs";
import { Op } from "sequelize";


const roomForChat = (chatId) => `chat:${chatId}`;

export default function registerChatEvents(io, socket) {



  socket.on("joinRoom", async ({ chatId }) => {
    if (!chatId) return;
    const room = roomForChat(chatId);
    socket.join(room);
    socket.emit("joinedRoom", { chatId });
  });
    socket.on("createOrGetRoom", async ({ buyerId, agentId }) => {
    try {
        if (!buyerId || !agentId) {
          return socket.emit("error", { message: "buyerId and agentId required" });
      }
        let chat = await chatRepo.findByParticipants(buyerId, agentId);
        if (!chat) chat = await chatRepo.createChat({ buyerId, agentId });
      socket.join(roomForChat(chat.id));
      socket.emit("roomReady", { chatId: chat.id });
    } catch (e) {
      socket.emit("error", { message: e.message });
    }
  });
  socket.on("sendMessage", async (payload) => {
    try {
      const { chatId, senderId, content, imageUrl, type, videoUrl, meta, replyToId } = payload || {};
      if (!chatId || !senderId || (!content && !imageUrl && !videoUrl)) {
        return socket.emit("error", { message: "chatId, senderId and content/imageUrl required" });
      }
      // Validate senderId matches authenticated user
      if (socket.user && senderId !== socket.user.id) {
        return socket.emit("error", { message: "senderId does not match authenticated user" });
      }
      const msg = await messageRepo.createMessage({ chatId, senderId, content: content || null, imageUrl: imageUrl || null, type, videoUrl, meta, replyToId });
      
      // Fetch the complete message with sender information
      const completeMsg = await messageRepo.findById(msg.id);
      
      const label = (() => {
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
      })();
      io.to(roomForChat(chatId)).emit("receiveMessage", { ...completeMsg.toJSON(), label });
    } catch (e) {
      socket.emit("error", { message: e.message });
    }
  });
  socket.on("typing", ({ chatId, senderId, typing }) => {
    if (!chatId) return;
    socket.to(roomForChat(chatId)).emit("typing", { chatId, senderId, typing: !!typing });
  });

  socket.on("getHistory", async ({ chatId, cursor, limit = 1000000000 }) => {
    try {
      if (!chatId) return socket.emit("error", { message: "chatId required" });
      const where = { chatId };
      if (cursor) {

        where.id = { [Op.lt]: Number(cursor) };
      }
      const rows = await messageRepo.listMessages({ chatId, cursor: cursor ? Number(cursor) : undefined, limit });
      socket.emit("history", { chatId, messages: rows });
    } catch (e) {
      socket.emit("error", { message: e.message });
    }
  });
  socket.on("getContactList", async ({ userId }) => {
    try {
      if (!userId) return socket.emit("error", { message: "userId required" });

      const chats = await chatRepo.listByUser(userId);

      const contactList = await Promise.all(chats.map(async (chat) => {

        let contact;
        if (chat.buyer && chat.buyer.id !== userId) contact = chat.buyer;
        else if (chat.agent && chat.agent.id !== userId) contact = chat.agent;
        else contact = null;
      
        const messages = await messageRepo.getLatestMessages({ chatId: chat.id, limit: 1 });
        return {
          chatId: chat.id,
          contact,
          contactRole: contact ? contact.role : null,
          messages,
        };
      }));
      socket.emit("contactList", { contacts: contactList });
    } catch (e) {
      socket.emit("error", { message: e.message });
    }
  });
    socket.on("clearChat", async ({ chatId }) => {
    try {
      if (!chatId) return socket.emit("error", { message: "chatId required" });
      await messageRepo.clearChatMessages(chatId);
      io.to(roomForChat(chatId)).emit("chatCleared", { chatId });
    } catch (e) {
      socket.emit("error", { message: e.message });
    }
  });
}
