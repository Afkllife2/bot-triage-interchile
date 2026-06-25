-- Script de inicializacion de Base de Datos para Bot Verificador X

-- Crear tabla de metricas si no existe
CREATE TABLE IF NOT EXISTS metrics (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    latency_ms INTEGER NOT NULL,
    veredicto VARCHAR(50) NOT NULL,
    confianza INTEGER NOT NULL,
    source VARCHAR(100) NOT NULL,
    text TEXT,
    status VARCHAR(50) DEFAULT 'ok',
    error_type VARCHAR(100),
    provider VARCHAR(100) DEFAULT 'unknown',
    attempts INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE metrics ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ok';
ALTER TABLE metrics ADD COLUMN IF NOT EXISTS error_type VARCHAR(100);
ALTER TABLE metrics ADD COLUMN IF NOT EXISTS provider VARCHAR(100) DEFAULT 'unknown';
ALTER TABLE metrics ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 1;

-- Indices para optimizar busquedas operacionales y reportes
CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON metrics (timestamp);
CREATE INDEX IF NOT EXISTS idx_metrics_veredicto ON metrics (veredicto);
CREATE INDEX IF NOT EXISTS idx_metrics_user_id ON metrics (user_id);
CREATE INDEX IF NOT EXISTS idx_metrics_status ON metrics (status);
CREATE INDEX IF NOT EXISTS idx_metrics_error_type ON metrics (error_type);
