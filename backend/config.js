import dotenv from "dotenv";

dotenv.config();

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const settings = {
  databaseUrl: process.env.DATABASE_URL || "sqlite:///./data.db",
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  transactionRateLimitPerMinute: parseNumber(process.env.TRANSACTION_RATE_LIMIT_PER_MINUTE, 10),
  transactionRateLimitWindowSeconds: parseNumber(process.env.TRANSACTION_RATE_LIMIT_WINDOW_SECONDS, 60),
  maxTransactionAmount: parseNumber(process.env.MAX_TRANSACTION_AMOUNT, 5000),
  maxAmountForScore: parseNumber(process.env.MAX_AMOUNT_FOR_SCORE, 10000),
  maxTransactionsForScore: parseNumber(process.env.MAX_TRANSACTIONS_FOR_SCORE, 200),
  maxConsistencyDays: parseNumber(process.env.MAX_CONSISTENCY_DAYS, 30),
  suspiciousAmountThreshold: parseNumber(process.env.SUSPICIOUS_AMOUNT_THRESHOLD, 2000),
};
