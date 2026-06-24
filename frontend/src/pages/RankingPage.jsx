/**
 * Ranking leaderboard component
 * Displays top-ranked users sorted by risk score on component mount
 */

import { useEffect, useState } from "react";
import { fetchRanking } from "../api";

function RankingPage() {
  // Ranking table data
  const [ranking, setRanking] = useState([]);
  // UI state for loading and errors
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch ranking data on component mount
  useEffect(() => {
    const loadRanking = async () => {
      try {
        // Fetch top ranked users from API
        const data = await fetchRanking();
        setRanking(data);
      } catch (err) {
        // Display error if fetch fails
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    loadRanking();
  }, []);

  return (
    <section>
      <h2>Leaderboard</h2>
      {/* Loading state */}
      {loading && <p>Loading leaderboard...</p>}
      {/* Error state */}
      {error && <div className="notice error">{error}</div>}
      {/* Ranking table */}
      {!loading && !error && (
        <table className="leaderboard">
          <thead>
            <tr>
              <th>Rank</th>
              <th>User ID</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((row) => (
              <tr key={row.userId}>
                <td>{row.rank}</td>
                <td>{row.userId}</td>
                <td>{row.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default RankingPage;
