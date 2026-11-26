# A2 · Requerimientos, Alcance del MPV y Escenarios de Calidad (Hito 3 — INSW422)

**Proyecto:** Bot Triage Comercial, Cotización PDF y Agenda Inteligente — InterChile Clima SpA  
**Estándar de Calidad Aplicado:** ISO/IEC 25010 (Eficiencia de Desempeño, Seguridad, Fiabilidad y Mantenibilidad/Usabilidad)  
**Ver trazabilidad bidireccional completa en:** [`docs/trazabilidad.md`](./trazabilidad.md)

---

## 1. Catálogo Priorizado de Requerimientos Funcionales (RF)

| ID | Tipo | Requerimiento Funcional (Descripción) | Prioridad | Objetivo | HUs Relacionadas |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **RF-01** | Funcional | Recibir mensajes de texto y eventos interactivos (`button_reply` / `list_reply` para 7 líneas incluyendo Arriendo) desde WhatsApp Cloud API verificando firma `HMAC-SHA256` y entregando acuse `HTTP 200`. | **Must** | **OE-1** | `HU-01`, `HU-03`, `HU-20`, `HU-NEW` |
| **RF-02** | Funcional | Sostener diálogo multi-turno con memoria contextual por teléfono (`10` turnos / `60 min`) sin repetir datos capturados y derivar a ejecutivo humano (`requiere_humano = true`, silencio posterior y contacto de Benjamín). | **Must** | **OE-1** | `HU-02`, `HU-06` |
| **RF-03** | Funcional | Interceptar toda salida estructurada del LLM (`Zod`) contra el catálogo ERP Kronos (`src/kronos.js` con timeout `5 s` o respaldo controlado), sanitizando entidades no verificadas como `[dato por confirmar]` antes de persistir o responder. | **Must** | **OE-2** | `HU-18`, `HU-21`, `KRON2-152` |
| **RF-04** | Funcional | Calcular de forma determinista (`src/cotizador.js`) Subtotal Neto, IVA (`19%`) y Total CLP fuera del LLM —retornando `null` en Proyectos Comerciales o datos por confirmar— y generar Ficha Técnica/Cotización corporativa `%PDF-1.4` vía `GET /api/tickets/:id/pdf`. | **Must** | **OE-3** | `AAI-25` (`INT-HU-05`) |
| **RF-05** | Funcional | Gestionar el ciclo de tickets en `/dashboard` (`en_proceso`, `derivado`, `agendado`, `resuelto`) exigiendo fecha/hora completa al agendar, bloqueando choques de visitas (`409 horario_visita_ocupado`) y protegiendo concurrencia optimista (`expected_updated_at` -> `409 Conflict`) más paginación por cursor `updated_at+id`. | **Must** | **OE-4** | `AAI-90` (`INT-HU-19`), `HU-14`, `KRON2-152` |
| **RF-06** | Funcional | Detectar solicitudes de reunión comercial en WhatsApp sin menús IVR rígidos, validar reglas hábiles de Benjamín (Lunes–Viernes `09:00–12:00` y `14:00–18:00`, bloqueando madrugadas/colación/fines de semana), iniciar en estado `ingresada` (`ingresada -> confirmada -> completada` o `cancelada`) y prevenir topones con `FOR UPDATE` (`HTTP 409` + 3 sugerencias cercanas). | **Must** | **OE-4** | `AAI-102` (`INT-HU-23`) |
| **RF-07** | Funcional | Registrar métricas operativas de latencia por turno (`< 4.0 s`), tasa del arnés y descarga PDF vía `GET /api/metricas`, separando en `/dashboard` los **4 KPIs comerciales** superiores del panel colapsable **Auditoría QA (ISO/IEC 25010)**. | **Should** | **OE-4** | `AAI-94` (`INT-HU-22`) |

---

## 2. Requerimientos No Funcionales (RNF) y Escenarios Medibles de Calidad

### 2.1 Resumen de RNF

