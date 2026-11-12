# Documento Oficial de Sprint Planning — Sprint 3 (Cierre de Titulación)

**Asignatura:** Seminario de Título / Proyecto de Título (Modalidad Scrum Adaptado Unipersonal — UNAB)  
**Proyecto:** Agente Autónomo de Triage Comercial e Integración ERP Kronos — InterChile Climatización  
**Estudiante / Developer:** Carlos Gabriel González Salgado  
**Profesora Metodológica (PO Acad.):** Sarita González Catalán  
**Profesor Guía Técnico:** Matías Vargas  
**Stakeholder / Contraparte Empresa:** Benjamín Yáñez (Gerente Comercial y de Operaciones — InterChile Climatización)  
**Sprint:** Sprint 3 — Hito 3 (Cierre) (`Jira Board 202 · Sprint ID: 434`)  
**Período de la Iteración:** 09 de noviembre de 2026 al 20 de noviembre de 2026 (2 semanas · 48 horas)  

---

## Tabla de Cumplimiento de las 10 Actividades Mínimas de la Sprint Planning (Pauta Oficial UNAB)

| Nº | Actividad Mínima Exigida | Estado | Sección de Evidencia en este Documento |
| :-: | :--- | :---: | :--- |
| **1** | **Revisar el Product Backlog** | Cumplido | Sección 1 (Incorporación de cotización PDF, agendamiento de visitas/reuniones con Benjamín y métricas SLA) |
| **2** | **Definir el Sprint Goal** | Cumplido | Sección 2 (Meta cuantitativa registrada en Jira Sprint 434 con 4 indicadores verificables) |
| **3** | **Seleccionar las HU del Sprint y Tareas Técnicas** | Cumplido | Sección 3 (4 Historias de Usuario: `AAI-25`, `AAI-90`, `AAI-94`, `AAI-102` + 1 Tarea Técnica QA: `AAI-98`) |
| **4** | **Revisar los Criterios de Aceptación (CA)** | Cumplido | Sección 4 (Los 20 Criterios de Aceptación exactos registrados en Jira en formato BDD `Dado / Cuando / Entonces`) |
| **5** | **Definir el Alcance del Sprint (In Scope / Out of Scope)** | Cumplido | Sección 5 (Alcance comprometido de 34 SP y exclusiones explícitas) |
| **6** | **Revisar el Definition of Done (DoD)** | Cumplido | Sección 6 (DoD corto, directo y consecuente de 5 condiciones idéntico al registrado en Jira) |
| **7** | **Construir el Sprint Backlog en Jira** | Cumplido | Sección 7 (Descomposición en las 16 subtareas exactas `AAI-86` a `AAI-105` en Jira con su rama por HU) |
| **8** | **Estimar y organizar el trabajo** | Cumplido | Sección 8 (Estimación de horas por subtarea, estado real en Jira y cronograma de 2 semanas) |
| **9** | **Identificar riesgos e impedimentos iniciales** | Cumplido | Sección 9 (Evaluación de riesgos R-15 a R-18 y acciones concretas de mitigación) |
| **10** | **Definir las evidencias esperadas** | Cumplido | Sección 10 (Entregables verificables en Jira, GitHub por rama de HU, Jest y Render) |

---

## 1. Actividad 1: Revisión y Refinamiento del Product Backlog

