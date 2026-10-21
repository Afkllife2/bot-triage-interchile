# Matriz de Riesgos v1

**Proyecto:** Bot Triage Comercial InterChile (Hito 1 y Hito 2)
**Metodología:** Análisis de Riesgo Cualitativo

Esta matriz identifica los riesgos potenciales que podrían afectar el desarrollo y la implementación del bot, evaluando su probabilidad e impacto para generar un plan de mitigación y contingencia.

---

## Escala de Evaluación
- **Probabilidad (P):** 1 (Baja) - 3 (Alta)
- **Impacto (I):** 1 (Bajo) - 3 (Alto)
- **Severidad (P x I):** 1-3 (Verde/Aceptable), 4-6 (Amarillo/Alerta), 7-9 (Rojo/Crítico)

---

## Matriz Identificada (Hito 1)

| ID | Riesgo | Categoría | Prob. | Impacto | Severidad | Estrategia de Mitigación (Contingencia) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **R-01** | **Bloqueo del número de WhatsApp por políticas de Spam.** | Negocio / API | 2 | 3 | **6 (Amarillo)** | Usar exclusivamente el Cloud API oficial de WhatsApp (Meta). Incluir flujos de "Opt-in" y evitar envío de mensajes masivos no solicitados. |
| **R-02** | **Alucinación del LLM (Gemini inventa fallas o precios).** | IA / Técnico | 2 | 3 | **6 (Amarillo)** | Configurar el *System Prompt* con temperatura baja (0) y arneses deterministas contra catálogo para validar marca, modelo, tipo de equipo y repuestos. |
| **R-03** | **Caída del servicio de Base de Datos (Supabase).** | Infraestructura | 1 | 3 | **3 (Verde)** | Implementar transacciones con rollback en Node.js y guardar un log local (`logs/error.log`) en caso de que la API de Supabase dé timeout. |
| **R-04** | **Rechazo de usuarios a hablar con un Bot.** | UX / Negocio | 2 | 2 | **4 (Amarillo)** | Implementar el **Módulo de Handoff** rápido. Si el usuario escribe "humano" o requiere proyecto complejo, derivar al ejecutivo Benjamín con pre-calificación. |
| **R-05** | **Retraso en el desarrollo por cambios de requerimiento.** | Gestión / Tiempo | 3 | 2 | **6 (Amarillo)** | Uso de marco de trabajo Ágil (Scrum) con gestión formal de cambios controlados junto al Product Owner (Benjamín Yáñez). |
| **R-06** | **Inconsistencia de tipos de datos en Inserción DB.** | Técnico | 2 | 2 | **4 (Amarillo)** | Uso de validaciones estrictas con Zod (`withStructuredOutput`) antes de hacer el query a Supabase para evitar errores 500. |

---

# Actualización de la Matriz de Riesgos — Cierre Sprint 2 (Hito 2)

**Fecha de revisión:** 20 de Octubre 2026 · Revisión de los riesgos del Hito 1, alta de riesgos nuevos detectados durante el Sprint 2 e incorporación de planes de contingencia tras sesión de Review con Profesora Guía.

## A. Estado de los riesgos del Hito 1

| ID | Riesgo | Estado al cierre Sprint 2 | Evidencia de mitigación |
|---|---|---|---|
| R-01 | Bloqueo del número por spam | **Vigente, controlado** — solo se responde a mensajes entrantes (ventana de servicio de 24 h, sin envíos masivos) | Facturación `free_customer_service` en logs de Meta |
| R-02 | Alucinación del LLM | **Mitigado con control determinista** — además de temperatura 0, el Arnés HU-21 valida marca, modelo, tipo y repuesto contra catálogo | `src/arneses.js`, `test/arneses.test.js` (15 tests unitarios) |
| R-03 | Caída de Supabase | **Mitigado** — rollback transaccional y log local implementados | `src/db.js`, `logs/error.log` |
| R-04 | Rechazo a hablar con un bot | **Mitigado** — derivación a humano con pre-calificación de contexto (Opción A) y contacto directo de Benjamín | HU-06, EV-10 |
| R-05 | Cambios de requerimiento | **Materializado y gestionado** — el cliente pidió "Arriendo", contacto de Benjamín y pre-calificación de comuna/espacio; incorporados como cambio controlado | `docs/ACTA_REVIEW_SPRINT_2.md` |
| R-06 | Inconsistencia de tipos en BD | **Mitigado** — esquema Zod antes de persistir y UPSERT transaccional de caso activo | `src/brain.js` (`FichaTriage`), `src/db.js` |

