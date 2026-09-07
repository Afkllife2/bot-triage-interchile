const { Pool } = require('pg');
require('dotenv').config();

// Configuración del Pool de PostgreSQL conectado a Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

/**
 * Guarda una ficha de Triage generada por la IA en la base de datos Supabase
 */
async function guardarCasoTriage(ficha, telefonoCliente) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Verificar si el cliente existe, si no, insertarlo
    let clientId;
    const resCliente = await client.query(
      'SELECT id FROM clientes WHERE telefono = $1 LIMIT 1',
      [telefonoCliente]
    );

    if (resCliente.rows.length > 0) {
      clientId = resCliente.rows[0].id;
    } else {
      // Insertar nuevo cliente
      const insertCliente = await client.query(
        'INSERT INTO clientes (telefono, nombre_completo, empresa, comuna, direccion) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [
          telefonoCliente,
          ficha.cliente_nombre || null,
          ficha.tipo_solicitud === 'Proyecto Comercial' ? ficha.cliente_nombre : null,
          ficha.sucursal_comuna || null,
          ficha.sucursal_direccion || null
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
        tiene_fotos
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id
    `;
    
    const valuesCaso = [
      clientId,
      ficha.tipo_solicitud,
      ficha.equipo_tipo || null,
      ficha.equipo_marca || null,
      ficha.sintoma_observacion || null,
      ficha.prioridad || 'Normal',
      ficha.disponibilidad_cliente || null,
      ficha.tiene_fotos || false
    ];

    const resCaso = await client.query(queryCaso, valuesCaso);
    await client.query('COMMIT');
    
    console.log(`✅ Caso guardado en DB exitosamente. ID: ${resCaso.rows[0].id}`);
    return resCaso.rows[0].id;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error al guardar en DB:', error);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  guardarCasoTriage
};
