const { Pool } = require("pg");
require("dotenv").config();

const connectionString = process.env.DATABASE_URL;

let pool;
let useMock = false;
let mockDb = [];

try {
  const config = connectionString
    ? { connectionString }
    : {
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432", 10),
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "postgres",
        database: process.env.DB_NAME || "bot_verificador",
        connectionTimeoutMillis: 1000
      };
  pool = new Pool(config);
} catch (e) {
  console.warn("No se pudo instanciar pg.Pool. Usando fallback en memoria:", e.message);
  useMock = true;
}

if (pool) {
  pool.on("error", (err) => {
    console.error("Error inesperado en el pool de PostgreSQL:", err.message);
  });
}

const db = {
  pool,
  query: async (text, params) => {
    if (useMock) {
      return queryMock(text, params);
    }
    try {
      return await pool.query(text, params);
    } catch (error) {
      console.warn("PostgreSQL fallo (se activa fallback en memoria):", error.message);
      useMock = true;
      return queryMock(text, params);
    }
  },
  isMockActive: () => useMock,
  setMockActive: (active) => { useMock = active; },
  clearMockDb: () => { mockDb = []; }
};

function queryMock(text, params) {
  const queryStr = text.trim().toLowerCase();
  
  if (queryStr.includes("insert into metrics")) {
    const newMetric = {
      id: mockDb.length + 1,
      user_id: params[0],
      timestamp: params[1],
      latency_ms: params[2],
      veredicto: params[3],
      confianza: params[4],
      source: params[5],
      text: params[6],
      status: params[7] || "ok",
      error_type: params[8] || null,
      provider: params[9] || "unknown",
      attempts: params[10] || 1,
      created_at: new Date().toISOString()
    };
    mockDb.push(newMetric);
    return { rows: [newMetric], rowCount: 1 };
  }
  
  if (queryStr.includes("select * from metrics")) {
    const sorted = [...mockDb].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return { rows: sorted, rowCount: sorted.length };
  }
  
  return { rows: [], rowCount: 0 };
}

module.exports = db;
