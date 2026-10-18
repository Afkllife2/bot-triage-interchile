# Matriz de Trazabilidad — Sprint 2 (Hito 2)

**Proyecto:** Bot Triage Comercial InterChile
**Sprint:** Sprint 2 — Hito 2
**Fecha de elaboración:** 24 de Septiembre 2026
**Última actualización:** 18 de Octubre 2026

> **ESTADO:** Ejecución y verificación completada al 100% (24/24 Casos de Prueba aprobados).
> Todas las evidencias se encuentran consolidadas en `evidencias_sprint2.md` y respaldadas por la suite de pruebas automatizadas (`npm test`).

---

## Trazabilidad HU → CA → Caso de Prueba

| Épica | Ticket Jira | Historia de Usuario | Criterio de Aceptación | ID Caso de Prueba | Estado |
|---|---|---|---|---|---|
| INT-EPIC-01 | AAI-6 | HU-02 Diagnóstico Dinámico | CA-1: Pregunta de seguimiento ante mensaje vago | CP-S2-01 | ✅ Aprobado (PASS) |
| INT-EPIC-01 | AAI-6 | HU-02 Diagnóstico Dinámico | CA-2: Límite de preguntas sin diagnóstico / derivación | CP-S2-02 | ✅ Aprobado (PASS) |
| INT-EPIC-01 | AAI-6 | HU-02 Diagnóstico Dinámico | CA-3: Diagnóstico completo con info suficiente | CP-S2-03 | ✅ Aprobado (PASS) |
| INT-EPIC-01 | AAI-6 | HU-02 Diagnóstico Dinámico | CA-4: Bot no repite pregunta ya respondida | CP-S2-04 | ✅ Aprobado (PASS) |
| INT-EPIC-02 | AAI-55 | HU-18 / HU-21 Integración y Arnés Kronos | CA-1: Validación exitosa contra Kronos | CP-S2-05 | ✅ Aprobado (PASS) |
| INT-EPIC-02 | AAI-55 | HU-18 / HU-21 Integración y Arnés Kronos | CA-2: Detección de alucinación (dato inventado) | CP-S2-06 | ✅ Aprobado (PASS) |
| INT-EPIC-02 | AAI-55 | HU-18 / HU-21 Integración y Arnés Kronos | CA-3: Respaldo ante fallo de Kronos (timeout) | CP-S2-07 | ✅ Aprobado (PASS) |
| INT-EPIC-02 | AAI-55 | HU-18 / HU-21 Integración y Arnés Kronos | CA-4: Inmutabilidad y reemplazo seguro `[dato por confirmar]` | CP-S2-08 | ✅ Aprobado (PASS) |
| INT-EPIC-04 | AAI-26 | HU-06 Derivación a Humano | CA-1: Detección de solicitud explícita de humano + Contacto Benjamín | CP-S2-09 | ✅ Aprobado (PASS) |
| INT-EPIC-04 | AAI-26 | HU-06 Derivación a Humano | CA-2: Actualización de estado en Supabase (`derivado`) | CP-S2-10 | ✅ Aprobado (PASS) |
| INT-EPIC-04 | AAI-26 | HU-06 Derivación a Humano | CA-3: Bot en silencio después de derivar | CP-S2-11 | ✅ Aprobado (PASS) |
| INT-EPIC-04 | AAI-26 | HU-06 Derivación a Humano | CA-4: Ticket derivado visible en Dashboard | CP-S2-12 | ✅ Aprobado (PASS) |
| INT-EPIC-04 | AAI-34 | HU-14 Dashboard Web | CA-1: Carga de tabla de tickets | CP-S2-13 | ✅ Aprobado (PASS) |
| INT-EPIC-04 | AAI-34 | HU-14 Dashboard Web | CA-2: Destaque visual de tickets Alta prioridad | CP-S2-14 | ✅ Aprobado (PASS) |
| INT-EPIC-04 | AAI-34 | HU-14 Dashboard Web | CA-3: Filtro de tickets derivados a humano | CP-S2-15 | ✅ Aprobado (PASS) |
| INT-EPIC-04 | AAI-34 | HU-14 Dashboard Web | CA-4: Refresco de datos en Dashboard | CP-S2-16 | ✅ Aprobado (PASS) |
| INT-EPIC-04 | AAI-70 | HU-20 Botones y Listas WhatsApp | CA-1: Envío de mensaje con botones / lista interactiva (incl. Arriendo) | CP-S2-17 | ✅ Aprobado (PASS) |
| INT-EPIC-04 | AAI-70 | HU-20 Botones y Listas WhatsApp | CA-2: Procesamiento de selección (`button_reply` y `list_reply`) | CP-S2-18 | ✅ Aprobado (PASS) |
| INT-EPIC-04 | AAI-70 | HU-20 Botones y Listas WhatsApp | CA-3: Fallback a texto libre sin botones | CP-S2-19 | ✅ Aprobado (PASS) |
| INT-EPIC-02 | AAI-72 | HU-16 / TSK-02 Infraestructura | Manejo de error Gemini sin crash (Timeout 8s) | CP-S2-20 | ✅ Aprobado (PASS) |
| INT-EPIC-02 | AAI-72 | HU-16 / TSK-02 Infraestructura | Manejo de error Supabase sin bloquear (`logs/error.log`) | CP-S2-21 | ✅ Aprobado (PASS) |
| INT-EPIC-02 | AAI-72 | HU-16 / TSK-02 Infraestructura | Número oficial productivo (+56 9 7235 2751) y doc de Token | CP-S2-22 | ✅ Aprobado (PASS) |
| INT-EPIC-02 | AAI-72 | HU-16 / TSK-02 Infraestructura | Historial de conversación multi-turno en memoria | CP-S2-23 | ✅ Aprobado (PASS) |
| INT-EPIC-02 | AAI-72 | HU-16 / TSK-02 Infraestructura | Expiración de sesión tras 60 minutos | CP-S2-24 | ✅ Aprobado (PASS) |

