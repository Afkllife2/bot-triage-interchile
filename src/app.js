const express = require("express");
const { verifyClaim, verifyMentionFromX } = require("./services/verificationService");
const { listMetrics } = require("./repositories/metricsRepository");
const db = require("./config/db");

const app = express();

app.use(express.json());
app.use(express.static("public"));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "bot-verificador-x-prototipo" });
});

app.post("/verify", async (req, res) => {
  const { text, userId = "demo-user", simulateFailure = false } = req.body || {};
  const shouldSimulate = simulateFailure || req.headers["x-simulate-nlp-failure"] === "true";

  if (!text || typeof text !== "string") {
    return res.status(400).json({
      error: "El campo text es obligatorio y debe ser un string."
    });
  }

  try {
    const result = await verifyClaim({ text, userId, source: "manual", simulateFailure: shouldSimulate });
    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
});

app.post("/x/webhook", async (req, res) => {
  const shouldSimulate = req.body?.simulateFailure || req.headers["x-simulate-nlp-failure"] === "true";
  try {
    const result = await verifyMentionFromX(req.body, shouldSimulate);
    return res.json(result);
  } catch (error) {
    return res.status(400).json({
      received: false,
      error: error.message
    });
  }
});

app.get("/metrics", async (_req, res) => {
  try {
    const metrics = await listMetrics();
    const isMock = db.isMockActive();
    const enriched = metrics.map(m => ({
      ...m,
      id: String(m.id),
      persistence: isMock ? "Memory" : "PostgreSQL"
    }));
    return res.json({ total: enriched.length, metrics: enriched });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
});

module.exports = app;
