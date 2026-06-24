export const calculateScore = (totalAmount, totalTransactions, consistencyDays, settings) => {
  const amountComponent = Math.min(totalAmount, settings.maxAmountForScore) * 0.6;
  const transactionComponent = Math.min(totalTransactions, settings.maxTransactionsForScore) * 2.5;
  const consistencyComponent = Math.min(consistencyDays, settings.maxConsistencyDays) * (15.0 / settings.maxConsistencyDays);
  return Math.floor(amountComponent + transactionComponent + consistencyComponent);
};
