import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { analyzeDataWithAI } from "./agent.js";

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Health check
app.get("/", (req, res) => {
  res.send("🚀 Server is running");
});

// API route
app.post("/api/ask", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const result = await analyzeDataWithAI(message);

    let parsed;

    try {
      parsed = JSON.parse(result);
    } catch (error) {
      console.error("❌ JSON parse error:", result);

      return res.status(500).json({
        error: "AI returned invalid JSON",
        raw: result
      });
    }

    res.json(parsed);

  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

