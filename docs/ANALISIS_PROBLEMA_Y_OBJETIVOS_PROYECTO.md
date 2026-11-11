# Análisis del Problema, Objetivo General y Objetivos Específicos del Proyecto

**Proyecto de Título:** Agente Autónomo de Triage Comercial e Integración ERP Kronos  
**Empresa Contraparte:** InterChile Climatización  
**Estudiante:** Carlos Gabriel González Salgado  
**Profesora Metodológica:** Sarita González Catalán  
**Profesor Guía Técnico:** Matías Vargas  
**Documento para:** Informe de Proyecto de Título / Defensa Metodológica  

---

## 1. Contexto de Negocio y Operacional

**InterChile Climatización** es una empresa chilena especializada en soluciones integrales de climatización, aire acondicionado, refrigeración comercial e industrial, y proyectos térmicos (atendiendo tanto a clientes residenciales como corporativos: clínicas, oficinas, retail y plantas industriales).

El canal prioritario de primer contacto con clientes y prospectos es la mensajería instantánea a través de **WhatsApp Business**. A través de este canal ingresan diariamente decenas de solicitudes con distintos niveles de urgencia:
- Falla técnica crítica (ej. servidor o clínica dental sin refrigeración con equipo detenido).
- Mantenciones preventivas y correctivas periódicas.
- Suministro e instalación de unidades nuevas.
- Cotizaciones de proyectos y arriendo de equipos.
- Consultas generales de disponibilidad.

---

## 2. Análisis del Problema

### 2.1 Planteamiento y Definición del Problema Central

> **Problema Central:**  
> *"Ineficiencia, lentitud y asimetría de información en el proceso de captura, pre-diagnóstico técnico y derivación de solicitudes comerciales de climatización a través de canales de mensajería (WhatsApp), generando retrasos en la atención, sobrecarga administrativa y riesgo de pérdida de clientes corporativos."*

---

### 2.2 Diagnóstico Causa-Efecto (Técnica de los 5 Porqués y Árbol de Problemas)

#### Causas Raíz Identificadas:
1. **Causa Tecnológica (Falta de Automatización Inteligente 24/7):**
   - No existe un mecanismo de atención automática capaz de comprender lenguaje natural y entablar un diálogo técnico con el cliente.
   - *¿Por qué?* Porque los canales tradicionales se limitaban a chatbots rígidos de opciones fijas o a la espera pasiva de un operador humano.
2. **Causa Operativa (Sobrecarga de Personal Especializado):**
   - Los ejecutivos comerciales y el gerente técnico deben destinar entre un 40% y 60% de su jornada laboral a realizar preguntas rutinarias y repetitivas (marca, modelo, tipo de equipo, dirección, síntomas y fotografías) antes de poder evaluar técnicamente el caso.
   - *¿Por qué?* El cliente promedio no describe su problema con precisión técnica en su primer mensaje (ej. escribe *"el aire no enfría"* o *"el aparato blanco gotea"*).
3. **Causa de Integración de Sistemas (Desconexión WhatsApp $\leftrightarrow$ ERP):**
   - La información recolectada en el chat de WhatsApp queda dispersa en el teléfono del operador, requiriendo transcripción manual a la base de datos o al sistema ERP Kronos.
   - *¿Por qué?* No existía una capa de integración API segura que transforme conversaciones no estructuradas en registros normalizados e inmutables.
4. **Causa de Calidad y Fiabilidad en IA (Riesgo de Alucinaciones):**
   - La adopción de un modelo LLM sin restricciones conlleva el riesgo de que la IA invente marcas, modelos, repuestos o precios inexistentes en el mercado chileno.
   - *¿Por qué?* Los modelos generativos son probabilísticos y requieren arneses deterministas que cotejen sus salidas contra el inventario y catálogo real de la empresa antes de interactuar con el cliente.

#### Efectos y Consecuencias en el Negocio:
- **Tiempos de respuesta lentos:** Clientes esperan entre 4 y 12 horas para recibir una primera orientación o presupuesto preliminar.
- **Pérdida de prospectos comerciales:** En servicios comerciales y de emergencia, los clientes corporativos cotizan simultáneamente con la competencia si no reciben una respuesta inmediata.
- **Diagnósticos preliminares incompletos:** Técnicos enviados a terreno sin los repuestos adecuados o sin claridad del tipo de equipo (Split vs Cassette vs Chiller), encareciendo los costos de visita y traslados fallidos.
- **Falta de trazabilidad y métricas:** Ausencia de indicadores de SLA (Service Level Agreement), tiempos de atención y estado de conversión de prospectos a órdenes de trabajo.

