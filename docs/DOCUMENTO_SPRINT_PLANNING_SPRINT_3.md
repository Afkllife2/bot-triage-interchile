# Sprint planning 3

**Objetivo del sprint:**

Consolidar el cierre funcional y operativo del agente autónomo de triage comercial de InterChile Climatización mediante la generación de borradores de cotización y fichas técnicas en PDF, la gestión de estados y visitas en el Dashboard Web, el agendamiento automático de reuniones con Benjamín mediante un widget de calendario de reservas y el monitoreo de métricas de calidad, verificando su funcionamiento con pruebas de integración y concurrencia (latencia promedio `< 4.0s`, `100%` de generación PDF exitosa, `100%` de alucinaciones bloqueadas por el arnés y `> 99%` de éxito con 20 usuarios simultáneos).

---

**Alcance:**

- **4 historias de usuario y 1 tarea técnica de QA**, estimadas en **34 Story points** (48 horas de trabajo en 2 semanas).
- **Desarrollo de las funcionalidades de cierre del ciclo de atención y gestión comercial:**
  - Cálculo automático de cotización referencial en pesos chilenos (Neto + IVA 19%) y generación de ficha técnica descargable en PDF (`[INT-HU-05]`).
  - Actualización de estados operativos (`en_proceso`, `derivado`, `agendado`, `resuelto`), registro de fecha de visita técnica y descarga directa de PDF desde el Dashboard Web (`[INT-HU-19]`).
  - Visualización de métricas operativas y cumplimiento de SLA (`< 4.0s`), intercepciones del arnés Kronos y PDFs emitidos en el Dashboard (`[INT-HU-22]`).
  - Detección y guardado automático de solicitudes de reunión con Benjamín (presencial, online o comercial) desde WhatsApp y widget interactivo de calendario en el Dashboard para reservar bloques horarios disponibles sin topones (`[INT-HU-23]`).
  - Pruebas automatizadas de concurrencia (20 usuarios simultáneos), diagrama de secuencia integrativo E2E e informe técnico formal de pruebas con sus evidencias correspondientes (`[INT-TSK-03]`).
- **Fuera del alcance (Exclusiones):** Emisión de documentos tributarios electrónicos ante el SII y pasarela de pagos en línea.

---

**Criterio para considerar terminada una HU (Definition of Done):**

La funcionalidad debe estar implementada y operativa en Render (HTTPS/SSL), cumplir todos sus criterios de aceptación en formato BDD, superar el 100% de las pruebas unitarias y de integración en Jest, estar integrada desde su rama específica en GitHub con commits semánticos y contar con sus subtareas actualizadas en Jira con el tiempo real utilizado y sus capturas de evidencia adjuntas.

---

**Mejora del sprint 3:**

Formalizar la verificación y trazabilidad del desarrollo a partir de la retrospectiva del Sprint 2 mediante:
1. Trabajo incremental con **una rama exclusiva en GitHub por cada Historia de Usuario**, registrando el tiempo real empleado y adjuntando capturas de evidencia en cada subtarea de Jira a medida que se completan.
2. Incorporación de agendamiento autónomo de visitas y widget de calendario de reuniones en el propio Dashboard del bot (Plan de Contingencia R-15 ante el desarrollo paralelo de Kronos 2.0).
3. Consolidación de todas las pruebas unitarias, de integración y concurrencia en un informe técnico independiente (`docs/INFORME_DE_PRUEBAS_SPRINT_3.md`).

---

**Sprint backlog:**

