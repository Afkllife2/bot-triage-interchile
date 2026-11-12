# Documento Oficial de Sprint Planning — Sprint 3 (Cierre de Titulación)

**Asignatura:** Seminario de Título / Proyecto de Título (Modalidad Scrum Adaptado Unipersonal — UNAB)  
**Proyecto:** Agente Autónomo de Triage Comercial e Integración ERP Kronos — InterChile Climatización  
**Estudiante / Developer:** Carlos Gabriel González Salgado  
**Profesora Metodológica (PO Acad.):** Sarita González Catalán  
**Profesor Guía Técnico:** Matías Vargas  
**Stakeholder / Contraparte Empresa:** Benjamín Yáñez (Gerente / Product Owner InterChile Climatización)  
**Sprint:** Sprint 3 — Hito 3 (Cierre) (`Jira Board 202 · Sprint ID: 434`)  
**Período de la Iteración:** 09 de noviembre de 2026 al 20 de noviembre de 2026 (2 semanas · 40 horas)  

---

## Tabla de Cumplimiento de las 10 Actividades Mínimas de la Sprint Planning (Pauta Oficial UNAB)

| Nº | Actividad Mínima Exigida | Estado | Sección de Evidencia en este Documento |
| :-: | :--- | :---: | :--- |
| **1** | **Revisar el Product Backlog** | Cumplido | Sección 1 (Incorporación de hallazgos H-05 a H-08 de la Review del Sprint 2 y encargo `KRON2-152`) |
| **2** | **Definir el Sprint Goal** | Cumplido | Sección 2 (Meta cuantitativa, propósito de negocio y 4 indicadores verificables) |
| **3** | **Seleccionar las HU del Sprint y Refinamiento Previo** | Cumplido | Sección 3 (`AAI-25`, `AAI-90`, `AAI-94`, `AAI-98` con Usuario/Necesidad/Valor, Dependencias, Restricciones y Supuestos) |
| **4** | **Revisar los Criterios de Aceptación (CA)** | Cumplido | Sección 4 (12 Criterios de Aceptación en formato BDD `Dado / Cuando / Entonces` con casos positivos, negativos y fallbacks) |
| **5** | **Definir el Alcance del Sprint (In Scope / Out of Scope)** | Cumplido | Sección 5 (Alcance comprometido de 26 SP y exclusiones explícitas) |
| **6** | **Revisar el Definition of Done (DoD)** | Cumplido | Sección 6 (DoD corto, directo y consecuente de 5 condiciones verificables) |
| **7** | **Construir el Sprint Backlog en Jira** | Cumplido | Sección 7 (Descomposición en 13 subtareas técnicas `AAI-86` a `AAI-101` vinculadas a cada HU) |
| **8** | **Estimar y organizar el trabajo** | Cumplido | Sección 8 (Estimación de 26 SP / 40 horas, dependencias y cronograma secuencial de 2 semanas) |
| **9** | **Identificar riesgos e impedimentos iniciales** | Cumplido | Sección 9 (Evaluación de riesgos R-15 a R-18 y acciones concretas de mitigación) |
| **10** | **Definir las evidencias esperadas** | Cumplido | Sección 10 (Entregables verificables en Jira, GitHub, Jest y Render) |

---

## 1. Actividad 1: Revisión y Refinamiento del Product Backlog

Al cierre del Sprint 2 (Acta de Sprint Review del 22/10/2026 y retroalimentación técnica del Hito 2 con nota 6,2 / 88,75%), se actualizaron las prioridades del Product Backlog incorporando:
1. **Hallazgo H-07 (Acta Review Sprint 2):** Necesidad de generar un borrador de cotización referencial en CLP (con IVA 19%) y una ficha técnica descargable en PDF a partir de los datos capturados en el triage (`[INT-HU-05]` / `AAI-25`).
2. **Hallazgo H-08 y Riesgo Crítico R-15 (Acordado con Prof. Sarita):** Dado que el sistema ERP interno **Kronos 2.0** de InterChile se desarrolla en paralelo, el bot debe contar con:
   - Una **capacidad autónoma completa en su propio Dashboard Web** (cambio manual de estados `en_proceso`, `derivado`, `agendado`, `resuelto`, asignación de `fecha_visita` técnica y descarga de ficha PDF) para no bloquear la operación ni la defensa académica si el ERP externo sufriera retrasos (`[INT-HU-19]` / `AAI-90`).
   - Un **contrato de API cerrado y autenticado mediante Bearer Token (`TRIAGE_API_TOKEN`)** compatible con la bandeja de integración de Kronos 2.0 (`KRON2-152`), con paginación por cursor estable (`updated_at+id`) y control de concurrencia optimista (`409 Conflict`).
