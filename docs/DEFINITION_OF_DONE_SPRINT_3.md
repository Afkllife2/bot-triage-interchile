# Definition of Done (DoD) — Sprint 3 (Cierre de Titulación)

De acuerdo con las directrices metodológicas de la Profesora Sarita González Catalán y del Profesor Guía Matías Vargas, una Historia de Usuario del **Sprint 3** se considera **Terminada (Done)** única y exclusivamente cuando cumple estas **5 condiciones verificables**:

1. **Código operativo y desplegado en Render (HTTPS/SSL):** Servicio activo en la nube con endpoints protegidos mediante HMAC-SHA256 (`/webhooks/meta`) y Bearer Token privado de integración (`TRIAGE_API_TOKEN` en `/api/*`).
2. **Criterios de Aceptación (CA) BDD cubiertos con casos positivos, negativos y fallbacks:** Todos los escenarios `Dado / Cuando / Entonces` implementados, incluyendo manejo de errores (`400`, `401`, `404`, `409 Conflict`, `503`) y degradación elegante (`[dato por confirmar]`).
3. **Pruebas automatizadas en Jest (Unitarias + Integración + Concurrencia) con 100% PASS:** `5 suites / 54 tests en verde (100% PASS)` documentados en `docs/INFORME_DE_PRUEBAS_SPRINT_3.md`.
4. **Commits semánticos en GitHub con ramas de feature y Tag formal de release:** Código versionado en `Afkllife2/bot-triage-interchile` con trazabilidad de commits por Historia de Usuario.
5. **Subtareas en Jira con horas estimadas y registradas (Time Tracking):** Las 13 subtareas técnicas (`AAI-86` a `AAI-101`) cuentan con estimación original, registro de trabajo ejecutado (`worklog`) y evidencia adjunta en Jira (`AAI`).
