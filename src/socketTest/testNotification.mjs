import { io as Client } from "socket.io-client";

// Adjust URL to your server
const SERVER_URL = process.env.SOCKET_URL || "http://localhost:5000";

const client = Client(SERVER_URL, { transports: ["websocket"] });

client.on("connect", () => {
	console.log("Connected as", client.id);

	// Example payloads (env-configurable)
	const postId = Number(process.env.TEST_POST_ID) || 1; // Post to watch
	const userId = 1; // User to watch (agent)

	if (postId) client.emit("subscribePost", { postId });
	if (userId) client.emit("subscribeUser", { userId });
});

client.on("subscribedPost", ({ postId }) => {
	console.log("Subscribed to post:", postId);
});

client.on("subscribedUser", ({ userId }) => {
	console.log("Subscribed to user:", userId);
});

client.on("comment:created", (payload) => {
	console.log("[Notification] comment:created", payload);
});

client.on("error", (e) => {
	console.error("Socket error:", e);
});

client.on("disconnect", () => {
	console.log("Disconnected");
});