3. **Hallazgo H-05 y Observación del Prof. Guía Técnico (Atributos de Calidad y Pruebas):** Necesidad de visualizar métricas cuantitativas de calidad y SLA en tiempo real (`[INT-HU-22]` / `AAI-94`) y validar el sistema completo mediante pruebas de concurrencia con múltiples usuarios simultáneos, diagrama integrativo E2E e informe técnico separado de pruebas (`[INT-HU-23]` / `AAI-98`).

---

## 2. Actividad 2: Definición del Sprint Goal (Meta Cuantitativa y Verificable)

- **Propósito de Negocio:** Cerrar el ciclo comercial y operativo del pre-diagnóstico automatizado en InterChile Climatización, entregando estimaciones referenciales en CLP con ficha PDF descargable, permitiendo a los coordinadores agendar visitas técnicas y gestionar estados con seguridad, y garantizando el cumplimiento de niveles de servicio (SLA) bajo carga concurrente.
- **Sprint Goal Oficial (Registrado en Jira Sprint 434):**
  > *"Meta verificable: Consolidar el cierre operativo con generación de cotizaciones PDF, agendamiento en Dashboard (Contingencia R-15) y monitoreo de calidad. Indicadores de éxito: (1) Latencia promedio < 4.0s, (2) 100% generación PDF exitosa, (3) 100% alucinaciones bloqueadas por arnés, (4) >99% éxito en tests de concurrencia (20 usuarios)."*

| Indicador Cuantitativo del Sprint Goal | Umbral de Éxito Comprometido | Método de Verificación |
| :--- | :---: | :--- |
| **1. Latencia promedio de respuesta del bot** | $< 4.0\text{ s}$ ($< 4000\text{ ms}$) | Medición en `src/metricsStore.js` (`GET /api/metricas`) y pruebas de integración en Jest |
| **2. Efectividad del arnés anti-alucinaciones** | $100\%$ interceptado | Suite `test/arneses.test.js` y `test/sprint3.test.js` frente a catálogo Kronos y fallbacks |
| **3. Éxito en pruebas de estrés y concurrencia** | $> 99\%$ sobre $N = 20$ usuarios | Ráfaga concurrente `Promise.all` de 20 webhooks firmados en `test/sprint3.test.js` |
| **4. Generación y descarga exitosa de fichas PDF** | $100\%$ | Validación de binario `%PDF-1.4` y `GET /api/tickets/:id/pdf` en `test/sprint3.test.js` |

---

## 3. Actividad 3: Selección de Historias de Usuario y Refinamiento Previo

Todas las Historias de Usuario fueron formuladas desde la perspectiva del usuario final (`Como... Quiero... Para...`) y refinadas previo al inicio del desarrollo identificando sus dependencias, restricciones y supuestos:

