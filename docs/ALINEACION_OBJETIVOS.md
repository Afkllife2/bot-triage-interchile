# Matriz de Consistencia: Objetivos del Proyecto vs Meta del Sprint

Este documento establece la trazabilidad formal y metodológica entre los objetivos declarados en el Documento de Proyecto (Tesis) y la Meta del Sprint 1, permitiendo medir el progreso objetivo del desarrollo y su alineación con el problema de negocio de InterChile.

---

## 1. Objetivos Formales del Proyecto de Tesis

**Objetivo General:**
Desarrollar e implementar un Agente Conversacional inteligente enfocado en el pre-diagnóstico técnico y perfilamiento comercial para la empresa InterChile, con el fin de automatizar el proceso de *intake*, estructurar la captura de requerimientos de climatización y optimizar la derivación a técnicos humanos.

**Objetivos Específicos:**
1. **Analizar y Modelar los Flujos de Triage (Intake):** Definir reglas de negocio y árboles de decisión dinámicos para clasificar motivos de contacto (falla, mantención, cotización) y niveles de prioridad (normal, urgente, equipo detenido).
2. **Diseñar la Arquitectura de Datos y Estado:** Estructurar el backend (Node.js) y la base de datos relacional (Supabase) para almacenar "Fichas de Caso" completas, incluyendo metadatos del cliente, síntomas del equipo y validación multimedia.
3. **Desarrollar el Motor de Procesamiento Semántico (IA):** Implementar modelos de lenguaje (Gemini) para extraer información estructurada (dirección, marca, problema, disponibilidad) a partir de conversaciones naturales.

---

## 2. Meta del Sprint 1 (Sprint Goal)

**Meta del Sprint 1:**  
"Construir la infraestructura base del sistema y desarrollar el MVP funcional del motor de Triage IA, logrando que el sistema sea capaz de recibir un mensaje vía WhatsApp, procesarlo mediante Inteligencia Artificial para extraer sus parámetros clave (clasificando su prioridad) y almacenarlo persistentemente en la base de datos, entregando además una respuesta automática al cliente."

---

## 3. Matriz de Alineación y Medición de Consistencia

La siguiente tabla demuestra cómo el trabajo realizado en el Sprint 1 aborda y da cumplimiento parcial o total a los objetivos de la tesis.

| Meta del Sprint 1 (Logro) | Aborda directamente el Objetivo de Tesis | Justificación Metodológica de la Consistencia |
| :--- | :--- | :--- |
| **Integración de Webhooks WhatsApp Inbound/Outbound** | Objetivo Específico 1 (Flujos de Intake) | Proveer la plataforma de entrada y respuesta automática para capturar la necesidad del usuario, reemplazando la barrera manual de entrada. |
| **Modelado de BD Supabase y Entorno Node.js** | Objetivo Específico 2 (Arquitectura de Datos) | La meta del Sprint exigía "almacenar persistentemente en base de datos". Esto forzó el diseño de las tablas relacionales (`casos_triage`, `clientes`), cumpliendo directamente este objetivo. |
| **Implementación de IA (Gemini 2.5 Flash)** | Objetivo Específico 3 (Motor Semántico) | Se desarrolló el módulo `brain.js`, el cual es el núcleo semántico exigido por el objetivo 3, logrando extraer comuna, tipo de equipo y falla desde lenguaje natural. |
| **Validación de Prioridad (Normal vs Urgente)** | Objetivo Específico 1 (Flujos de Triage) | El Sprint Goal exigía "clasificar su prioridad". La IA fue instruida con System Prompts para diferenciar equipos comerciales caídos vs domiciliarios preventivos. |

### Conclusión de Consistencia
La **Meta del Sprint 1** es 100% consistente con la visión del proyecto. En lugar de abarcar todo el desarrollo de una sola vez, la meta fraccionó el **Objetivo General** en un incremento funcional medible (El esqueleto base + IA), atacando simultáneamente los fundamentos de los tres **Objetivos Específicos** sin comprometer entregables fuera de alcance (ej. ERP Kronos o Dashboard, que pertenecen a los siguientes Sprints).
