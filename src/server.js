import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { analyzeDataWithAI } from "./agent.js";

// Load environment variables
import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";
import { SolRouter } from "@solrouter/sdk";

// -----------------------------
// 1. ENV VARIABLE VALIDATION
// -----------------------------
const requiredEnvVars = ["OPENAI_API_KEY", "SOLROUTER_API_KEY"];

let hasMissingEnv = false;

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing environment variable: ${key}`);
    hasMissingEnv = true;
  }
});

if (hasMissingEnv) {
  process.exit(1);
}

console.log("✅ All environment variables loaded");

// -----------------------------
// 2. INITIALIZE CLIENTS
// -----------------------------
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const solrouter = new SolRouter({
  apiKey: process.env.SOLROUTER_API_KEY,
});

// -----------------------------
// 3. TEST OPENAI KEY
// -----------------------------
(async () => {
  try {
    await openai.models.list();
    console.log("✅ OpenAI API key is valid");
  } catch (err) {
    console.error("❌ Invalid OpenAI API key");
    process.exit(1);
  }
})();

// -----------------------------
// 4. TEST SOLROUTER KEY (SDK WAY)
// -----------------------------
(async () => {
  try {
    // Use a harmless test prompt
    const res = await solrouter.chat("test connection");

    if (!res || !res.message) throw new Error("Invalid response");

    console.log("✅ SolRouter API key is valid");
  } catch (err) {
    console.error("❌ Invalid SolRouter API key");
    console.error(err.message || err);
    process.exit(1);
  }
})();

// -----------------------------
// 5. EXPRESS SETUP
// -----------------------------
const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "../public")));

// -----------------------------
// 6. API ROUTE
// -----------------------------
app.post("/api/ask", async (req, res) => {
  try {
    const { message } = req.body;

    console.log("📩 Incoming message:", message);

    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      });
    }

    // Step 1: AI logic (OpenAI via your agent)
    const result = await analyzeDataWithAI(message);

    console.log("🤖 RAW AI RESPONSE:", result);

    let parsed;
    try {
      parsed = JSON.parse(result);
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: "AI returned invalid JSON",
        raw: result,
      });
    }

    // Step 2: SolRouter usage
    let solrouterResponse = null;

    try {
      const solRes = await solrouter.chat(message);
      solrouterResponse = solRes?.message || null;
    } catch (err) {
      console.warn("⚠️ SolRouter call failed:", err.message);
    }

    // Step 3: Return combined response
    return res.json({
      success: true,
      data: parsed,
      solrouter: solrouterResponse,
    });

  } catch (err) {
    console.error("❌ SERVER ERROR:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Something went wrong",
    });
  }
});

// -----------------------------
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

