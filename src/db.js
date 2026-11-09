const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { calcularCotizacionBorrador } = require('./cotizador');
require('dotenv').config();

// ============================================================
// 🛡️ HU-16 CA-2: Logger de errores a archivo local (sin secretos)
// ============================================================
const LOG_PATH = path.join(__dirname, '..', 'logs', 'error.log');

function logError(context, error) {
  const entry = {
    timestamp: new Date().toISOString(),
    context,
    message: error.message,
  };
  const line = JSON.stringify(entry) + '\n';
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
  connectionTimeoutMillis: 8000,
  idleTimeoutMillis: 30000,
});

const ESTADOS_VALIDOS = new Set(['en_proceso', 'derivado', 'agendado', 'resuelto']);

let schemaEnsured = false;

/**
 * Asegura de forma idempotente las columnas de Sprint 3 y KRON2-152 en `casos_triage`.
 */
async function ensureSchema(client) {
  if (schemaEnsured) return;
  await client.query(`
    ALTER TABLE casos_triage
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS fecha_visita TIMESTAMPTZ NULL,
      ADD COLUMN IF NOT EXISTS cotizacion_neto INTEGER NULL,
      ADD COLUMN IF NOT EXISTS cotizacion_iva INTEGER NULL,
      ADD COLUMN IF NOT EXISTS cotizacion_total INTEGER NULL,
      ADD COLUMN IF NOT EXISTS catalogo_verificado BOOLEAN DEFAULT FALSE;
  `);
  schemaEnsured = true;
}

/**
 * Normaliza una fila de base de datos al contrato cerrado de KRON2-152 y Sprint 3.
 * Campos ausentes quedan en `null`, nunca inferidos ni inventados.
 */
function normalizarTicketRow(row) {
  if (!row) return null;
  const createdIso = row.created_at ? new Date(row.created_at).toISOString() : null;
  const updatedIso = row.updated_at ? new Date(row.updated_at).toISOString() : createdIso;
  const clienteNombre = row.cliente_nombre ?? row.nombre_completo ?? null;

  return {
    id: Number(row.id),
    created_at: createdIso,
    updated_at: updatedIso,
    cliente_nombre: clienteNombre || null,
    nombre_completo: clienteNombre || null,
    telefono: row.telefono ?? null,
    sucursal_comuna: row.sucursal_comuna ?? row.comuna ?? null,
    sucursal_direccion: row.sucursal_direccion ?? row.direccion ?? null,
    motivo_principal: row.motivo_principal ?? null,
    equipo_tipo: row.equipo_tipo ?? null,
    equipo_marca: row.equipo_marca ?? null,
    sintoma_observacion: row.sintoma_observacion ?? null,
    prioridad_sugerida: row.prioridad_sugerida ?? 'Normal',
    requiere_humano: Boolean(row.requiere_humano),
    estado: row.estado ?? 'en_proceso',
    fecha_visita: row.fecha_visita ? new Date(row.fecha_visita).toISOString() : null,
    cotizacion_neto: typeof row.cotizacion_neto === 'number' ? row.cotizacion_neto : null,
    cotizacion_iva: typeof row.cotizacion_iva === 'number' ? row.cotizacion_iva : null,
    cotizacion_total: typeof row.cotizacion_total === 'number' ? row.cotizacion_total : null,
    catalogo_verificado: Boolean(row.catalogo_verificado),
  };
}

/**
 * Codifica un cursor estable basado en `updated_at` + `id`.
 */
function encodeCursor(updatedAtIso, id) {
  if (!updatedAtIso || id === undefined || id === null) return null;
  return Buffer.from(`${updatedAtIso}|${id}`, 'utf8').toString('base64url');
}

/**
 * Decodifica un cursor (`base64url` o texto `iso|id` / `iso+id`).
 * @returns {{ updatedAt: string, id: number } | null}
 */
function decodeCursor(cursorStr) {
  if (!cursorStr || typeof cursorStr !== 'string') return null;
  let raw = cursorStr.trim();
  if (!raw.includes('|') && !raw.includes('+')) {
    try {
      raw = Buffer.from(raw, 'base64url').toString('utf8');
    } catch {
      return null;
    }
  }
  const sep = raw.includes('|') ? '|' : '+';
  const lastIdx = raw.lastIndexOf(sep);
  if (lastIdx <= 0) return null;
  const tsPart = raw.slice(0, lastIdx);
  const idPart = Number(raw.slice(lastIdx + 1));
  const parsedDate = new Date(tsPart);
  if (Number.isNaN(parsedDate.getTime()) || !Number.isInteger(idPart) || idPart <= 0) {
    return null;
  }
  return { updatedAt: parsedDate.toISOString(), id: idPart };
}

/**
 * Guarda o actualiza una ficha de Triage generada por la IA en Supabase.
 * Si el cliente ya tiene un caso 'en_proceso' reciente (últimos 60 min), lo actualiza
 * in-place preservando `created_at` inmutable y actualizando `updated_at`.
 */
