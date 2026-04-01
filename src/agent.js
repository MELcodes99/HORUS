import "dotenv/config";
import { fetchAllData } from "./fetchData.js";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeDataWithAI(message) {
  try {
    console.log("📩 Incoming message:", message);

    const data = await fetchAllData(message);

    const marketOdds = data?.odds?.probability ?? "N/A";
    const sentiment = data?.news?.sentiment ?? "N/A";
    const sentimentScore = data?.news?.score ?? "N/A";
    const githubStars = data?.github?.stars ?? "N/A";
    const githubForks = data?.github?.forks ?? "N/A";
    const githubActivity = data?.github?.activity ?? "N/A";

    const prompt = `
You are a sharp crypto analyst.

Write a clear, natural, human-like analysis. Avoid sounding robotic or overly formal.

STYLE GUIDELINES:
- Be detailed but easy to understand
- Explain insights in plain English
- Avoid jargon unless necessary, and if used, keep it simple
- Keep tone natural, intelligent, and conversational
- Do not sound like a textbook or news article
- Do not mention that you are an AI

DEPTH GUIDELINES:
- Provide meaningful explanations, not one-line statements
- Each signal should include what it means and why it matters
- Connect the signals together in your reasoning
- Be balanced — do not exaggerate bullish or bearish views without justification

User Query:
${message}

Market Data:
- Market Odds: ${marketOdds}%
- News Sentiment: ${sentiment} (score: ${sentimentScore})
- GitHub Stars: ${githubStars}
- GitHub Forks: ${githubForks}
- GitHub Activity: ${githubActivity}

Return ONLY valid JSON in this format:

{
  "sentiment": "Bullish | Bearish | Neutral",
  "summary": "2–4 sentences explaining the overall outlook in a simple, clear way",
  "signals": {
    "marketOdds": "Explain what the odds suggest and what it implies",
    "newsSentiment": "Explain the sentiment and what it reflects",
    "developerActivity": "Explain what the dev activity indicates and why it matters"
  },
  "analysis": "Combine all signals into a clear, natural explanation of the overall outlook",
  "risks": ["risk1", "risk2", "risk3"]
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a concise, human-like crypto analyst that returns only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const result = completion.choices[0].message.content;

    console.log("🤖 AI RAW OUTPUT:\n", result);

    return result;

  } catch (err) {
    console.error("❌ Error during analysis:", err.message);
    return JSON.stringify({ error: "Analysis failed" });
  }
}

