# Arquitectura Integrativa End-to-End y ADRs — Sprint 3 (Cierre de Titulación)

**Proyecto:** Agente Autónomo de Triage Comercial e Integración ERP Kronos — InterChile Climatización  
**Autor:** Carlos Gabriel González Salgado  
**Asignatura:** Proyecto de Título (UNAB) — Sprint 3 / Hito 3  
**Fecha:** 09 de noviembre de 2026  

---

## 1. Visión Arquitectónica Integrativa (End-to-End)

En el Sprint 3 se consolida la arquitectura completa del sistema, unificando en un flujo continuo y trazable:
1. **Recepción Segura de Mensajería:** Webhook de Meta Cloud API validado criptográficamente con `HMAC-SHA256` (`x-hub-signature-256`).
2. **Orquestación Cognitiva con Memoria:** Motor conversacional en `src/brain.js` con LangChain y Google Gemini (`gemini-2.5-flash`) + validación de esquema con `Zod`.
3. **Arnés Anti-Alucinaciones y Contrato de Catálogo (`src/arneses.js` + `src/kronos.js`):** Validación previa al guardado y envío al cliente contra `GET /api/kronos/catalogo` (timeout de 5 s) o lista local de respaldo (`catalogo_verificado: false`), reemplazando cualquier entidad no confirmada por `[dato por confirmar]`.
4. **Motor Determinista de Cotización y PDF (`src/cotizador.js` + `src/pdfGenerator.js`):** Cálculo exacto en CLP (Subtotal Neto + IVA 19% + Total) fuera del LLM para impedir alucinaciones aritméticas, y generación nativa de ficha técnica en formato estándar `%PDF-1.4`.
5. **Persistencia Transaccional y Contrato API (`src/db.js` + `src/server.js`):** Almacenamiento en PostgreSQL (Supabase) con `created_at` inmutable, `updated_at`, paginación por cursor estable (`updated_at+id`), control de concurrencia optimista (`409 Conflict`) y protección mediante Bearer Token privado (`TRIAGE_API_TOKEN`).
6. **Gestión Operativa Dual (Dashboard Web Autónomo + Bandeja Nativa en Kronos 2.0):** Visualización de KPIs de calidad/SLA (`< 4.0 s`), agendamiento con `fecha_visita` obligatoria, descarga de PDF y sincronización paginada hacia `/modulos/triage` en Kronos 2.0 (`KRON2-152`).

---

## 2. Diagrama de Secuencia Integrativo E2E

```mermaid
sequenceDiagram
    autonumber
    actor Cliente as Cliente (WhatsApp)
    participant Meta as Meta Cloud API
    participant Server as Express Server (src/server.js)
    participant Brain as Motor IA LangChain+Gemini (src/brain.js)
    participant Arnes as Arnés Anti-Alucinación (src/arneses.js)
    participant KronosCat as Catálogo Kronos (src/kronos.js)
    participant Cotizador as Cotizador CLP & PDF (src/cotizador.js / pdfGenerator.js)
    participant DB as PostgreSQL Supabase (src/db.js)
    participantMetrics as Metrics Store SLA (src/metricsStore.js)
    actor Admin as Administrador (Dashboard / Kronos 2.0)

    Cliente->>Meta: Envía mensaje o selecciona botón interactivo
    Meta->>Server: POST /webhooks/meta (x-hub-signature-256)
    Server->>Server: Verifica firma HMAC-SHA256 (Tiempo constante)
    alt Firma inválida o ausente
        Server-->>Meta: HTTP 401 / 403 (Bloqueado)
    else Firma válida
        Server->>Brain: extraerFichaTriage(textoCliente, telefonoCliente)
        Brain-->>Server: Ficha estructurada validada con Zod
        Server->>Arnes: aplicarArnes(fichaIA, telefonoCliente)
        Arnes->>KronosCat: validarMarca / validarTipoEquipo / validarRepuesto (Timeout 5s)
        KronosCat-->>Arnes: { existe, catalogo_verificado, source }
        Arnes->>participantMetrics: registrarEventoArnes(huboAlucinacion)
        Arnes-->>Server: fichaCorregida ([dato por confirmar] si no verificado)
        Server->>DB: guardarCasoTriage(fichaCorregida, telefonoCliente)
        DB->>Cotizador: calcularCotizacionBorrador(fichaCorregida)
        Cotizador-->>DB: { subtotal_neto, iva (19%), total_clp } o null
        DB->>DB: UPSERT transaccional (created_at inmutable, updated_at = NOW())
        DB-->>Server: casoId persistido
        Server->>Meta: Envía respuesta o botones interactivos a WhatsApp
        Server->>participantMetrics: registrarLatencia(duracionMs)
        Server-->>Meta: HTTP 200 EVENT_RECEIVED
    end

    Note over Admin,DB: Flujo de Gestión Operativa, Agendamiento, PDF y Sincronización Kronos 2.0
    Admin->>Server: GET /api/tickets?limit=50&cursor=... (Authorization: Bearer TRIAGE_API_TOKEN)
    Server->>DB: getTicketsPaginados({ limit, cursor })
    DB-->>Server: { data: ticketsNormalizados, nextCursor }
    Server-->>Admin: HTTP 200 { ok: true, data, nextCursor }

    Admin->>Server: PATCH /api/tickets/:id { estado: 'agendado', fecha_visita, expected_updated_at }
    Server->>DB: actualizarEstadoTicket(id, payload)
    alt expected_updated_at desactualizado
        DB-->>Server: { error: 'conflict', status: 409 }
        Server-->>Admin: HTTP 409 Conflict
    else Versión vigente y fecha_visita ISO UTC válida
        DB-->>Server: { ok: true, data: ticketActualizado }
        Server-->>Admin: HTTP 200 { ok: true, data }
    end

    Admin->>Server: GET /api/tickets/:id/pdf (Bearer TRIAGE_API_TOKEN)
    Server->>DB: getTicketById(id)
    Server->>Cotizador: generarFichaCotizacionPDF(ticket)
    Cotizador-->>Server: Buffer %PDF-1.4 (Sello: Estimación del bot · No oficial)
    Server-->>Admin: HTTP 200 application/pdf (ficha-triage-id.pdf)
```

