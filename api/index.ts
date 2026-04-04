import app from "../server/index.js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Add a quick health check before any DB calls
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    env: {
      database: !!process.env.DATABASE_URL,
      telegram: !!process.env.TELEGRAM_BOT_TOKEN,
    },
  });
});

// Global error handler — surface DB_URL and other config errors clearly
app.use((err: Error, _req: VercelRequest, res: VercelResponse, _next: Function) => {
  console.error("[api error]", err.message);
  if (err.message.includes("DATABASE_URL")) {
    return res.status(503).json({
      error: "Database not configured",
      fix: "Set DATABASE_URL in your Vercel project environment variables (Settings → Environment Variables).",
    });
  }
  res.status(500).json({ error: err.message });
});

export default app;