Al cierre del Sprint 2 se revisó el Product Backlog junto con las necesidades operativas de InterChile Climatización (Benjamín Yáñez) y las observaciones metodológicas y técnicas de los profesores, priorizando para este último Sprint:
1. **Generación de Borrador de Cotización y Ficha Técnica en PDF (`AAI-25` / `[INT-HU-05]`):** Calcular de forma automática el valor neto, IVA (19%) y total en CLP según la matriz tarifaria de InterChile y emitir una ficha técnica descargable en PDF.
2. **Gestión de Agendamiento de Visitas, Estados y Descarga de PDF en Dashboard (`AAI-90` / `[INT-HU-19]`):** Permitir al administrador cambiar estados (`en_proceso`, `derivado`, `agendado`, `resuelto`), asignar fecha de visita técnica (Contingencia R-15 frente al desarrollo paralelo de Kronos 2.0) y descargar el PDF de cada ticket.
3. **Monitoreo de Métricas de Calidad y Cumplimiento de SLA (`AAI-94` / `[INT-HU-22]`):** Visualizar en el Dashboard la latencia promedio en segundos, porcentaje de cumplimiento del SLA (`< 4.0s`), alucinaciones bloqueadas por el arnés y total de PDFs generados.
4. **Agendamiento Automático de Reuniones con Benjamín y Widget de Calendario de Reservas (`AAI-102` / `[INT-HU-23]`):** Cuando un cliente solicita por WhatsApp una reunión con Benjamín (presencial, online o de cualquier tipo), guardar automáticamente la reserva y disponer de un widget interactivo de calendario en el panel web donde se visualicen los bloques horarios ocupados/disponibles y se puedan realizar reservas.
5. **Tarea Técnica de QA y Arquitectura (`AAI-98` / `[INT-TSK-03]`):** Reclasificada formalmente como **Tarea Técnica** (siguiendo el estándar de `[INT-TSK-02]` en el Sprint 2) para ejecutar las pruebas de concurrencia (20 usuarios simultáneos), el diagrama integrativo E2E y el informe formal separado de pruebas (`docs/INFORME_DE_PRUEBAS_SPRINT_3.md`).

---

## 2. Actividad 2: Definición del Sprint Goal (Meta Cuantitativa y Verificable)

- **Sprint Goal Oficial (Registrado textualmente en Jira Sprint 434):**
  > *"Meta verificable: Consolidar el cierre operativo con generación de cotizaciones PDF, agendamiento en Dashboard (Contingencia R-15) y monitoreo de calidad. Indicadores de éxito: (1) Latencia promedio < 4.0s, (2) 100% generación PDF exitosa, (3) 100% alucinaciones bloqueadas por arnés, (4) >99% éxito en tests de concurrencia (20 usuarios)."*

| Indicador Cuantitativo del Sprint Goal | Umbral Comprometido | Método de Verificación |
| :--- | :---: | :--- |
| **1. Latencia promedio de respuesta del bot** | $< 4.0\text{ s}$ ($< 4000\text{ ms}$) | Medición automática por turno en `src/metricsStore.js` (`GET /api/metricas`) |
| **2. Generación y descarga exitosa de fichas PDF** | $100\%$ | Descarga en `GET /api/tickets/:id/pdf` en menos de 3 segundos |
| **3. Efectividad del arnés anti-alucinaciones** | $100\%$ bloqueado | Validación contra catálogo Kronos en `src/arneses.js` y `test/arneses.test.js` |
| **4. Éxito en pruebas de estrés y concurrencia** | $> 99\%$ ($N = 20$ usuarios) | Suite de concurrencia de 20 clientes simultáneos en `test/sprint3.test.js` |

---

## 3. Actividad 3: Historias de Usuario y Tarea Técnica Seleccionadas (Idénticas a Jira)

### 3.1. Historias de Usuario del Sprint 3 (4 HUs)