async function guardarCasoTriage(ficha, telefonoCliente) {
  let client;
  try {
    client = await pool.connect();
    await ensureSchema(client);
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
      if (ficha.sucursal_direccion) {
        await client.query(
          `UPDATE clientes SET direccion = $1
           WHERE id = $2 AND (direccion IS NULL OR direccion = '')`,
          [ficha.sucursal_direccion, clientId]
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

    const estadoCaso = ficha.requiere_derivacion ? 'derivado' : 'en_proceso';

    // Calcular borrador de cotización referencial (HU-05 / AAI-25)
    const cotizacion = calcularCotizacionBorrador({
      tipo_solicitud: ficha.tipo_solicitud,
      equipo_tipo: ficha.equipo_tipo,
      equipo_marca: ficha.equipo_marca,
      prioridad: ficha.prioridad,
    });
    const cotNeto = cotizacion ? cotizacion.subtotal_neto : null;
    const cotIva = cotizacion ? cotizacion.iva : null;
    const cotTotal = cotizacion ? cotizacion.total_clp : null;
    const catalogoVerificado = Boolean(ficha.catalogo_verificado);

    // 2. Buscar si ya existe un caso activo 'en_proceso' de los últimos 60 min
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
      // KRON2-152: created_at es INMUTABLE; solo se actualiza updated_at
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
            cotizacion_neto = COALESCE($10, cotizacion_neto),
            cotizacion_iva = COALESCE($11, cotizacion_iva),
            cotizacion_total = COALESCE($12, cotizacion_total),
            catalogo_verificado = $13,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $14
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
        cotNeto,
        cotIva,
        cotTotal,
        catalogoVerificado,
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
          estado,
          cotizacion_neto,
          cotizacion_iva,
          cotizacion_total,
          catalogo_verificado,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP)
        RETURNING id
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
        cotNeto,
        cotIva,
        cotTotal,
        catalogoVerificado,
      ];
      const resCaso = await client.query(queryCaso, valuesCaso);
      casoId = resCaso.rows[0].id;
      console.log(`✅ Caso creado en DB exitosamente. ID: ${casoId} (estado: ${estadoCaso})`);
    }

    await client.query('COMMIT');
    return casoId;
  } catch (error) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    logError('db.guardarCasoTriage', error);
    return null;
  } finally {
    if (client) client.release();
  }
}

const BASE_SELECT_TICKETS = `
  SELECT
    ct.id,
    ct.created_at,
    COALESCE(ct.updated_at, ct.created_at) AS updated_at,
    cl.telefono,
    cl.nombre_completo,
    cl.nombre_completo AS cliente_nombre,
    cl.comuna AS sucursal_comuna,
    cl.direccion AS sucursal_direccion,
    ct.equipo_tipo,
    ct.equipo_marca,
    ct.sintoma_observacion,
    ct.motivo_principal,
    ct.prioridad_sugerida,
    ct.requiere_humano,
    ct.estado,
    ct.fecha_visita,
    ct.cotizacion_neto,
    ct.cotizacion_iva,
    ct.cotizacion_total,
    ct.catalogo_verificado
  FROM casos_triage ct
  LEFT JOIN clientes cl ON ct.cliente_id = cl.id
`;

/**
 * Obtiene los últimos tickets normalizados para el Dashboard.
 */
async function getTicketsDashboard(limite = 50) {
  let client;
  try {
    client = await pool.connect();
    await ensureSchema(client);
    const limitClamped = Math.min(Math.max(Number(limite) || 50, 1), 50);
    const query = `
      ${BASE_SELECT_TICKETS}
      ORDER BY COALESCE(ct.updated_at, ct.created_at) DESC, ct.id DESC
      LIMIT $1
    `;
    const result = await client.query(query, [limitClamped]);
    return result.rows.map(normalizarTicketRow);
  } catch (error) {
    logError('db.getTicketsDashboard', error);
    return [];
  } finally {
    if (client) client.release();
  }
}

/**
 * KRON2-152: Listado paginado con cursor estable `updated_at+id` y `limit` 1–50.
 * Lanza excepción si la base de datos falla para que el endpoint devuelva 500/503 y nunca un falso "sin tickets".
 */
async function getTicketsPaginados({ limit = 50, cursor = null } = {}) {
  let client;
  try {
    client = await pool.connect();
    await ensureSchema(client);
    const limitNum = Math.min(Math.max(Number(limit) || 50, 1), 50);
    const decoded = cursor ? decodeCursor(cursor) : null;

    let result;
    if (decoded) {
      const query = `
        ${BASE_SELECT_TICKETS}
        WHERE (COALESCE(ct.updated_at, ct.created_at), ct.id) < ($1::timestamptz, $2::int)
        ORDER BY COALESCE(ct.updated_at, ct.created_at) DESC, ct.id DESC
        LIMIT $3
      `;
      result = await client.query(query, [decoded.updatedAt, decoded.id, limitNum + 1]);
    } else {
      const query = `
        ${BASE_SELECT_TICKETS}
        ORDER BY COALESCE(ct.updated_at, ct.created_at) DESC, ct.id DESC
        LIMIT $1
      `;
      result = await client.query(query, [limitNum + 1]);
    }

    const hasMore = result.rows.length > limitNum;
    const slice = hasMore ? result.rows.slice(0, limitNum) : result.rows;
    const normalized = slice.map(normalizarTicketRow);
    const last = normalized[normalized.length - 1];
    const nextCursor = hasMore && last ? encodeCursor(last.updated_at, last.id) : null;

    return {
      data: normalized,
      nextCursor,
    };
  } finally {
    if (client) client.release();
  }
}

