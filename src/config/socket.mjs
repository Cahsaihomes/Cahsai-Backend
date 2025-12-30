// socket.mjs
export default function setupSocket(io) {
  io.on("connection", (socket) => {
    console.log(`🔥 New client connected: ${socket.id}`);

    // Join a chat room (buyer-agent pair)
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`✅ User joined room: ${roomId}`);
    });

    // Handle message sending
    socket.on("sendMessage", (data) => {
      console.log("📩 New message:", data);

      // Emit message to everyone in the room
      io.to(data.roomId).emit("receiveMessage", data);
    });

    // Handle likes
    socket.on("likeMessage", (data) => {
      io.to(data.roomId).emit("messageLiked", data);
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
}
