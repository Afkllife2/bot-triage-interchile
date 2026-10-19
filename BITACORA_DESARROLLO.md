# Bitácora de Desarrollo - Sprint 1 (Agosto - Septiembre 2026)

**Proyecto:** Bot Triage Comercial InterChile  
**Repositorio Oficial:** Afkllife2/bot-triage-interchile  
**Frameworks:** Node.js, Express, Supabase, Google Gemini API, Meta WhatsApp Cloud API  

Esta bitácora consolida el registro de desarrollo técnico, metodológico e integración continua del equipo durante el primer Sprint de trabajo, sincronizado con las fechas oficiales de Jira.

---

## 24 de Agosto: Inicio del Sprint y Definición Core
- **Actividades:**
  - Definición y levantamiento de las historias de usuario principales para el desarrollo del software.
  - Se estructuraron los requerimientos técnicos para la Inteligencia Artificial y la Base de Datos.
- **Historias de Usuario (Creadas):** 
  - `[INT-HU-01]` Clasificación de Motivo Principal.
  - `[INT-HU-03]` Asignación de Priorización Automática.
  - `[INT-HU-04]` Generación de Ficha de Consolidación.

## 25 de Agosto: Modelamiento, Metodología y Arquitectura
- **Actividades Técnicas y de QA:**
  - Levantamiento de impedimentos técnicos y operativos; creación de matriz de mitigación (`MATRIZ_RIESGOS_V1.md`).
  - Cruce de evidencias inicial metodológica (`MATRIZ_TRAZABILIDAD.md`).
  - Análisis de rúbrica académica para alinear los entregables del Sprint.
  - Modelado y generación de vista arquitectónica de componentes 4+1 (`DISENO_4_MAS_1.md`).
  - Definición de trazabilidad para validación de pruebas.
  - Inicio de la documentación del Plan de Pruebas Funcionales.
- **Historias de Usuario (Creadas y Resueltas):** 
  - `[INT-HU-08]` Matriz de Gestión de Riesgos.
  - `[INT-HU-09]` Matriz de Trazabilidad Metodológica.
  - `[INT-HU-10]` Alineación y Análisis de Rúbrica.
  - `[INT-HU-11]` Diseño Arquitectónico y Vistas 4+1.
  - `[INT-HU-12]` Seguimiento y Trazabilidad de Pruebas.
- **Historias de Usuario (Creadas):**
  - `[INT-HU-07]` Plan de Pruebas Funcionales.

## 28 de Agosto: Cierre de Pruebas Metodológicas
- **Actividades:**
  - Finalización y validación formal de los planes de QA que gobernarán el software.
- **Historias de Usuario (Resueltas):**
  - `[INT-HU-07]` Plan de Pruebas Funcionales.

## 1 de Septiembre: Hito Técnico - Cierre de Desarrollo Core (IA y DB)
- **Actividades Técnicas:**
  - **Motor Semántico (IA):** Implementación de `src/brain.js`. Se conectó la API de Google Gemini 2.5 Flash forzando formato JSON estricto (`responseSchema`).
  - Lógica implementada: Extracción de entidades (motivo de contacto, síntomas) y árbol de decisión dinámico para asignar nivel de urgencia según reglas de negocio.
  - **Infraestructura de Datos:** Integración End-to-End con PostgreSQL (Supabase) mediante `src/db.js`.
  - Inserción de la tabla `tickets` capturando `telefono`, `sintoma_observacion`, `equipo_marca` y `prioridad_sugerida`.
- **Historias de Usuario (Resueltas):** 
  - `[INT-HU-01]` Clasificación de Motivo Principal.
  - `[INT-HU-03]` Asignación de Priorización Automática.
  - `[INT-HU-04]` Generación de Ficha de Consolidación.
- **Ramas de Git asociadas:** `feature/INT-HU-01`, `feature/INT-HU-03`, `feature/INT-HU-04`.

## 4 de Septiembre: Integración de Mensajería Outbound
- **Actividades Técnicas:**
  - **Gestión de Cambio:** Por recomendación metodológica, se evitó el prototipo "caja negra" implementando envío de mensajes asíncronos.
  - Programación de `src/whatsapp.js` usando la API de Meta (Graph API) para retornar respuestas al cliente, confirmando la recepción y derivación del ticket (Handoff).
- **Historias de Usuario (Creadas y Resueltas):** `[HU-NEW]` Mensajería Outbound.
- **Ramas de Git asociadas:** `feature/HU-NEW`.

