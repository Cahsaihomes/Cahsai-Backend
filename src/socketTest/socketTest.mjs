// socketTest.mjs
import { io } from "socket.io-client";

// Connect to your server
const socket = io("http://localhost:5000", {
  transports: ["websocket"], // force WebSocket
});

socket.on("connect", () => {
  console.log("✅ Connected to server with id:", socket.id);

  // 1️⃣ Join a room
  socket.emit("joinRoom", "room123");
  console.log("👉 Sent joinRoom for room123");

  // 2️⃣ Send a message
  setTimeout(() => {
    socket.emit("sendMessage", {
      roomId: "room123",
      text: "Hello from test client 🚀",
    });
    console.log("👉 Sent message to room123");
  }, 1000);

  // 3️⃣ Like a message
  setTimeout(() => {
    socket.emit("likeMessage", {
      roomId: "room123",
      messageId: "msg001",
      userId: "buyer1",
    });
    console.log("👉 Liked message msg001");
  }, 2000);
});

// Listen for messages from server
socket.on("receiveMessage", (data) => {
  console.log("📩 Message received from server:", data);
});

socket.on("messageLiked", (data) => {
  console.log("👍 Message liked:", data);
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from server");
});