| Key Jira | Código HU | Resumen en Jira | Historia de Usuario (Texto exacto registrado en Jira) | SP | Horas |
| :---: | :---: | :--- | :--- | :-: | :-: |
| **`AAI-25`** | `[INT-HU-05]` | Generación de Borrador de Cotización y Ficha Técnica en PDF | **Como** cliente de InterChile que solicita una mantención, instalación o revisión técnica, **Quiero** recibir una estimación transparente de costos y contar con un borrador de cotización / ficha técnica descargable en PDF, **Para** conocer de inmediato el presupuesto referencial de mi servicio sin esperar horas por un cálculo manual. | 8 | 12h |
| **`AAI-90`** | `[INT-HU-19]` | Gestión de Agendamiento, Estados y Descarga de PDF en Dashboard Web | **Como** administrador de soporte de InterChile, **Quiero** actualizar el estado operativo de los tickets (`en_proceso`, `agendado`, `resuelto`), asignar fecha de visita técnica y descargar la cotización en PDF desde el Dashboard Web, **Para** coordinar el agendamiento en terreno de forma autónoma (Plan de Contingencia R-15) y gestionar el ciclo completo de cada emergencia en una sola plataforma. | 8 | 12h |
| **`AAI-94`** | `[INT-HU-22]` | Monitoreo de Métricas de Calidad y Cumplimiento de SLA en Dashboard | **Como** supervisor de operaciones de InterChile, **Quiero** visualizar en tiempo real los indicadores cuantitativos de desempeño del bot (latencia promedio en segundos, porcentaje de cumplimiento del SLA `< 4.0s`, alucinaciones interceptadas y PDFs generados), **Para** verificar con métricas objetivas que la atención automatizada cumple los estándares de velocidad y confiabilidad exigidos por la empresa. | 5 | 8h |
| **`AAI-102`** | `[INT-HU-23]` | Agendamiento Automático de Reuniones con Benjamín y Widget de Calendario de Reservas | **Como** cliente o prospecto comercial de InterChile (y como Benjamín Yáñez, gerente comercial), **Quiero** poder solicitar una reunión con Benjamín (presencial, online o de evaluación comercial) directamente por WhatsApp para que quede registrada automáticamente, y contar con un widget interactivo de calendario en el panel web donde se visualicen los horarios y se puedan realizar reservas en las horas disponibles, **Para** coordinar reuniones con Benjamín sin cruces de horario ni esperas manuales. | 8 | 8h |

### 3.2. Tarea Técnica de QA y Arquitectura del Sprint 3 (1 Tarea Técnica)

| Key Jira | Código Tarea | Resumen en Jira | Descripción de la Tarea Técnica (Texto exacto en Jira) | SP | Horas |
| :---: | :---: | :--- | :--- | :-: | :-: |
| **`AAI-98`** | `[INT-TSK-03]` | Validación de Concurrencia, Diagrama Integrativo E2E e Informe Formal de Pruebas | **Tarea Técnica de Aseguramiento de Calidad (QA) y Arquitectura:** Ejecutar pruebas automatizadas de concurrencia (20 usuarios simultáneos), documentar el diagrama de secuencia integrativo de extremo a extremo y emitir el informe técnico formal de pruebas separado (`docs/INFORME_DE_PRUEBAS_SPRINT_3.md`). | 5 | 8h |

---

## 4. Actividad 4: Criterios de Aceptación en Formato BDD (Exactos de Jira)

### 4.1. `AAI-25` — `[INT-HU-05] Generación de Borrador de Cotización y Ficha Técnica en PDF`
- **CA-1 (Cálculo con reglas de negocio):** `Dado que` el cliente solicita Mantención, Instalación o Diagnóstico de Falla e indica el tipo o capacidad del equipo (ej. Split, Cassette, Piso-Cielo), `Cuando` el módulo cotizador procesa la ficha de triage, `Entonces` debe aplicar la matriz tarifaria oficial de InterChile y calcular el valor neto, IVA (19%) y total estimado en pesos chilenos (CLP).
- **CA-2 (Generación de documento PDF):** `Dado que` existe un ticket registrado con sus datos técnicos y tarifarios, `Cuando` se solicita el documento del caso mediante `GET /api/tickets/:id/pdf`, `Entonces` el sistema debe generar en menos de 3 segundos un archivo PDF formal con membrete de InterChile, folio del ticket, datos del cliente, equipo validado por Kronos y desglose de valores.
- **CA-3 (Excepción para proyectos complejos o datos por confirmar):** `Dado que` la solicitud corresponde a un Proyecto Comercial industrial o contiene un equipo marcado como `[dato por confirmar]`, `Cuando` se genera el documento PDF del caso, `Entonces` el sistema no debe inventar precios cerrados, sino emitir una Ficha Técnica de Levantamiento indicando *"Valor sujeto a evaluación y visita técnica por ejecutivo comercial"*.
- **CA-4 (Envío de estimación referencial por WhatsApp):** `Dado que` el cliente completa los datos requeridos para una cotización o servicio estándar en WhatsApp, `Cuando` el bot confirma el registro de la solicitud, `Entonces` el mensaje enviado al cliente debe incluir el valor referencial estimado junto con los datos de contacto comercial.

