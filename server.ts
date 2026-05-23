import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { lookupStockSymbol, analyzeMarketData, performBacktest } from "./src/services/geminiService";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parsing middleware with custom limits (up to 10mb for base64 image graphs)
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // API endpoints FIRST
  app.post("/api/stock/lookup", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) {
        return res.status(400).send("Query string is required");
      }
      const data = await lookupStockSymbol(query);
      res.json(data);
    } catch (err: any) {
      console.error("API Error - Stock Lookup:", err);
      res.status(500).send(err.message || "Failed to lookup stock");
    }
  });

  app.post("/api/stock/analyze", async (req, res) => {
    try {
      const { symbol, timeframe, currentPrice, imageBase64, isLockedPrice } = req.body;
      if (!symbol || !timeframe || currentPrice === undefined) {
        return res.status(400).send("symbol, timeframe, and currentPrice are required");
      }
      const data = await analyzeMarketData(symbol, timeframe, currentPrice, imageBase64, isLockedPrice);
      res.json(data);
    } catch (err: any) {
      console.error("API Error - Stock Analysis:", err);
      res.status(500).send(err.message || "Failed to analyze stock");
    }
  });

  app.post("/api/stock/backtest", async (req, res) => {
    try {
      const { symbol, strategy, period } = req.body;
      if (!symbol || !strategy || !period) {
        return res.status(400).send("symbol, strategy, and period are required");
      }
      const data = await performBacktest(symbol, strategy, period);
      res.json(data);
    } catch (err: any) {
      console.error("API Error - Strategy Backtest:", err);
      res.status(500).send(err.message || "Failed to backtest strategy");
    }
  });

  // Vite middleware for development vs server for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[TradeGuard Server] Running on http://localhost:${PORT} under NODE_ENV=${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
