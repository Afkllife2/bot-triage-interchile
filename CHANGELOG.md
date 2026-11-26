# Registro de Cambios (CHANGELOG)

Todos los cambios relevantes del proyecto **Agente Autónomo de Triage Comercial, Cotización PDF y Agenda Inteligente — InterChile Clima SpA** se documentan en este archivo siguiendo *Keep a Changelog* y trazabilidad directa hacia Jira (`AAI-*`) y GitHub.

---

## [3.2.0 / hito3] - 2026-11-26 (Cierre Hito 3 — Auditoría INSW422)
### Agregado
- Artefactos completos de cierre Hito 3 exigidos por rúbrica INSW422:
  - [`docs/objetivos.md`](./docs/objetivos.md) (`A1`): Problema, hipótesis y objetivos medibles (`OE-1..OE-4`) con línea base, meta y validación de stakeholder.
  - [`docs/requerimientos.md`](./docs/requerimientos.md) (`A2`): Catálogo `RF-01..07`, escenarios de calidad `ISO/IEC 25010` (`RNF-01..04`) y frontera de alcance MPV.
  - [`docs/HISTORIAS_USUARIO_MPV_A3.md`](./docs/HISTORIAS_USUARIO_MPV_A3.md) (`A3`) y plantillas [`.github/ISSUE_TEMPLATE/historia-de-usuario.md`](./.github/ISSUE_TEMPLATE/historia-de-usuario.md) + [`.github/pull_request_template.md`](./.github/pull_request_template.md).
  - [`docs/trazabilidad.md`](./docs/trazabilidad.md) (`A4`): Matriz bidireccional completa desde `OE` a `commit/tag/riesgo`.
  - [`docs/pruebas/PLAN_DE_PRUEBAS_HITO3.md`](./docs/pruebas/PLAN_DE_PRUEBAS_HITO3.md) y [`docs/pruebas/jest-report-hito3.json`](./docs/pruebas/jest-report-hito3.json) (`A5`).
  - [`docs/calidad/REPORTE_SEGURIDAD_Y_EFICIENCIA.md`](./docs/calidad/REPORTE_SEGURIDAD_Y_EFICIENCIA.md), [`docs/calidad/load-test-hito3.js`](./docs/calidad/load-test-hito3.js), [`docs/calidad/load-test-report.json`](./docs/calidad/load-test-report.json) y [`docs/calidad/npm-audit-hito3.json`](./docs/calidad/npm-audit-hito3.json) (`A6`).
  - [`docs/arquitectura/`](./docs/arquitectura/README.md) (`A7`): Declaración **Camino A (UML)** y `ADR-01` a `ADR-04` con matrices de decisión ponderadas (`100%`).
  - [`docs/riesgos.md`](./docs/riesgos.md) (`A9`): Cierre de riesgos `R-01..R-19` e inventario priorizado de Deuda Técnica `DT-01..DT-04`.
### Seguridad
- Remediación de dependencias mediante `npm audit fix` (`zod 4.6.7`, `body-parser 1.20.9`, `proxy-addr 2.0.8`, `qs 6.15.4/6.16.2`, `js-yaml`), eliminando el **100% de vulnerabilidades críticas (`0`) y altas (`0`)** (`86/86` tests Jest PASS sin regresiones).

---

## [3.1.0-sprint3-cierre] - 2026-11-24
### Agregado / Corregido (Refinamientos Post-Review)
- **`AAI-102` (`INT-HU-23` · `1212829`):** Ciclo de 3 estados en reuniones (`ingresada -> confirmada -> completada`), validación determinista de reglas horarias Lunes–Viernes (`09:00–12:00` y `14:00–18:00`, bloqueando `04:00 AM`, colación y fines de semana), orden de sugerencias cercanas por distancia y prevención de choque en visitas técnicas (`409 horario_visita_ocupado`).
- **`AAI-94` (`INT-HU-22` · `9ea54db`):** Separación visual entre **4 KPIs Comerciales** arriba y panel colapsable **`Auditoría QA (ISO/IEC 25010)`** (`#btn-toggle-qa`).
- **Corrección de defectos en vivo (`c7167be`, `92eb4ff`):** Eliminado enum vacío `''` en `reunion_modalidad` (`Gemini 400`) y cierre transaccional de casos `en_proceso` al ejecutar `/reset` en WhatsApp limpiando cotizaciones obsoletas a `null`.
- **`AAI-98` (`INT-TSK-03` · `3a117fc`, `7abbfa4`):** Suite global consolidada (`7/7` suites, `86/86` tests PASS, `91,37%` cobertura líneas), diagrama E2E e [`INFORME_DE_PRUEBAS_SPRINT_3.md`](./docs/INFORME_DE_PRUEBAS_SPRINT_3.md).

---

## [3.0.0-sprint3] - 2026-11-23
### Agregado
- **`AAI-25` (`INT-HU-05` · `9acd69e`, PR `feat/AAI-25-HU-05-cotizacion-borrador-pdf`):** Motor determinista CLP + IVA `19%` en `src/cotizador.js`, excepción `null` para levantamientos complejos y ensamblador binario corporativo `%PDF-1.4` en `src/pdfGenerator.js` con diseño oficial aprobado por Benjamín Yáñez.
- **`AAI-90` (`INT-HU-19` + `KRON2-152` · `c5747c2`, PR `#5` `f911dcb`):** Autenticación Bearer privada (`TRIAGE_API_TOKEN`), cursor estable con microsegundos (`updated_at+id`), `created_at` inmutable, concurrencia optimista `409 Conflict` y gestión de visitas en Dashboard (`Contingencia R-15`).
- **`AAI-94` (`INT-HU-22` · `05c1b47`):** Telemetría SLA (`< 4.0 s`) en `src/metricsStore.js` y rediseño visual corporativo alineado con `interchileclima.cl`.
- **`AAI-102` (`INT-HU-23` · `ec24b17`):** Migración SQL `public.reuniones` con `uq_reuniones_slot_activo`, bloqueo `FOR UPDATE` (`HTTP 409 HORARIO_OCUPADO`) y widget interactivo de calendario en `/dashboard`.

---

## [2.0.0-sprint2] - 2026-10-19
### Agregado
- Memoria conversacional multi-turno (`LangChain + Gemini 2.5 Flash + Zod` en `src/brain.js`).
- Arnés determinista anti-alucinación (`src/arneses.js` + `src/kronos.js`) forzando `[dato por confirmar]`.
- Derivación humana (`HU-06`) con silenciamiento de IA y entrega de contacto de Benjamín Yáñez (`+569 9440 2632`).
- Menús interactivos WhatsApp con conmutación a *List Messages* para 7 servicios incluido **Arriendo** (`HU-20`), Token permanente Meta (`R-07`) y despliegue 24/7 en Render (`R-11`).
- Suite de integración `Supertest` (`34/34` tests PASS) y formalización de Plan de Contingencia `R-15`.

---

## [1.0.0-sprint1] - 2026-09-08
### Agregado
- Webhook Express inicial con validación `HMAC-SHA256`, clasificación de motivo/prioridad y persistencia base en Supabase PostgreSQL (`clientes`, `casos_triage`) más mensajería Outbound Graph API (`HU-01`, `HU-03`, `HU-04`, `HU-NEW`).
