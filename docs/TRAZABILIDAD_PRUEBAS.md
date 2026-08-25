# Trazabilidad de Pruebas y Resultados (Sprint 1)

**Proyecto:** Bot Triage Comercial InterChile
**Estado de Ejecución:** Pendiente (Fase de Desarrollo)

Este documento asegura el cumplimiento de la trazabilidad completa exigida por la rúbrica: **HU -> CA -> Prueba -> Resultado -> Evidencia**, permitiendo determinar metodológicamente el estado de las HU.

---

## Matriz de Trazabilidad de Pruebas

| Historia de Usuario (HU) | Criterios de Aceptación (CA) Evaluados | ID Prueba | Tipo de Prueba | Resultado | Defectos / Acciones Posteriores | Evidencia (Link/Screenshot) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **HU-01:** Clasificación Motivo | CA1: El bot reconoce "falla" o "mantención". | `PU-02` | Unitaria | *Pendiente* | *Por ejecutar* | *Pendiente* |
| **HU-02:** Pre-diagnóstico | CA1: Extrae marca y síntomas. | `PI-01` | Integración (LLM) | *Pendiente* | *Por ejecutar* | *Pendiente* |
| **HU-03:** Prioridad | CA1: Asigna "Urgente" a locales comerciales. | `PU-03` | Unitaria | *Pendiente* | *Por ejecutar* | *Pendiente* |
| **HU-04:** Ficha de Consolidación | CA1: Se insertan los datos en la base de datos Supabase. | `PI-02` | Integración (DB) | *Pendiente* | *Por ejecutar* | *Pendiente* |
| **HU-06:** Derivación (Handoff) | CA1: El bot detiene el flujo al detectar intención de hablar con humano. | `PU-04` | Unitaria | *Pendiente* | *Por ejecutar* | *Pendiente* |
| **Todas las HU (E2E)** | El flujo completo desde WhatsApp hasta la creación en Supabase funciona sin bloqueos. | `E2E-01` | Manual (UAT) | *Pendiente* | *Por ejecutar* | *Pendiente* |

---

## Metodología de Gestión de Defectos
1. **Detección:** Si una prueba falla (Resultado: "Fallido"), se registra en la columna "Defectos".
2. **Registro en Jira:** Todo defecto crítico encontrado generará un nuevo ticket tipo **"Bug"** en Jira, vinculado a la HU original.
3. **Acción Posterior:** La HU no podrá pasar a estado "Done" hasta que el Bug asociado esté resuelto y la prueba vuelva a ejecutarse con estado "Exitoso".
