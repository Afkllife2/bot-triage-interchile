# Agente Autónomo de Triage Comercial, Cotización PDF y Agenda Inteligente — InterChile Clima SpA

Sistema conversacional conectado a **WhatsApp Business Cloud API** (`+56 9 7235 2751`) con orquestación IA (**Google Gemini 2.5 Flash + LangChain + Zod**), **arnés determinista anti-alucinaciones** contra el catálogo del ERP Kronos, **cotizador CLP + IVA 19%** con emisión nativa **PDF (`%PDF-1.4`)** fuera del LLM, **agenda comercial anti-topones (`HTTP 409`)** y **Dashboard operativo en tiempo real** alineado a la identidad corporativa de **InterChile Clima SpA**.

- **Servicio en Producción (24/7 SSL):** https://bot-triage-interchile.onrender.com/dashboard
- **Repositorio GitHub:** https://github.com/Afkllife2/bot-triage-interchile
- **Tablero Jira (AAI):** https://uandresbello-team-bg7iosbc.atlassian.net/jira/software/projects/AAI/boards/202

---

## Navegación Rápida de Artefactos — Hito 3 (INSW422)

Todos los artefactos exigidos por la rúbrica de titulación viven versionados y listos para auditoría en vivo:

| # | Artefacto | Ruta en Repositorio | Criterio |
| :-: | :--- | :--- | :-: |
| **A1** | Problema, hipótesis y objetivos medibles (`OE-1..OE-4`) | [`docs/objetivos.md`](./docs/objetivos.md) | `1` |
| **A2** | Requerimientos `RF/RNF`, escenarios `ISO 25010` y alcance MPV | [`docs/requerimientos.md`](./docs/requerimientos.md) | `2 y 4` |
| **A3** | Historias BDD (`Dado/Cuando/Entonces`) y plantilla Issue | [`docs/HISTORIAS_USUARIO_MPV_A3.md`](./docs/HISTORIAS_USUARIO_MPV_A3.md) · [`.github/ISSUE_TEMPLATE/`](./.github/ISSUE_TEMPLATE/historia-de-usuario.md) | `2` |
| **A4** | Matriz de trazabilidad bidireccional (`OE <-> Commit/Tag`) | [`docs/trazabilidad.md`](./docs/trazabilidad.md) | `2` |
| **A5** | Plan de pruebas, defectos, informe y reporte Jest JSON | [`docs/pruebas/PLAN_DE_PRUEBAS_HITO3.md`](./docs/pruebas/PLAN_DE_PRUEBAS_HITO3.md) · [`jest-report-hito3.json`](./docs/pruebas/jest-report-hito3.json) · [`INFORME_DE_PRUEBAS_SPRINT_3.md`](./docs/INFORME_DE_PRUEBAS_SPRINT_3.md) | `3a y 3b` |
| **A6** | Reportes de seguridad (`npm audit`) y carga HTTP (`N=50`) | [`docs/calidad/REPORTE_SEGURIDAD_Y_EFICIENCIA.md`](./docs/calidad/REPORTE_SEGURIDAD_Y_EFICIENCIA.md) · [`load-test-report.json`](./docs/calidad/load-test-report.json) · [`npm-audit-hito3.json`](./docs/calidad/npm-audit-hito3.json) | `4` |
| **A7** | Modelamiento **Camino A (UML)** y ADRs con matrices ponderadas | [`docs/arquitectura/README.md`](./docs/arquitectura/README.md) · [`docs/arquitectura/adr/`](./docs/arquitectura/adr/ADR-01-calculo-y-arnes-fuera-del-llm.md) · [`modelos/`](./docs/arquitectura/modelos/README.md) | `5` |
| **A8** | Changelog, plantillas Git y estrategia Git Flow | [`CHANGELOG.md`](./CHANGELOG.md) · [`.github/pull_request_template.md`](./.github/pull_request_template.md) | `6` |
| **A9** | Matriz de riesgos al cierre, deuda técnica (`DT-01..04`) y mejoras | [`docs/riesgos.md`](./docs/riesgos.md) | `8` |

---

## Arquitectura del Código Fuente (`src/` y `public/`)

