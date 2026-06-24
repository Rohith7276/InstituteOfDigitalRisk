import { useState } from "react";
import { submitTransaction } from "../api";

function TransactionForm() {
  const [requestId, setRequestId] = useState("");
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await submitTransaction({ requestId, userId, amount });
      setMessage(response.message + ` Score: ${response.score}`);
      setRequestId("");
      setAmount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2>Submit Transaction</h2>
      <form onSubmit={handleSubmit} className="form-grid">
        <label>
          Request ID
          <input
            value={requestId}
            onChange={(event) => setRequestId(event.target.value)}
            placeholder="unique-id"
            required
          />
        </label>

        <label>
          User ID
          <input
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            placeholder="user123"
            required
          />
        </label>

        <label>
          Amount
          <input
            type="number"
            value={amount}
            onChange={(event) => setAmount(Number(event.target.value))}
            min={1}
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>

      {message && <div className="notice success">{message}</div>}
      {error && <div className="notice error">{error}</div>}
    </section>
  );
}

export default TransactionForm;
