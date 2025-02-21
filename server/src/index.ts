import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { setupGameServer } from "./GameManager";
import { createServer } from "http";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

setupGameServer(io);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
