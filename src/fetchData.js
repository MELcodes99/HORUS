import axios from "axios";

// Mock Polymarket data
async function getPolymarketOdds(query) {
  return {
    market: query,
    probability: Math.floor(Math.random() * 100),
  };
}

// Mock News Sentiment
async function getNewsSentiment(query) {
  return {
    sentiment: "Positive",
    score: 0.7,
  };
}

// Mock GitHub Activity
async function getGithubActivity(query) {
  return {
    activity: "Increasing",
    commits: Math.floor(Math.random() * 100),
  };
}

export async function fetchAllData(query) {
  const odds = await getPolymarketOdds(query);
  const news = await getNewsSentiment(query);
  const github = await getGithubActivity(query);

  return { odds, news, github };
}

