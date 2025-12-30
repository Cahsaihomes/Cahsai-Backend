import { io as Client } from "socket.io-client";
// Emit lead assigned to agent
export function emitLeadAssigned(agentId, tourData) {
  const user = connectedUsers[agentId];
  if (user) {
    Client.to(user.socketId).emit("leadAssigned", tourData);
  }
}

// Emit agent rotation
export function emitAgentRotated(agentId, tourData) {
  const user = connectedUsers[agentId];
  if (user) {
    io.to(user.socketId).emit("agentRotated", tourData);
  }
}

// Emit tour confirmed
export function emitTourConfirmed(tourId, tourData) {
  io.to(`tour_${tourId}`).emit("tourConfirmed", tourData);
}

// Emit tour expired
export function emitTourExpired(tourId, tourData) {
  io.to(`tour_${tourId}`).emit("tourExpired", tourData);
}

