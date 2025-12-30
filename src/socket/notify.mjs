
import { NotificationRooms } from "./notifications.mjs";

let ioRef = null;

export function setIO(io) {
  ioRef = io;
}

function ensureIO() {
  if (!ioRef) throw new Error("Socket IO not initialized. Call setIO(io) at startup.");
  return ioRef;
}

export function notifyCommentCreated(payload) {
  const io = ensureIO();
  const { postId, postOwnerId } = payload || {};
  if (!postId) return;

  io.to(NotificationRooms.roomForPost(postId)).emit("comment:created", payload);
  if (postOwnerId) {
    io.to(NotificationRooms.roomForUser(postOwnerId)).emit("comment:created", payload);
  }
}

export function notifyNewNotification(notification) {
  const io = ensureIO();
  const { userId } = notification || {};
  if (!userId) return;

  console.log(`Emitting new notification to user ${userId}:`, notification.title);
  io.to(NotificationRooms.roomForUser(userId)).emit("newNotification", notification);
}
