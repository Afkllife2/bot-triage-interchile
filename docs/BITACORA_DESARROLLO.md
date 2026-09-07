# Bitácora de Desarrollo Diaria (Changelog)

**Proyecto:** Bot Triage Comercial InterChile
**Sprint actual:** Sprint 1

Este documento registra cronológicamente cada avance, decisión, conexión y línea de código implementada en el proyecto. Actúa como el diario oficial del desarrollo.

---

## 📅 Lunes 24 de Agosto de 2026

**Horario de trabajo:** Tarde
**Áreas trabajadas:** Infraestructura, DevOps, Base de Datos, Documentación Académica.

- **[12:28 PM] Configuración de Entorno y Git (INT-TASK-01):**
  - Se limpió el código basura heredado ("Lider", "X").
  - Se creó un README profesional del proyecto.
  - Se desvinculó el repositorio antiguo y se conectó exitosamente al nuevo repositorio oficial en GitHub (`Afkllife2/bot-triage-interchile`).
  - Se configuró la estrategia de branching (Git Flow) dejando la rama `develop` como principal de trabajo.
- **[12:53 PM] Arquitectura v1 (INT-TASK-02):**
  - Se diseñó el primer diagrama de arquitectura técnica usando Mermaid, definiendo la integración entre Node.js, Gemini AI y Supabase.
- **[13:30 PM] Inyección de Backlog en Jira:**
  - Se ejecutó un script en Node.js que inyectó automáticamente las 4 Épicas y las 6 Historias de Usuario (HU-01 a HU-06) en el nuevo proyecto Jira (`AAI`).
- **[13:50 PM - 14:00 PM] Fase de Documentación Académica:**
  - Se crearon los documentos oficiales para cumplir con la rúbrica del Hito 1:
    - `PLAN_DE_PRUEBAS_V1.md` (INT-TASK-04).
    - `MATRIZ_RIESGOS_V1.md` (INT-TASK-05).
    - `MATRIZ_TRAZABILIDAD.md` (INT-TASK-06).

**✅ Resumen Humano: Tareas del Backlog Completadas Oficialmente (Sprint 1)**
*Nota para el informe final: Este fue el día donde armamos toda la "columna vertebral" del proyecto antes de escribir código.*
1. **[INT-TASK-01] Configurar Entorno y Git:** La completamos limpiando la carpeta de archivos viejos y conectando todo a un repositorio nuevo y limpio en GitHub para no tener conflictos.
2. **[INT-TASK-02] Diagrama de Arquitectura:** La completamos dibujando un diagrama en texto (Mermaid) que explica que usaremos Node.js, WhatsApp, Gemini y Supabase.
3. **[INT-TASK-03] Modelo de Datos (Supabase):** La completamos entrando a la base de datos en la nube y creando las tablas principales (`clientes`, `casos_triage`) que guardarán la información.
4. **[INT-TASK-04], [INT-TASK-05], [INT-TASK-06] (Documentación):** Las completamos redactando las tres matrices exigidas por la rúbrica de la universidad (Pruebas, Riesgos y Trazabilidad) dejándolas guardadas como documentos Markdown en el repositorio.
5. **[INT-HU-04] Generación de Ficha (Avance):** Aunque es una historia de código, completamos toda la parte de infraestructura creando la base de datos real.

---

## 📅 Martes 25 de Agosto de 2026

**Horario de trabajo:** Tarde
**Áreas trabajadas:** Levantamiento de Requerimientos, Análisis de Rúbrica.

- **[16:10 PM - 16:30 PM] Análisis de Rúbrica de Evaluación (Sprint 1):**
  - Se analizó exhaustivamente la rúbrica de 12 puntos entregada por la profesora.
  - Se generó el documento `RUBRICA_SPRINT_1_EVIDENCIA.md` mapeando nuestra estrategia para asegurar la calificación "Excelente" (7.0).
  - Se crearon documentos adicionales exigidos por la rúbrica: `DISENO_4_MAS_1.md` (Arquitectura de Kruchten) y `TRAZABILIDAD_PRUEBAS.md`.
