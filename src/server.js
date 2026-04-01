import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import OpenAI from "openai";
import { SolRouter } from "@solrouter/sdk";
import { analyzeDataWithAI } from "./agent.js";

dotenv.config();

// -----------------------------
// ENV VALIDATION
// -----------------------------
function requireEnv(key) {
  const value = process.env[key];
  if (!value || value.trim() === "") {
    console.error(`❌ Missing or empty environment variable: ${key}`);
    process.exit(1);
  }
  return value.trim();
}

const OPENAI_API_KEY = requireEnv("OPENAI_API_KEY");
const SOLROUTER_API_KEY = requireEnv("SOLROUTER_API_KEY");

console.log("✅ Environment variables loaded");

// -----------------------------
// CLIENTS
// -----------------------------
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const solrouter = new SolRouter({
  apiKey: SOLROUTER_API_KEY,
});

// -----------------------------
// VALIDATE OPENAI (STRICT)
// -----------------------------
async function validateOpenAI() {
  try {
    await openai.models.list();
    console.log("✅ OpenAI API key is valid");
  } catch (err) {
    console.error("❌ Invalid OpenAI API key");
    process.exit(1);
  }
}

// -----------------------------
// VALIDATE SOLROUTER (SMART)
// -----------------------------
async function validateSolRouter() {
  try {
    const response = await fetch("https://api.solrouter.com/agent", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SOLROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: "test",
        model: "gpt-oss:20b",
        useTools: false,
      }),
    });

    const data = await response.json();

    // ✅ Invalid API key
    if (response.status === 401 || response.status === 403) {
      console.error("❌ Invalid SolRouter API key");
      process.exit(1);
    }

    // ⚠️ Service issue (NOT key issue)
    if (response.status === 503) {
      console.warn("⚠️ SolRouter service unavailable (503). Continuing anyway...");
      return;
    }

    // Other non-OK responses
    if (!response.ok) {
      console.warn("⚠️ SolRouter returned unexpected response:", data);
      return;
    }

    console.log("✅ SolRouter API key is valid");
  } catch (err) {
    console.error("❌ SolRouter validation failed:", err.message);
    process.exit(1);
  }
}

// -----------------------------
// BOOTSTRAP
// -----------------------------
async function bootstrap() {
  await validateOpenAI();
  await validateSolRouter();

  const app = express();
  app.use(express.json());

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  app.use(express.static(path.join(__dirname, "../public")));

  // -----------------------------
  // API ROUTE
  // -----------------------------
  app.post("/api/ask", async (req, res) => {
    try {
      const { message } = req.body;

      if (!message || message.trim() === "") {
        return res.status(400).json({
          success: false,
          error: "Message is required",
        });
      }

      // OpenAI processing
      const result = await analyzeDataWithAI(message);

      let parsed;
      try {
        parsed = JSON.parse(result);
      } catch {
        return res.status(500).json({
          success: false,
          error: "AI returned invalid JSON",
        });
      }

      // SolRouter usage
      let solrouterResponse = null;

      try {
        const solRes = await solrouter.chat(message);
        solrouterResponse = solRes?.message || null;
      } catch (err) {
        console.error("❌ SolRouter request failed:", err.message);

        // Distinguish runtime errors
        return res.status(502).json({
          success: false,
          error: "SolRouter request failed (possible service issue or invalid request)",
        });
      }

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
  // START SERVER
  // -----------------------------
  const PORT = 3000;

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

// Run app
bootstrap();

