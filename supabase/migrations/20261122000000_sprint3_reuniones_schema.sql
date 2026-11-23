-- =============================================================================
-- Migración Sprint 3 ([INT-HU-23] / AAI-102) — Agenda de Reuniones con Benjamín
-- Fecha: 2026-11-22
-- Descripción: Crea la tabla `public.reuniones` con bloqueo atómico parcial
--              para impedir topones horarios (HTTP 409) en reservas activas.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.reuniones (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NULL REFERENCES public.clientes(id) ON DELETE SET NULL,
    cliente_nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(30) NULL,
    fecha_reunion DATE NOT NULL,
    hora_reunion VARCHAR(5) NOT NULL,
    modalidad VARCHAR(30) NOT NULL CHECK (modalidad IN ('Presencial', 'Online')),
    motivo TEXT NOT NULL DEFAULT 'Evaluación comercial con Benjamín Yáñez',
    origen VARCHAR(30) NOT NULL DEFAULT 'dashboard' CHECK (origen IN ('whatsapp', 'dashboard')),
    estado VARCHAR(30) NOT NULL DEFAULT 'confirmada' CHECK (estado IN ('confirmada', 'reagendada', 'cancelada', 'completada')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índice único parcial: impide doble reserva en el mismo día/hora mientras no esté cancelada (CA-3)
CREATE UNIQUE INDEX IF NOT EXISTS uq_reuniones_slot_activo
    ON public.reuniones (fecha_reunion, hora_reunion)
    WHERE estado <> 'cancelada';

-- Índices de consulta para el Widget de Calendario (CA-2, CA-4)
CREATE INDEX IF NOT EXISTS idx_reuniones_fecha_hora
    ON public.reuniones (fecha_reunion ASC, hora_reunion ASC);

CREATE INDEX IF NOT EXISTS idx_reuniones_cliente_id
    ON public.reuniones (cliente_id);
