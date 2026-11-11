# Documento de Sprint Planning — Sprint 3 (Cierre de Titulación)

**Proyecto:** Agente Autónomo de Triage Comercial e Integración ERP Kronos  
**Empresa Contraparte:** InterChile Climatización  
**Alumno:** Carlos Gabriel González Salgado  
**Profesora Metodológica:** Sarita González Catalán  
**Profesor Guía Técnico:** Matías Vargas  
**Período de Ejecución:** 09 de noviembre al 20 de noviembre de 2026  
**Duración del Sprint:** 2 semanas (10 días hábiles)  
**Herramienta de Gestión:** Jira Software (`AAI` - Board 202, Sprint 3 ID: 434)  

---

## 1. Sprint Goal (Meta Cuantitativa, Medible y Verificable)

> **"Consolidar el cierre operativo del Agente de Triage Comercial mediante la generación determinista de borradores de cotización y fichas técnicas en PDF, la gestión de agendamiento y estados en el Dashboard Web (Contingencia R-15), la integración al contrato del ERP Kronos 2.0 y el monitoreo en tiempo real de métricas de calidad y SLA. El éxito de la iteración se evalúa cuantitativamente mediante 4 indicadores verificables:"**

### Indicadores Clave de Éxito del Sprint 3:
1. **Latencia promedio de respuesta del bot:** $< 4.0\text{ s}$ en el pipeline end-to-end bajo condiciones normales de red.
2. **Efectividad anti-alucinaciones (Arnés Kronos):** $100\%$ de detección y neutralización de marcas, modelos o repuestos no verificados, reemplazándolos por `[dato por confirmar]`.
3. **Resistencia a la concurrencia y estrés:** Tasa de éxito $> 99\%$ sobre ráfagas de 20 usuarios simultáneos en el Webhook de WhatsApp sin colisiones de sesión ni pérdida de datos.
4. **Disponibilidad y generación de fichas PDF:** Tasa de éxito del $100\%$ en la emisión y descarga de documentos `%PDF-1.4` generados en memoria ($< 5\text{ ms}$).

---

## 2. Capacidad del Equipo y Estimación del Esfuerzo

- **Desarrollador Responsable:** Carlos González (`CG` - Full Stack Developer / Ingeniero de Software).
- **Dedicación Neta:** 20 horas semanales $\times$ 2 semanas = **40 horas de desarrollo e ingeniería**.
- **Puntos de Historia Comprometidos:** **26 Story Points (SP)** distribuidos en 4 Historias de Usuario.
- **Subtareas Técnicas:** 13 subtareas desglosadas con horas estimadas y vinculadas a criterios de aceptación BDD.

---

## 3. Sprint Backlog Comprometido (Historias de Usuario y Subtareas)

### Historia 1: `AAI-25` (`[INT-HU-05]`)
**Título:** Generación de Borrador de Cotización y Ficha Técnica en PDF  
**Estimación:** 8 Story Points | 12 Horas  
**Enfoque Usuario:** *Como ejecutivo de ventas de InterChile, quiero que el bot genere un borrador de cotización referencial con IVA y una ficha técnica descargable en PDF, para entregar una estimación rápida al cliente sin errores de cálculo manual.*  

- **Criterios de Aceptación (BDD):**
  - **CA-1 (Cálculo Determinista):** Dado un caso de triage con tipo de solicitud (`Mantención`, `Falla Técnica`, etc.) y equipo clasificado (`Split`, `Cassette`, etc.), cuando se calcula la cotización, entonces el sistema calcula automáticamente subtotal neto, IVA (19%) y total CLP sin alucinaciones numéricas.
  - **CA-2 (Manejo de Incertidumbre):** Dado un equipo no reconocido o marcado como `[dato por confirmar]`, cuando se evalúa la cotización, entonces el sistema retorna `null` en los importes y rotula *"Sin estimación"*, evitando suponer costos en cero.
  - **CA-3 (Ficha Técnica PDF):** Dado un ticket registrado, cuando el operador solicita su descarga, entonces el servidor entrega un documento `%PDF-1.4` con los datos del cliente, falla, equipo, sello *"Estimación del bot · No oficial"* y descarga autorizada.

- **Desglose de Subtareas en Jira:**
  - `AAI-86` (3h): Implementación del motor determinista `src/cotizador.js` (tarifario CLP e IVA 19%).
  - `AAI-87` (4h): Implementación del generador nativo en memoria `src/pdfGenerator.js` y endpoint `/api/tickets/:id/pdf`.
  - `AAI-88` (3h): Persistencia en base de datos (`cotizacion_neto`, `cotizacion_iva`, `cotizacion_total`, `catalogo_verificado`) en `src/db.js`.
  - `AAI-89` (2h): Pruebas unitarias y de integración de cotización y PDF en Jest (`100% PASS`).

---

### Historia 2: `AAI-90` (`[INT-HU-19]`)
**Título:** Gestión de Agendamiento, Estados y Descarga de PDF en Dashboard Web  
**Estimación:** 8 Story Points | 12 Horas  
**Enfoque Usuario:** *Como coordinador de operaciones de InterChile, quiero gestionar el estado de los tickets, asignar fecha de visita técnica y descargar la ficha PDF desde el Dashboard protegido, para coordinar la atención en terreno cuando Kronos esté en mantención o fuera de línea (Contingencia R-15).*  

