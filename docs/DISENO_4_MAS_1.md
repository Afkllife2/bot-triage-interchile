# Arquitectura 4+1 (Diseño del Incremento - Sprint 1)

**Proyecto:** Bot Triage Comercial InterChile
**Modelo:** Vistas de Arquitectura 4+1 de Kruchten

Este documento presenta el diseño arquitectónico del incremento de software correspondiente al Hito 1, estructurado en las 5 vistas del modelo 4+1, asegurando la trazabilidad con las Historias de Usuario (HU-01 a HU-06).

---

## 1. Vista Lógica (Estructura y Componentes)
Muestra las partes que componen el sistema y cómo se relacionan funcionalmente.
- **Módulo de Recepción (Webhook):** Construido en Node.js/Express. Recibe los JSON de Meta (WhatsApp).
- **Módulo de Triage (Cerebro):** Encargado de las reglas de negocio. Verifica prioridad y tipo de cliente.
- **Módulo de Inteligencia Artificial:** Integración vía API REST con Google Gemini.
- **Módulo de Persistencia:** Cliente ORM (Prisma/pg) que interactúa con Supabase (PostgreSQL).

## 2. Vista de Procesos (Interacción y Concurrencia)
Describe cómo fluye la información en tiempo de ejecución.
- **Proceso Asíncrono Principal:**
  1. Ingresa mensaje HTTP POST al Webhook.
  2. Node.js parsea el texto y lanza request asíncrono a Gemini.
  3. Node.js espera respuesta, formatea el JSON (Entidades extraídas).
  4. Node.js ejecuta un INSERT asíncrono en Supabase.
  5. Se dispara respuesta al usuario vía WhatsApp API.
- *Decisión de Diseño:* Se usan Promesas (`async/await`) en Node.js para evitar el bloqueo del Event Loop durante la llamada al LLM.

## 3. Vista de Desarrollo (Despliegue y Código)
Muestra cómo está estructurado el código fuente y el entorno de desarrollo.
- **Repositorio:** Git (GitHub), estructurado bajo Git Flow (`main`, `develop`).
- **Pila Tecnológica:** Node.js, Express, Jest (Testing), Supabase-js.
- **Gestión de Entorno:** Archivo `.env` para proteger JWT tokens y URLs de pooler (Supavisor).

## 4. Vista Física (Topología de Red)
Muestra dónde se ejecutan los componentes de software físicamente (en la nube).
- **Servidor Backend:** (Proyectado para Render / Heroku / AWS EC2). Ejecuta la instancia Node.js.
- **Base de Datos:** Instancia serverless en AWS (vía Supabase), región `us-east-2`.
- **API Externa 1:** Google Cloud (Gemini API).
- **API Externa 2:** Meta Graph API (WhatsApp).

## 5. Vista de Escenarios (Casos de Uso)
El "más 1". Valida que el diseño soporta las Historias de Usuario.
- **Escenario (HU-04 - Ficha de Consolidación):** El usuario ingresa sus datos. La Vista Lógica orquesta la petición, la Vista de Procesos asegura que no haya timeout con el LLM, y la Vista Física asegura que la conexión segura a la DB en AWS guarde el registro en la tabla `casos_triage`.


---

# Actualización Sprint 2 — Vistas 4+1 del Incremento Implementado

Detalle de componentes y decisiones en [ARQUITECTURA_V2.md](ARQUITECTURA_V2.md). Esta sección corrige las vistas del Hito 1 con lo realmente construido.

## 1. Vista Lógica (Sprint 2)
- **`server.js`** — entrada: webhook, firma HMAC, API REST, dashboard.
- **`brain.js`** — motor IA con LangChain (`ChatGoogleGenerativeAI` + `withStructuredOutput` Zod), memoria por teléfono y derivación a humano.
- **`arneses.js` + `kronos.js`** — control anti-alucinación contra catálogo.
- **`db.js`** — persistencia con `pg` (pool) hacia Supabase. *(Corrige el Hito 1: no se usa Prisma ni supabase-js.)*
- **`whatsapp.js`** — salida: texto, botones y lista interactiva.

## 2. Vista de Procesos (Sprint 2)
1. `POST /webhooks/meta` → validación HMAC-SHA256 sobre el cuerpo crudo.
2. Se extrae texto, `button_reply` o `list_reply`.
3. `brain.js`: si el cliente ya fue derivado → respuesta estática sin IA; si no, Gemini con historial (timeout 8 s).
4. `arneses.js`: valida marca/tipo/repuesto contra Kronos y corrige.
5. `db.js`: transacción cliente + caso (rollback ante error).
6. `whatsapp.js`: respuesta como texto, botones (≤3) o lista (4–10).
7. Siempre `HTTP 200` a Meta; los errores quedan en `logs/`.

## 3. Vista de Desarrollo (Sprint 2)
- Git Flow con ramas por HU o por pares de HU (`feat/HU-06-y-HU-20-…`, `feat/HU-18-y-HU-21-…`).
- Pruebas: Jest + supertest — `test/arneses.test.js` (13), `test/interchile.test.js` (4), `test/integracion.test.js` (15).
- Entorno: `.env` (secretos fuera del repositorio).

