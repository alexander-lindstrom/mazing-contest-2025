import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";
import { setupGameServer } from "./SocketManager";

const app = express();
const PORT = 5000;
const VITE_PORT = 5173;

app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: `http://localhost:${VITE_PORT}`,
    methods: ["GET", "POST"]
  }
});

setupGameServer(io);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});