| ID | Atributo ISO/IEC 25010 | Descripción Medible | Prioridad | Objetivo |
| :--- | :--- | :--- | :---: | :---: |
| **RNF-01** | **Eficiencia de Desempeño** *(Obligatorio)* | La API en Render procesa consultas y generación PDF con `p95 <= 2000 ms` y tasa de error `< 1%` bajo carga (`N=50` concurrentes); el flujo completo por WhatsApp mantiene promedio `< 4,0 s` (`N=20` concurrentes). | **Must** | **OE-1, OE-4** |
| **RNF-02** | **Seguridad** *(Obligatorio)* | Toda petición sin firma `HMAC-SHA256` válida al Webhook o sin token privado `TRIAGE_API_TOKEN` aislado en `/api/*` se deniega en tiempo constante (`401 / 403 / 503`) al `100%`, con `0` secretos en DOM/Git y `0` hallazgos críticos/altos abiertos sin justificación en `npm audit`. | **Must** | **Transversal** |
| **RNF-03** | **Mantenibilidad (Testabilidad)** *(Adicional)* | El núcleo modular (`src/*.js`) alcanza al menos `70%` de cobertura de líneas automatizada con `Jest` (`>= 95%` de ejecución del plan de pruebas) y cero defectos críticos abiertos. | **Must** | **OE-4** |
| **RNF-04** | **Usabilidad y Fiabilidad** *(Adicional)* | La interfaz `/dashboard` aplica identidad corporativa de InterChile (`#a6083c`, `#0d1e2e`), separa KPIs de negocio de métricas técnicas (`#btn-toggle-qa`) y responde ante fallos externos (`Gemini` timeout `12 s`, `Kronos` timeout `5 s`, `PG` rollback) sin caídas del servidor (`HTTP 200 / 500` controlado). | **Should** | **OE-2, OE-4** |

### 2.2 Escenarios de Calidad Detallados (Formato de 6 Partes — Rúbrica INSW422)

| Elemento del Escenario | **RNF-01 · Eficiencia de Desempeño** | **RNF-02 · Seguridad** | **RNF-03 · Mantenibilidad / Testabilidad** |
| :--- | :--- | :--- | :--- |
| **Fuente** | Clientes WhatsApp / Operadores Dashboard | Actor externo malintencionado / Petición sin credenciales | Equipo de ingeniería y auditoría QA |
| **Estímulo** | Ráfaga concurrente de **50 usuarios virtuales (`500` peticiones)** a `/webhooks/meta`, `/api/tickets`, `/api/reuniones` y `/api/tickets/94/pdf`, más `N=20` usuarios WhatsApp simultáneos. | Envío de payloads sin firma `x-hub-signature-256` o con HMAC adulterado, accesos a `/api/*` sin Bearer válido y escaneo `npm audit` de dependencias productivas. | Ejecución completa de la batería automatizada `npx jest --coverage --runInBand --detectOpenHandles` previo a fusión/tag. |
| **Entorno** | Servicio Node.js/Express (`src/server.js`) con ensamblador binario `%PDF-1.4` en contenedor 512 MB RAM (Render) + carga HTTP local reproducible. | Producción Render SSL (`https://bot-triage-interchile.onrender.com`) y servidor Express de auditoría. | Repositorio Node.js `>= 18` con suites `test/*.test.js`. |
| **Respuesta** | El servidor atiende todas las peticiones concurrentes, genera el PDF en memoria y registra la telemetría SLA sin bloquear el Event Loop ni mezclar sesiones. | Rechaza inmediatamente mediante `crypto.timingSafeEqual`, registra advertencia segura sin volcar tokens/cuerpo y bloquea reutilización de credenciales Meta/Gemini (`503`). | Ejecuta los 7 archivos de prueba con reporte JSON/texto fechado, identificando líneas no cubiertas y eventuales regresiones. |
| **Medida de Respuesta Comprometida** | **`p95 <= 2000 ms`** en carga HTTP (`error < 1%`), emisión PDF `< 3000 ms`, y latencia promedio bot **`< 4000 ms`** con `> 99%` éxito (`N=20`). | **`100%` de intentos inválidos denegados (`401 / 403 / 503`)**, `0` secretos en código/HTML y **`0` vulnerabilidades críticas/altas** en producción. | **`>= 70%` cobertura de líneas** en lógica de negocio, `>= 95%` casos ejecutados y `0` defectos críticos sin corregir. |
| **Resultado Verificado (Hito 3)** | **Cumplido (`PASS`):** `p95 = 169,06 ms` (`avg = 70,87 ms`, `0%` error en `500` reqs `N=50`), PDF `p95 = 122,67 ms`, `N=20` WA `20/20 HTTP 200` (`~2,67 s` prod). Reporte en [`docs/calidad/REPORTE_SEGURIDAD_Y_EFICIENCIA.md`](./calidad/REPORTE_SEGURIDAD_Y_EFICIENCIA.md). | **Cumplido (`PASS`):** `20/20 (100%)` ataques denegados en prueba automatizada + `0` críticos / `0` altos tras `npm audit fix` (`2` moderados residuales en `qs/express` documentados y mitigados). | **Cumplido (`PASS`):** **`91,37%` Líneas globales (`90,35%` Stmts)** across `86/86` tests PASS (`100%` en `cotizador.js`, `metricsStore.js` y `agenda.js`). Reporte en [`docs/pruebas/`](./pruebas/PLAN_DE_PRUEBAS_HITO3.md). |

