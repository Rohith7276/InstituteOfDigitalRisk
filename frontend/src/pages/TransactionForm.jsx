/**
 * Transaction submission form component
 * Allows users to submit a transaction with idempotent requestId, userId, and amount
 */

import { useState } from "react";
import { submitTransaction } from "../api";

function TransactionForm() {
  // Form state management
  const [requestId, setRequestId] = useState("");
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState(0);
  // UI state for feedback messages
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    

    try {
      // Submit transaction to API
      const response = await submitTransaction({ requestId, userId, amount });
      // Display success message with calculated risk score
      setMessage(response.message + ` Score: ${response.score}`);
      // Clear form fields after successful submission
      setRequestId("");
      setAmount(0);
    } catch (err) {
      // Display error message if submission fails
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2>Submit Transaction</h2>
      <form onSubmit={handleSubmit} className="form-grid">
        {/* Unique request ID for idempotency */}
        <label>
          Request ID
          <input
            value={requestId}
            onChange={(event) => setRequestId(event.target.value)}
            placeholder="unique-id"
            required
          />
        </label>

        {/* User identifier */}
        <label>
          User ID
          <input
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            placeholder="user123"
            required
          />
        </label>

        {/* Transaction amount */}
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

      {/* Success message with score */}
      {message && <div className="notice success">{message}</div>}
      {/* Error message */}
      {error && <div className="notice error">{error}</div>}
    </section>
  );
}

export default TransactionForm;