## B. Riesgos nuevos identificados en el Sprint 2

| ID | Riesgo | Categoría | Prob. | Impacto | Severidad | Mitigación / Plan de Contingencia |
|---|---|---|---|---|---|---|
| **R-07** | **Expiración del token de acceso de Meta** (el temporal de 24h dejaba de funcionar: `OAuthException 190`) | Infraestructura / API | 3 | 3 | **9 (Rojo)** | **Materializado y resuelto:** se configuró un Usuario del Sistema en Meta Business Suite con Token Permanente (`expires_at: 0`, nunca expira). |
| **R-08** | **Supabase pausa proyectos inactivos** (plan gratuito) y la BD deja de responder | Infraestructura | 3 | 3 | **9 (Rojo)** | **Mitigado:** servidor reactivado, esquema consolidado con índices B-Tree y monitoreo activo desde Render. |
| **R-09** | **Límite de 3 botones de Meta** impide ofrecer 4+ opciones (incl. Arriendo) | Técnico / UX | 3 | 2 | **6 (Amarillo)** | **Materializado y resuelto:** conmutación automática en `src/whatsapp.js` entre Reply Buttons ($\le 3$) y List Messages ($4\text{–}10$). |
| **R-10** | **Pérdida de memoria conversacional y de estado de derivación al reiniciar el servidor** | Técnico | 2 | 2 | **4 (Amarillo)** | Aceptado en prototipo (el ticket sí persiste en Supabase en cada turno); persistir sesión en BD en Hito 3. |
| **R-11** | **Túnel Cloudflare efímero**: la URL cambiaba en cada arranque y rompía el webhook | Infraestructura | 3 | 2 | **6 (Amarillo)** | **Materializado y resuelto:** despliegue 24/7 en la nube mediante Render (`https://bot-triage-interchile.onrender.com/webhooks/meta`). |
| **R-12** | **Catálogo Kronos simulado**: el arnés valida contra catálogo estático de marcas, modelos y repuestos | Negocio / Datos | 2 | 2 | **4 (Amarillo)** | El reemplazo por `[dato por confirmar]` evita bloquear al cliente y alerta al supervisor; integrar con Kronos en Hito 3. |
| **R-13** | **Exposición de secretos** (tokens en scripts locales / `.env`) | Seguridad | 2 | 3 | **6 (Amarillo)** | `.env`, `scripts/` y `scratch/` están en `.gitignore` (verificado: 0 secretos en el repositorio); variables inyectadas de forma segura en Render. |
| **R-14** | **Dependencia de un LLM externo** (latencia / cuota / caída de Gemini) | IA / Disponibilidad | 2 | 3 | **6 (Amarillo)** | Benchmark empírico seleccionó `gemini-2.5-flash` (~3–5 s) sobre Gemini 3.x (> 50 s); timeout de 12 s y mensaje de contingencia (HU-16). |
| **R-15** | **Atraso en el desarrollo de la plataforma interna "Kronos" por parte de InterChile fuera de los plazos académicos del Hito 3** | Dependencia Externa / Cliente | 3 | 3 | **9 (Rojo)** | **Plan de Contingencia (Obligatorio Hito 3):** Si la empresa InterChile no tiene lista su plataforma Kronos dentro de los plazos del curso, **no se bloqueará la entrega**: se evolucionará y entregará una **Plataforma Web Intermedia Propia** (basada en nuestro Dashboard en Render + Supabase) que incluirá agendamiento autónomo de mantenciones, gestión completa del ciclo de vida del ticket, autenticación y exportación de datos compatible para cuando Kronos entre en producción. |

## C. Resumen Ejecutivo
- **Riesgos Críticos Cerrados en Sprint 2:** R-07 (Token permanente activo), R-08 (Supabase activo con índices), R-09 (Listas interactivas) y R-11 (Despliegue 24/7 en Render).
- **Riesgo Crítico Principal hacia el Hito 3:** **R-15** (Dependencia del software interno Kronos de la empresa), el cual cuenta con un **Plan de Contingencia** concreto y autónomo acordado en la sesión de Review con la profesora guía.
