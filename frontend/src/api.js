const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

async function handleResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || JSON.stringify(data));
  }
  return data;
}

export async function submitTransaction(payload) {
  const response = await fetch(`${API_BASE}/transaction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function fetchUserSummary(userId) {
  const response = await fetch(`${API_BASE}/summary/${encodeURIComponent(userId)}`);
  return handleResponse(response);
}

export async function fetchRanking() {
  const response = await fetch(`${API_BASE}/ranking`);
  return handleResponse(response);
}
