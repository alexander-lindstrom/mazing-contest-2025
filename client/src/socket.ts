import { io, Socket } from 'socket.io-client';

const URL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:5000'
    : import.meta.env.VITE_BACKEND_URL;

let socket: Socket | null = null;

export const getSocket = (userId: string): Socket => {
  if (!socket) {
    socket = io(URL, {
      autoConnect: false,
      transports: ['websocket'],
      query: {
        userId: userId
      }
    });
  }
  return socket;
};