- **[16:50 PM] Reestructuración del Backlog Anual (De Tareas a HUs):**
  - Se tomó la decisión estratégica de erradicar el formato de "Tareas Académicas" (`INT-TASK`) y transformarlas en **Historias de Usuario (HU-07 a HU-12)** con Criterios de Aceptación, adaptándonos al estándar exigido por la universidad.
  - Se planificó el Backlog futuro del año (`HU-13` a `HU-17`) abarcando Dashboard, Cotizaciones PDF y Recordatorios Automáticos, logrando un total de **17 Historias de Usuario**.
- **[17:35 PM] Re-balanceo del Scope (Sprint 1):**
  - Tras analizar los requerimientos detallados del stakeholder (Empresa partner), se determinó que el MVP del Hito 1 debe enfocarse 100% en el **Intake Básico** (captura de datos iniciales) y no en diagnósticos complejos de IA ni presupuestos.
  - Se movieron las historias de Diagnóstico (`HU-02`), Cotización (`HU-05`) y Handoff (`HU-06`) al Backlog futuro (Sprint 2/3).
  - El Sprint 1 quedó compuesto por 9 historias: 3 de desarrollo (`HU-01`, `HU-03`, `HU-04`) y 6 académicas, logrando una carga de trabajo realista y altamente justificable ante la comisión evaluadora. Se agregó la integración con Kronos como `HU-18` a futuro.
- **[Reunión con Stakeholders - Empresa Partner]:**
  - Reunión sostenida con la empresa del amigo para levantamiento de requerimientos y contexto del negocio.
  - Se obtuvo acceso al código legacy y base de datos del sistema Kronos (antiguo ERP de la empresa).
  - Requisito clave definido: *El bot no debe solo chatear, debe terminar cada conversación entregando una ficha estructurada con los datos del cliente, equipo, motivo y urgencia.*
- **[18:00 PM] Implementación del Motor de Inteligencia Artificial (Cerebro del Bot):**
  - Se desarrolló el módulo `src/brain.js` implementando `@google/genai` con el modelo de última generación `gemini-2.5-flash`.
  - Se aplicó ingeniería de prompts (System Instructions) para transformar mensajes no estructurados en objetos JSON estrictos (`responseSchema`).
  - **Mapeo Kronos:** La estructura del JSON se diseñó replicando exactamente los campos de las tablas SQL descubiertas en Kronos (`clients`, `branch_offices`, `equipment`, `applications`).
  - Pruebas unitarias locales ejecutadas exitosamente, logrando extraer comuna, tipo de falla y asignar automáticamente "Alta/Urgente" a locales comerciales.
  - *Esto da por completadas las historias de usuario **[INT-HU-01]** y **[INT-HU-04]** a nivel de lógica de negocio pura.*
  
---
*Nota: Este documento debe actualizarse diariamente al finalizar la jornada de programación o al realizar integraciones clave.*

## 📅 Domingo 30 de Agosto de 2026

**Horario de trabajo:** Tarde
**Áreas trabajadas:** Infraestructura de Red, Webhooks de Meta, Integración Completa.

- **[14:00 PM - 16:00 PM] Implementación de Webhooks y Conexión con Meta:**
  - Se configuró la API de WhatsApp Cloud en Meta for Developers.
  - Se levantó un túnel seguro usando `cloudflared` para exponer el servidor Node.js local al internet público y permitir que Meta se comunique con nosotros.
  - Se programó la ruta `GET /webhooks/meta` para la verificación oficial de Meta.
  - Se programó la ruta `POST /webhooks/meta` con encriptación de grado militar (HMAC-SHA256) para asegurar que los mensajes entrantes provienen realmente de Facebook y evitar hackeos.