---

## 3. Alcance del MPV (Incluido vs. Excluido para Versiones Futuras)

| Elemento / Capacidad | Decisión MPV | Objetivo Asociado | Justificación Explícita |
| :--- | :---: | :---: | :--- |
| **Triage WhatsApp 24/7 (`+56 9 7235 2751`) con HMAC-SHA256 y 7 líneas** | **Incluido** | `OE-1` | Ataca directamente el cuello de botella inicial (`4–12 h` de latencia AS-IS). |
| **Memoria multi-turno + Handoff humano con silenciamiento IA** | **Incluido** | `OE-1` | Evita repreguntas repetitivas y traspasa casos complejos a Benjamín Yáñez sin interferencia. |
| **Arnés anti-alucinaciones + Contrato `GET /api/kronos/catalogo`** | **Incluido** | `OE-2` | Garantiza 0 inventos de marca/modelo/repuesto (`[dato por confirmar]`). *(Opera contra respaldo local mientras Kronos 2.0 abre endpoint: ver `DT-01`).* |
| **Cotizador determinista CLP (Neto + IVA 19%) + Ficha `%PDF-1.4`** | **Incluido** | `OE-3` | Formaliza estimaciones preliminares exactas en segundos con diseño validado por la empresa. |
| **Dashboard Corporativo + Gestión Estados `409` + Agenda Benjamín + Panel QA** | **Incluido** | `OE-4` | Ejecuta el Plan de Contingencia `R-15` ofreciendo autonomía operativa inmediata ante el desarrollo paralelo de Kronos 2.0. |
| **Facturación electrónica / DTE ante el SII y Pasarela de Pago** | **Excluido** *(Versión Futura)* | — | Corresponde a módulo contable/tributario del ERP Kronos 2.0 y queda fuera del problema de *intake* y triage comercial. |
| **Transcripción de audios y visión computacional de videos WhatsApp** | **Excluido** *(Versión Futura)* | — | No es necesario para validar los objetivos `OE-1..OE-4`; actualmente el bot solicita fotos como indicador (`tiene_fotos`) para el técnico. |
| **Notificaciones cron automáticas de recordatorio 24 h pre-reunión** | **Excluido** *(Versión Futura · `DT-04`)* | — | Se priorizó integridad transaccional de reservas (`FOR UPDATE`), reglas hábiles Lun–Vie y confirmación manual `ingresada -> confirmada`. |