| Key Jira | Código | Historia de Usuario / Tarea Técnica | Rama en GitHub | Estado Actual | SP |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AAI-25** | `INT-HU-05` | Generación de Borrador de Cotización y Ficha Técnica en PDF | `feat/AAI-25-HU-05-cotizacion-borrador-pdf` | En curso | 8 |
| **AAI-90** | `INT-HU-19` | Gestión de Agendamiento, Estados y Descarga de PDF en Dashboard Web | `feat/AAI-90-HU-19-agendamiento-estados-dashboard` | Por hacer | 8 |
| **AAI-94** | `INT-HU-22` | Monitoreo de Métricas de Calidad y Cumplimiento de SLA en Dashboard | `feat/AAI-94-HU-22-metricas-calidad-sla` | Por hacer | 5 |
| **AAI-102** | `INT-HU-23` | Agendamiento Automático de Reuniones con Benjamín y Widget de Calendario | `feat/AAI-102-HU-23-agendamiento-reuniones-calendario` | Por hacer | 8 |
| **AAI-98** | `INT-TSK-03` | Validación de Concurrencia, Diagrama Integrativo E2E e Informe de Pruebas *(Tarea Técnica)* | `feat/AAI-98-TSK-03-concurrencia-informe-pruebas` | Por hacer | 5 |
| **Total propuesto** | **4 HUs + 1 TSK** | **16 subtareas técnicas en Jira (`AAI-86` a `AAI-105` · 48 horas est.)** | **5 ramas específicas** | **Inicio Sprint 3** | **34** |

---

**Detalle de Historias, Criterios de Aceptación y Subtareas (según registro en Jira):**

### 1. AAI-25 (`[INT-HU-05]`): Generación de Borrador de Cotización y Ficha Técnica en PDF (8 SP · 12h)
- **Historia:** Como cliente de InterChile que solicita una mantención, instalación o revisión técnica, quiero recibir una estimación transparente de costos y contar con un borrador de cotización / ficha técnica descargable en PDF, para conocer de inmediato el presupuesto referencial de mi servicio sin esperar horas por un cálculo manual.
- **Criterios de Aceptación:**
  - **CA-1 (Cálculo con reglas de negocio):** `Dado que` el cliente solicita Mantención, Instalación o Diagnóstico de Falla e indica el tipo o capacidad del equipo (ej. Split, Cassette, Piso-Cielo), `Cuando` el módulo cotizador procesa la ficha de triage, `Entonces` debe aplicar la matriz tarifaria oficial de InterChile y calcular el valor neto, IVA (19%) y total estimado en pesos chilenos (CLP).
  - **CA-2 (Generación de documento PDF):** `Dado que` existe un ticket registrado con sus datos técnicos y tarifarios, `Cuando` se solicita el documento del caso mediante `GET /api/tickets/:id/pdf`, `Entonces` el sistema debe generar en menos de 3 segundos un archivo PDF formal con membrete de InterChile, folio del ticket, datos del cliente, equipo validado por Kronos y desglose de valores.
  - **CA-3 (Excepción para proyectos complejos o datos por confirmar):** `Dado que` la solicitud corresponde a un Proyecto Comercial industrial o contiene un equipo marcado como `[dato por confirmar]`, `Cuando` se genera el documento PDF del caso, `Entonces` el sistema no debe inventar precios cerrados, sino emitir una Ficha Técnica de Levantamiento indicando *"Valor sujeto a evaluación y visita técnica por ejecutivo comercial"*.
  - **CA-4 (Envío de estimación referencial por WhatsApp):** `Dado que` el cliente completa los datos requeridos para una cotización o servicio estándar en WhatsApp, `Cuando` el bot confirma el registro de la solicitud, `Entonces` el mensaje enviado al cliente debe incluir el valor referencial estimado junto con los datos de contacto comercial.
- **Subtareas en Jira:**
  - `AAI-86` (`3h est.` / `1h 25m real` — **Listo**): Implementar motor de reglas tarifarias (CLP + IVA) según servicio y equipo en `src/cotizador.js`.
  - `AAI-87` (`4h est.` / `1h 45m real` — **Listo**): Construir generador de documentos PDF con membrete InterChile y tabla de costos en `src/pdfGenerator.js`.
  - `AAI-88` (`3h est.` / `40m parcial` — **En curso**): Exponer endpoint `GET /api/tickets/:id/pdf` e inyectar monto estimado en respuesta de WhatsApp.
  - `AAI-89` (`2h est.` — **Por hacer**): Ejecutar pruebas unitarias y de integración en Jest para cálculo tarifario y exportación PDF.

