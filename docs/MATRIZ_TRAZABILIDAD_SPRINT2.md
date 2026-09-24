# Matriz de Trazabilidad — Sprint 2 (Hito 2)

**Proyecto:** Bot Triage Comercial InterChile
**Sprint:** Sprint 2 — Hito 2
**Fecha:** 24 de Septiembre 2026

> **INSTRUCCIÓN:** Este documento enlaza cada Historia de Usuario con sus Criterios de Aceptación
> y sus Casos de Prueba correspondientes del PLAN_DE_PRUEBAS_SPRINT2.md.
> Actualizar la columna "Estado" a medida que se completan las pruebas.

---

## Trazabilidad HU → CA → Caso de Prueba

| Épica | Ticket Jira | Historia de Usuario | Criterio de Aceptación | ID Caso de Prueba | Estado |
|---|---|---|---|---|---|
| INT-EPIC-01 | AAI-6 | HU-02 Diagnóstico Dinámico | CA-1: Pregunta de seguimiento ante mensaje vago | CP-S2-01 | Pendiente |
| INT-EPIC-01 | AAI-6 | HU-02 Diagnóstico Dinámico | CA-2: Límite de 3 preguntas sin diagnóstico | CP-S2-02 | Pendiente |
| INT-EPIC-01 | AAI-6 | HU-02 Diagnóstico Dinámico | CA-3: Diagnóstico completo con info suficiente | CP-S2-03 | Pendiente |
| INT-EPIC-01 | AAI-6 | HU-02 Diagnóstico Dinámico | CA-4: Bot no repite pregunta ya respondida | CP-S2-04 | Pendiente |
| INT-EPIC-02 | AAI-55 | HU-18 Integración Kronos | CA-1: Validación exitosa contra Kronos | CP-S2-05 | Pendiente |
| INT-EPIC-02 | AAI-55 | HU-18 Integración Kronos | CA-2: Detección de alucinación (dato inventado) | CP-S2-06 | Pendiente |
| INT-EPIC-02 | AAI-55 | HU-18 Integración Kronos | CA-3: Respaldo ante fallo de Kronos (timeout) | CP-S2-07 | Pendiente |
| INT-EPIC-02 | AAI-55 | HU-18 Integración Kronos | CA-4: Límite de 2 reintentos de regeneración | CP-S2-08 | Pendiente |
| INT-EPIC-04 | AAI-26 | HU-06 Derivación a Humano | CA-1: Detección de solicitud explícita de humano | CP-S2-09 | Pendiente |
| INT-EPIC-04 | AAI-26 | HU-06 Derivación a Humano | CA-2: Actualización de estado en Supabase | CP-S2-10 | Pendiente |
| INT-EPIC-04 | AAI-26 | HU-06 Derivación a Humano | CA-3: Bot en silencio después de derivar | CP-S2-11 | Pendiente |
| INT-EPIC-04 | AAI-26 | HU-06 Derivación a Humano | CA-4: Ticket derivado visible en Dashboard | CP-S2-12 | Pendiente |
| INT-EPIC-04 | AAI-34 | HU-14 Dashboard Web | CA-1: Carga de tabla de tickets | CP-S2-13 | Pendiente |
| INT-EPIC-04 | AAI-34 | HU-14 Dashboard Web | CA-2: Destaque visual de tickets Alta prioridad | CP-S2-14 | Pendiente |
| INT-EPIC-04 | AAI-34 | HU-14 Dashboard Web | CA-3: Filtro de tickets derivados a humano | CP-S2-15 | Pendiente |
| INT-EPIC-04 | AAI-34 | HU-14 Dashboard Web | CA-4: Refresco de datos en Dashboard | CP-S2-16 | Pendiente |
| INT-EPIC-04 | AAI-70 | HU-20 Botones WhatsApp | CA-1: Envío de mensaje con botones interactivos | CP-S2-17 | Pendiente |
| INT-EPIC-04 | AAI-70 | HU-20 Botones WhatsApp | CA-2: Procesamiento de selección de botón | CP-S2-18 | Pendiente |
| INT-EPIC-04 | AAI-70 | HU-20 Botones WhatsApp | CA-3: Fallback a texto libre sin botones | CP-S2-19 | Pendiente |
| INT-EPIC-02 | AAI-72 | TSK-02 Infraestructura | Manejo de error Gemini sin crash | CP-S2-20 | Pendiente |
| INT-EPIC-02 | AAI-72 | TSK-02 Infraestructura | Manejo de error Supabase sin bloquear | CP-S2-21 | Pendiente |
| INT-EPIC-02 | AAI-72 | TSK-02 Infraestructura | Token permanente activo 24+ horas | CP-S2-22 | Pendiente |
| INT-EPIC-02 | AAI-72 | TSK-02 Infraestructura | Historial de conversación persistido en BD | CP-S2-23 | Pendiente |
| INT-EPIC-02 | AAI-72 | TSK-02 Infraestructura | Expiración de sesión tras 60 minutos | CP-S2-24 | Pendiente |

---

## Trazabilidad hacia Objetivos de Tesis

| Objetivo Específico | HU del Sprint 2 que lo atiende |
|---|---|
| OE-1: Modelar flujos de Triage y diagnóstico | HU-02 (Diagnóstico Dinámico), HU-06 (Derivación) |
| OE-2: Diseñar arquitectura de datos y estado | HU-18 (Kronos), TSK-02 (Memoria conversación, BD) |
| OE-3: Desarrollar motor semántico (IA) | HU-02 (multi-turno), HU-18 (Arneses IA), HU-20 (Botones) |

---

## Cobertura de Épicas en el Sprint

| Épica | HUs en Sprint 2 | % de la Épica cubierto en Sprint 2 |
|---|---|---|
| INT-EPIC-01: Triage y Levantamiento | HU-02 | ~80% de la épica completada |
| INT-EPIC-02: Infraestructura y Base de Datos | HU-18, TSK-02 | ~70% de la épica completada |
| INT-EPIC-03: Motor IA y Cotizaciones | (Sprint 3: Ficha PDF) | 0% en Sprint 2 |
| INT-EPIC-04: Integración Mensajería y Handoff | HU-06, HU-14, HU-20 | ~90% de la épica completada |
