import Database from "better-sqlite3";
import path from "path";

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

export const initDb = (databaseUrl) => {
  const filePath = normalizeSqlitePath(databaseUrl);
  const db = new Database(filePath);

  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

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

  const queries = {
    getUserByUserId: db.prepare("SELECT * FROM users WHERE user_id = ?"),
    insertUser: db.prepare("INSERT INTO users (user_id, score, total_amount, total_transactions) VALUES (?, ?, ?, ?)") ,
    insertTransaction: db.prepare("INSERT INTO transactions (request_id, user_id, amount) VALUES (?, ?, ?)"),
    updateUserTotals: db.prepare("UPDATE users SET total_amount = ?, total_transactions = ?, score = ? WHERE user_id = ?"),
    getConsistencyDays: db.prepare("SELECT COUNT(DISTINCT DATE(created_at)) AS days FROM transactions WHERE user_id = ?"),
    getUserRank: db.prepare("SELECT COUNT(*) AS count FROM users WHERE score > ?"),
    getRanking: db.prepare("SELECT user_id, score FROM users ORDER BY score DESC, total_amount DESC LIMIT ?"),
  };

  const transactionRunner = db.transaction((requestId, userId, amount) => {
    let user = queries.getUserByUserId.get(userId);
    if (!user) {
      queries.insertUser.run(userId, 0, 0, 0);
      user = queries.getUserByUserId.get(userId);
    }

    queries.insertTransaction.run(requestId, userId, amount);

    const totalAmount = user.total_amount + amount;
    const totalTransactions = user.total_transactions + 1;
    const consistencyDays = queries.getConsistencyDays.get(userId).days || 0;
    const score = 0; // placeholder; route will compute actual score after transaction

    queries.updateUserTotals.run(totalAmount, totalTransactions, score, userId);

    return { user, totalAmount, totalTransactions, consistencyDays };
  });

  return {
    db,
    queries,
    transactionRunner,
  };
};
