// src/socket/tourEvents.mjs
let ioInstance;

export function setTourIO(io) {
  ioInstance = io;
}

export function emitAgentRotated(agentId, tourData) {
  if (ioInstance) {
    ioInstance.to(`agent_${agentId}`).emit("agentRotated", tourData);
  }
}

export function emitTourExpired(tourId, tourData) {
  if (ioInstance) {
    ioInstance.to(`tour_${tourId}`).emit("tourExpired", tourData);
  }
}
// Register agent and tour room join events
export function registerTourSocketEvents(socket) {
  socket.on("registerAgent", (agentId) => {
    socket.join(`agent_${agentId}`);
  });
  socket.on("joinTour", (tourId) => {
    socket.join(`tour_${tourId}`);
  });
}