---

### 4.2. `AAI-90` — `[INT-HU-19] Gestión de Agendamiento, Estados y Descarga de PDF en Dashboard Web`
- **CA-1 (Cambio de estado operativo):** `Dado que` visualizo un ticket en la tabla del Dashboard Web, `Cuando` selecciono un nuevo estado operativo (`en_proceso`, `derivado`, `agendado` o `resuelto`), `Entonces` el cambio debe persistirse en Supabase vía `PATCH /api/tickets/:id` y actualizar de inmediato la fila y los contadores superiores sin recargar la página.
- **CA-2 (Agendamiento de visita técnica - Contingencia R-15):** `Dado que` un ticket requiere visita técnica o mantención programada, `Cuando` el administrador registra la fecha y bloque horario de visita en el Dashboard, `Entonces` la fecha de agendamiento debe guardarse en base de datos y mostrarse en la fila del ticket dentro del panel administrativo.
- **CA-3 (Descarga directa de PDF en cada fila):** `Dado que` el administrador necesita compartir o archivar el respaldo formal de un ticket, `Cuando` presiona el botón `'PDF'` en la fila correspondiente del Dashboard, `Entonces` el navegador debe descargar inmediatamente el archivo PDF con la ficha técnica y cotización referencial de ese ticket.
- **CA-4 (Validación ante estados o IDs inválidos):** `Dado que` se envía una petición `PATCH /api/tickets/:id` con un estado no permitido o un ID inexistente, `Cuando` el servidor valida los parámetros de entrada, `Entonces` debe rechazar la operación con código HTTP 400 o 404 controlado sin afectar la estabilidad del servidor ni corromper los datos.

---

### 4.3. `AAI-94` — `[INT-HU-22] Monitoreo de Métricas de Calidad y Cumplimiento de SLA en Dashboard`
- **CA-1 (Medición automática de latencia por turno):** `Dado que` un cliente envía un mensaje al Webhook de WhatsApp, `Cuando` el motor de IA y el arnés completan el procesamiento del turno, `Entonces` el sistema debe medir el tiempo exacto de respuesta en milisegundos (`latencia_ms`) y almacenarlo en el registro de métricas operativas.
- **CA-2 (API de indicadores cuantitativos):** `Dado que` el Dashboard o el supervisor consulta el endpoint `GET /api/metricas`, `Cuando` el servidor consolida las mediciones del periodo, `Entonces` debe responder con un JSON que incluya `latencia_promedio_ms`, `porcentaje_sla_cumplido` (`< 4000ms`), `total_alucinaciones_bloqueadas` y `total_pdfs_generados`.
- **CA-3 (Visualización de indicadores SLA en Dashboard):** `Dado que` el supervisor accede al Dashboard Web, `Cuando` la página carga los datos de monitoreo, `Entonces` debe mostrar tarjetas o indicadores visibles con la latencia promedio actual, el porcentaje de cumplimiento del SLA (`< 4.0s`) y las intercepciones del arnés.
- **CA-4 (Detección de respuestas sobre el umbral SLA):** `Dado que` una interacción puntual tarda más de 4000 ms en procesarse, `Cuando` el módulo de métricas registra el evento, `Entonces` debe descontar proporcionalmente el porcentaje de cumplimiento de SLA y dejar registro en consola para auditoría, sin interrumpir la entrega del mensaje.

