import { io } from "socket.io-client";
import { API_BASE_URL } from "./api.js";

let socket = null;

export const connectSocket = () => {
  if (!socket) {
    socket = io(API_BASE_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
