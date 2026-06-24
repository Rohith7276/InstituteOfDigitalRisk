/**
 * Application configuration
 * Loads environment variables and provides default settings for the risk scoring platform
 */

import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Utility function to safely parse numeric environment variables with fallback defaults
const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

// Exported settings object with all configurable parameters
export const settings = {
  // Database connection URL (SQLite path)
  databaseUrl: process.env.DATABASE_URL || "sqlite:///./data.db",
  // Frontend origin for CORS configuration
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  // Rate limiting: max transactions allowed per client in time window
  transactionRateLimitPerMinute: parseNumber(process.env.TRANSACTION_RATE_LIMIT_PER_MINUTE, 10),
  // Rate limiting: time window in seconds for transaction rate limits
  transactionRateLimitWindowSeconds: parseNumber(process.env.TRANSACTION_RATE_LIMIT_WINDOW_SECONDS, 60),
  // Maximum allowed amount per single transaction
  maxTransactionAmount: parseNumber(process.env.MAX_TRANSACTION_AMOUNT, 5000),
  // Max transaction amount used in score calculation (caps the amount component)
  maxAmountForScore: parseNumber(process.env.MAX_AMOUNT_FOR_SCORE, 10000),
  // Max transaction count used in score calculation (caps the transactions component)
  maxTransactionsForScore: parseNumber(process.env.MAX_TRANSACTIONS_FOR_SCORE, 200),
  // Max consistency days used in score calculation (caps the consistency component)
  maxConsistencyDays: parseNumber(process.env.MAX_CONSISTENCY_DAYS, 30),
  // Transaction amount threshold that triggers monitoring/logging for suspicious activity
  suspiciousAmountThreshold: parseNumber(process.env.SUSPICIOUS_AMOUNT_THRESHOLD, 2000),
};
