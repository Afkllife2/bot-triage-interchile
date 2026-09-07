const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function setup() {
  const client = await pool.connect();
  try {
    await client.query(`
      DROP TABLE IF EXISTS casos_triage CASCADE;
      DROP TABLE IF EXISTS clientes CASCADE;

      CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY,
        telefono VARCHAR(20) UNIQUE NOT NULL,
        nombre_completo VARCHAR(255),
        empresa VARCHAR(255),
        comuna VARCHAR(255),
        direccion TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS casos_triage (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER REFERENCES clientes(id),
        motivo_principal VARCHAR(255),
        equipo_tipo VARCHAR(255),
        equipo_marca VARCHAR(255),
        sintoma_observacion TEXT,
        prioridad_sugerida VARCHAR(50),
        disponibilidad_cliente VARCHAR(255),
        tiene_fotos BOOLEAN DEFAULT FALSE,
        estado VARCHAR(50) DEFAULT 'Pendiente',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    client.release();
    pool.end();
  }
}

setup();