| Key Jira | Código HU | Historia de Usuario (Perspectiva de Usuario) | Prioridad | SP | Horas | Refinamiento Previo (Dependencias, Restricciones y Supuestos) |
| :---: | :---: | :--- | :---: | :-: | :-: | :--- |
| **`AAI-25`** | `[INT-HU-05]` | **Como** ejecutivo comercial de InterChile, **quiero** que el sistema calcule automáticamente un borrador de cotización referencial en CLP (con IVA 19%) y genere una ficha técnica descargable en PDF por cada caso de triage, **para** entregar al cliente una estimación formal y rápida sin realizar cálculos manuales. | Alta | 8 | 12h | **Dependencias:** Requiere ficha extraída por `src/brain.js` y validada por `src/arneses.js` (`HU-02`/`HU-21`).<br>**Restricciones:** El cálculo aritmético NUNCA debe delegarse al LLM; si el equipo es `[dato por confirmar]` los montos deben quedar en `null` (nunca inventar `$0`). El generador PDF no debe usar Puppeteer/Chromium para no exceder los 512 MB de RAM en Render.<br>**Supuestos:** Tarifario base en CLP definido por categoría de equipo y tipo de servicio con IVA legal del 19%. |
| **`AAI-90`** | `[INT-HU-19]` | **Como** coordinador de operaciones de InterChile, **quiero** actualizar el estado de los tickets (`en_proceso`, `derivado`, `agendado`, `resuelto`), registrar la fecha de visita técnica y descargar la ficha en PDF desde el Dashboard Web protegido, **para** gestionar la operación comercial de forma autónoma (Contingencia R-15) y sincronizar casos con Kronos 2.0. | Alta | 8 | 12h | **Dependencias:** Requiere capa de persistencia en `src/db.js` (`HU-04`) y panel base (`HU-14`).<br>**Restricciones:** Las rutas `/api/*` deben exigir Bearer Token privado (`TRIAGE_API_TOKEN`) distinto de Meta/Gemini; `created_at` debe ser inmutable; pasar a `agendado` exige `fecha_visita` ISO UTC; cambios con versión antigua deben responder `409 Conflict`.<br>**Supuestos:** El operador ingresa su credencial en memoria de sesión sin exponer tokens en el código fuente HTML/JS. |
| **`AAI-94`** | `[INT-HU-22]` | **Como** supervisor de servicio de InterChile, **quiero** visualizar en el Dashboard tarjetas con las métricas de latencia promedio (SLA `< 4.0s`), tasa de alucinaciones interceptadas por el arnés y distribución de casos por estado, **para** auditar en tiempo real la calidad y confiabilidad de la atención automatizada. | Media | 5 | 8h | **Dependencias:** Requiere pipeline de webhooks (`src/server.js`) y validador `src/arneses.js` + `src/kronos.js`.<br>**Restricciones:** La consulta al catálogo remoto `GET /api/kronos/catalogo` tiene timeout máximo de 5 s; debe distinguir respaldo local (`catalogo_verificado: false`) de catálogo oficial (`catalogo_verificado: true`).<br>**Supuestos:** Ventana móvil de hasta 200 muestras en memoria para cálculo instantáneo de SLA sin sobrecargar PostgreSQL. |
| **`AAI-98`** | `[INT-HU-23]` | **Como** líder técnico y evaluador del proyecto, **quiero** contar con pruebas automatizadas de concurrencia (20 usuarios simultáneos), un diagrama de secuencia integrativo E2E con ADRs y un informe técnico formal de pruebas, **para** certificar la estabilidad del sistema en producción y la trazabilidad exigida al cierre de titulación. | Media | 5 | 8h | **Dependencias:** Requiere `AAI-25`, `AAI-90` y `AAI-94` implementadas.<br>**Restricciones:** Las pruebas en Jest deben simular bordes externos (Meta/Gemini) y ejecutarse con `--runInBand` logrando `100% PASS` sin tests omitidos.<br>**Supuestos:** El informe de pruebas se entrega en un documento exclusivo (`docs/INFORME_DE_PRUEBAS_SPRINT_3.md`). |

---

## 4. Actividad 4: Criterios de Aceptación Verificables (Formato BDD)

