"use client";
import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";
import { Notification } from "../types/Types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL!;

let socket: Socket;

export const initSocket = () => {
  socket = io(WS_URL, {
    transports: ["websocket"],
    auth: {
      token: Cookies.get("authToken"),
    },
  });

  socket.on("connect", () => {
    console.log("Connected to WebSocket");
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from WebSocket");
  });

  return socket;
};

export const subscribeToNotifications = (
  callback: (notification: Notification) => void
) => {
  socket.on("notification", callback);
};

export const unsubscribeFromNotifications = () => {
  socket.off("notification");
};

export const disconnectSocket = () => {
  socket.disconnect();
};