---

### 4.4. `AAI-102` — `[INT-HU-23] Agendamiento Automático de Reuniones con Benjamín y Widget de Calendario de Reservas`
- **CA-1 (Detección y guardado automático de solicitud de reunión con Benjamín):** `Dado que` un cliente solicita por WhatsApp agendar una reunión con Benjamín (presencial, online o de cualquier tipo) indicando fecha y hora preferida, `Cuando` el bot procesa la solicitud del cliente, `Entonces` el sistema debe detectar la intención de reunión, guardar automáticamente la reserva en base de datos vinculada al cliente y confirmar los detalles de la reunión.
- **CA-2 (Widget interactivo de Calendario para reservas):** `Dado que` el usuario o administrador accede al Widget de Calendario en el panel web, `Cuando` selecciona un día y un bloque horario disponible para reunirse con Benjamín indicando modalidad (Presencial u Online) y motivo, `Entonces` el sistema debe registrar la reserva en el calendario y mostrar inmediatamente el bloque horario como reservado.
- **CA-3 (Bloqueo de horarios ocupados y prevención de topones):** `Dado que` existe una reunión ya reservada con Benjamín en una fecha y hora determinada, `Cuando` otro cliente por WhatsApp o un usuario desde el widget intenta reservar esa misma hora, `Entonces` el sistema debe impedir la doble reserva (HTTP 409 / aviso de horario ocupado) y ofrecer los bloques horarios disponibles más cercanos.
- **CA-4 (Sincronización y listado de reuniones agendadas):** `Dado que` se han registrado reuniones tanto desde el chat de WhatsApp como desde el widget de calendario, `Cuando` se consulta el calendario en el Dashboard Web (`GET /api/reuniones`), `Entonces` deben visualizarse todas las reuniones programadas con Benjamín mostrando cliente, teléfono, fecha, hora, tipo de reunión (presencial/online) y estado.

---

### 4.5. `AAI-98` — `[INT-TSK-03] Validación de Concurrencia, Diagrama Integrativo E2E e Informe Formal de Pruebas`
- **CA-1 (Prueba de estrés y concurrencia multi-usuario):** `Dado que` 20 clientes distintos envían mensajes simultáneos al Webhook de WhatsApp, `Cuando` se ejecuta la suite automatizada de concurrencia, `Entonces` el servidor debe procesar el 100% de las solicitudes con respuesta HTTP 200, manteniendo aislada la memoria de cada teléfono sin mezclar sesiones.
- **CA-2 (Diagrama Integrativo E2E y justificación técnica):** `Dado que` se requiere evidenciar cómo interactúan todos los módulos de los 3 Sprints, `Cuando` se consulta el documento de arquitectura integrativa, `Entonces` debe presentar el diagrama de secuencia extremo a extremo (WhatsApp -> Webhook HMAC -> Gemini 2.5 -> Arnés Kronos -> Supabase -> PDF -> Dashboard) junto con la justificación técnica de cada tecnología.
- **CA-3 (Informe formal y separado de pruebas):** `Dado que` se ejecutan las pruebas unitarias, funcionales, de integración (Sprint 1 + 2 + 3) y de estrés, `Cuando` se documentan los resultados del Sprint 3, `Entonces` debe generarse el archivo independiente `docs/INFORME_DE_PRUEBAS_SPRINT_3.md` con la matriz HU -> CA -> Tipo de Prueba -> Archivo Jest -> Resultado PASS -> Evidencia con fecha/hora.
- **CA-4 (Aprobación total sin regresiones):** `Dado que` se integran los módulos del Sprint 3 con el código de los Sprints 1 y 2, `Cuando` se ejecuta el comando `npm test` en consola, `Entonces` el 100% de las suites de prueba deben finalizar en estado PASS con 0 errores y sin promesas colgadas (open handles).

---

## 5. Actividad 5: Alcance del Sprint (Inclusiones y Exclusiones Explícitas)

