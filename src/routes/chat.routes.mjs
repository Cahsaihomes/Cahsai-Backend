import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.mjs";
import {
  startOrSendFirstMessageController,
  sendMessageToChatController,
  listMyChatsController,
  listMessagesController,
  likeMessageController,
  unlikeMessageController,
} from "../controllers/chat.controller.mjs";

const router = express.Router();
router.post(
  "/:postId/message",
  isAuthenticated,
  startOrSendFirstMessageController
);

/** Send a message to an existing chat (buyer or agent) */
router.post("/:chatId/messages", isAuthenticated, sendMessageToChatController);

/** List chats for the logged-in user (buyer or agent) */
router.get("/my", isAuthenticated, listMyChatsController);

/** List messages in a chat (with optional pagination ?cursor=&limit=) */
router.get("/:chatId/messages", isAuthenticated, listMessagesController);

/** Like / Unlike a message */
router.post(
  "/messages/:messageId/like",
  isAuthenticated,
  likeMessageController
);
router.delete(
  "/messages/:messageId/like",
  isAuthenticated,
  unlikeMessageController
);

export default router;
