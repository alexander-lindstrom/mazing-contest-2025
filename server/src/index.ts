import express from "express";
import cors from "cors";
import { generateStartingState } from "@mazing/util";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running!");
});

const config = generateStartingState();
console.log(config)

// Endpoints:
// GET configuration (random grid, resources)
// GET shortest path
// POST final grid

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
