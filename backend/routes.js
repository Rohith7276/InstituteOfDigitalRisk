import { calculateScore } from "./services.js";

// Validates if a value is a non-empty string
const isString = (value) => typeof value === "string" && value.trim().length > 0;

// Creates a standardized error object with a status code
const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Registers all API routes: transaction processing, user summary, and ranking leaderboard
export const registerRoutes = (app, db, settings) => {
  // POST /transaction - Process a new transaction and update user score
  app.post("/transaction", (req, res, next) => {
    try {
      const { requestId, userId, amount } = req.body || {};

      // Validate requestId is a non-empty string
      if (!isString(requestId)) {
        throw createError("requestId is required and must be a non-empty string.");
      }
      // Validate userId is a non-empty string
      if (!isString(userId)) {
        throw createError("userId is required and must be a non-empty string.");
      }
      // Validate amount is a valid positive number
      if (typeof amount !== "number" || Number.isNaN(amount)) {
        throw createError("amount is required and must be a number.");
      }
      if (amount <= 0) {
        throw createError("Amount must be greater than zero.");
      }
      // Check if amount exceeds platform's maximum allowed transaction
      if (amount > settings.maxTransactionAmount) {
        throw createError("Amount exceeds allowed maximum.", 400);
      }

      // Process transaction with idempotency protection via requestId
      const transaction = db.transactionRunner(requestId, userId, amount);
      // Calculate user's risk score based on transaction history
      const score = calculateScore(
        transaction.totalAmount,
        transaction.totalTransactions,
        transaction.consistencyDays,
        settings
      );

      // Update user's total amount, transaction count, and risk score in database
      db.queries.updateUserTotals.run(
        transaction.totalAmount,
        transaction.totalTransactions,
        score,
        userId
      );

      // Log large transactions for monitoring suspicious activity
      if (amount >= settings.suspiciousAmountThreshold) {
        console.info("Large transaction recorded:", { userId, amount });
      }

      res.json({
        requestId,
        userId,
        amount,
        score,
        message: "Transaction recorded successfully.",
      });
    } catch (error) {
      // Handle duplicate transaction (already processed with same requestId)
      if (error?.code === "SQLITE_CONSTRAINT_UNIQUE" || error?.message?.includes("UNIQUE")) {
        return next(createError("Transaction with this requestId has already been processed.", 409));
      }
      return next(error);
    }
  });

  // GET /summary/:userId - Retrieve user's transaction summary and ranking
  app.get("/summary/:userId", (req, res, next) => {
    try {
      const { userId } = req.params;
      // Validate userId parameter
      if (!isString(userId)) {
        throw createError("userId is required in the path parameter.");
      }

      // Fetch user data from database
      const user = db.queries.getUserByUserId.get(userId);
      if (!user) {
        throw createError("User not found.");
      }

      // Calculate user's rank among all users (higher score = better rank = lower rank number)
      const rank = (db.queries.getUserRank.get(user.score)?.count || 0) + 1;

      res.json({
        userId: user.user_id,
        totalTransactions: user.total_transactions,
        totalAmount: user.total_amount,
        score: user.score,
        rank,
      });
    } catch (error) {
      return next(error);
    }
  });

  // GET /ranking - Retrieve top 100 users ranked by risk score (descending)
  app.get("/ranking", (req, res, next) => {
    try {
      // Fetch top 100 users sorted by score
      const rows = db.queries.getRanking.all(100);
      // Transform database rows into ranked response format
      const payload = rows.map((row, index) => ({
        rank: index + 1,
        userId: row.user_id,
        score: row.score,
      }));
      res.json(payload);
    } catch (error) {
      return next(error);
    }
  });
};
