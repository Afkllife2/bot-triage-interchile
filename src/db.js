const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ============================================================
// 🛡️ HU-16 CA-2: Logger de errores a archivo local
// ============================================================
const LOG_PATH = path.join(__dirname, '..', 'logs', 'error.log');

function logError(context, error) {
  const entry = {
    timestamp: new Date().toISOString(),
    context,
    message: error.message,
    stack: error.stack,
  };
  const line = JSON.stringify(entry) + '\n';
  // Escribir al archivo de forma asíncrona sin bloquear
  fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
  fs.appendFile(LOG_PATH, line, (err) => {
    if (err) console.error('⚠️ No se pudo escribir en error.log:', err.message);
  });
  console.error(`❌ [${context}]`, error.message);
}

// Configuración del Pool de PostgreSQL conectado a Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  // HU-16 CA-3: timeout de conexión a BD
  connectionTimeoutMillis: 8000,
  idleTimeoutMillis: 30000,
});

/**
 * Guarda una ficha de Triage generada por la IA en la base de datos Supabase.
 * HU-16 CA-2: Si falla, loguea a error.log y retorna null (no lanza excepción).
 */
async function guardarCasoTriage(ficha, telefonoCliente) {
  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    // 1. Verificar si el cliente existe, si no, insertarlo
    let clientId;
    const resCliente = await client.query(
      'SELECT id FROM clientes WHERE telefono = $1 LIMIT 1',
      [telefonoCliente]
    );

    if (resCliente.rows.length > 0) {
      clientId = resCliente.rows[0].id;
      if (ficha.cliente_nombre) {
        await client.query(
          `UPDATE clientes SET nombre_completo = $1, comuna = COALESCE(NULLIF($2,''), comuna)
           WHERE id = $3 AND (nombre_completo IS NULL OR nombre_completo = '')`,
          [ficha.cliente_nombre, ficha.sucursal_comuna || '', clientId]
        );
      }
    } else {
      const insertCliente = await client.query(
        'INSERT INTO clientes (telefono, nombre_completo, empresa, comuna, direccion) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [
          telefonoCliente,
          ficha.cliente_nombre || null,
          ficha.tipo_solicitud === 'Proyecto Comercial' ? ficha.cliente_nombre : null,
          ficha.sucursal_comuna || null,
          ficha.sucursal_direccion || null,
        ]
      );
      clientId = insertCliente.rows[0].id;
    }

    // 2. Insertar el caso de triage
    const queryCaso = `
      INSERT INTO casos_triage (
        cliente_id,
        motivo_principal,
        equipo_tipo,
        equipo_marca,
        sintoma_observacion,
        prioridad_sugerida,
        disponibilidad_cliente,
        tiene_fotos,
        requiere_humano,
        estado
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id
    `;

    // HU-06: Estado derivado si requiere humano
    const estadoCaso = ficha.requiere_derivacion ? 'derivado' : 'en_proceso';

    const valuesCaso = [
      clientId,
      ficha.tipo_solicitud,
      ficha.equipo_tipo || null,
      ficha.equipo_marca || null,
      ficha.sintoma_observacion || null,
      ficha.prioridad || 'Normal',
      ficha.disponibilidad_cliente || null,
      ficha.tiene_fotos || false,
      ficha.requiere_derivacion || false,
      estadoCaso,
    ];

    const resCaso = await client.query(queryCaso, valuesCaso);
    await client.query('COMMIT');

    console.log(`✅ Caso guardado en DB exitosamente. ID: ${resCaso.rows[0].id}`);
    return resCaso.rows[0].id;

  } catch (error) {
    // HU-16 CA-2: Rollback + log local, NO relanzar la excepción
    if (client) await client.query('ROLLBACK').catch(() => {});
    logError('db.guardarCasoTriage', error);
    return null; // El servidor seguirá respondiendo al cliente igualmente
  } finally {
    if (client) client.release();
  }
}

/**
 * Obtiene los últimos tickets de triage para el Dashboard de administración.
 * HU-16 CA-2: Si falla, loguea y retorna array vacío.
 */
async function getTicketsDashboard(limite = 50) {
  let client;
  try {
    client = await pool.connect();
    const query = `
      SELECT
        ct.id,
        ct.created_at,
        cl.telefono,
        cl.nombre_completo,
        ct.equipo_tipo,
        ct.equipo_marca,
        ct.sintoma_observacion,
        ct.motivo_principal,
        ct.prioridad_sugerida,
        ct.requiere_humano,
        ct.estado
      FROM casos_triage ct
      LEFT JOIN clientes cl ON ct.cliente_id = cl.id
      ORDER BY ct.created_at DESC
      LIMIT $1
    `;
    const result = await client.query(query, [limite]);
    return result.rows;
  } catch (error) {
    logError('db.getTicketsDashboard', error);
    return []; // Dashboard muestra tabla vacía en vez de crashear
  } finally {
    if (client) client.release();
  }
}

module.exports = { guardarCasoTriage, getTicketsDashboard };