---

## Trazabilidad de Diagramas de Flujo ("Regla de Oro" Metodológica)

| Historia de Usuario | Artefacto de Diseño (Mermaid) | Estado |
|---|---|---|
| HU-02 Diagnóstico Dinámico y Memoria | `docs/DIAGRAMA_FLUJO_HU02_MEMORIA.md` | ✅ Completado |
| HU-06 Derivación a Humano (Handoff) | `docs/DIAGRAMA_FLUJO_HU06_DERIVACION.md` | ✅ Completado |
| HU-14 Dashboard Web de Administración | `docs/DIAGRAMA_FLUJO_HU14_DASHBOARD.md` | ✅ Completado |
| HU-18 / HU-21 Arneses de IA y Kronos | `docs/DIAGRAMA_FLUJO_HU21_ARNESES_KRONOS.md` | ✅ Completado |
| HU-20 Botones y Listas Interactivas | `docs/DIAGRAMA_FLUJO_HU20_BOTONES.md` | ✅ Completado |

---

## Trazabilidad hacia Objetivos de Tesis

| Objetivo Específico | HU del Sprint 2 que lo atiende |
|---|---|
| OE-1: Modelar flujos de Triage y diagnóstico | HU-02 (Diagnóstico Dinámico), HU-06 (Derivación) |
| OE-2: Diseñar arquitectura de datos y estado | HU-18/21 (Kronos), HU-16/TSK-02 (Memoria conversación, BD) |
| OE-3: Desarrollar motor semántico (IA) | HU-02 (multi-turno), HU-21 (Arneses IA), HU-20 (Botones y Listas) |

---

## Cobertura de Épicas al Cierre del Sprint 2

| Épica | HUs en Sprint 2 | % de la Épica cubierto al cierre de Sprint 2 |
|---|---|---|
| INT-EPIC-01: Triage y Levantamiento | HU-02 | 100% completada ✅ |
| INT-EPIC-02: Infraestructura y Base de Datos | HU-16, HU-18, HU-21, TSK-01 | 100% completada ✅ |
| INT-EPIC-03: Motor IA y Cotizaciones | (Sprint 3: Cotización/Ficha avanzada) | En progreso para Sprint 3 |
| INT-EPIC-04: Integración Mensajería y Handoff | HU-06, HU-14, HU-20 | 100% completada ✅ |
