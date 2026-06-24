/**
 * Business logic for risk scoring
 * Calculates user risk score based on transaction history, frequency, and consistency
 */

// Computes a composite risk score from three components:
// 1. Amount component (transaction volume weighted 0.6 per unit)
// 2. Transaction component (frequency weighted 2.5 per transaction)
// 3. Consistency component (days active weighted for engagement pattern)
export const calculateScore = (totalAmount, totalTransactions, consistencyDays, settings) => {
  // Score component based on total transaction amount (capped at maxAmountForScore)
  const amountComponent = Math.min(totalAmount, settings.maxAmountForScore) * 0.6;
  // Score component based on transaction count (capped at maxTransactionsForScore)
  const transactionComponent = Math.min(totalTransactions, settings.maxTransactionsForScore) * 2.5;
  // Score component based on number of active days (capped at maxConsistencyDays)
  const consistencyComponent = Math.min(consistencyDays, settings.maxConsistencyDays) * (15.0 / settings.maxConsistencyDays);
  // Return floor of combined score
  return Math.floor(amountComponent + transactionComponent + consistencyComponent);
};
