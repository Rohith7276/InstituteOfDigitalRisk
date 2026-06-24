import { calculateScore } from "./services.js";

const isString = (value) => typeof value === "string" && value.trim().length > 0;

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const registerRoutes = (app, db, settings) => {
  app.post("/transaction", (req, res, next) => {
    try {
      const { requestId, userId, amount } = req.body || {};

      if (!isString(requestId)) {
        throw createError("requestId is required and must be a non-empty string.");
      }
      if (!isString(userId)) {
        throw createError("userId is required and must be a non-empty string.");
      }
      if (typeof amount !== "number" || Number.isNaN(amount)) {
        throw createError("amount is required and must be a number.");
      }
      if (amount <= 0) {
        throw createError("Amount must be greater than zero.");
      }
      if (amount > settings.maxTransactionAmount) {
        throw createError("Amount exceeds allowed maximum.", 400);
      }

      const transaction = db.transactionRunner(requestId, userId, amount);
      const score = calculateScore(
        transaction.totalAmount,
        transaction.totalTransactions,
        transaction.consistencyDays,
        settings
      );

      db.queries.updateUserTotals.run(
        transaction.totalAmount,
        transaction.totalTransactions,
        score,
        userId
      );

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
      if (error?.code === "SQLITE_CONSTRAINT_UNIQUE" || error?.message?.includes("UNIQUE")) {
        return next(createError("Transaction with this requestId has already been processed.", 409));
      }
      return next(error);
    }
  });

  app.get("/summary/:userId", (req, res, next) => {
    try {
      const { userId } = req.params;
      if (!isString(userId)) {
        throw createError("userId is required in the path parameter.");
      }

      const user = db.queries.getUserByUserId.get(userId);
      if (!user) {
        throw createError("User not found.");
      }

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

  app.get("/ranking", (req, res, next) => {
    try {
      const rows = db.queries.getRanking.all(100);
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
