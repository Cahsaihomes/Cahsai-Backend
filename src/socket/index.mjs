import registerChatEvents from "./messages.mjs";
import { registerNotificationEvents } from "./notifications.mjs";
import { setIO } from "./notify.mjs";
import { setTourIO, registerTourSocketEvents } from "./tourEvents.mjs";


export default function setupSocket(io) {
  setIO(io);
  setTourIO(io);
  io.on("connection", (socket) => {
    console.log(`🔥 Socket connected: ${socket.id}`);

  registerChatEvents(io, socket);
  registerNotificationEvents(io, socket);
  registerTourSocketEvents(socket);


    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });
}
