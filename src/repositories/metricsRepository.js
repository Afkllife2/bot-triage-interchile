const db = require("../config/db");

function anonymizeUserId(userId) {
  if (!userId) return "anonymous";
  const value = String(userId);
  return `user_${Buffer.from(value).toString("base64").slice(0, 10)}`;
}

async function saveMetric({
  userId,
  latencyMs,
  veredicto,
  confianza,
  source,
  text,
  status = "ok",
  errorType = null,
  provider = "unknown",
  attempts = 1
}) {
  const queryText = `
    INSERT INTO metrics (user_id, timestamp, latency_ms, veredicto, confianza, source, text, status, error_type, provider, attempts)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *
  `;
  const anonUser = anonymizeUserId(userId);
  const values = [
    anonUser,
    new Date().toISOString(),
    latencyMs,
    veredicto,
    confianza,
    source || "unknown",
    text || null,
    status,
    errorType,
    provider,
    attempts
  ];
  
  try {
    const res = await db.query(queryText, values);
    return res.rows[0];
  } catch (error) {
    console.error("Error al guardar metrica en PostgreSQL:", error);
    throw error;
  }
}

async function listMetrics() {
  const queryText = "SELECT * FROM metrics ORDER BY timestamp DESC";
  try {
    const res = await db.query(queryText);
    return res.rows;
  } catch (error) {
    console.error("Error al listar metricas desde PostgreSQL:", error);
    throw error;
  }
}

module.exports = {
  anonymizeUserId,
  saveMetric,
  listMetrics
};
