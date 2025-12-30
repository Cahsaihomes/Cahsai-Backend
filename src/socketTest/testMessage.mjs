import { io as Client } from "socket.io-client";

// Adjust URL to your server
const SERVER_URL = process.env.SOCKET_URL || "http://localhost:5000";

const client = Client(SERVER_URL, { transports: ["websocket"] });

client.on("connect", () => {
  console.log("Connected as", client.id);

  // Example payloads
  const buyerId = Number(process.env.TEST_BUYER_ID) || 1;
  const agentId = Number(process.env.TEST_AGENT_ID) || 2;

  client.emit("createOrGetRoom", { buyerId, agentId });
});

client.on("roomReady", ({ chatId }) => {
  console.log("Room ready chatId:", chatId);
  client.emit("joinRoom", { chatId });

  setTimeout(() => {
    client.emit("sendMessage", { chatId, senderId: 1, content: "Hello from test!" });
  }, 500);

  setTimeout(() => {
    client.emit("getHistory", { chatId, limit: 10 });
  }, 1000);
});

client.on("joinedRoom", ({ chatId }) => {
  console.log("Joined room", chatId);
});

client.on("receiveMessage", (msg) => {
  console.log("Received message:", msg);
});

client.on("history", ({ chatId, messages }) => {
  console.log(`History for ${chatId} (count=${messages.length})`);
});

client.on("error", (e) => {
  console.error("Socket error:", e);
});

client.on("disconnect", () => {
  console.log("Disconnected");
});
