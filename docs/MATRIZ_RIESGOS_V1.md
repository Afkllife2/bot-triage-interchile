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
