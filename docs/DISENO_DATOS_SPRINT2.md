# Diseño de Datos — Sprint 2

**Fuente:** derivado de las consultas reales de `src/db.js` (`guardarCasoTriage`, `getTicketsDashboard`).

> ⚠️ **Nota de consistencia:** la migración `supabase/migrations/20260824000000_initial_schema.sql` (Hito 1) usa nombres distintos (`nombre`, `motivo`, `tipo_equipo`, `prioridad`, UUID) y una tabla `chat_history` que el código **no usa**. El esquema operativo evolucionó directamente en Supabase durante el Sprint 1–2. Los tipos exactos de columna deben contrastarse con la base viva y consolidarse en una migración nueva (tarea para Hito 3).

## 1. Modelo entidad–relación (según el código)

```mermaid
erDiagram
    clientes ||--o{ casos_triage : "genera"
    clientes {
        id PK
        telefono UK "wa_id de WhatsApp"
        nombre_completo
        empresa "solo Proyecto Comercial"
        comuna
        direccion
    }
    casos_triage {
        id PK
        cliente_id FK
        motivo_principal "tipo_solicitud de la IA"
        equipo_tipo
        equipo_marca
        sintoma_observacion
        prioridad_sugerida "Alta/Media/Baja/Normal"
        disponibilidad_cliente
        tiene_fotos
        requiere_humano
        estado "en_proceso | derivado"
        created_at
    }
```

## 2. Reglas de negocio sobre los datos

| Regla | Dónde se implementa |
|---|---|
| Un teléfono = un cliente (se busca por `telefono`, se crea si no existe) | `db.js` → `SELECT … WHERE telefono` / `INSERT clientes` |
| El nombre del cliente solo se completa si estaba vacío (no se sobrescribe) | `db.js` → `UPDATE … WHERE nombre_completo IS NULL OR = ''` |
| Cliente y caso se guardan en **una transacción** (`BEGIN/COMMIT/ROLLBACK`) | `db.js` |
| `estado = 'derivado'` y `requiere_humano = true` cuando la IA deriva | `db.js` (`estadoCaso`) |
| La ficha se valida con Zod **antes** de llegar a la BD y el arnés corrige datos inventados | `brain.js`, `arneses.js` |
| Un fallo de BD no interrumpe la atención: se registra en `logs/error.log` | `db.js` → `logError` |

## 3. Procesos y plataformas

| Proceso | Plataforma | Decisión y justificación |
|---|---|---|
| Canal de conversación | WhatsApp Cloud API (Meta) | Canal que ya usa el cliente; sin app nueva que instalar |
| Extracción semántica | Gemini 2.5 Flash vía LangChain | Velocidad y costo; salida estructurada con Zod |
| Persistencia | Supabase (PostgreSQL gestionado) | SQL relacional, transacciones, RLS |
| Validación de dominio | Catálogo Kronos (simulado) | Aísla la validación; interfaz lista para API real |
| Exposición | Express + túnel Cloudflare (desarrollo) | Webhook público sin infraestructura propia |
