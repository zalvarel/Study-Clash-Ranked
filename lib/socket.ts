import { io, type Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "@/src/shared/events";

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
let currentToken: string | null = null;

export function getSocket(token: string): Socket<ServerToClientEvents, ClientToServerEvents> {
  if (socket && currentToken === token) {
    if (!socket.connected && !socket.active) {
      socket.connect();
    }
    return socket;
  }

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  currentToken = token;
  const serverUrl =
    typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

  socket = io(serverUrl, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentToken = null;
  }
}
