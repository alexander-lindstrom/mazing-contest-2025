import { io, Socket } from 'socket.io-client';

const URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(URL, {
      autoConnect: false,
      transports: ['websocket'],
    });
  }
  return socket;
};