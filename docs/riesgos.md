# A9 · Matriz de Riesgos al Cierre, Deuda Técnica y Plan de Mejoras (Hito 3 — INSW422)

**Proyecto:** Agente Autónomo de Triage Comercial, Cotización PDF y Agenda Inteligente — InterChile Clima SpA  
**Fecha de Cierre y Evaluación:** Noviembre de 2026 (`Hito 3`)

---

## 1. Escala de Evaluación de Severidad ($P \times I$)
- **Probabilidad ($P$):** `1` (Baja) · `2` (Media) · `3` (Alta)
- **Impacto ($I$):** `1` (Bajo) · `2` (Medio) · `3` (Alto)
- **Nivel ($P \times I$):** `1–3` Bajo (Verde) · `4–6` Medio (Amarillo) · `7–9` Alto/Crítico (Rojo)

---

## 2. Matriz Consolidada de Riesgos al Cierre (`R-01` a `R-19`)

*(Incluye explícitamente el requerimiento u objetivo amenazado, su plan de mitigación y contingencia, y los riesgos materializados resueltos o mitigados durante el proyecto).*

| ID | Riesgo | Req. / Objetivo Afectado | $P$ | $I$ | Nivel | Estrategia de Mitigación | Plan de Contingencia | Estado Real al Cierre (Hito 3) |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- | :--- |
| **R-01** | Bloqueo del número WhatsApp por políticas anti-spam de Meta. | `RF-01` · `OE-1` | `2` | `3` | `6` (Medio) | Uso exclusivo de WhatsApp Cloud API oficial respondiendo solo mensajes entrantes (ventana `24 h`). | Cambio inmediato a plantilla aprobada en Meta Business Manager. | **Controlado (`Vigente`)** — `0` bloqueos en producción (`free_customer_service`). |
| **R-02** | Alucinación del LLM (inventa marcas, equipos o repuestos HVAC). | `RF-03` · `OE-2` | `2` | `3` | `6` (Medio) | Temperatura `0` + esquema estricto `Zod` + arnés determinista en `src/arneses.js` previo a persistir. | Reemplazo automático por `[dato por confirmar]` + registro en `logs/alucinaciones.log`. | **Cerrado (`100%` Mitigado)** — `15/15 PASS` (`96,92%` líneas) + Escenario B validado. |
| **R-03** | Caída o latencia de conexión con Supabase PostgreSQL. | `RF-05`, `RNF-04` · `OE-4` | `1` | `3` | `3` (Bajo) | Transacciones `BEGIN/COMMIT/ROLLBACK` con pool SSL en `src/db.js`. | Log local en `logs/error.log` sin tumbar respuesta al cliente (`HTTP 500` controlado). | **Mitigado (`Activo`)** — Rollbacks verificados en `test/db-contrato.test.js`. |
| **R-04** | Rechazo del cliente final a interactuar solo con un bot. | `RF-02` · `OE-1` | `2` | `2` | `4` (Medio) | Mensajes breves, empatía comercial y diálogo natural sin menús IVR rígidos. | Derivación inmediata (`HU-06`) entregando correo/teléfono de Benjamín y silenciando IA. | **Cerrado** — Handoff y silenciamiento verificados (`CP-S2-09..11`). |
| **R-05** | Retraso por cambios de requerimiento del stakeholder. | `RF-01..RF-07` · `OE-1..4` | `3` | `2` | `6` (Medio) | Refinamiento ágil en Jira tras cada Sprint Review con acta formal. | Priorización MoSCoW protegiendo `Must` del MPV y pasando extras a Versiones Futuras. | **Materializado y Gestionado** — Se integró *Arriendo*, formato PDF de Benjamín y reglas de agenda Review (`24-11-2026`). |
| **R-06** | Inconsistencia de tipos entre salida IA e inserción SQL. | `RF-05` · `OE-3/4` | `2` | `2` | `4` (Medio) | Contrato `Zod` (`withStructuredOutput`) + normalización defensiva en `db.js`/`agenda.js`. | Rechazo controlado `HTTP 400` y fallback `'No especificada'` (`D-01`). | **Cerrado** — Corregido `D-01` (`c7167be`) y cubierto por contrato DB. |
| **R-07** | Expiración del token temporal 24 h de Meta (`OAuthException 190`). | `RF-01` · `OE-1` | `3` | `3` | `9` (Alto) | Creación de *System User* en Meta Business Suite. | Token permanente (`expires_at: 0`) documentado en `docs/TOKEN_RENOVACION.md`. | **Materializado y Cerrado** — Token permanente operativo 24/7. |
| **R-08** | Pausa automática de proyecto gratuito en Supabase por inactividad. | `RF-05`, `RNF-03` · `OE-4` | `3` | `3` | `9` (Alto) | Monitoreo previo a demos y salud vía `/healthz` + consultas periódicas. | Reactivación de instancia y respaldo de migraciones versionadas en `supabase/migrations/`. | **Mitigado** — Base activa (`50+` tickets y `reuniones` operando). |
| **R-09** | Límite de 3 botones rápidos en Meta impide listar 4+ servicios. | `RF-01` · `OE-1` | `3` | `2` | `6` (Medio) | Conmutación automática en `src/whatsapp.js` hacia *List Messages* (`4–10` ítems). | Fallback automático a texto plano numerado en caso de error de payload. | **Materializado y Cerrado** — Lista de servicios + *Arriendo* activa (`16/16 PASS`). |
| **R-10** | Pérdida de historial conversacional multi-turno ante reinicio RAM. | `RF-02` · `OE-1` | `2` | `2` | `4` (Medio) | El ticket consolidado persiste en cada turno dentro de Supabase (`casos_triage`). | Reinicio limpio vía `/reset` cerrando caso activo (`92eb4ff`). | **Aceptado / Deuda (`DT-02`)** — Documentado plan de persistencia de sesión en PG. |
| **R-11** | Inestabilidad de túnel efímero local (`cloudflared`) al cambiar URL. | `RF-01`, `RNF-01` · `OE-1` | `3` | `2` | `6` (Medio) | Eliminar dependencia local mediante PaaS fijo con SSL. | Despliegue en **Render** (`https://bot-triage-interchile.onrender.com`). | **Materializado y Cerrado** — URL fija SSL operando 24/7 (`render.yaml`). |
| **R-12** | Catálogo Kronos real no disponible aún (`src/kronos.js` en caché local). | `RF-03` · `OE-2` | `2` | `2` | `4` (Medio) | Patrón Adaptador en `src/kronos.js` con flag explícito `catalogo_verificado: false`. | Timeout de `5 s` hacia `GET /api/kronos/catalogo` con degradación automática segura. | **Mitigado / Deuda (`DT-01`)** — Listo para activar con `KRONOS_API_BASE_URL`. |
| **R-13** | Exposición accidental de secretos (`TOKEN`, `GEMINI_API_KEY`, DB). | `RNF-02` · `Transversal` | `2` | `3` | `6` (Medio) | `.env`, `scripts/` y `scratch/` en `.gitignore`; aislamiento estricto de `TRIAGE_API_TOKEN`. | Bloqueo `HTTP 503` si el token reutiliza secretos externos (`test/sprint3.test.js`). | **Cerrado (`100%`)** — `0` secretos en DOM HTML ni historial Git. |
| **R-14** | Alta latencia (`> 4 s`) o cuota agotada de LLM externo (Gemini). | `RNF-01`, `RNF-04` · `OE-1` | `2` | `3` | `6` (Medio) | Benchmark seleccionó `gemini-2.5-flash` (~2,67 s) frente a Gemini 3.x (> 50 s) + `conTimeout(12s)`. | Respuesta empática de contingencia al cliente manteniendo Webhook en `HTTP 200`. | **Controlado (`~2,67 s` prom.)** — Alertas SLA registradas en `src/metricsStore.js`. |
| **R-15** | **Atraso del ERP Kronos 2.0 fuera de los plazos del Hito 3.** | `RF-05`, `RF-06`, `RF-07` · `OE-4` | `3` | `3` | `9` (Alto) | Contrato API REST desacoplado (`KRON2-152` Bearer + Cursor) listo para conectar. | **Plan de Contingencia Ejecutado:** Dashboard propio en Render con gestión de estados `409`, visitas técnicas, descarga PDF y agenda autónoma de reuniones. | **Materializado y Mitigado (`Exitoso`)** — Cierre comercial 100% autónomo sin bloqueo. |
| **R-16** | Alucinación aritmética de precios CLP o cálculo erróneo de IVA `19%`. | `RF-04` · `OE-3` | `2` | `3` | `6` (Medio) | Cálculo 100% determinista desacoplado del LLM (`src/cotizador.js`). | Retorno obligatorio `null` y Ficha Técnica de Levantamiento ante `[dato por confirmar]`. | **Cerrado** — `100%` cobertura en `src/cotizador.js`. |
| **R-17** | Colapso RAM (`512 MB` Render) o latencia `> 3 s` al emitir PDF. | `RF-04`, `RNF-01` · `OE-3` | `2` | `3` | `6` (Medio) | Descarte de Chromium (`ADR-03`); ensamblador binario nativo `%PDF-1.4` en RAM (`< 5 ms`). | Respuesta `HTTP 500` controlada si falla BD sin caer proceso Node. | **Cerrado** — `p95 = 122,67 ms` bajo `N=50` carga HTTP (`125/125 OK`). |
| **R-18** | Condiciones de carrera en WhatsApp/Dashboard o cobertura insuficiente. | `RF-05`, `RNF-01`, `RNF-03` · `OE-4` | `2` | `2` | `4` (Medio) | Concurrencia optimista `expected_updated_at` (`409`), estrés `N=20` y carga `N=50`. | Preservación de selección visual del operador en UI ante rechazo `409`. | **Cerrado** — `87/87 PASS`, `91,58%` cobertura líneas, `20/20` concurrencia. |
| **R-19** | Topones horarios o reserva de horarios inválidos (`04:00 AM` / findes) en agenda. | `RF-06` · `OE-4` | `2` | `3` | `6` (Medio) | Reglas hábiles deterministas Lun–Vie (`09:00–12:00 / 14:00–18:00`) + `SELECT FOR UPDATE` + índice único `uq_reuniones_slot_activo`. | Estado inicial `ingresada`, rechazo `HTTP 400/409` y entrega de 3 horarios libres cercanos. | **Cerrado** — `14/14 PASS` (`100%` `agenda.js`) + verificado vivo en Render. |

