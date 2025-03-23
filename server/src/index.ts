import 'dotenv/config';
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { createServer as createHttpServer } from "http";
import { createServer as createHttpsServer } from "https";
import { setupGameServer } from "./SocketManager";
import fs from "fs";
import { getMaze } from './service';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const isProduction = process.env.NODE_ENV === "production";

let server;

if (isProduction) {
  if (!process.env.PRIVATE_KEY || !process.env.CERTIFICATE) {
    throw new Error("PRIVATE_KEY or CERTIFICATE environment variables are not defined.");
  }

  const options = {
    key: fs.readFileSync(process.env.PRIVATE_KEY),
    cert: fs.readFileSync(process.env.CERTIFICATE)
  };
  
  server = createHttpsServer(options, app);
} else {
  server = createHttpServer(app);
}

const io = new Server(server, {
  cors: {
    origin: isProduction 
      ? "https://mazing-contest.se" 
      : "http://localhost:5173",
    methods: ["GET", "POST"]
    //credentials: true 
  }
});

app.get('/api/maze', (req, res) => {
  const maze = getMaze();
  res.json({ maze });
});

app.put('/api/result', (req, res) => {
  const result = req.body; 
  //validateResult(result);
  //persistResult(result);

  res.status(200).json({ message: 'Success', result });
});

setupGameServer(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (${isProduction ? 'HTTPS' : 'HTTP'})`);
});