## 4. Vista Física (Sprint 2)
- Backend Node.js local expuesto con **túnel Cloudflare** (efímero; producción requiere hosting fijo).
- Base de datos en Supabase; modelo de IA en Google Cloud; mensajería en Meta Cloud API (número oficial `+56 9 7235 2751`).

## 5. Vista de Escenarios (Sprint 2)
- **HU-06:** el cliente pide un ejecutivo → la IA marca derivación → se guarda `derivado` → se entrega el contacto de Benjamín → mensajes posteriores reciben respuesta estática.
- **HU-20:** saludo → lista de 4 opciones (incl. Arriendo) → el clic llega como `list_reply` → la IA continúa el flujo.
- **HU-21:** la IA menciona una marca inexistente → el arnés la reemplaza por `[dato por confirmar]` antes de guardar.

---

# Actualización Sprint 3 (Hito 3) — Vistas 4+1 del Incremento de Cierre e Integración Kronos 2.0

Detalle completo de secuencia y ADRs en [ARQUITECTURA_INTEGRATIVA_SPRINT_3.md](ARQUITECTURA_INTEGRATIVA_SPRINT_3.md).

## 1. Vista Lógica (Sprint 3)
- **`cotizador.js` (`[INT-HU-05]`):** Motor determinista de estimación comercial en CLP (`subtotal_neto`, `iva` 19%, `total_clp`) desacoplado del LLM; retorna `null` cuando el equipo está por confirmar.
- **`pdfGenerator.js` (`[INT-HU-05]`):** Generador nativo en memoria de fichas técnicas y borradores de cotización en formato estándar `%PDF-1.4` con sello no oficial.
- **`metricsStore.js` (`[INT-HU-22]`):** Almacén en memoria de métricas de latencia SLA (`< 4000 ms`), efectividad del arnés (`100%`) y tasa de generación de PDFs.
- **`kronos.js` + `arneses.js` (`KRON2-152`):** Adaptador HTTP con timeout de 5 s hacia `GET /api/kronos/catalogo` y distinción explícita entre catálogo oficial (`catalogo_verificado: true`) y lista local de respaldo (`catalogo_verificado: false`).
- **`db.js` + `server.js` (`[INT-HU-19]` + `KRON2-152`):** Autenticación Bearer privada (`TRIAGE_API_TOKEN`), inmutabilidad de `created_at`, paginación por cursor estable `updated_at+id` y control de concurrencia optimista (`409 Conflict`) en `PATCH /api/tickets/:id`.

## 2. Vista de Procesos (Sprint 3)
- **Flujo de Triage + Cotización:** `POST /webhooks/meta` (HMAC-SHA256) → `brain.js` → `arneses.js` (`kronos.js` con timeout 5 s) → `db.guardarCasoTriage` (invoca `cotizador.js` y persiste con `created_at` inmutable) → `whatsapp.js` → `metricsStore.registrarLatencia`.
- **Flujo de Gestión, Agendamiento y Sincronización Kronos 2.0:** `GET /api/tickets?limit=50&cursor=...` (Bearer `TRIAGE_API_TOKEN`) → `PATCH /api/tickets/:id` (valida `fecha_visita` ISO UTC al pasar a `agendado` y verifica `expected_updated_at` devolviendo `409` ante conflicto) → `GET /api/tickets/:id/pdf` (entrega binario `%PDF-1.4`).

## 3. Vista de Desarrollo (Sprint 3)
- Rama `feat/sprint3-bot-y-contrato-kronos` integrada en `develop` y `main` bajo tag `v3.0.0-sprint3`.
- Suite automatizada en Jest (`5 suites / 54 tests PASS`): `test/interchile.test.js`, `test/arneses.test.js`, `test/integracion.test.js`, `test/db-contrato.test.js` y `test/sprint3.test.js`.

## 4. Vista Física (Sprint 3)
- Servicio Node.js desplegado 24/7 en **Render** con HTTPS/SSL (`https://bot-triage-interchile.onrender.com`), conectado a **Supabase PostgreSQL**, **Meta WhatsApp Cloud API**, **Google Gemini API** y preparado para comunicación servidor-a-servidor HTTPS con **Kronos 2.0**.

## 5. Vista de Escenarios (Sprint 3)
- **INT-HU-05:** Cliente reporta mantención de Split Samsung → el bot calcula `$45.000` neto + `$8.550` IVA = `$53.550 CLP` → el administrador descarga la ficha `%PDF-1.4`.
- **INT-HU-19 / KRON2-152:** Coordinador agenda visita técnica con fecha ISO UTC → si otro usuario editó antes el ticket, el servidor rechaza con `409 Conflict` protegiendo la integridad.
- **INT-HU-23:** 20 usuarios envían mensajes simultáneos por WhatsApp → el 100% recibe `HTTP 200` con sesiones aisladas y latencia `< 4.0 s`.
