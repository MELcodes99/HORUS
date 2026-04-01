import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { analyzeDataWithAI } from "./agent.js";

// Load environment variables
import dotenv from "dotenv";
dotenv.config();

// ✅ REQUIRED ENV VALIDATION (ADD THIS)
const requiredEnvVars = ["OPENAI_API_KEY", "SOLROUTER_API_KEY"];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing environment variable: ${key}`);
    process.exit(1);
  }
});

const app = express();
app.use(express.json());
    
// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend
app.use(express.static(path.join(__dirname, "../public")));
        
// API route
app.post("/api/ask", async (req, res) => {
  try {
    const { message } = req.body;
    
    console.log("📩 Incoming message:", message);
      
    // Validate input
    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      });
    }
      
    // Call AI function
    const result = await analyzeDataWithAI(message);
   
    console.log("🤖 RAW AI RESPONSE:", result);

    // Parse AI JSON safely
    let parsed;
    try {
      parsed = JSON.parse(result);
    } catch (err) {
      console.error("❌ JSON PARSE ERROR:", result);
   
      return res.status(500).json({
        success: false,
        error: "AI returned invalid JSON",
        raw: result,
      });
    }

    // Send structured response
    return res.json({
      success: true,
      data: parsed,
    });

  } catch (err) {
    console.error("❌ SERVER ERROR:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Something went wrong",
    });
  }
});

const PORT = 3000;
    
console.log("🔥 SERVER FILE EXECUTING");
      
app.listen(PORT, () => {
  console.log(`🚀 Horus server running on http://localhost:${PORT}`);
});