---

## 3. Objetivo General del Proyecto

> **"Diseñar, desarrollar e implementar un Agente Autónomo Conversacional de Triage Comercial integrado al sistema ERP Kronos para la empresa InterChile Climatización, capaz de procesar requerimientos en lenguaje natural vía WhatsApp, realizar pre-diagnósticos técnicos con arneses anti-alucinaciones, generar borradores deterministas de cotización en PDF y clasificar la prioridad operativa para optimizar los tiempos de respuesta y la gestión en terreno."**

---

## 4. Objetivos Específicos del Proyecto

Los objetivos específicos responden a las fases de ingeniería de software del proyecto y garantizan la resolución de cada causa identificada:

1. **Objetivo Específico 1 (Análisis y Modelado de Flujos de Triage):**  
   *Analizar y formalizar los flujos conversacionales de admisión técnica (intake), la taxonomía de equipos de climatización (Split, Cassette, Ducto, Piso-Techo, Chiller, VRV) y las reglas de negocio para clasificar automáticamente el motivo de solicitud y nivel de prioridad (Alta, Normal, Baja).*

2. **Objetivo Específico 2 (Arquitectura Cognitiva y Arneses de Control):**  
   *Diseñar e implementar el motor cognitivo basado en Large Language Models (LLM) con memoria conversacional multi-turno y arneses algorítmicos anti-alucinaciones, asegurando la validación del diagnóstico contra el catálogo del ERP Kronos y neutralizando datos no confirmados.*

3. **Objetivo Específico 3 (Motor Determinista de Cotización y Fichas PDF):**  
   *Construir un módulo de estimación comercial desacoplado del LLM que calcule con exactitud matemática el subtotal neto, IVA chileno (19%) y total en pesos chilenos (CLP), generando automáticamente una ficha técnica descargable en formato PDF estándar para respaldar la atención al cliente.*

4. **Objetivo Específico 4 (Integración, Plataforma de Gestión y Validación de Calidad):**  
   *Integrar el sistema con la API de WhatsApp Cloud (Meta) y el contrato del ERP Kronos 2.0 mediante autenticación Bearer segura, implementando un panel web administrativo con monitoreo de métricas de SLA ($< 4.0\text{ s}$) y validando la robustez del sistema mediante pruebas de estrés y concurrencia ($N=20$).*

---

## 5. Matriz de Coherencia Metodológica (Problema $\to$ Objetivos $\to$ Sprint 3)

| Causa del Problema | Abordada por Objetivo Específico | Entregable en el Sprint 3 | Verificación en Pruebas (Jest) |
| :--- | :--- | :--- | :--- |
| **Falta de pre-diagnóstico y captura manual lenta** | **OE 1 & OE 2:** Motor IA con memoria conversacional | `src/brain.js` (Extracción estructurada con Gemini y LangChain) | `test/interchile.test.js` (Priorización Alta/Baja, botones interactivos) |
| **Riesgo de alucinaciones de marcas o repuestos** | **OE 2:** Arneses de validación contra catálogo Kronos | `src/arneses.js` + `src/kronos.js` (Detección de alucinaciones y fallback) | `test/arneses.test.js` (100% intercepción alucinaciones) |
| **Cálculo manual de precios y demora en presupuesto** | **OE 3:** Cotizador determinista CLP + Ficha PDF | `src/cotizador.js` + `src/pdfGenerator.js` (Tarifario e IVA 19%) | `test/sprint3.test.js` (Cálculo exacto, generación `%PDF-1.4`) |
| **Desconexión WhatsApp-ERP y falta de visibilidad** | **OE 4:** Contrato API segura, Dashboard y SLA | `src/server.js`, `src/db.js`, `public/dashboard.html` y `src/metricsStore.js` | `test/sprint3.test.js` & `test/db-contrato.test.js` (Paginación cursor, 409 Conflict, Estrés 20 usuarios) |