---

## 3. Registros de Decisiones de Arquitectura (ADRs — Sprint 3)

### ADR-01: Motor Determinista de Cotización Desacoplado del LLM (`src/cotizador.js`)
- **Contexto:** Los modelos generativos (LLMs) pueden cometer errores de redondeo o inventar tarifas al calcular montos netos e impuestos (IVA 19%).
- **Decisión:** El LLM únicamente clasifica `tipo_solicitud`, `equipo_tipo` y `prioridad`. El cálculo comercial en pesos chilenos (`subtotal_neto`, `iva = Math.round(neto * 0.19)`, `total_clp`) se ejecuta en un módulo determinista puro (`src/cotizador.js`). Cuando el equipo no está confirmado (`[dato por confirmar]`), los campos de cotización se almacenan como `null` (nunca `0` supuesto).
- **Consecuencia:** Precisión aritmética del 100%, cero alucinaciones de precios y cumplimiento estricto del contrato financiero de Kronos 2.0 (`KRON2-152`).

### ADR-02: Generación Nativa de PDF `%PDF-1.4` en Memoria (`src/pdfGenerator.js`)
- **Contexto:** Librerías basadas en Chromium headless (Puppeteer) consumen >300 MB de RAM y exceden los límites del plan gratuito/estándar en Render.
- **Decisión:** Construir un generador nativo de flujos PDF 1.4 en Node.js (`src/pdfGenerator.js`) que ensambla la tabla de objetos, fuentes estándar Type1 (`Helvetica` / `Helvetica-Bold`) y tabla `xref` en un `Buffer` en memoria en `< 5 ms`.
- **Consecuencia:** Tasa de éxito del 100% en generación y descarga de PDFs sin dependencias nativas externas ni riesgo de `Out-Of-Memory` en producción.

### ADR-03: Paginación por Cursor Estable (`updated_at+id`) y Control de Concurrencia Optimista (`409 Conflict`)
- **Contexto:** La paginación por `OFFSET` sufre duplicados o saltos cuando un ticket existente se actualiza mientras un operador o el sincronizador de Kronos 2.0 recorre páginas.
- **Decisión:** Implementar paginación por keyset/cursor compuesto `(COALESCE(updated_at, created_at), id) < ($1, $2)` codificado en `base64url`, conservar `created_at` inmutable y exigir `expected_updated_at` en `PATCH /api/tickets/:id` respondiendo `HTTP 409 Conflict` ante escrituras concurrentes sobre una versión obsoleta.
- **Consecuencia:** Sincronización idempotente sin pérdida ni duplicación de casos entre el Bot y Kronos 2.0.

### ADR-04: Autenticación Bearer Privada de Integración (`TRIAGE_API_TOKEN`)
- **Contexto:** Las rutas administrativas (`/api/tickets`, `/api/tickets/:id`, `/api/metricas`, `/api/tickets/:id/pdf`) no deben quedar expuestas públicamente ni compartir secretos con Meta o Gemini.
- **Decisión:** Implementar el middleware `requireTriageAuth` con comparación en tiempo constante (`crypto.timingSafeEqual`), rechazando con `401` peticiones sin token, con `503` si el token no está configurado o si reutiliza credenciales de Meta/Gemini, y eliminando cualquier token del código fuente del frontend.
- **Consecuencia:** Cumplimiento total de los requisitos de seguridad de `KRON2-152` y protección de datos personales de clientes.
