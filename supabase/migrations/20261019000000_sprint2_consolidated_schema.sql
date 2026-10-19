-- =============================================================================
-- Migración Consolidada Sprint 2 (Hito 2) — Bot Triage Comercial InterChile
-- Fecha: 2026-10-19
-- Descripción: Sincroniza el esquema declarativo del repositorio con el esquema
--              operativo real en Supabase PostgreSQL utilizado por src/db.js
--              (guardarCasoTriage y getTicketsDashboard).
-- =============================================================================

-- 1. Tabla de Clientes (identificados unívocamente por su wa_id / teléfono)
CREATE TABLE IF NOT EXISTS public.clientes (
    id SERIAL PRIMARY KEY,
    telefono VARCHAR NOT NULL UNIQUE,
    nombre_completo VARCHAR NULL,
    empresa VARCHAR NULL,
    comuna VARCHAR NULL,
    direccion TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Casos de Triage (tickets generados por la IA y validados por arneses)
CREATE TABLE IF NOT EXISTS public.casos_triage (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES public.clientes(id),
    motivo_principal VARCHAR NULL,
    equipo_tipo VARCHAR NULL,
    equipo_marca VARCHAR NULL,
    sintoma_observacion TEXT NULL,
    prioridad_sugerida VARCHAR NULL,
    disponibilidad_cliente VARCHAR NULL,
    tiene_fotos BOOLEAN DEFAULT FALSE,
    estado VARCHAR DEFAULT 'Pendiente',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    requiere_humano BOOLEAN DEFAULT FALSE,
    tipo_interaccion VARCHAR DEFAULT 'texto'
);

-- 3. Asegurar columnas añadidas en iteraciones del Sprint 2 (idempotente)
ALTER TABLE public.casos_triage
    ADD COLUMN IF NOT EXISTS requiere_humano BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS tipo_interaccion VARCHAR DEFAULT 'texto';

-- 4. Índices de rendimiento para JOIN y ordenamiento del Dashboard (HU-19)
CREATE INDEX IF NOT EXISTS idx_casos_triage_cliente_id
    ON public.casos_triage(cliente_id);

CREATE INDEX IF NOT EXISTS idx_casos_triage_created_at_desc
    ON public.casos_triage(created_at DESC);
