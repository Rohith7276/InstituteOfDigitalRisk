/**
 * Main Express server application
 * Handles API setup, middleware configuration, rate limiting, and error handling
 */

import express from "express";
import cors from "cors";
import { settings } from "./config.js";
import { initDb } from "./db.js";
import { registerRoutes } from "./routes.js";

const app = express();
const db = initDb(settings.databaseUrl);

// Enable CORS with credentials for frontend communication
app.use(cors({ origin: settings.frontendOrigin , credentials: true }));
// Parse incoming JSON request bodies
app.use(express.json());
// Trust X-Forwarded-For header for accurate client IP detection
app.set("trust proxy", true);

// In-memory store for tracking transaction request rate limits per client IP
const rateLimitStore = new Map();

// Rate limiting middleware: prevents abuse by limiting transaction requests per client
app.use((req, res, next) => {
  if (req.method === "POST" && req.path === "/transaction") {
      // Extract client IP address for tracking rate limit
      const clientIp = req.ip || req.socket.remoteAddress || "unknown";
      const now = Date.now();
      const windowMs = settings.transactionRateLimitWindowSeconds * 1000;
      // Get previous transaction timestamps for this client within the time window
      const history = rateLimitStore.get(clientIp) || [];
      // Filter out old requests outside the current time window
      const updatedHistory = history.filter((timestamp) => timestamp > now - windowMs);
      
      // Reject request if rate limit exceeded
      if (updatedHistory.length >= settings.transactionRateLimitPerMinute) {
          return res.status(429).json({ detail: "Rate limit exceeded. Please wait before retrying." });
        }
        
      // Record this request timestamp for future rate limit checks
        updatedHistory.push(now);
        rateLimitStore.set(clientIp, updatedHistory);
 
    }
    
    return next();
});

// Register all API endpoints
registerRoutes(app, db, settings);

// Global error handling middleware: catches and formats all errors
app.use((err, req, res, next) => {
    console.error(err);
    // Skip error handling if response already started
    if (res.headersSent) return next(err);

  // Return custom error with status code if available
  if (err.statusCode) {
    return res.status(err.statusCode).json({ detail: err.message });
  }

  // Default to 500 Internal Server Error for unhandled errors
  return res.status(500).json({ detail: "Internal Server Error" });
});

// Start the Express server on configured port
const port = Number(process.env.PORT || 8000);
app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
