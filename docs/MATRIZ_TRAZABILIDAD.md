# Matriz de Trazabilidad de Requerimientos

**Proyecto:** Bot Triage Comercial InterChile
**Sprint:** 1

Este documento traza la relación entre los requerimientos de negocio de InterChile, las Historias de Usuario (HU) desarrolladas en Jira, y los componentes técnicos de la arquitectura.

---

## Tabla de Trazabilidad (Hito 1)

| Requerimiento de Negocio (RN) | Historia de Usuario (Jira) | Épica Asociada | Componente Técnico / Módulo | Estado Sprint 1 |
| :--- | :--- | :--- | :--- | :--- |
| **RN-01:** La empresa necesita filtrar mensajes entrantes de WhatsApp para saber si es un cliente con falla, una cotización o mantenimiento. | `[INT-HU-01]` Clasificación de Motivo Principal | `INT-EPIC-01` Triage y Levantamiento | API Node.js + Gemini LLM (Intent Recognition) | Pendiente |
| **RN-02:** El técnico necesita saber la marca, tipo de equipo y falla antes de ir a terreno. | `[INT-HU-02]` Pre-diagnóstico Dinámico de Fallas | `INT-EPIC-01` Triage y Levantamiento | Prompt Engineering (Extracción Entidades) | Pendiente |
| **RN-03:** Los clientes de locales comerciales (B2B) deben ser atendidos con mayor rapidez que los residenciales. | `[INT-HU-03]` Asignación de Prioridad Automática | `INT-EPIC-01` Triage y Levantamiento | Node.js (Reglas de Negocio IF-ELSE) | Pendiente |
| **RN-04:** Todo el historial del problema debe quedar registrado en una base de datos centralizada. | `[INT-HU-04]` Generación de Ficha de Consolidación | `INT-EPIC-01` Triage y Levantamiento | Supabase (PostgreSQL) + `casos_triage` | **Completado** |
| **RN-05:** Automatizar la entrega de precios base para instalaciones estándar. | `[INT-HU-05]` Borrador de Cotización Simple | `INT-EPIC-01` Triage y Levantamiento | API Node.js (Plantillas Estáticas) | Pendiente |
| **RN-06:** Si el bot no entiende o el cliente se enoja, un humano debe tomar el control de WhatsApp. | `[INT-HU-06]` Derivación Directa (Human Handoff) | `INT-EPIC-01` Triage y Levantamiento | Node.js (Detención de Webhook) | Pendiente |

---

## Trazabilidad Inversa

- El módulo de **Base de Datos (Supabase)** satisface exclusivamente el `RN-04`.
- El módulo de **IA (Gemini)** es crítico para satisfacer los requerimientos `RN-01` y `RN-02`.
- El módulo de **Node.js (Lógica Core)** orquesta y da cumplimiento a los requerimientos `RN-03`, `RN-05` y `RN-06`.

*Nota: Esta matriz será expandida en el Hito 2 cuando se incorporen las cotizaciones PDF y reportes.*
