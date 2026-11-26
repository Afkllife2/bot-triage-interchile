-- =============================================================================
-- Migración Sprint 3 ([INT-HU-23] / AAI-102) — Diferenciación Online vs Presencial
-- Fecha: 2026-11-26
-- Descripción: Agrega `detalle_modalidad` (TEXT NULL) a `public.reuniones` para
--              persistir dirección física / sede en reuniones Presenciales y
--              plataforma / enlace de videollamada en reuniones Online.
-- =============================================================================

ALTER TABLE public.reuniones
    ADD COLUMN IF NOT EXISTS detalle_modalidad TEXT NULL;
