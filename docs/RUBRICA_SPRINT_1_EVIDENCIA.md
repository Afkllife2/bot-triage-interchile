# Evidencia de Cumplimiento: Rúbrica Sprint 1

Este documento asegura el cumplimiento exacto de la rúbrica de evaluación para obtener el puntaje máximo (Categoría "Excelente") en el Hito 1.

## 1. Sprint Goal, propósito y alcance (7 pts)
- **Sprint Goal:** "Desarrollar el MVP funcional del sistema de Intake y Triage automatizado mediante WhatsApp, asegurando la persistencia de datos en Supabase y completando la planificación arquitectónica y documental del proyecto."
- **Propósito:** Automatizar el primer filtro de atención al cliente de InterChile.
- **Alcance:** Recepción de mensajes, extracción de entidades (motivo, marca, falla) mediante IA, asignación de prioridad e inserción en base de datos.
- **Exclusiones:** En este Sprint NO se incluye la generación automática de PDFs de cotización ni el despliegue a producción (se probará en entorno local/sandbox).

## 2. Historias de Usuario y Refinamiento (10 pts)
Para asegurar este puntaje, cada HU en Jira debe tener explícitamente:
- **Usuario, Necesidad y Valor:** Formuladas como "Como [Rol], quiero [Acción] para [Valor]".
- **Refinamiento:** Se deben añadir comentarios o secciones en Jira que detallen:
  - *Dependencias:* (Ej. HU-01 depende de la API de Meta).
  - *Restricciones:* (Ej. Límite de tokens en Gemini).
  - *Supuestos:* (Ej. El cliente enviará texto, no audios largos).

## 3. Criterios de Aceptación - CA (8 pts)
- Todas nuestras HU ya fueron redactadas utilizando el formato **BDD (Given - When - Then)**.
- Se han cubierto los flujos de "Éxito" (Happy Path) y "Alternativas/Error" (Ej. ¿Qué pasa si el cliente envía un dato inválido?). Esto garantiza que sean verificables y listos para QA.

## 4. Sprint Backlog y Gestión Jira (10 pts)
- **Descomposición:** Para ganar estos 10 puntos, es CRÍTICO que en Jira entremos a cada Historia de Usuario y le agreguemos **Sub-tareas** (Sub-tasks). Por ejemplo, a la HU de Supabase hay que crearle sub-tareas como "Definir esquema SQL", "Configurar `.env`", etc.
- **Estimación y Vinculación:** Las tareas deben tener Story Points asignados y sus estados deben moverse de "To Do" -> "In Progress" -> "Done" de forma realista (no mover todo el último día).

## 5. Definition of Done (DoD) y aplicación (7 pts)
- **DoD Definido:** Una HU se considera *Done* (Completada) cuando cumple con lo siguiente:
  1. El código fue programado y el entorno corre localmente sin errores.
  2. Cumple con todos los Criterios de Aceptación (CA) definidos en Jira.
  3. Pasa las Pruebas Unitarias o la validación manual definida en el Plan de Pruebas.
  4. El código ha sido *pusheado* a la rama `develop` en GitHub.
  5. La tarjeta en Jira fue movida a la columna "Done".
- **Aplicación:** Usa esta lista literalmente en tu informe o pégala en la descripción del Sprint en Jira para asegurar los 7 puntos.

## 6. Diseño del incremento mediante 4+1 (10 pts)
- **Documentación Creada:** Se ha generado el documento oficial [docs/DISENO_4_MAS_1.md](file:///c:/Users/count/Documents/New%20project/bot-verificador-x-prototipo/docs/DISENO_4_MAS_1.md) que plasma las 5 vistas de Kruchten (Lógica, Procesos, Desarrollo, Física y Escenarios) y vincula directamente cómo la base de datos y Node.js resolverán las Historias de Usuario.

## 7. Seguimiento metodológico y meetings (8 pts)
- **Rol del Estudiante:** Este puntaje depende enteramente de ti. Debes asistir a las reuniones con tu profesora, presentar avances (mostrando tu Jira y estos documentos) e idealmente guardar una pequeña "Minuta" en un doc de Google o en Jira con los acuerdos a los que lleguen en cada reunión.

## 8. Gestión de riesgos e impedimentos (7 pts)
- **Documentación Creada:** Ayer nos adelantamos y creamos la [docs/MATRIZ_RIESGOS_V1.md](file:///c:/Users/count/Documents/New%20project/bot-verificador-x-prototipo/docs/MATRIZ_RIESGOS_V1.md). Ese documento cumple al 100% con "identificar, analizar probabilidad/impacto y definir estrategia de mitigación". Presenta ese documento y los 7 puntos son tuyos.