- **Criterios de Aceptación (BDD):**
  - **CA-1 (Autenticación Bearer):** Dado un operador o sistema externo que accede a `/api/tickets*`, cuando realiza la petición sin credenciales o con credencial inválida, entonces el servidor responde `401 Unauthorized` o `503` si la integración no está configurada, protegiendo los datos del cliente.
  - **CA-2 (Paginación Cursor Estable):** Dado un volumen creciente de tickets, cuando se consulta la bandeja paginada, entonces el sistema pagina mediante cursor `updated_at+id` (`limit` 1–50) sin duplicados ni omisiones.
  - **CA-3 (Transición de Estados y Conflicto Concurrente):** Dado un operador que modifica un ticket a `agendado`, cuando envía los datos, entonces el sistema exige obligatoriamente `fecha_visita` en formato ISO UTC (`400`) y rechaza con `409 Conflict` si otro usuario modificó el ticket previamente.

- **Desglose de Subtareas en Jira:**
  - `AAI-91` (4h): Endpoints protegidos `GET /api/tickets`, `GET /api/tickets/:id` y `PATCH /api/tickets/:id` con paginación cursor y conflicto 409.
  - `AAI-92` (5h): Interfaz en `public/dashboard.html` con selectores de estado, modal de agendamiento de fecha y descarga PDF.
  - `AAI-93` (3h): Pruebas automatizadas de concurrencia optimista, estados e inmutabilidad de fechas en Jest (`100% PASS`).

---

### Historia 3: `AAI-94` (`[INT-HU-22]`)
**Título:** Monitoreo de Métricas de Calidad y Cumplimiento de SLA en Dashboard  
**Estimación:** 5 Story Points | 8 Horas  
**Enfoque Usuario:** *Como supervisor técnico de InterChile, quiero visualizar en tiempo real los indicadores de latencia SLA, tasa de intercepción del arnés y estado de casos, para verificar la confiabilidad y desempeño del asistente antes del despliegue masivo.*  

- **Criterios de Aceptación (BDD):**
  - **CA-1 (Contrato Catálogo Kronos):** Dado el arnés de IA, cuando consulta `GET /api/kronos/catalogo` con timeout de 5 s, entonces distingue entre validación oficial Kronos (`catalogo_verificado: true`) y respaldo local (`catalogo_verificado: false`), marcando `[dato por confirmar]` si Kronos no está disponible.
  - **CA-2 (Métricas SLA en Tiempo Real):** Dado el flujo de mensajería, cuando se atienden clientes, entonces el almacén en memoria registra la latencia de cada request y el endpoint `GET /api/metricas` calcula el promedio, verificando el cumplimiento del umbral SLA $< 4000\text{ ms}$.

- **Desglose de Subtareas en Jira:**
  - `AAI-95` (3h): Módulo `src/metricsStore.js` y endpoint protegido `GET /api/metricas`.
  - `AAI-96` (3h): Visualización de métricas en tarjetas interactivas de `public/dashboard.html`.
  - `AAI-97` (2h): Pruebas unitarias de catálogo, timeout y cálculo de SLA en Jest (`100% PASS`).

---

### Historia 4: `AAI-98` (`[INT-HU-23]`)
**Título:** Validación de Concurrencia, Diagrama Integrativo E2E e Informe Formal de Pruebas  
**Estimación:** 5 Story Points | 8 Horas  
**Enfoque Usuario:** *Como evaluador del proyecto de título, quiero disponer de un informe formal de pruebas con matriz de trazabilidad estricta y pruebas de estrés con múltiples usuarios simultáneos, para verificar la robustez técnica y rigor metodológico exigido para el cierre de titulación.*  

- **Criterios de Aceptación (BDD):**
  - **CA-1 (Prueba de Estrés 20 Usuarios):** Dado un escenario de alta demanda, cuando se envían 20 solicitudes simultáneas al webhook, entonces el 100% responde HTTP 200, no hay cruce de sesiones de chat y la latencia promedio es $< 4.0\text{ s}$.
  - **CA-2 (Diagrama E2E y ADRs):** Dado el cierre de arquitectura, cuando se documenta el sistema, entonces se emite un diagrama de secuencia integrativo en Mermaid y los Registros de Decisiones de Arquitectura (ADRs).
  - **CA-3 (Informe Formal de Pruebas):** Dado el fin de la iteración, cuando se consolidan las pruebas, entonces se genera `docs/INFORME_DE_PRUEBAS_SPRINT_3.md` con trazabilidad $\text{HU} \to \text{CA} \to \text{Test} \to \text{PASS} \to \text{Captura con Timestamp}$.

- **Desglose de Subtareas en Jira:**
  - `AAI-99` (3h): Test de estrés y concurrencia con 20 usuarios simultáneos en `test/sprint3.test.js`.
  - `AAI-100` (3h): Elaboración de `docs/ARQUITECTURA_INTEGRATIVA_SPRINT_3.md` (Diagrama E2E y ADRs).
  - `AAI-101` (2h): Consolidación de `docs/INFORME_DE_PRUEBAS_SPRINT_3.md` y evidencias con timestamp.

---

## 4. Definition of Done (DoD) Aplicable

Una Historia de Usuario se da por **Terminada (Done)** si y solo si cumple:
1. **Código operativo y desplegado en Render (HTTPS/SSL):** Endpoints protegidos con HMAC-SHA256 y Bearer Token privado de integración.
2. **Criterios de Aceptación BDD cubiertos:** Escenarios positivos, negativos y fallbacks validados.
3. **Pruebas automatizadas en Jest con 100% PASS:** 5 suites / 54 tests en verde sin omisiones.
4. **Commits semánticos y Tag de release en GitHub:** Trazabilidad en repositorio oficial (`Afkllife2/bot-triage-interchile`).
5. **Subtareas en Jira con Time Tracking:** 13 subtareas con estimación y horas reales registradas.