### `AAI-25` (`[INT-HU-05]`): Borrador de Cotización y Ficha Técnica en PDF
- **CA-1 (Cálculo Determinista CLP + IVA 19%):** **Dado que** un caso de triage cuenta con un motivo tarifable (`Mantención`, `Falla Técnica`, `Instalación`, `Cotización`, `Arriendo`, `Proyecto Comercial`) y un tipo de equipo válido (`Split`, `Cassette`, `Piso Techo`, `Ducto`, `Chiller`, `VRV`), **Cuando** `src/cotizador.js` procesa la ficha, **Entonces** calcula de forma determinista `subtotal_neto`, `iva` (`Math.round(neto * 0.19)`) y `total_clp`, aplicando recargo de urgencia si es `Falla Técnica` con prioridad `Alta`.
- **CA-2 (Caso Negativo / Incertidumbre):** **Dado que** el tipo de equipo fue reemplazado por `[dato por confirmar]` por el arnés o el motivo es `Otra Consulta`, **Cuando** se evalúa la cotización, **Entonces** el sistema retorna `null` en `cotizacion_neto`, `cotizacion_iva` y `cotizacion_total` (nunca inventa `$0`).
- **CA-3 (Emisión y Descarga Autorizada de PDF):** **Dado que** existe un ticket persistido en base de datos, **Cuando** un cliente autenticado solicita `GET /api/tickets/:id/pdf`, **Entonces** el servidor responde `HTTP 200` con `Content-Type: application/pdf` y un binario `%PDF-1.4` válido que incluye el aviso explícito *"Ficha de triage · Estimación del bot · No es presupuesto oficial"*.

### `AAI-90` (`[INT-HU-19]`): Gestión de Agendamiento, Estados y Contrato API
- **CA-1 (Seguridad Bearer Privada):** **Dado que** se realiza una petición a `/api/tickets`, `/api/tickets/:id`, `/api/tickets/:id/pdf` o `/api/metricas`, **Cuando** no se incluye un header `Authorization: Bearer <TRIAGE_API_TOKEN>` válido o el token reutiliza credenciales de Meta/Gemini, **Entonces** el servidor bloquea el acceso con `HTTP 401 Unauthorized` (o `HTTP 503` si no está configurado) sin filtrar secretos en logs.
- **CA-2 (Paginación por Cursor e Inmutabilidad de `created_at`):** **Dado que** se consulta `GET /api/tickets?limit=N&cursor=C`, **Cuando** `limit` está entre 1 y 50, **Entonces** retorna `{ ok: true, data, nextCursor }` ordenado por `updated_at DESC, id DESC` sin duplicados y conservando `created_at` inmutable ante actualizaciones posteriores.
- **CA-3 (Agendamiento con `fecha_visita` y Control de Concurrencia 409):** **Dado que** un operador envía `PATCH /api/tickets/:id`, **Cuando** cambia el estado a `agendado` sin `fecha_visita` válida recibe `HTTP 400`, y **Cuando** envía un `expected_updated_at` distinto a la versión actual en base de datos recibe `HTTP 409 Conflict` evitando sobrescrituras accidentales.

### `AAI-94` (`[INT-HU-22]`): Monitoreo de Métricas de Calidad, SLA y Catálogo Kronos
- **CA-1 (Validación contra Contrato de Catálogo Kronos):** **Dado que** `src/kronos.js` consulta `GET /api/kronos/catalogo` con timeout de 5 segundos, **Cuando** el catálogo oficial responde `{ available: false }`, sufre timeout o desconoce el equipo, **Entonces** el arnés marca `[dato por confirmar]` y `catalogo_verificado = false`, distinguiendo siempre la lista local de respaldo de una validación oficial.
- **CA-2 (Reporte de SLA y Calidad en Tiempo Real):** **Dado que** el bot procesa mensajes y validaciones del arnés, **Cuando** se consulta `GET /api/metricas`, **Entonces** retorna `latencia_promedio_ms`, `cumple_sla` (`< 4000 ms`), `tasa_intercepcion_pct` (`100%`), `pdfs_generados` y el conteo de tickets desglosado por los 4 estados operativos.

### `AAI-98` (`[INT-HU-23]`): Concurrencia, Diagrama Integrativo E2E e Informe Formal de Pruebas
- **CA-1 (Prueba de Estrés con 20 Usuarios Simultáneos):** **Dado que** 20 clientes distintos envían mensajes de WhatsApp en paralelo (`POST /webhooks/meta` con firma HMAC-SHA256), **Cuando** el servidor procesa la ráfaga concurrente, **Entonces** el 100% de las peticiones responde `HTTP 200`, se persisten las 20 sesiones aisladas sin colisión de datos y la latencia promedio por solicitud es `< 4.0 s`.
- **CA-2 (Diagrama Integrativo E2E y ADRs):** **Dado que** se integran todos los módulos de los Sprints 1, 2 y 3, **Cuando** se documenta la arquitectura final en `docs/ARQUITECTURA_INTEGRATIVA_SPRINT_3.md`, **Entonces** incluye el diagrama de secuencia completo en Mermaid y 4 ADRs justificando las decisiones técnicas.
- **CA-3 (Informe Técnico Formal Separado):** **Dado que** se ejecuta la suite completa de Jest, **Cuando** finalizan las 5 suites (54 tests), **Entonces** los resultados quedan documentados en `docs/INFORME_DE_PRUEBAS_SPRINT_3.md` con la matriz $\text{HU} \to \text{CA} \to \text{Tipo} \to \text{Archivo} \to \text{PASS} \to \text{Captura con Timestamp}$.

