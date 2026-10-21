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
 * Guarda o actualiza una ficha de Triage generada por la IA en Supabase.
 * Si el cliente ya tiene un caso 'en_proceso' reciente (últimos 60 min), lo actualiza
 * in-place para consolidar toda la conversación en un único ticket.
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
          `UPDATE clientes SET nombre_completo = $1
           WHERE id = $2 AND (nombre_completo IS NULL OR nombre_completo = '')`,
          [ficha.cliente_nombre, clientId]
        );
      }
      if (ficha.sucursal_comuna) {
        await client.query(
          `UPDATE clientes SET comuna = $1
           WHERE id = $2 AND (comuna IS NULL OR comuna = '')`,
          [ficha.sucursal_comuna, clientId]
        );
      }
      if (ficha.tipo_solicitud === 'Proyecto Comercial' && ficha.cliente_nombre) {
        await client.query(
          `UPDATE clientes SET empresa = $1
           WHERE id = $2 AND (empresa IS NULL OR empresa = '')`,
          [ficha.cliente_nombre, clientId]
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

    // HU-06: Estado derivado si requiere humano
    const estadoCaso = ficha.requiere_derivacion ? 'derivado' : 'en_proceso';

    // 2. Buscar si ya existe un caso activo 'en_proceso' de los últimos 60 min para este cliente
    const resCasoActivo = await client.query(
      `SELECT id FROM casos_triage
       WHERE cliente_id = $1
         AND estado = 'en_proceso'
         AND created_at > NOW() - INTERVAL '60 minutes'
       ORDER BY id DESC
       LIMIT 1`,
      [clientId]
    );

    let casoId;
    if (resCasoActivo.rows.length > 0) {
      const idExistente = resCasoActivo.rows[0].id;
      const updateCaso = `
        UPDATE casos_triage
        SET motivo_principal = COALESCE(NULLIF($1, 'Otra Consulta'), motivo_principal, $1),
            equipo_tipo = COALESCE(NULLIF($2, ''), equipo_tipo),
            equipo_marca = COALESCE(NULLIF($3, ''), equipo_marca),
            sintoma_observacion = COALESCE(NULLIF($4, ''), sintoma_observacion),
            prioridad_sugerida = COALESCE(NULLIF($5, 'Normal'), prioridad_sugerida, 'Normal'),
            disponibilidad_cliente = COALESCE(NULLIF($6, ''), disponibilidad_cliente),
            tiene_fotos = COALESCE($7, tiene_fotos),
            requiere_humano = $8,
            estado = $9,
            created_at = CURRENT_TIMESTAMP
        WHERE id = $10
        RETURNING id
      `;
      const resUpdate = await client.query(updateCaso, [
        ficha.tipo_solicitud,
        ficha.equipo_tipo || null,
        ficha.equipo_marca || null,
        ficha.sintoma_observacion || null,
        ficha.prioridad || 'Normal',
        ficha.disponibilidad_cliente || null,
        Boolean(ficha.tiene_fotos),
        Boolean(ficha.requiere_derivacion),
        estadoCaso,
        idExistente,
      ]);
      casoId = resUpdate.rows[0].id;
      console.log(`🔄 Caso actualizado en DB exitosamente. ID: ${casoId} (estado: ${estadoCaso})`);
    } else {
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
      casoId = resCaso.rows[0].id;
      console.log(`✅ Caso creado en DB exitosamente. ID: ${casoId} (estado: ${estadoCaso})`);
    }

    await client.query('COMMIT');
    return casoId;

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
