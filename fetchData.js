import axios from "axios";

/**
 * GitHub activity fetch
 */
async function getGithubActivity(query) {
  try {
    const keyword = query.split(" ")[0];

    const response = await axios.get(
      `https://api.github.com/search/repositories?q=${keyword}&sort=stars&order=desc`
    );

    const repo = response.data.items[0];

    return {
      activity: repo ? "Active" : "Unknown",
      stars: repo?.stargazers_count || 0,
      forks: repo?.forks_count || 0,
      watchers: repo?.watchers_count || 0,
      openIssues: repo?.open_issues_count || 0,
      language: repo?.language || "Unknown"
    };
  } catch (error) {
    return {
      activity: "Unknown",
      stars: 0,
      forks: 0,
      watchers: 0,
      openIssues: 0,
      language: "Unknown"
    };
  }
}

/**
 * Mock Polymarket odds (can be replaced later with real API)
 */
async function getPolymarketOdds(query) {
  const base = query.toLowerCase().includes("sol") ? 35 : 50;
  const variance = Math.floor(Math.random() * 20);

  return {
    market: query,
    probability: base + variance
  };
}

/**
 * Lightweight sentiment scoring
 */
async function getNewsSentiment(query) {
  const keywords = query.toLowerCase();

  let score = 0.5;

  if (keywords.includes("sol")) score += 0.1;
  if (keywords.includes("crypto")) score += 0.05;

  score = Math.max(0, Math.min(1, score));

  let sentiment = "Neutral";
  if (score > 0.6) sentiment = "Positive";
  if (score < 0.4) sentiment = "Negative";

  return {
    sentiment,
    score: parseFloat(score.toFixed(2)),
    sources: 10
  };
}

/**
 * Main aggregator
 */
export async function fetchAllData(query) {
  const [odds, news, github] = await Promise.all([
    getPolymarketOdds(query),
    getNewsSentiment(query),
    getGithubActivity(query)
  ]);

  return {
    odds,
    news,
    github
  };
}

