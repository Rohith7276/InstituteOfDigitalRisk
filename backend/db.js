/**
 * Database initialization and management
 * Sets up SQLite database schema, prepared statements, and transaction operations
 */

import Database from "better-sqlite3";
import path from "path";

// Converts SQLite URL format to absolute file path
const normalizeSqlitePath = (databaseUrl) => {
  if (!databaseUrl) {
    return path.resolve(process.cwd(), "data.db");
  }

  let dbPath = databaseUrl;
  if (dbPath.startsWith("sqlite:///")) {
    dbPath = dbPath.slice("sqlite:///".length);
  } else if (dbPath.startsWith("sqlite://")) {
    dbPath = dbPath.slice("sqlite://".length);
  }

  return path.isAbsolute(dbPath) ? dbPath : path.resolve(process.cwd(), dbPath);
};

// Initializes database connection and creates necessary tables and prepared statements
export const initDb = (databaseUrl) => {
  const filePath = normalizeSqlitePath(databaseUrl);
  // Create or connect to SQLite database
  const db = new Database(filePath);

  // Enable Write-Ahead Logging for better concurrency
  db.pragma("journal_mode = WAL");
  // Enable foreign key constraints
  db.pragma("foreign_keys = ON");

  // Create users table to store user profiles and their risk scores
  db.prepare(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT UNIQUE NOT NULL,
      score INTEGER NOT NULL DEFAULT 0,
      total_amount REAL NOT NULL DEFAULT 0,
      total_transactions INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`
  ).run();

  // Create transactions table to store all processed transactions
  db.prepare(
    `CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      amount REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(user_id)
    )`
  ).run();

  // Collection of prepared SQL statements for optimized execution
  const queries = {
    // Retrieve user record by user_id
    getUserByUserId: db.prepare("SELECT * FROM users WHERE user_id = ?"),
    // Insert new user with initial values
    insertUser: db.prepare("INSERT INTO users (user_id, score, total_amount, total_transactions) VALUES (?, ?, ?, ?)") ,
    // Insert new transaction record
    insertTransaction: db.prepare("INSERT INTO transactions (request_id, user_id, amount) VALUES (?, ?, ?)"),
    // Update user's total amount, transaction count, and score
    updateUserTotals: db.prepare("UPDATE users SET total_amount = ?, total_transactions = ?, score = ? WHERE user_id = ?"),
    // Count distinct days user has made transactions
    getConsistencyDays: db.prepare("SELECT COUNT(DISTINCT DATE(created_at)) AS days FROM transactions WHERE user_id = ?"),
    // Get rank by counting users with higher scores
    getUserRank: db.prepare("SELECT COUNT(*) AS count FROM users WHERE score > ?"),
    // Get top users ranked by score (descending) and secondary sort by total amount
    getRanking: db.prepare("SELECT user_id, score FROM users ORDER BY score DESC, total_amount DESC LIMIT ?"),
  };

  // Atomic transaction function: ensures all DB operations succeed or fail together
  const transactionRunner = db.transaction((requestId, userId, amount) => {
    // Get existing user or create new one
    let user = queries.getUserByUserId.get(userId);
    if (!user) {
      queries.insertUser.run(userId, 0, 0, 0);
      user = queries.getUserByUserId.get(userId);
    }

    // Record the transaction with idempotency protection via request_id
    queries.insertTransaction.run(requestId, userId, amount);

    // Calculate updated totals
    const totalAmount = user.total_amount + amount;
    const totalTransactions = user.total_transactions + 1;
    // Count days user has been active
    const consistencyDays = queries.getConsistencyDays.get(userId).days || 0;
    // Placeholder score; actual score computed in routes after transaction
    const score = 0;

    // Update user record with new totals
    queries.updateUserTotals.run(totalAmount, totalTransactions, score, userId);

    // Return transaction summary for scoring
    return { user, totalAmount, totalTransactions, consistencyDays };
  });

  // Return database interface with queries and transaction runner
  return {
    db,
    queries,
    transactionRunner,
  };
};
