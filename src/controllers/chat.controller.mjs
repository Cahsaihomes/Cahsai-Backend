import * as chatService from "../app/services/chat.service.mjs";

// Buyer starts chat by replying to a post OR sends first message if chat exists
export const startOrSendFirstMessageController = async (req, res) => {
  try {
    const user = req.user;
    const { postId } = req.params;
    const { content, imageUrl } = req.body;

    if (!postId)
      return res
        .status(400)
        .json({ success: false, message: "Post ID is required" });
    if (!content && !imageUrl)
      return res
        .status(400)
        .json({ success: false, message: "content or imageUrl is required" });

    const result = await chatService.startOrSendFirstMessage({
      user,
      postId: Number(postId),
      content,
      imageUrl,
    });

    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// Send message to an existing chat
export const sendMessageToChatController = async (req, res) => {
  try {
    const user = req.user;
    const { chatId } = req.params;
    const { content, imageUrl } = req.body;

    if (!chatId)
      return res
        .status(400)
        .json({ success: false, message: "Chat ID is required" });
    if (!content && !imageUrl)
      return res
        .status(400)
        .json({ success: false, message: "content or imageUrl is required" });

    const msg = await chatService.sendMessageToChat({
      user,
      chatId: Number(chatId),
      content,
      imageUrl,
    });

    return res.status(201).json({ success: true, data: msg });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// List chats for logged-in user
export const listMyChatsController = async (req, res) => {
  try {
    const chats = await chatService.listChatsForUser(req.user.id);
    return res.status(200).json({ success: true, data: chats });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// List messages in a chat
export const listMessagesController = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { cursor, limit } = req.query;
    if (!chatId)
      return res
        .status(400)
        .json({ success: false, message: "Chat ID is required" });

    const data = await chatService.listMessages({
      userId: req.user.id,
      chatId: Number(chatId),
      cursor: cursor ? Number(cursor) : undefined,
      limit: limit ? Number(limit) : 30,
    });

    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// Like / Unlike
export const likeMessageController = async (req, res) => {
  try {
    const { messageId } = req.params;
    if (!messageId)
      return res
        .status(400)
        .json({ success: false, message: "Message ID is required" });

    const like = await chatService.likeMessage(req.user.id, Number(messageId));
    return res.status(201).json({ success: true, data: like });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const unlikeMessageController = async (req, res) => {
  try {
    const { messageId } = req.params;
    if (!messageId)
      return res
        .status(400)
        .json({ success: false, message: "Message ID is required" });

    await chatService.unlikeMessage(req.user.id, Number(messageId));
    return res.status(200).json({ success: true, message: "Unliked" });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};