/**
 * Obtiene un ticket individual por su ID numérico.
 */
async function getTicketById(id) {
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId <= 0) return null;

  let client;
  try {
    client = await pool.connect();
    await ensureSchema(client);
    const query = `
      ${BASE_SELECT_TICKETS}
      WHERE ct.id = $1
      LIMIT 1
    `;
    const result = await client.query(query, [numId]);
    if (result.rows.length === 0) return null;
    return normalizarTicketRow(result.rows[0]);
  } finally {
    if (client) client.release();
  }
}

/**
 * [INT-HU-19] (AAI-90) + KRON2-152:
 * Actualiza el estado (`en_proceso`, `derivado`, `agendado`, `resuelto`) y `fecha_visita`
 * de un ticket con control de concurrencia optimista (`expected_updated_at`).
 */
async function actualizarEstadoTicket(id, { estado, fecha_visita, expected_updated_at } = {}) {
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId <= 0) {
    return { error: 'invalid_id', status: 400, message: 'ID de ticket inválido' };
  }
  if (!estado || !ESTADOS_VALIDOS.has(estado)) {
    return {
      error: 'invalid_state',
      status: 400,
      message: 'Estado inválido. Valores permitidos: en_proceso, derivado, agendado, resuelto',
    };
  }

  let fechaVisitaIso = null;
  if (estado === 'agendado') {
    if (!fecha_visita) {
      return {
        error: 'missing_fecha_visita',
        status: 400,
        message: 'El campo fecha_visita (ISO UTC) es obligatorio al pasar al estado agendado',
      };
    }
    const parsed = new Date(fecha_visita);
    if (Number.isNaN(parsed.getTime())) {
      return {
        error: 'invalid_fecha_visita',
        status: 400,
        message: 'El campo fecha_visita debe ser una fecha ISO 8601 válida',
      };
    }
    fechaVisitaIso = parsed.toISOString();
  } else if (fecha_visita !== undefined && fecha_visita !== null && fecha_visita !== '') {
    const parsed = new Date(fecha_visita);
    if (Number.isNaN(parsed.getTime())) {
      return {
        error: 'invalid_fecha_visita',
        status: 400,
        message: 'El campo fecha_visita debe ser una fecha ISO 8601 válida',
      };
    }
    fechaVisitaIso = parsed.toISOString();
  }

  let client;
  try {
    client = await pool.connect();
    await ensureSchema(client);
    await client.query('BEGIN');

    const currentRes = await client.query(
      `${BASE_SELECT_TICKETS} WHERE ct.id = $1 FOR UPDATE OF ct`,
      [numId]
    );
    if (currentRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return { error: 'not_found', status: 404, message: 'Ticket no encontrado' };
    }

    const currentTicket = normalizarTicketRow(currentRes.rows[0]);

    if (expected_updated_at) {
      const expectedTime = new Date(expected_updated_at).getTime();
      const currentTime = new Date(currentTicket.updated_at).getTime();
      if (Number.isNaN(expectedTime) || expectedTime !== currentTime) {
        await client.query('ROLLBACK');
        return {
          error: 'conflict',
          status: 409,
          message: 'Conflicto de versión: el ticket fue modificado recientemente',
          current: currentTicket,
        };
      }
    }

    const nuevaFechaVisita = estado === 'agendado'
      ? fechaVisitaIso
      : (fecha_visita === null ? null : (fechaVisitaIso || currentTicket.fecha_visita));

    await client.query(
      `UPDATE casos_triage
       SET estado = $1,
           fecha_visita = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [estado, nuevaFechaVisita, numId]
    );

    const updatedRes = await client.query(`${BASE_SELECT_TICKETS} WHERE ct.id = $1`, [numId]);
    await client.query('COMMIT');

    return {
      ok: true,
      status: 200,
      data: normalizarTicketRow(updatedRes.rows[0]),
    };
  } catch (error) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    logError('db.actualizarEstadoTicket', error);
    throw error;
  } finally {
    if (client) client.release();
  }
}

module.exports = {
  guardarCasoTriage,
  getTicketsDashboard,
  getTicketsPaginados,
  getTicketById,
  actualizarEstadoTicket,
  normalizarTicketRow,
  encodeCursor,
  decodeCursor,
  ESTADOS_VALIDOS,
};
