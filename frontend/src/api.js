/**
 * API client module
 * Provides functions to communicate with the backend transaction processing API
 */

// Backend API base URL from environment or default to localhost
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

// Utility function to parse response and handle errors
async function handleResponse(response) {
  const data = await response.json();
  // Throw error if response status is not OK, using server's error detail if available
  if (!response.ok) {
    throw new Error(data.detail || JSON.stringify(data));
  }
  return data;
}

// Submit a new transaction with requestId, userId, and amount
export async function submitTransaction(payload) {
  const response = await fetch(`${API_BASE}/transaction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

// Fetch user's transaction summary and ranking information
export async function fetchUserSummary(userId) {
  const response = await fetch(`${API_BASE}/summary/${encodeURIComponent(userId)}`);
  return handleResponse(response);
}

// Fetch top ranked users leaderboard
export async function fetchRanking() {
  const response = await fetch(`${API_BASE}/ranking`);
  return handleResponse(response);
}