### 2. AAI-90 (`[INT-HU-19]`): Gestión de Agendamiento, Estados y Descarga de PDF en Dashboard Web (8 SP · 12h)
- **Historia:** Como administrador de soporte de InterChile, quiero actualizar el estado operativo de los tickets (`en_proceso`, `agendado`, `resuelto`), asignar fecha de visita técnica y descargar la cotización en PDF desde el Dashboard Web, para coordinar el agendamiento en terreno de forma autónoma (Plan de Contingencia R-15) y gestionar el ciclo completo de cada emergencia en una sola plataforma.
- **Criterios de Aceptación:**
  - **CA-1 (Cambio de estado operativo):** `Dado que` visualizo un ticket en la tabla del Dashboard Web, `Cuando` selecciono un nuevo estado operativo (`en_proceso`, `derivado`, `agendado` o `resuelto`), `Entonces` el cambio debe persistirse en Supabase vía `PATCH /api/tickets/:id` y actualizar de inmediato la fila y los contadores superiores sin recargar la página.
  - **CA-2 (Agendamiento de visita técnica - Contingencia R-15):** `Dado que` un ticket requiere visita técnica o mantención programada, `Cuando` el administrador registra la fecha y bloque horario de visita en el Dashboard, `Entonces` la fecha de agendamiento debe guardarse en base de datos y mostrarse en la fila del ticket dentro del panel administrativo.
  - **CA-3 (Descarga directa de PDF en cada fila):** `Dado que` el administrador necesita compartir o archivar el respaldo formal de un ticket, `Cuando` presiona el botón `'PDF'` en la fila correspondiente del Dashboard, `Entonces` el navegador debe descargar inmediatamente el archivo PDF con la ficha técnica y cotización referencial de ese ticket.
  - **CA-4 (Validación ante estados o IDs inválidos):** `Dado que` se envía una petición `PATCH /api/tickets/:id` con un estado no permitido o un ID inexistente, `Cuando` el servidor valida los parámetros de entrada, `Entonces` debe rechazar la operación con código HTTP 400 o 404 controlado sin afectar la estabilidad del servidor ni corromper los datos.
- **Subtareas en Jira:**
  - `AAI-91` (`4h est.` — **Por hacer**): Crear endpoint `PATCH /api/tickets/:id` y función `actualizarEstadoTicket` en `src/db.js`.
  - `AAI-92` (`5h est.` — **Por hacer**): Agregar selector de estado, campo de agendamiento de visita y botón de descarga PDF en `public/dashboard.html`.
  - `AAI-93` (`3h est.` — **Por hacer**): Programar pruebas de integración en Jest para cambio de estado, agendamiento y manejo de errores 400/404.