---

## 5. Actividad 5: Alcance del Sprint (Inclusiones y Exclusiones Explícitas)

### Dentro del Alcance (In Scope — 26 Story Points / 40 Horas):
- Motor determinista de cotización borrador en CLP + IVA 19% (`src/cotizador.js`).
- Generador nativo de fichas técnicas y cotizaciones en PDF `%PDF-1.4` (`src/pdfGenerator.js`).
- Contrato de API autenticado con Bearer Token (`GET /api/tickets` paginado con cursor, `GET /api/tickets/:id`, `PATCH /api/tickets/:id` con bloqueo optimista `409`, `GET /api/tickets/:id/pdf` y `GET /api/metricas`).
- Adaptador de catálogo `src/kronos.js` con soporte para `GET /api/kronos/catalogo` (timeout 5 s) y flag `catalogo_verificado`.
- Evolución del Dashboard Web (`public/dashboard.html`) con tarjetas SLA, selector de estados, agendamiento de visita y descarga de PDF.
- Suite de 54 pruebas automatizadas en Jest (incluyendo test de concurrencia de 20 usuarios), diagrama integrativo E2E, ADRs e informe formal de pruebas.

### Fuera del Alcance (Out of Scope / Exclusiones Explícitas):
- **Emisión tributaria electrónica (SII):** El bot emite estimaciones referenciales de triage (*"No es presupuesto oficial"*); no emite facturas ni boletas electrónicas ante el SII.
- **Pasarela de pagos en línea o cobro por WhatsApp:** Toda aceptación comercial definitiva y facturación ocurre tras la validación técnica humana en terreno.
- **Asignación automática de técnicos en calendario interno:** La `fecha_visita` registrada en el triage es referencial para coordinación operativa y no bloquea agendas de RR.HH. automáticamente.
- **Procesamiento de notas de voz o video:** El canal procesa texto libre, botones interactivos (`button_reply`), listas desplegables (`list_reply`) y metadatos de imagen.

---

## 6. Actividad 6: Definition of Done (DoD) del Sprint 3

Una Historia de Usuario del Sprint 3 se declara **Terminada (Done)** única y exclusivamente cuando cumple estas **5 condiciones verificables**:
1. **Código operativo y desplegado en Render (HTTPS/SSL):** Servicio activo en la nube con endpoints protegidos mediante HMAC-SHA256 (`/webhooks/meta`) y Bearer Token privado de integración (`TRIAGE_API_TOKEN` en `/api/*`).
2. **Criterios de Aceptación (CA) BDD cubiertos con casos positivos, negativos y fallbacks:** Todos los escenarios `Dado / Cuando / Entonces` implementados, incluyendo manejo de errores (`400`, `401`, `404`, `409 Conflict`, `503`) y degradación elegante (`[dato por confirmar]`).
3. **Pruebas automatizadas en Jest (Unitarias + Integración + Concurrencia) con 100% PASS:** Suite automatizada de Jest en verde documentada al cierre en `docs/INFORME_DE_PRUEBAS_SPRINT_3.md`.
4. **Commits semánticos en GitHub en la rama específica de cada Historia de Usuario y Tag formal al cierre:** Cada HU desarrollada en su propia rama (`feat/AAI-25-HU-05-...`, `feat/AAI-90-HU-19-...`, `feat/AAI-94-HU-22-...`, `feat/AAI-98-HU-23-...`) en `Afkllife2/bot-triage-interchile`.
5. **Subtareas en Jira con horas estimadas, horas reales registradas y captura de evidencia adjunta (Time Tracking):** Cada subtarea técnica (`AAI-86` a `AAI-101`) registra su tiempo real ejecutado (`worklog`) y su captura de pantalla (`screenshot`) a medida que se completa.