### Dentro del Alcance (In Scope — 34 Story Points / 48 Horas):
- Motor de reglas tarifarias en CLP + IVA 19% (`src/cotizador.js`) y generador de PDF con membrete de InterChile (`src/pdfGenerator.js`).
- Gestión de estados operativos (`en_proceso`, `derivado`, `agendado`, `resuelto`), agendamiento de visita técnica (`PATCH /api/tickets/:id`) y descarga de PDF (`GET /api/tickets/:id/pdf`).
- Agendamiento automático de reuniones con Benjamín (presencial u online) desde WhatsApp y Widget interactivo de Calendario de Reservas (`GET/POST /api/reuniones`).
- Colector de métricas de calidad y SLA `< 4.0s` (`src/metricsStore.js`, `GET /api/metricas`) con tarjetas en el Dashboard Web.
- Pruebas de concurrencia (20 usuarios simultáneos), diagrama integrativo E2E e informe técnico formal de pruebas (`docs/INFORME_DE_PRUEBAS_SPRINT_3.md`).

### Fuera del Alcance (Out of Scope / Exclusiones Explícitas):
- **Emisión tributaria electrónica ante el SII:** El PDF generado es una cotización referencial y ficha técnica de triage, no una factura electrónica tributaria.
- **Pasarela de pagos en línea:** El cobro del servicio se realiza una vez validada la visita o reunión comercial.
- **Procesamiento de notas de voz o video en WhatsApp:** El bot procesa mensajes de texto, botones interactivos, listas y fotos.

---

## 6. Actividad 6: Definition of Done (DoD) del Sprint 3 (Exacto de Jira)

1. Código operativo y desplegado 24/7 en Render con HTTPS/SSL.
2. Criterios de Aceptación BDD cumplidos con reglas de negocio y evidencia visual.
3. Pruebas Unitarias y de Integración en Jest 100% PASS registradas en `INFORME_DE_PRUEBAS_SPRINT_3.md`.
4. Ramas específicas por Historia de Usuario con commits semánticos y tag `v3.0.0-release`.
5. Subtareas completadas con horas estimadas, horas reales registradas (Time Tracking) y captura adjunta.

---

## 7. Actividad 7 y 8: Sprint Backlog en Jira, Ramas por HU y Estado Real de Avance