### 3. AAI-94 (`[INT-HU-22]`): Monitoreo de Métricas de Calidad y Cumplimiento de SLA en Dashboard (5 SP · 8h)
- **Historia:** Como supervisor de operaciones de InterChile, quiero visualizar en tiempo real los indicadores cuantitativos de desempeño del bot (latencia promedio en segundos, porcentaje de cumplimiento del SLA `< 4.0s`, alucinaciones interceptadas y PDFs generados), para verificar con métricas objetivas que la atención automatizada cumple los estándares de velocidad y confiabilidad exigidos por la empresa.
- **Criterios de Aceptación:**
  - **CA-1 (Medición automática de latencia por turno):** `Dado que` un cliente envía un mensaje al Webhook de WhatsApp, `Cuando` el motor de IA y el arnés completan el procesamiento del turno, `Entonces` el sistema debe medir el tiempo exacto de respuesta en milisegundos (`latencia_ms`) y almacenarlo en el registro de métricas operativas.
  - **CA-2 (API de indicadores cuantitativos):** `Dado que` el Dashboard o el supervisor consulta el endpoint `GET /api/metricas`, `Cuando` el servidor consolida las mediciones del periodo, `Entonces` debe responder con un JSON que incluya `latencia_promedio_ms`, `porcentaje_sla_cumplido` (`< 4000ms`), `total_alucinaciones_bloqueadas` y `total_pdfs_generados`.
  - **CA-3 (Visualización de indicadores SLA en Dashboard):** `Dado que` el supervisor accede al Dashboard Web, `Cuando` la página carga los datos de monitoreo, `Entonces` debe mostrar tarjetas o indicadores visibles con la latencia promedio actual, el porcentaje de cumplimiento del SLA (`< 4.0s`) y las intercepciones del arnés.
  - **CA-4 (Detección de respuestas sobre el umbral SLA):** `Dado que` una interacción puntual tarda más de 4000 ms en procesarse, `Cuando` el módulo de métricas registra el evento, `Entonces` debe descontar proporcionalmente el porcentaje de cumplimiento de SLA y dejar registro en consola para auditoría, sin interrumpir la entrega del mensaje.
- **Subtareas en Jira:**
  - `AAI-95` (`3h est.` — **Por hacer**): Implementar colector de telemetría (latencia en ms, SLA `< 4s`, conteo de arneses y PDFs) en `src/metricsStore.js`.
  - `AAI-96` (`3h est.` — **Por hacer**): Exponer endpoint `GET /api/metricas` e integrar panel de indicadores cuantitativos en `public/dashboard.html`.
  - `AAI-97` (`2h est.` — **Por hacer**): Crear pruebas unitarias y de integración en Jest para validar cálculo de SLA y métricas operativas.

### 4. AAI-102 (`[INT-HU-23]`): Agendamiento Automático de Reuniones con Benjamín y Widget de Calendario de Reservas (8 SP · 8h)
- **Historia:** Como cliente o prospecto comercial de InterChile (y como Benjamín Yáñez, gerente comercial), quiero poder solicitar una reunión con Benjamín (presencial, online o de evaluación comercial) directamente por WhatsApp para que quede registrada automáticamente, y contar con un widget interactivo de calendario en el panel web donde se visualicen los horarios y se puedan realizar reservas en las horas disponibles, para coordinar reuniones con Benjamín sin cruces de horario ni esperas manuales.
- **Criterios de Aceptación:**
  - **CA-1 (Detección y guardado automático de solicitud de reunión con Benjamín):** `Dado que` un cliente solicita por WhatsApp agendar una reunión con Benjamín (presencial, online o de cualquier tipo) indicando fecha y hora preferida, `Cuando` el bot procesa la solicitud del cliente, `Entonces` el sistema debe detectar la intención de reunión, guardar automáticamente la reserva en base de datos vinculada al cliente y confirmar los detalles de la reunión.
  - **CA-2 (Widget interactivo de Calendario para reservas):** `Dado que` el usuario o administrador accede al Widget de Calendario en el panel web, `Cuando` selecciona un día y un bloque horario disponible para reunirse con Benjamín indicando modalidad (Presencial u Online) y motivo, `Entonces` el sistema debe registrar la reserva en el calendario y mostrar inmediatamente el bloque horario como reservado.
  - **CA-3 (Bloqueo de horarios ocupados y prevención de topones):** `Dado que` existe una reunión ya reservada con Benjamín en una fecha y hora determinada, `Cuando` otro cliente por WhatsApp o un usuario desde el widget intenta reservar esa misma hora, `Entonces` el sistema debe impedir la doble reserva (`HTTP 409` / aviso de horario ocupado) y ofrecer los bloques horarios disponibles más cercanos.
  - **CA-4 (Sincronización y listado de reuniones agendadas):** `Dado que` se han registrado reuniones tanto desde el chat de WhatsApp como desde el widget de calendario, `Cuando` se consulta el calendario en el Dashboard Web (`GET /api/reuniones`), `Entonces` deben visualizarse todas las reuniones programadas con Benjamín mostrando cliente, teléfono, fecha, hora, tipo de reunión (presencial/online) y estado.