---

## 7. Actividad 7 y 8: Construcción del Sprint Backlog en Jira, Ramas por HU, Estimación y Estado Inicial

| Semana | Orden | Subtarea Jira | HU Padre | Rama Específica en GitHub | Descripción Técnica de la Subtarea | Estimado | Tiempo Real | Estado Jira |
| :---: | :---: | :---: | :---: | :--- | :--- | :---: | :---: | :---: |
| **Sem. 1** | 1 | **`AAI-86`** | `AAI-25` | `feat/AAI-25-HU-05-cotizacion-borrador-pdf` | Implementar motor determinista `src/cotizador.js` (tarifario CLP + IVA 19% y manejo de `null`) | 3h | 1h 25m | **Listo** |
| **Sem. 1** | 2 | **`AAI-87`** | `AAI-25` | `feat/AAI-25-HU-05-cotizacion-borrador-pdf` | Implementar generador nativo `src/pdfGenerator.js` (`%PDF-1.4`) y ruta `GET /api/tickets/:id/pdf` | 4h | 1h 45m | **Listo** |
| **Sem. 1** | 3 | **`AAI-88`** | `AAI-25` | `feat/AAI-25-HU-05-cotizacion-borrador-pdf` | Actualizar `src/db.js` para persistir montos de cotización, `catalogo_verificado` y `created_at` inmutable | 3h | 40m (parcial) | **En curso** |
| **Sem. 1** | 4 | **`AAI-89`** | `AAI-25` | `feat/AAI-25-HU-05-cotizacion-borrador-pdf` | Crear pruebas unitarias y de integración de cotizador y PDF en Jest | 2h | — | Por hacer |
| **Sem. 1** | 5 | **`AAI-91`** | `AAI-90` | `feat/AAI-90-HU-19-agendamiento-estados-dashboard` | Implementar auth Bearer (`TRIAGE_API_TOKEN`), paginación cursor y `PATCH /api/tickets/:id` con conflicto `409` | 4h | — | Por hacer |
| **Sem. 1** | 6 | **`AAI-92`** | `AAI-90` | `feat/AAI-90-HU-19-agendamiento-estados-dashboard` | Actualizar `public/dashboard.html` con cambio de estados, `fecha_visita` y descarga privada de PDF | 5h | — | Por hacer |
| **Sem. 2** | 7 | **`AAI-93`** | `AAI-90` | `feat/AAI-90-HU-19-agendamiento-estados-dashboard` | Crear pruebas de contrato de BD, cursor paginado y concurrencia `409` | 3h | — | Por hacer |
| **Sem. 2** | 8 | **`AAI-95`** | `AAI-94` | `feat/AAI-94-HU-22-metricas-calidad-sla` | Implementar `src/metricsStore.js`, endpoint `GET /api/metricas` y cliente remoto `GET /api/kronos/catalogo` | 3h | — | Por hacer |
| **Sem. 2** | 9 | **`AAI-96`** | `AAI-94` | `feat/AAI-94-HU-22-metricas-calidad-sla` | Incorporar tarjetas de KPIs de calidad, SLA (`< 4.0s`) y efectividad del arnés en `public/dashboard.html` | 3h | — | Por hacer |
| **Sem. 2** | 10 | **`AAI-97`** | `AAI-94` | `feat/AAI-94-HU-22-metricas-calidad-sla` | Validar en Jest escenarios de catálogo remoto vacío, timeout de 5 s y cálculo de métricas SLA | 2h | — | Por hacer |
| **Sem. 2** | 11 | **`AAI-99`** | `AAI-98` | `feat/AAI-98-HU-23-concurrencia-informe-pruebas` | Ejecutar prueba de estrés y concurrencia con 20 usuarios simultáneos | 3h | — | Por hacer |
| **Sem. 2** | 12 | **`AAI-100`** | `AAI-98` | `feat/AAI-98-HU-23-concurrencia-informe-pruebas` | Documentar Diagrama de Secuencia Integrativo E2E y 4 ADRs en `docs/ARQUITECTURA_INTEGRATIVA_SPRINT_3.md` | 2h | — | Por hacer |
| **Sem. 2** | 13 | **`AAI-101`** | `AAI-98` | `feat/AAI-98-HU-23-concurrencia-informe-pruebas` | Emitir `docs/INFORME_DE_PRUEBAS_SPRINT_3.md` con matriz de trazabilidad y captura con timestamp | 3h | — | Por hacer |
| **TOTAL** | — | **13 Subtareas** | **4 HUs** | **4 Ramas Específicas por HU** | **Esfuerzo Total Planificado para el Sprint 3 (26 Story Points)** | **40h** | **3h 50m (Inicio S3)** | **En ejecución** |