| Semana | Key Subtarea | Padre Jira | Rama Específica en GitHub | Resumen Exacto de la Subtarea en Jira | Estimado | Tiempo Real | Estado Jira |
| :---: | :---: | :---: | :--- | :--- | :---: | :---: | :---: |
| **Sem. 1** | **`AAI-86`** | `AAI-25` (`HU-05`) | `feat/AAI-25-HU-05-cotizacion-borrador-pdf` | `[SUB-01] [3h est.] Implementar motor de reglas tarifarias (CLP + IVA) según servicio y equipo en src/cotizador.js (CA-1, CA-3)` | 3h | 1h 25m | **Listo** |
| **Sem. 1** | **`AAI-87`** | `AAI-25` (`HU-05`) | `feat/AAI-25-HU-05-cotizacion-borrador-pdf` | `[SUB-02] [4h est.] Construir generador de documentos PDF con membrete InterChile y tabla de costos en src/pdfGenerator.js (CA-2)` | 4h | 1h 45m | **Listo** |
| **Sem. 1** | **`AAI-88`** | `AAI-25` (`HU-05`) | `feat/AAI-25-HU-05-cotizacion-borrador-pdf` | `[SUB-03] [3h est.] Exponer endpoint GET /api/tickets/:id/pdf e inyectar monto estimado en respuesta de WhatsApp (CA-2, CA-4)` | 3h | 40m (parcial) | **En curso** |
| **Sem. 1** | **`AAI-89`** | `AAI-25` (`HU-05`) | `feat/AAI-25-HU-05-cotizacion-borrador-pdf` | `[SUB-04] [2h est.] Ejecutar pruebas unitarias y de integración en Jest para cálculo tarifario y exportación PDF (CA-1 a CA-4)` | 2h | — | Por hacer |
| **Sem. 1** | **`AAI-91`** | `AAI-90` (`HU-19`) | `feat/AAI-90-HU-19-agendamiento-estados-dashboard` | `[SUB-01] [4h est.] Crear endpoint PATCH /api/tickets/:id y función actualizarEstadoTicket en src/db.js (CA-1, CA-2, CA-4)` | 4h | — | Por hacer |
| **Sem. 1** | **`AAI-92`** | `AAI-90` (`HU-19`) | `feat/AAI-90-HU-19-agendamiento-estados-dashboard` | `[SUB-02] [5h est.] Agregar selector de estado, campo de agendamiento de visita y botón de descarga PDF en public/dashboard.html (CA-1, CA-2, CA-3)` | 5h | — | Por hacer |
| **Sem. 1** | **`AAI-93`** | `AAI-90` (`HU-19`) | `feat/AAI-90-HU-19-agendamiento-estados-dashboard` | `[SUB-03] [3h est.] Programar pruebas de integración en Jest para cambio de estado, agendamiento y manejo de errores 400/404 (CA-1 a CA-4)` | 3h | — | Por hacer |
| **Sem. 2** | **`AAI-95`** | `AAI-94` (`HU-22`) | `feat/AAI-94-HU-22-metricas-calidad-sla` | `[SUB-01] [3h est.] Implementar colector de telemetría (latencia en ms, SLA < 4s, conteo de arneses y PDFs) en src/metricsStore.js (CA-1, CA-4)` | 3h | — | Por hacer |
| **Sem. 2** | **`AAI-96`** | `AAI-94` (`HU-22`) | `feat/AAI-94-HU-22-metricas-calidad-sla` | `[SUB-02] [3h est.] Exponer endpoint GET /api/metricas e integrar panel de indicadores cuantitativos en public/dashboard.html (CA-2, CA-3)` | 3h | — | Por hacer |
| **Sem. 2** | **`AAI-97`** | `AAI-94` (`HU-22`) | `feat/AAI-94-HU-22-metricas-calidad-sla` | `[SUB-03] [2h est.] Crear pruebas unitarias y de integración en Jest para validar cálculo de SLA y métricas operativas (CA-1 a CA-4)` | 2h | — | Por hacer |
| **Sem. 2** | **`AAI-103`** | `AAI-102` (`HU-23`) | `feat/AAI-102-HU-23-agendamiento-reuniones-calendario` | `[SUB-01] [3h est.] Implementar persistencia y endpoints de reservas de reuniones con Benjamín (GET/POST /api/reuniones) y detección automática en el bot (CA-1, CA-3, CA-4)` | 3h | — | Por hacer |
| **Sem. 2** | **`AAI-104`** | `AAI-102` (`HU-23`) | `feat/AAI-102-HU-23-agendamiento-reuniones-calendario` | `[SUB-02] [3h est.] Construir widget interactivo de calendario en el Dashboard para visualizar disponibilidad y reservar horas con Benjamín (CA-2, CA-4)` | 3h | — | Por hacer |
| **Sem. 2** | **`AAI-105`** | `AAI-102` (`HU-23`) | `feat/AAI-102-HU-23-agendamiento-reuniones-calendario` | `[SUB-03] [2h est.] Ejecutar pruebas en Jest para agendamiento de reuniones, validación de horarios ocupados y widget de reservas (CA-1 a CA-4)` | 2h | — | Por hacer |
| **Sem. 2** | **`AAI-99`** | `AAI-98` (`TSK-03`) | `feat/AAI-98-TSK-03-concurrencia-informe-pruebas` | `[SUB-01] [3h est.] Desarrollar suite de pruebas de concurrencia (20 usuarios simultáneos) e integración S1+S2+S3 en test/sprint3.test.js (CA-1, CA-4)` | 3h | — | Por hacer |
| **Sem. 2** | **`AAI-100`** | `AAI-98` (`TSK-03`) | `feat/AAI-98-TSK-03-concurrencia-informe-pruebas` | `[SUB-02] [2h est.] Diseñar Diagrama de Secuencia Integrativo E2E y matriz de justificación de decisiones técnicas en docs/ (CA-2)` | 2h | — | Por hacer |
| **Sem. 2** | **`AAI-101`** | `AAI-98` (`TSK-03`) | `feat/AAI-98-TSK-03-concurrencia-informe-pruebas` | `[SUB-03] [3h est.] Redactar informe técnico exclusivo docs/INFORME_DE_PRUEBAS_SPRINT_3.md con trazabilidad completa y capturas (CA-3)` | 3h | — | Por hacer |
| **TOTAL** | **16 Subtareas** | **4 HUs + 1 TSK** | **5 Ramas Específicas** | **Total Planificado Sprint 3 (34 Story Points)** | **48h** | **3h 50m** | **En ejecución** |

