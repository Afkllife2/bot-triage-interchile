# Matriz de Consistencia: Análisis del Problema, Objetivos del Proyecto y Metas de los Sprints (Sprints 1, 2 y 3)

Este documento establece la trazabilidad formal y metodológica entre el **Análisis del Problema**, el **Objetivo General**, los **4 Objetivos Específicos** declarados en el Informe de Proyecto de Título y las **Metas de los Sprints 1, 2 y 3**, permitiendo auditar la coherencia integral del desarrollo para **InterChile Climatización**.

---

## 1. Síntesis del Problema de Negocio (InterChile Climatización)

- **Problema Central:** Ineficiencia, alta latencia (4 a 12 horas) y pérdida de trazabilidad en el proceso de admisión (*intake*), pre-diagnóstico técnico y cotización preliminar de solicitudes de climatización recibidas vía WhatsApp Business en InterChile Climatización.
- **Causa Raíz Tecnológica (5 Porqués):** Inexistencia de una plataforma automatizada de Triage Comercial que combine procesamiento semántico multi-turno (LLM) con arneses deterministas conectados al catálogo del ERP Kronos, motor de cotización exacta en CLP y generación automatizada de fichas técnicas en PDF.

---

## 2. Objetivos Formales del Proyecto de Título (Actualizados al Cierre Sprint 3)

### Objetivo General
> *"Diseñar, desarrollar e implementar un Agente Autónomo Conversacional de Pre-Diagnóstico Técnico y Triage Comercial integrado al ecosistema ERP Kronos para la empresa InterChile Climatización, mediante modelos de lenguaje (Gemini), arneses deterministas anti-alucinaciones y un motor de cotización referencial en PDF, con el fin de automatizar la captura estructurada de requerimientos vía WhatsApp, priorizar urgencias operativas y reducir los tiempos de atención al cliente."*

### Objetivos Específicos
1. **OE 1 (Flujos de Triage e Interacción Guiada):** Analizar y modelar los flujos conversacionales de admisión técnica y perfilamiento comercial, implementando recepción segura de webhooks de WhatsApp Cloud API, menús interactivos para las 7 líneas de servicio de InterChile y reglas de clasificación automática de prioridad (Alta, Normal, Baja) y derivación a ejecutivo humano.
2. **OE 2 (Motor Semántico Multi-Turno y Arneses Anti-Alucinaciones):** Diseñar e implementar el motor de procesamiento semántico con memoria conversacional multi-turno (LangChain + Google Gemini 2.5 Flash + Zod) y arneses algorítmicos de validación contra el catálogo del ERP Kronos, asegurando la intercepción y sanitización de marcas, tipos de equipo o repuestos no verificados.
3. **OE 3 (Persistencia Relacional, Cotizador Determinista CLP y Ficha PDF):** Desarrollar la capa de persistencia transaccional en PostgreSQL (Supabase), el motor determinista de borrador de cotización en pesos chilenos (Subtotal Neto + IVA 19% + Total CLP) y el generador nativo de fichas técnicas en formato PDF estándar (`%PDF-1.4`) para formalizar las estimaciones preliminares sin riesgo de alucinación aritmética.
4. **OE 4 (Integración ERP Kronos 2.0, Dashboard Operativo y Validación de SLA):** Implementar la interfaz web administrativa de gestión y contingencia operativa (Dashboard Web) junto con el contrato de API autenticado para el ERP Kronos 2.0 (`KRON2-152`), validando el cumplimiento de atributos de calidad (latencia SLA y concurrencia) mediante una suite automatizada de pruebas unitarias, de integración y de estrés.

---

## 3. Evolución de las Metas por Iteración (Sprint Goals)

### Meta del Sprint 1 (Hito 1 — MVP Funcional Base)
> *"Construir la infraestructura base del sistema y desarrollar el MVP funcional del motor de Triage IA, logrando que el sistema sea capaz de recibir un mensaje vía WhatsApp, procesarlo mediante Inteligencia Artificial para extraer sus parámetros clave (clasificando su prioridad) y almacenarlo persistentemente en la base de datos, entregando además una respuesta automática al cliente."*

### Meta del Sprint 2 (Hito 2 — Diagnóstico Multi-Turno, Arneses Kronos y Producción Cloud 24/7)
> *"Evolucionar el bot de triage de un clasificador básico a un asistente conversacional inteligente en producción 24/7 (Render), capaz de hacer diagnósticos dinámicos multi-turno con menús interactivos en WhatsApp, validar equipos y repuestos contra el catálogo Kronos mediante arneses deterministas anti-alucinaciones y derivar casos críticos a ejecutivos humanos con visibilidad en tiempo real desde un panel web de administración."*

### Meta del Sprint 3 (Hito 3 — Cotización PDF, Agendamiento, Contrato Kronos 2.0 y Calidad SLA)
> *"Meta verificable: Consolidar el cierre operativo con generación de cotizaciones PDF, agendamiento en Dashboard (Contingencia R-15) y monitoreo de calidad. Indicadores de éxito: (1) Latencia promedio < 4.0s, (2) 100% generación PDF exitosa, (3) 100% alucinaciones bloqueadas por arnés, (4) >99% éxito en tests de concurrencia (20 usuarios)."*

---

## 4. Matriz de Alineación y Medición de Consistencia (Sprints 1, 2 y 3)

| Incremento / Logro Técnico | Sprint | Objetivo Específico Abordado | Evidencia Verificable en el Repositorio |
| :--- | :---: | :--- | :--- |
| **Webhook WhatsApp con validación HMAC-SHA256 y menús interactivos (7 servicios)** | S1 / S2 | **OE 1** (Flujos de Intake e Interacción) | `src/server.js`, `src/whatsapp.js`, `test/integracion.test.js` |
| **Motor IA con memoria multi-turno (`gemini-2.5-flash` + Zod) y derivación a humano** | S1 / S2 | **OE 1 & OE 2** (Motor Semántico) | `src/brain.js`, `test/interchile.test.js` |
| **Arnés anti-alucinaciones y contrato remoto `GET /api/kronos/catalogo` (`catalogo_verificado`)** | S2 / S3 | **OE 2** (Arneses de Control IA) | `src/arneses.js`, `src/kronos.js`, `test/arneses.test.js`, `test/sprint3.test.js` |
| **Cotizador determinista CLP (Neto + IVA 19%) y generador nativo `%PDF-1.4`** | S3 | **OE 3** (Cotización y Ficha PDF) | `src/cotizador.js`, `src/pdfGenerator.js`, `test/sprint3.test.js` (`AAI-25`) |
| **Contrato API Bearer (`TRIAGE_API_TOKEN`), cursor `updated_at+id`, `PATCH` 409 y Dashboard** | S2 / S3 | **OE 3 & OE 4** (Integración y Gestión) | `src/db.js`, `src/server.js`, `public/dashboard.html`, `test/db-contrato.test.js` (`AAI-90`) |
| **Monitoreo de SLA (`< 4.0s`), test de concurrencia ($N=20$) e Informe Formal (`54/54 PASS`)** | S3 | **OE 4** (Calidad y Validación Integral) | `src/metricsStore.js`, `docs/INFORME_DE_PRUEBAS_SPRINT_3.md` (`AAI-94`, `AAI-98`) |