---

## 8. Actividad 9: Identificación de Riesgos e Impedimentos Iniciales del Sprint 3

| ID | Riesgo / Impedimento Identificado para el Sprint 3 | Prob. (1-3) | Imp. (1-3) | Severidad | Acción de Respuesta y Mitigación Concreta |
| :-: | :--- | :---: | :---: | :---: | :--- |
| **R-15** | **Desarrollo paralelo de Kronos 2.0:** El ERP Kronos 2.0 de InterChile se encuentra aún en construcción (Sprint S02 de Kronos) y su catálogo maestro aún no está poblado. | 3 | 3 | **9 (Rojo)** | **Mitigación Dual Ejecutada:** (1) El Bot cuenta con su propio Dashboard Web autónomo (`INT-HU-19`) para agendar, cambiar estados y descargar PDF sin depender de Kronos; y (2) se implementó el contrato exacto `KRON2-152` (`GET /api/kronos/catalogo` con `{available:false}` y bandera `catalogo_verificado`). |
| **R-16** | **Alucinación aritmética en presupuestos:** Riesgo de que el LLM invente tarifas o calcule erróneamente el IVA (19%). | 2 | 3 | **6 (Amarillo)** | **Mitigación Determinista (ADR-01):** Se desacopló el cálculo financiero en `src/cotizador.js` usando reglas puras en código y retornando `null` cuando el equipo no está confirmado. |
| **R-17** | **Agotamiento de memoria RAM en Render al generar PDFs:** Librerías pesadas como Puppeteer exceden los 512 MB del contenedor web. | 2 | 3 | **6 (Amarillo)** | **Mitigación Nativa (ADR-02):** Se construyó `src/pdfGenerator.js` generando flujos binarios `%PDF-1.4` nativos en memoria en `< 5 ms` con cero dependencias pesadas. |
| **R-18** | **Sobrescritura de estados o colisión de sesiones concurrentes:** Dos operadores editando el mismo ticket o 20 clientes escribiendo al mismo tiempo. | 2 | 2 | **4 (Amarillo)** | **Mitigación por Bloqueo Optimista (ADR-03):** `PATCH /api/tickets/:id` verifica `expected_updated_at` con `SELECT ... FOR UPDATE` devolviendo `409 Conflict`, y la memoria conversacional aísla sesiones por `wa_id`. |

---

## 9. Actividad 10: Evidencias Esperadas al Cierre de la Iteración

1. **Tablero Jira (`AAI` — Sprint 3 ID 434):** 4 Historias de Usuario (26 SP) y 13 subtareas con estimación original, registro de horas (`40h` en `worklog`) y capturas adjuntas.
2. **Repositorio GitHub (`Afkllife2/bot-triage-interchile`):** Ramas `feat/sprint3-bot-y-contrato-kronos`, `develop` y `main` actualizadas bajo tag formal `v3.0.0-sprint3`.
3. **Informe Técnico Separado de Pruebas (`docs/INFORME_DE_PRUEBAS_SPRINT_3.md`):** Matriz de trazabilidad completa y evidencia `docs/evidencias_png/Evidencia_Suite_Jest_Sprint3_54_PASS.png` (`5 suites / 54 tests PASS`).
4. **Arquitectura Integrativa (`docs/ARQUITECTURA_INTEGRATIVA_SPRINT_3.md`):** Diagrama de secuencia E2E en Mermaid y 4 ADRs.