---

## 8. Actividad 9: Identificación de Riesgos e Impedimentos Iniciales del Sprint 3

| ID | Riesgo / Impedimento Identificado | Prob. (1-3) | Imp. (1-3) | Severidad | Acción de Mitigación Concreta |
| :-: | :--- | :---: | :---: | :---: | :--- |
| **R-15** | **Desarrollo paralelo del ERP Kronos 2.0:** Posible desfase en el módulo externo de agendamiento de Kronos 2.0 antes del cierre del semestre. | 3 | 3 | **9 (Rojo)** | **Plan de Contingencia R-15 (`AAI-90` y `AAI-102`):** El Dashboard Web del Bot incorpora gestión autónoma de estados, fecha de visita técnica y widget de calendario de reservas de reuniones con Benjamín. |
| **R-16** | **Alucinación de precios o tarifas en el LLM:** Riesgo de que la IA invente valores cerrados o calcule mal el IVA. | 2 | 3 | **6 (Amarillo)** | **Cálculo Determinista (`AAI-25`):** El cálculo en CLP + IVA (19%) se ejecuta en `src/cotizador.js` con reglas fijas; proyectos complejos o equipos `[dato por confirmar]` se emiten como sujetos a evaluación comercial. |
| **R-17** | **Cruces o topones de horario en reuniones con Benjamín:** Dos clientes intentando reservar la misma fecha y hora de reunión. | 2 | 3 | **6 (Amarillo)** | **Validación de Disponibilidad (`AAI-102`):** El endpoint de reservas y el widget de calendario verifican si el bloque horario ya está ocupado y bloquean reservas duplicadas. |
| **R-18** | **Saturación ante múltiples mensajes simultáneos en WhatsApp:** Degradación o mezcla de sesiones bajo alta concurrencia. | 2 | 2 | **4 (Amarillo)** | **Aislamiento por Teléfono (`AAI-98`):** Sesiones indexadas por `wa_id` validadas con prueba automatizada de estrés de 20 clientes simultáneos en Jest. |

---

## 9. Actividad 10: Evidencias Esperadas al Cierre de la Iteración

1. **Tablero Jira (`AAI` — Sprint 3 ID 434):** Las 4 Historias de Usuario (`AAI-25`, `AAI-90`, `AAI-94`, `AAI-102`), la Tarea Técnica (`AAI-98`) y las 16 subtareas (`AAI-86` a `AAI-105`) con registro real de horas y capturas adjuntas a medida que se completan.
2. **Repositorio GitHub (`Afkllife2/bot-triage-interchile`):** Ramas específicas por cada Historia de Usuario y Tarea Técnica con commits semánticos.
3. **Informe Técnico Separado de Pruebas (`docs/INFORME_DE_PRUEBAS_SPRINT_3.md`):** Matriz de trazabilidad completa y suite de Jest en `100% PASS`.
