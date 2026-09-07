-- Migración Inicial: Modelo de Datos para Bot Triage InterChile

-- Habilitar extensión para generar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla: clientes
CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telefono TEXT UNIQUE NOT NULL,
    nombre TEXT,
    empresa TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla: casos_triage (Fichas)
CREATE TABLE IF NOT EXISTS public.casos_triage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
    motivo TEXT, -- FALLA, MANTENCION, COTIZACION, PROYECTO, OTRO
    estado TEXT DEFAULT 'ABIERTO', -- ABIERTO, PAUSADO, CERRADO, DERIVADO
    prioridad TEXT DEFAULT 'MEDIA', -- BAJA, MEDIA, URGENTE
    tipo_equipo TEXT,
    sintomas_reportados TEXT,
    fotos_urls TEXT[],
    resumen_ia TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabla: chat_history
CREATE TABLE IF NOT EXISTS public.chat_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    caso_id UUID NOT NULL REFERENCES public.casos_triage(id) ON DELETE CASCADE,
    emisor TEXT NOT NULL, -- CLIENTE, BOT, HUMANO
    mensaje TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Configuración de Seguridad (RLS)
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.casos_triage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir acceso desde el servidor backend (Service Role)
-- Por defecto, el Service Role de Supabase se salta RLS, pero para la API pública 
-- podríamos restringirlo si se usara el cliente anon. 
-- Aquí permitimos a roles anónimos insertar solo temporalmente (o bloqueamos todo y dejamos que el backend de Node.js haga el trabajo con service_role).
-- Por seguridad, denegaremos el acceso anónimo a todo y manejaremos todo en Node.js usando SUPABASE_SERVICE_ROLE_KEY.

CREATE POLICY "Bloquear acceso anónimo a clientes" ON public.clientes FOR ALL USING (false);
CREATE POLICY "Bloquear acceso anónimo a casos" ON public.casos_triage FOR ALL USING (false);
CREATE POLICY "Bloquear acceso anónimo a historial" ON public.chat_history FOR ALL USING (false);
