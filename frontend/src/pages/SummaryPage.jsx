/**
 * User summary page component
 * Displays user's transaction history, total amounts, risk score, and ranking
 */

import { useState } from "react";
import { fetchUserSummary } from "../api";

function SummaryPage() {
  // User lookup state
  const [userId, setUserId] = useState("");
  // Fetched summary data
  const [summary, setSummary] = useState(null);
  // UI state for loading and errors
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle user lookup
  const handleLookup = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSummary(null);

    try {
      // Fetch user's summary data from API
      const data = await fetchUserSummary(userId);
      setSummary(data);
    } catch (err) {
      // Display error if user not found or API error
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2>User Summary</h2>
      {/* Form to search for user */}
      <form onSubmit={handleLookup} className="form-grid">
        <label>
          User ID
          <input value={userId} onChange={(event) => setUserId(event.target.value)} placeholder="user123" required />
        </label>
        <button type="submit" disabled={loading || !userId}>
          {loading ? "Loading..." : "Lookup"}
        </button>
      </form>

      {/* Display user summary if found */}
      {summary && (
        <div className="summary-card">
          <p><strong>User ID:</strong> {summary.userId}</p>
          <p><strong>Total Transactions:</strong> {summary.totalTransactions}</p>
          <p><strong>Total Amount:</strong> ${summary.totalAmount.toFixed(2)}</p>
          <p><strong>Score:</strong> {summary.score}</p>
          <p><strong>Rank:</strong> {summary.rank}</p>
        </div>
      )}

      {/* Error message if lookup failed */}
      {error && <div className="notice error">{error}</div>}
    </section>
  );
}

export default SummaryPage;
