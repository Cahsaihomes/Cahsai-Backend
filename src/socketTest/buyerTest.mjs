// src/socketTest/buyerTest.mjs
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log(`🛒 Buyer connected with id: ${socket.id}`);

  // Join chat room
  const roomId = "room123"; // could be postId-based
  socket.emit("joinRoom", roomId);
  console.log(`🛒 Buyer joined room: ${roomId}`);

  // Send message to agent
  setTimeout(() => {
    socket.emit("sendMessage", {
      roomId,
      sender: "buyer1",
      text: "Hi Agent, I'm interested in your post 📌",
    });
    console.log("🛒 Buyer sent a message");
  }, 1000);

  // Like agent's message after 4 sec
  setTimeout(() => {
    socket.emit("likeMessage", {
      roomId,
      messageId: "msg002", // assume msg002 came from agent
      userId: "buyer1",
    });
    console.log("🛒 Buyer liked Agent's message msg002");
  }, 4000);
});

// Listen for messages
socket.on("receiveMessage", (data) => {
  console.log("💬 Buyer received:", data);
});

// Listen for likes
socket.on("messageLiked", (data) => {
  console.log("👍 Buyer saw like event:", data);
});
