# Acta de Revisión del Sprint (Sprint Review) - Sprint 2

**Proyecto:** Bot Triage Comercial InterChile  
**Fecha de Reunión:** 18 de Octubre de 2026  
**Asistentes:** Equipo Desarrollador, Profesor Guía Funcional (Madrid), Profesora Metodológica (Sarita González), Stakeholder Cliente (Benjamín - InterChile)  
**Estado del Sprint 2:** Completado (100% de Historias de Usuario y Subtareas aprobadas en Jira)  

---

## 1. Objetivo de la Ceremonia
Inspeccionar el incremento de software funcional desarrollado durante el **Sprint 2**, verificando en vivo la memoria conversacional multi-turno con LangChain, los botones y listas interactivas en WhatsApp, la derivación a ejecutivo humano, los Arneses de IA contra el catálogo de Kronos, el Dashboard Web en tiempo real y la puesta en marcha en el **número oficial de producción de InterChile (+56 9 7235 2751)**.

## 2. Inspección del Incremento y Cumplimiento de Criterios de Aceptación (CA)

Se realizó la demostración del sistema y la revisión de las 24 pruebas funcionales y unitarias:

| Ticket Jira | Historia de Usuario / Tarea | Rama GitHub Asociada | Criterios de Aceptación Verificados | Estado |
|---|---|---|---|---|
| **AAI-6 / AAI-74** | `[INT-HU-02]` Diagnóstico Dinámico y Memoria Multi-turno | `feat/HU-02-memoria-conversacional` | Recuerda nombre, comuna y equipo entre turnos sin repetir preguntas (expiración 60 min). | ✅ APROBADO |
| **AAI-26** | `[INT-HU-06]` Derivación a Humano (Handoff) | `feat/HU-06-y-HU-20-derivacion-botones` | Detecta escalada, entrega contacto directo de Benjamín (`Benjamin@interchileclima.cl` / `+569 9440 2632`), marca `derivado` en BD y silencia la IA. | ✅ APROBADO |
| **AAI-34 / AAI-75** | `[INT-HU-14]` Dashboard Web Administradores | `AAI-34-INT-HU-14-Dashboard-Web-para-Administradores-de-InterChile` | Carga tickets desde Supabase en vivo, resalta Prioridad Alta en rojo y filtra instantáneamente. | ✅ APROBADO |
| **AAI-55 / AAI-71** | `[INT-HU-18 / HU-21]` Integración Kronos y Arneses de IA | `feat/HU-18-y-HU-21-arneses-kronos` | Intercepta marcas, equipos y repuestos alucinados antes de guardar o responder, reemplazándolos por `[dato por confirmar]` (17/17 tests Jest en verde). | ✅ APROBADO |
| **AAI-56 / AAI-72** | `[INT-HU-16 / TSK-02]` Manejo de Errores, Timeouts e Infraestructura | `feat/HU-16-y-TSK-02-manejo-errores-infraestructura` | Timeouts de 8s en Gemini y Meta API, rollback + log local `logs/error.log` en Supabase, y manejador global HTTP 200. | ✅ APROBADO |
| **AAI-57 / AAI-73** | `[INT-TSK-01]` Número Oficial y Tokens de Producción | `docs/INT-TSK-01-y-TSK-02-token-produccion` | Bot operativo en el número comercial `+56 9 7235 2751` y guía documentada en `docs/TOKEN_RENOVACION.md`. | ✅ APROBADO |
| **AAI-70** | `[INT-HU-20]` Botones y Listas Interactivas en WhatsApp | `feat/HU-06-y-HU-20-derivacion-botones` | Envía botones rápidos (≤3 opciones) o Menú de Lista (4+ opciones: Falla Técnica, Mantención, Cotización, Arriendo) y procesa `button_reply` / `list_reply`. | ✅ APROBADO |

## 3. Feedback del Stakeholder Real (Benjamín — Dueño de InterChile)
Durante la validación en vivo del bot sobre el número oficial `+56 9 7235 2751`, el dueño de InterChile aprobó el flujo conversacional y solicitó dos mejoras operativas inmediatas que fueron incorporadas en el mismo Sprint:
1. **Incorporación de "Arriendo de Equipos":** Se añadió `Arriendo` al esquema Zod (`FichaTriage`) y al menú interactivo de WhatsApp (activando automáticamente el formato `list` de Meta Graph API cuando se presentan 4 opciones).
2. **Datos de Contacto Directo al Derivar:** Cuando el bot deriva un caso (por ejemplo, proyectos industriales con envío de planos CAD/PDF), ahora entrega explícitamente el correo **`Benjamin@interchileclima.cl`** y el teléfono **`+569 9440 2632`**.

## 4. Conclusión de la Review
El Sprint 2 se declara **100% exitoso y aprobado**, cumpliendo tanto con la "Regla de Oro" metodológica (5 diagramas de flujo Mermaid y PNG adjuntados en Jira) como con las 24 pruebas del Plan de Pruebas (`docs/PLAN_DE_PRUEBAS_SPRINT2.md`) y las 17 pruebas unitarias automatizadas con Jest.
