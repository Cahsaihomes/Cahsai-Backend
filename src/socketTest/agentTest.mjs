// src/socketTest/agentTest.mjs
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log(`🎩 Agent connected with id: ${socket.id}`);

  // Join the same room
  const roomId = "room123";
  socket.emit("joinRoom", roomId);
  console.log(`🎩 Agent joined room: ${roomId}`);

  // Reply after 2 sec
  setTimeout(() => {
    socket.emit("sendMessage", {
      roomId,
      sender: "agent1",
      text: "Hello Buyer, thanks for reaching out! 🙌",
    });
    console.log("🎩 Agent replied");
  }, 2000);

  // Like buyer's message after 5 sec
  setTimeout(() => {
    socket.emit("likeMessage", {
      roomId,
      messageId: "msg001", // assume msg001 was buyer's message
      userId: "agent1",
    });
    console.log("🎩 Agent liked Buyer's message msg001");
  }, 5000);
});

// Listen for messages
socket.on("receiveMessage", (data) => {
  console.log("💬 Agent received:", data);
});

// Listen for likes
socket.on("messageLiked", (data) => {
  console.log("👍 Agent saw like event:", data);
});
