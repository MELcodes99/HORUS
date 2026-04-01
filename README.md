 ⚡ Horus AI — Private Crypto Research Agent ( MADE BY CRYPTO_JEDI 
(mel_sol1)

 📌 Overview

Horus AI is a privacy-focused crypto research agent that analyzes market 
odds, news sentiment, and developer activity to generate intelligent 
insights for a given query.

The system combines:
- Market data
- News sentiment analysis
- GitHub developer activity
- AI reasoning

It returns structured, human-readable insights through a clean chat-style 
interface.

---

## 🚀 Features

- Real-time crypto research analysis
- Combines multiple signals:
  - Market odds
  - News sentiment
  - Developer activity (GitHub)
- AI-powered reasoning using OpenAI
- Structured JSON responses
- Modern glass-style chat UI
- Privacy-aware inference workflow

---

## 🧠 How It Works

1. User enters a query in the frontend
2. The frontend sends a POST request to `/api/ask`
3. The backend:
   - Fetches relevant market, news, and developer data
   - Builds a structured prompt
   - Sends the prompt to the OpenAI model
   - Receives a JSON response
4. The frontend parses and displays the structured output in the UI

---

## 🔐 Why Private Inference Matters

This project is designed with privacy in mind.

Private inference ensures that:

- User queries remain confidential
- Sensitive research queries are not exposed to third parties
- Financial or strategic intent is protected
- Data privacy is preserved during AI processing
- It aligns with the needs of Web3 and decentralized applications

The integration of a privacy layer (TEE-based encryption via SolRouter 
SDK) demonstrates how secure AI workflows can be implemented in real-world 
applications.

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd horus

npm install

Create a .env file in the root directory:

OPENAI_API_KEY=your_openai_api_key

RUN THE SERVER : node src/server.js

Open your browser and visit : https://localhost:3000

POST /api/ask

Request:

{
  "message": "Is SOL bullish?"
}

Response :

{
  "success": true,
  "data": {
    "sentiment": "Bullish",
    "summary": "Short explanation...",
    "signals": {
      "marketOdds": "...",
      "newsSentiment": "...",
      "developerActivity": "..."
    },
    "analysis": "Combined reasoning...",
    "risks": ["risk1", "risk2"]
  }
}


🛠️ Tech Stack
Node.js
Express.js
OpenAI API
Vanilla JavaScript (frontend)
HTML/CSS (glass UI)
SolRouter SDK (privacy layer)

📌 Notes
The AI is instructed to return strict JSON
The frontend parses and renders structured responses
The system is modular and can be extended with additional data sources
Designed for experimentation with AI + Web3 + privacy workflows

⚠️ Disclaimer

This tool is for informational and educational purposes only. It does not 
provide financial advice.
