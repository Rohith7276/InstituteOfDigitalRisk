import { useEffect, useState } from "react";
import { fetchRanking } from "../api";

function RankingPage() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRanking = async () => {
      try {
        const data = await fetchRanking();
        setRanking(data);
      } catch (err) {
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
      {loading && <p>Loading leaderboard...</p>}
      {error && <div className="notice error">{error}</div>}
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
