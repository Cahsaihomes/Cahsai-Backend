// src/server.mjs
import app from "./app.mjs";
import { sequelize } from "./models/userModel/index.mjs";
import config from "./config/config.mjs";
import { createServer } from "http";
import { Server } from "socket.io";
import setupSocket from "./socket/index.mjs";
import { initializeDefaultRoles } from "./utils/initializeRoles.mjs";
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected"); 
    await sequelize.sync({ alter: true });
    console.log("✅ Database synchronized");
    
    // Initialize default roles
    await initializeDefaultRoles();
    
    const httpServer = createServer(app);

    // Setup socket.io
    const allowedOrigins = [
      "https://0e22ec332490.ngrok-free.app",
      "https://cahsai-one.vercel.app",
      "https://cahsai-nine.vercel.app",
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:5000",
      "https://cahsai-frontend-production.up.railway.app",
      "https://cahsai.com"
    ];
    const io = new Server(httpServer, {
      cors: {
      origin: "*",
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true
      },
    });

    // Initialize socket events
    setupSocket(io);
    console.log("🎧 Socket.io setup complete... waiting for connections");

    // Attach io to app (optional: so controllers can emit events)
    app.set("io", io);

    httpServer.listen(config.PORT, () =>
      console.log(`🚀 Server running on http://localhost:${config.PORT}`)
    );
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
})();
