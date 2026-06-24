import { useState } from "react";
import { fetchUserSummary } from "../api";

function SummaryPage() {
  const [userId, setUserId] = useState("");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLookup = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSummary(null);

    try {
      const data = await fetchUserSummary(userId);
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2>User Summary</h2>
      <form onSubmit={handleLookup} className="form-grid">
        <label>
          User ID
          <input value={userId} onChange={(event) => setUserId(event.target.value)} placeholder="user123" required />
        </label>
        <button type="submit" disabled={loading || !userId}>
          {loading ? "Loading..." : "Lookup"}
        </button>
      </form>

      {summary && (
        <div className="summary-card">
          <p><strong>User ID:</strong> {summary.userId}</p>
          <p><strong>Total Transactions:</strong> {summary.totalTransactions}</p>
          <p><strong>Total Amount:</strong> ${summary.totalAmount.toFixed(2)}</p>
          <p><strong>Score:</strong> {summary.score}</p>
          <p><strong>Rank:</strong> {summary.rank}</p>
        </div>
      )}

      {error && <div className="notice error">{error}</div>}
    </section>
  );
}

export default SummaryPage;
