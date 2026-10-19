# Matriz de Riesgos v1

**Proyecto:** Bot Triage Comercial InterChile (Hito 1)
**Metodología:** Análisis de Riesgo Cualitativo

Esta matriz identifica los riesgos potenciales que podrían afectar el desarrollo y la implementación del bot, evaluando su probabilidad e impacto para generar un plan de mitigación.

---

## Escala de Evaluación
- **Probabilidad (P):** 1 (Baja) - 3 (Alta)
- **Impacto (I):** 1 (Bajo) - 3 (Alto)
- **Severidad (P x I):** 1-3 (Verde/Aceptable), 4-6 (Amarillo/Alerta), 7-9 (Rojo/Crítico)

---

## Matriz Identificada

| ID | Riesgo | Categoría | Prob. | Impacto | Severidad | Estrategia de Mitigación (Contingencia) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **R-01** | **Bloqueo del número de WhatsApp por políticas de Spam.** | Negocio / API | 2 | 3 | **6 (Amarillo)** | Usar exclusivamente el Cloud API oficial de WhatsApp (Meta). Incluir flujos de "Opt-in" y evitar envío de mensajes masivos no solicitados. |
| **R-02** | **Alucinación del LLM (Gemini inventa fallas o precios).** | IA / Técnico | 2 | 3 | **6 (Amarillo)** | Configurar el *System Prompt* con temperatura baja (0.1) y dar instrucciones estrictas de RAG para que solo extraiga información, sin inventar soluciones técnicas. |
| **R-03** | **Caída del servicio de Base de Datos (Supabase).** | Infraestructura | 1 | 3 | **3 (Verde)** | Implementar *retries* exponenciales en Node.js y guardar un log local (fallback) en caso de que la API de Supabase de timeout. |
| **R-04** | **Rechazo de usuarios a hablar con un Bot.** | UX / Negocio | 2 | 2 | **4 (Amarillo)** | Implementar el **Módulo de Handoff** rápido. Si el usuario escribe "humano" o muestra enojo (análisis de sentimiento), derivar inmediatamente a un agente de InterChile. |
| **R-05** | **Retraso en el desarrollo por cambios de requerimiento.** | Gestión / Tiempo | 3 | 2 | **6 (Amarillo)** | Uso estricto de marco de trabajo Ágil (Scrum) con Sprints cerrados. Congelamiento de alcance (Scope Freeze) para el Hito 1. |
| **R-06** | **Inconsistencia de tipos de datos en Inserción DB.** | Técnico | 2 | 2 | **4 (Amarillo)** | Uso de validaciones estrictas (Zod/Joi) en Node.js antes de hacer el query a Supabase para evitar errores 500. |

---

## Plan de Monitoreo
La matriz será revisada al final de cada Sprint durante la ceremonia de *Sprint Retrospective* para evaluar si nuevos riesgos han aparecido o si los riesgos actuales han sido mitigados exitosamente.


---

# Actualización de la Matriz de Riesgos — Cierre Sprint 2 (Hito 2)

**Fecha de revisión:** 19 de Octubre 2026 · Revisión de los riesgos del Hito 1 y alta de riesgos nuevos detectados durante el Sprint 2.

## A. Estado de los riesgos del Hito 1

| ID | Riesgo | Estado al cierre Sprint 2 | Evidencia de mitigación |
|---|---|---|---|
| R-01 | Bloqueo del número por spam | **Vigente, controlado** — solo se responde a mensajes entrantes (ventana de servicio de 24 h, sin envíos masivos) | Facturación `free_customer_service` en logs de Meta |
| R-02 | Alucinación del LLM | **Mitigado con control determinista** — además de temperatura 0, el Arnés HU-21 valida contra catálogo | `src/arneses.js`, `test/arneses.test.js` (13 tests) |
| R-03 | Caída de Supabase | **Mitigado parcialmente** — rollback y log local implementados; los *retries* exponenciales **no** se implementaron | `src/db.js`, `logs/error.log` |
| R-04 | Rechazo a hablar con un bot | **Mitigado** — derivación a humano con contacto directo de Benjamín | HU-06, EV-10 |
| R-05 | Cambios de requerimiento | **Materializado y gestionado** — el cliente pidió "Arriendo" y el contacto de Benjamín; se incorporaron como cambio controlado | `docs/ACTA_REVIEW_SPRINT_2.md` |
| R-06 | Inconsistencia de tipos en BD | **Mitigado** — esquema Zod antes de persistir | `src/brain.js` (`FichaTriage`) |

## B. Riesgos nuevos identificados en el Sprint 2

| ID | Riesgo | Categoría | Prob. | Impacto | Severidad | Mitigación / Plan |
|---|---|---|---|---|---|---|
| **R-07** | **Expiración del token de acceso de Meta** (el temporal dejó de funcionar durante las pruebas: `OAuthException 190`) | Infraestructura / API | 3 | 3 | **9 (Rojo)** | Migrar a token de usuario del sistema (permanente); procedimiento documentado en `docs/TOKEN_RENOVACION.md`. **Pendiente de ejecutar** antes de producción |
| **R-08** | **Supabase pausa proyectos inactivos** (plan gratuito) y la BD deja de responder | Infraestructura | 3 | 3 | **9 (Rojo)** | Verificar el proyecto antes de cada demo; considerar plan de pago o *keep-alive* programado en Hito 3 |
| **R-09** | **Límite de 3 botones de Meta** impide ofrecer 4 opciones (incl. Arriendo) | Técnico / UX | 3 | 2 | **6 (Amarillo)** | **Materializado y resuelto:** conmutación automática a mensaje de lista |
| **R-10** | **Pérdida de memoria conversacional y de estado de derivación al reiniciar el servidor** | Técnico | 2 | 2 | **4 (Amarillo)** | Aceptado en prototipo; persistir sesión en BD en Hito 3 |
| **R-11** | **Túnel Cloudflare efímero**: la URL cambia en cada arranque y rompe el webhook | Infraestructura | 3 | 2 | **6 (Amarillo)** | Reconfigurar webhook en Meta en cada demo; hosting con URL fija en Hito 3 |
| **R-12** | **Catálogo Kronos simulado**: el arnés podría rechazar equipos reales no catalogados (falsos positivos) | Negocio / Datos | 2 | 2 | **4 (Amarillo)** | Reemplazo del `[dato por confirmar]` evita bloquear al cliente; integrar API real de Kronos (HU-18) en Hito 3 |
| **R-13** | **Exposición de secretos** (tokens en scripts locales / `.env`) | Seguridad | 2 | 3 | **6 (Amarillo)** | `.env`, `scripts/` y `scratch/` están en `.gitignore` (verificado: no hay secretos en el repositorio); rotar tokens periódicamente |
| **R-14** | **Dependencia de un LLM externo** (latencia / cuota / caída de Gemini) | IA / Disponibilidad | 2 | 3 | **6 (Amarillo)** | Timeout de 8 s y mensaje de contingencia (HU-16) |

## C. Resumen
- **Críticos (Rojo):** R-07 y R-08. Ambos son de infraestructura y deben resolverse antes del Hito 3.
- Riesgos materializados durante el Sprint 2: R-05, R-07 y R-09; los tres fueron detectados, tratados y documentados.
