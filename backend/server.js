import express from "express";
import cors from "cors";
import { settings } from "./config.js";
import { initDb } from "./db.js";
import { registerRoutes } from "./routes.js";

const app = express();
const db = initDb(settings.databaseUrl);

app.use(cors({ origin: settings.frontendOrigin , credentials: true }));
app.use(express.json());
app.set("trust proxy", true);

const rateLimitStore = new Map();

app.use((req, res, next) => {
  if (req.method === "POST" && req.path === "/transaction") {
      const clientIp = req.ip || req.socket.remoteAddress || "unknown";
      const now = Date.now();
      const windowMs = settings.transactionRateLimitWindowSeconds * 1000;
      const history = rateLimitStore.get(clientIp) || [];
      const updatedHistory = history.filter((timestamp) => timestamp > now - windowMs);
      
      if (updatedHistory.length >= settings.transactionRateLimitPerMinute) {
          return res.status(429).json({ detail: "Rate limit exceeded. Please wait before retrying." });
        }
        
        updatedHistory.push(now);
        rateLimitStore.set(clientIp, updatedHistory);
        console.log("asdf" );
    }
    
    return next();
});

registerRoutes(app, db, settings);

app.use((err, req, res, next) => {
    console.error(err);
    if (res.headersSent) return next(err);

  if (err.statusCode) {
    return res.status(err.statusCode).json({ detail: err.message });
  }

  return res.status(500).json({ detail: "Internal Server Error" });
});

const port = Number(process.env.PORT || 8000);
app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
