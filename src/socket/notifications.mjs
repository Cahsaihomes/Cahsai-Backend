
const roomForPost = (postId) => `post:${postId}`;
const roomForUser = (userId) => `user:${userId}`;

export function registerNotificationEvents(io, socket) {

  socket.on("subscribePost", ({ postId }) => {
    if (!postId) return;
    const room = roomForPost(postId);
    socket.join(room);
    socket.emit("subscribedPost", { postId });
  });

  socket.on("unsubscribePost", ({ postId }) => {
    if (!postId) return;
    socket.leave(roomForPost(postId));
    socket.emit("unsubscribedPost", { postId });
  });
  
  socket.on("subscribeUser", ({ userId }) => {
    if (!userId) return;
    const room = roomForUser(userId);
    socket.join(room);
    socket.emit("subscribedUser", { userId });
  });

  socket.on("unsubscribeUser", ({ userId }) => {
    if (!userId) return;
    socket.leave(roomForUser(userId));
    socket.emit("unsubscribedUser", { userId });
  });

  // Handle joining notification room (for real-time notifications)
  socket.on("joinNotificationRoom", ({ userId }) => {
    if (!userId) return;
    const room = roomForUser(userId);
    socket.join(room);
    console.log(`User ${userId} joined notification room: ${room}`);
    socket.emit("joinedNotificationRoom", { userId, room });
  });
}

export const NotificationRooms = { roomForPost, roomForUser };