- **Subtareas en Jira:**
  - `AAI-103` (`3h est.` — **Por hacer**): Implementar persistencia y endpoints de reservas de reuniones con Benjamín (`GET/POST /api/reuniones`) y detección automática en el bot.
  - `AAI-104` (`3h est.` — **Por hacer**): Construir widget interactivo de calendario en el Dashboard para visualizar disponibilidad y reservar horas con Benjamín.
  - `AAI-105` (`2h est.` — **Por hacer**): Ejecutar pruebas en Jest para agendamiento de reuniones, validación de horarios ocupados y widget de reservas.

### 5. AAI-98 (`[INT-TSK-03]`): Validación de Concurrencia, Diagrama Integrativo E2E e Informe Formal de Pruebas (5 SP · 8h)
- **Descripción (Tarea Técnica):** Ejecutar pruebas automatizadas de concurrencia (20 usuarios simultáneos), documentar el diagrama de secuencia integrativo de extremo a extremo y emitir el informe técnico formal de pruebas separado (`docs/INFORME_DE_PRUEBAS_SPRINT_3.md`).
- **Criterios de Aceptación:**
  - **CA-1 (Prueba de estrés y concurrencia multi-usuario):** `Dado que` 20 clientes distintos envían mensajes simultáneos al Webhook de WhatsApp, `Cuando` se ejecuta la suite automatizada de concurrencia, `Entonces` el servidor debe procesar el 100% de las solicitudes con respuesta HTTP 200, manteniendo aislada la memoria de cada teléfono sin mezclar sesiones.
  - **CA-2 (Diagrama Integrativo E2E y justificación técnica):** `Dado que` se requiere evidenciar cómo interactúan todos los módulos de los 3 Sprints, `Cuando` se consulta el documento de arquitectura integrativa, `Entonces` debe presentar el diagrama de secuencia extremo a extremo (`WhatsApp -> Webhook HMAC -> Gemini 2.5 -> Arnés Kronos -> Supabase -> PDF -> Dashboard`) junto con la justificación técnica de cada tecnología.
  - **CA-3 (Informe formal y separado de pruebas):** `Dado que` se ejecutan las pruebas unitarias, funcionales, de integración (Sprint 1 + 2 + 3) y de estrés, `Cuando` se documentan los resultados del Sprint 3, `Entonces` debe generarse el archivo independiente `docs/INFORME_DE_PRUEBAS_SPRINT_3.md` con la matriz `HU -> CA -> Tipo de Prueba -> Archivo Jest -> Resultado PASS -> Evidencia con fecha/hora`.
  - **CA-4 (Aprobación total sin regresiones):** `Dado que` se integran los módulos del Sprint 3 con el código de los Sprints 1 y 2, `Cuando` se ejecuta el comando `npm test` en consola, `Entonces` el 100% de las suites de prueba deben finalizar en estado PASS con 0 errores y sin promesas colgadas (open handles).
- **Subtareas en Jira:**
  - `AAI-99` (`3h est.` — **Por hacer**): Desarrollar suite de pruebas de concurrencia (20 usuarios simultáneos) e integración S1+S2+S3 en `test/sprint3.test.js`.
  - `AAI-100` (`2h est.` — **Por hacer**): Diseñar Diagrama de Secuencia Integrativo E2E y matriz de justificación de decisiones técnicas en `docs/`.
  - `AAI-101` (`3h est.` — **Por hacer**): Redactar informe técnico exclusivo `docs/INFORME_DE_PRUEBAS_SPRINT_3.md` con trazabilidad completa y capturas.

---

**Tablero en Jira:** https://uandresbello-team-bg7iosbc.atlassian.net/jira/software/projects/AAI/boards/202/backlog