- **[16:30 PM] Integración End-to-End (Celular -> BD):**
  - Se conectó todo el flujo: el mensaje sale de WhatsApp, llega al túnel de Cloudflare, entra a Node.js, es enviado a Gemini AI (`brain.js`) para extraer la ficha, y finalmente se guarda exitosamente en Supabase (`db.js`).
  - Se destrabó un bug de Facebook forzando la suscripción del número de prueba mediante la Graph API (`POST /subscribed_apps`).

---

## 📅 Viernes 4 de Septiembre de 2026

**Horario de trabajo:** Tarde
**Áreas trabajadas:** Mensajería Outbound (Respuestas por WhatsApp), Cierre del Sprint 1.

- **[14:50 PM] Implementación de Respuestas de IA (Outbound):**
  - Se modificó el esquema de Gemini en `src/brain.js` agregando el campo `respuesta_cliente` para que la IA redacte un texto empático y comercial basado en la prioridad del caso.
  - Se creó un nuevo módulo `src/whatsapp.js` dedicado a comunicarse con la API de Facebook para enviar mensajes de texto de vuelta al cliente.
  - Se integró el envío del mensaje en `src/server.js`, gatillándose inmediatamente después de guardar el caso en la base de datos.
- **[15:15 PM] Troubleshooting y Tokens:**
  - Se resolvió un error de "Token Expirado" (OAuthException 190) actualizando el Token Temporal.
  - Se resolvió un error de permisos (GraphMethodException 100) corrigiendo un typo en el Phone Number ID (`0069`).
- **[15:30 PM] Verificación Exitosa y Cierre Oficial del Sprint 1:**
  - Se ejecutó la prueba final en vivo. El bot recibió un reporte de emergencia (Cassette botando agua), la IA lo clasificó, lo guardó en la base de datos y le respondió al cliente por WhatsApp de forma automática en menos de 5 segundos.
  - Se generaron los artefactos de Cierre (`walkthrough.md`) para preparar la demostración a los profesores.

---

## 📅 Domingo 6 de Septiembre de 2026

**Horario de trabajo:** Noche
**Áreas trabajadas:** Documentación del Informe Oficial, Corrección de Backlog Jira, Preparación Sprint 2.

- **[20:00 PM - 21:30 PM] Redacción del Informe Oficial (Sprint 1):**
  - Se estructuró el archivo `INFORME_AVANCE_SPRINT_1.md` cumpliendo con el formato de 13 secciones de la rúbrica oficial de tesis.
  - Se detalló el pivoteo estratégico y la evolución del problema desde el "Bot Verificador X" hacia el "Bot Triage InterChile".
  - Se consolidaron los Criterios de Aceptación con justificación explícita ("Dado que... Cuando... Entonces...").
- **[21:40 PM - 22:20 PM] Limpieza y Sincronización del Jira Oficial (`AAI`):**
  - Se detectó un desajuste entre las historias metodológicas del informe y las del proyecto real de Jira.
  - Tras un error de automatización (donde se intentaron inyectar historias nuevas y se borró parte del Sprint 2), se realizó una auditoría completa del tablero ticket por ticket (AAI-1 al AAI-60).
  - Se revirtió el daño, eliminando las historias alucinadas y **se actualizaron vía API los títulos y descripciones de las incidencias reales (AAI-5 a AAI-33)** para que todas contengan sus Criterios de Aceptación exactos, quedando el tablero 100% alineado con el Informe.
- **[22:25 PM] Planificación del Sprint 2:**
  - Tras el escaneo, se corrigió el documento para reflejar las 3 historias reales que vienen para el próximo Sprint: Generación Automática de Cotizaciones en PDF (INT-HU-13), Dashboard Web (INT-HU-14) y Migración a WhatsApp Oficial (INT-HU-15).
  - Se generó un archivo `DOCUMENTACION_HOY.md` para dejar constancia de los cambios en Jira y comprometerse a validar siempre antes de automatizar.
