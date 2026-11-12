// import { io, Socket } from "socket.io-client"

// let socket: Socket | null = null

// export const getSocket = () => {
//     if (!socket) {
//         const socketUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:8000"
//         socket = io(socketUrl, {
//             transports: ["websocket", "polling"],
//         })
//     }
//     return socket
// }

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io("http://localhost:8000", {
      transports: ["websocket", "polling"]
    });
  }
  return socket;
};