---

## 3. Deuda Técnica Inventariada y Priorizada

| ID DT | Deuda Técnica Declarada | Impacto | Origen / Criterio | Plan Concreto de Mejoras Post-Hito 3 |
| :--- | :--- | :---: | :--- | :--- |
| **`DT-01`** | El arnés opera contra el catálogo de respaldo local (`catalogo_verificado: false`) mientras el equipo de Kronos 2.0 libera el endpoint productivo `GET /api/kronos/catalogo`. | **Alto** | `R-12`, `R-15` (`OE-2`, `RF-03`) | Configurar variables `KRONOS_API_BASE_URL` y `KRONOS_CATALOGO_TOKEN` en Render al habilitar Kronos 2.0 (adaptador HTTP en `src/kronos.js` ya operativo y cubierto al `92,85%`). |
| **`DT-02`** | Memoria multi-turno conversacional (`conversaciones`) y lista de derivados (`clientesDerivados`) residen en RAM de Node.js (se reinician al redeploy del contenedor). | **Medio** | `R-10` (`OE-1`, `RF-02`) | Migrar historial corto de sesión y flag de silenciamiento a tabla dedicada `public.sesiones_chat` en Supabase PostgreSQL aprovechando el pool SSL ya existente. |
| **`DT-03`** | Los tests automatizados de integración simulan Gemini/Meta externos y `npm audit` conserva `2` hallazgos moderados transitivos en `qs` dentro de `express@4.22.2`. | **Medio** | `RNF-02`, `RNF-03` (`A5`, `A6`) | Montar suite staging contra número sandbox Meta + actualizar a `express@5.x` en ventana de mantenimiento planificada para llevar `npm audit` a `0` hallazgos totales. |
| **`DT-04`** | Sin envíos automáticos de recordatorio `24 h` previos a cada reunión confirmada con Benjamín ni reintento en colas. | **Bajo** | Alcance Excluido MPV (`A2`) | Incorporar cron diario (`Supabase pg_cron` / `node-cron`) enviando plantilla HSM aprobada por WhatsApp para que el cliente confirme o libere su bloque horario. |