## 6 de Septiembre: Reestructuración Git y Planificación Sprint 2
- **Actividades de Integración Continua:**
  - **Git Flow:** Reestructuración de historial aislando limpiamente las ramas `feature/` y generando 4 Pull Requests formales hacia la rama `main` en GitHub (Code Review).
  - Limpieza de Backlog en Jira; purga de historias descartadas y actualización a sintaxis BDD.
  - Generación de informe PDF y renderizado de diagrama Mermaid.
  - **Inyección de Sprint 2:** Creación técnica en Jira de `AAI-55` (Integración Kronos), `AAI-56` (Manejo de Errores), `AAI-57` (Migración Tokens).

## 16 de Septiembre: Nueva Regla de Oro (Diagramas de IA)
- **Feedback Docente:** Tras la defensa del Sprint 1, la profesora Sarita estableció un nuevo requerimiento formal.
- **Acción:** Se adopta como "Regla de Oro" que toda Historia de Usuario que modifique el comportamiento del bot debe tener un Diagrama de Flujo previo (generado en Mermaid) como herramienta de diseño y educación del LLM antes de su codificación.
- **Retroactividad:** Se crearon los artefactos `diagrama_HU01.md` y `diagrama_HU03.md` para anexar a las historias del Sprint 1, cumpliendo con la trazabilidad solicitada.

---
*Fin de Bitácora Sprint 1. El entorno de desarrollo (Node.js) se encuentra estable y documentado, coincidiendo al 100% con los registros y transiciones de estado en Jira.*


---

# Bitácora de Desarrollo - Sprint 2 (Septiembre - Octubre 2026)

## 29 de Septiembre: Memoria Conversacional Multi-turno y Dashboard Web
- **Actividades Técnicas:**
  - Refactorización de `src/brain.js` con `@langchain/google-genai` y `withStructuredOutput` (Zod) para implementar memoria conversacional por teléfono (hasta 10 mensajes, expiración 60 min).
  - Construcción de `public/dashboard.html` y endpoint `GET /api/tickets` en `src/server.js` conectado a Supabase en tiempo real.
- **Historias de Usuario (Resueltas):** `[INT-HU-02]`, `[INT-HU-14]`.
- **Ramas de Git asociadas:** `feat/HU-02-memoria-conversacional`, `AAI-34-INT-HU-14-Dashboard-Web-para-Administradores-de-InterChile`.

## 8 de Octubre: Derivación a Humano, Botones Interactivos, Manejo de Errores y Arneses Kronos
- **Actividades Técnicas:**
  - Implementación de derivación a ejecutivo humano (`HU-06`) con silencio post-escalada (`clientesDerivados`) y reflejo en el Dashboard.
  - Implementación de botones interactivos en WhatsApp (`HU-20`) en `src/whatsapp.js` y `src/server.js`.
  - Implementación de Timeouts de 8s (`HU-16`), logger local `logs/error.log` y manejador global Express.
  - Creación del módulo `src/arneses.js` y `src/kronos.js` (`HU-18` / `HU-21`) con suite de tests unitarios en `test/arneses.test.js`.
- **Ramas de Git asociadas:** `feat/HU-06-y-HU-20-derivacion-botones`, `feat/HU-16-y-TSK-02-manejo-errores-infraestructura`, `feat/HU-18-y-HU-21-arneses-kronos`.

## 9 al 18 de Octubre: Número Oficial de Producción (+56 9 7235 2751), Feedback de Stakeholder y Cierre Sprint 2
- **Actividades Técnicas y Metodológicas:**
  - Registro y verificación del número comercial oficial de InterChile (`+56 9 7235 2751`) en Meta Cloud API y documentación en `docs/TOKEN_RENOVACION.md`.
  - Incorporación del feedback del dueño de InterChile (Benjamín): adición del servicio de **Arriendo** (soportando Menús de Lista Interactiva `list_reply` en WhatsApp) y entrega explícita del contacto `Benjamin@interchileclima.cl` / `+569 9440 2632` al derivar.
  - Generación y carga en Jira de los 5 diagramas de flujo Mermaid y PNG ("Regla de Oro"), capturas de evidencia real (`docs/EVIDENCIAS_SPRINT2.md`), Plan de Pruebas (24/24 PASS) y Matriz de Trazabilidad.
- **Ramas de Git asociadas:** `docs/INT-TSK-01-y-TSK-02-token-produccion`, `feat/HU-06-y-HU-20-derivacion-botones`, `main`.