- `src/server.js`: Servidor Express, Webhook Meta (`/webhooks/meta`) con firma `HMAC-SHA256`, API REST protegida por `TRIAGE_API_TOKEN` (`crypto.timingSafeEqual`), carga cursor keyset, PDF, métricas y agenda.
- `src/brain.js`: Motor cognitivo con LangChain + Gemini 2.5 Flash + esquema estricto `Zod` (`FichaTriage`), memoria conversacional por teléfono (`10` turnos / `60` min), derivación silenciosa (`HU-06`) y timeout de `12 s`.
- `src/arneses.js` + `src/kronos.js`: Arnés determinista anti-alucinaciones (`HU-18/21` + `KRON2-152`) con consulta a `GET /api/kronos/catalogo` (timeout `5 s`) o respaldo local sanitizando datos inexistentes hacia `[dato por confirmar]`.
- `src/cotizador.js` + `src/pdfGenerator.js`: Tarifario determinista CLP (`Neto + IVA 19%` fuera del LLM; retorno `null` en proyectos/datos por confirmar) y ensamblador binario nativo `%PDF-1.4` (`< 5 ms`).
- `src/agenda.js`: Validación de reglas hábiles de Benjamín (Lunes–Viernes `09:00–12:00` y `14:00–18:00`), ciclo de estados (`ingresada -> confirmada -> completada` / `cancelada`) y sugerencias cercanas ante colisiones `409`.
- `src/db.js`: Pool SSL hacia PostgreSQL (Supabase), transacciones `BEGIN/COMMIT/ROLLBACK`, cursor `updated_at+id` con preservación de microsegundos, bloqueo pesimista `SELECT FOR UPDATE` (`uq_reuniones_slot_activo`) y concurrencia optimista `409 Conflict`.
- `src/metricsStore.js` + `src/whatsapp.js`: Ventana móvil SLA (`< 4000 ms`), contadores de arnés/PDF y envío Graph API `v21.0` con *Reply Buttons* / *List Messages*.
- `public/dashboard.html`: Panel corporativo `interchileclima.cl` con **4 KPIs comerciales**, filtros, asignación de visitas técnicas (`409`), calendario de reuniones con Benjamín y panel colapsable **`Auditoría QA (ISO/IEC 25010)`**.

---

## Requisitos, Instalación y Reproducción del Despliegue

### 1. Prerrequisitos
- **Node.js `>= 18`** y **npm**.
- Cuenta **PostgreSQL / Supabase** con las migraciones ejecutadas en orden desde [`supabase/migrations/`](./supabase/migrations/):
  1. `20260824000000_initial_schema.sql`
  2. `20261019000000_sprint2_consolidated_schema.sql`
  3. `20261122000000_sprint3_reuniones_schema.sql`

### 2. Variables de Entorno (`.env`)
Copie [`.env.example`](./.env.example) a `.env` y complete sus credenciales privadas (nunca versionadas):

```env
PORT=3000
META_VERIFY_TOKEN=<token_verificacion_webhook>
META_APP_SECRET=<app_secret_hmac_sha256>
META_ACCESS_TOKEN=<system_user_token_permanente>
META_PHONE_NUMBER_ID=<id_numero_whatsapp>
GEMINI_API_KEY=<api_key_google_gemini>
DATABASE_URL=<postgres_connection_string_ssl>
TRIAGE_API_TOKEN=<token_bearer_privado_distinto_de_meta_y_gemini>
KRONOS_API_BASE_URL=<opcional_url_kronos_catalogo>
KRONOS_CATALOGO_TOKEN=<opcional_bearer_kronos>
```

### 3. Comandos Locales Reproducibles

```bash
# Instalar dependencias
npm install

# Ejecutar suite completa de pruebas + cobertura (7 suites / 87 tests PASS, 91.58% líneas)
npx jest --coverage --runInBand --detectOpenHandles

# Ejecutar prueba reproducible de carga HTTP (N=50 VUs, 500 reqs + 20 probes de seguridad)
node docs/calidad/load-test-hito3.js

# Auditar vulnerabilidades de dependencias
npm audit --omit=dev

# Iniciar servidor HTTP y Dashboard local (http://localhost:3000/dashboard)
npm start
```

### 4. Despliegue Productivo en Render Cloud
Configurado como Infrastructure-as-Code en [`render.yaml`](./render.yaml) y [`Dockerfile`](./Dockerfile):
- **Build Command:** `npm install` (o `npm install --omit=dev` en Docker `node:20-alpine`).
- **Start Command:** `node src/server.js`.
- **Health Check:** `GET /healthz` (`200 OK`).
- **Estrategia Git Flow:** Desarrollo aislado por Historia de Usuario (`feat/AAI-XX-...`) integrado vía Pull Request hacia `develop` y `main`, congelado bajo tag formal (`v3.1.0-sprint3-cierre` / `hito3`).
