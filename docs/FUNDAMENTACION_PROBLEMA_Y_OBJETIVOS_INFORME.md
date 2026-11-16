# Fundamentación del Problema, Objetivos y Alcance del Proyecto (Avance de Informe — Portafolio de Título)

**Universidad:** Universidad Andrés Bello — Facultad de Ingeniería (Escuela de Ingeniería en Computación e Informática)  
**Estudiante:** Carlos Gabriel González Salgado  
**Profesora Metodológica:** Sarita González Catalán  
**Profesor Guía Técnico:** Matías Vargas  
**Proyecto:** Agente Autónomo Conversacional de Pre-Diagnóstico Técnico y Triage Comercial Integrado al Sistema ERP Kronos para InterChile Climatización  
**Fecha:** Noviembre de 2026  

---

## 1. Introducción

La incorporación de canales digitales de mensajería instantánea ha transformado la relación comercial entre empresas de servicios técnicos y sus clientes. En mercados con alta adopción móvil como Chile, aplicaciones como WhatsApp superan el 90% de penetración entre usuarios de internet y se consolidan como la vía principal de contacto directo con las empresas (DataReportal, 2025; SUBTEL, 2025). Según estudios globales de mensajería comercial, el 73,3% de los consumidores prefiere comunicarse con negocios mediante mensajería instantánea y el 72,4% muestra mayor disposición a concretar una compra cuando dispone de este canal (Meta & Kantar, 2026).

No obstante, cuando la atención inicial por chat se gestiona de forma manual y sin captura estructurada, el volumen de consultas ambiguas genera demoras operativas, sobrecarga del personal técnico y pérdida de oportunidades comerciales. El presente proyecto aborda esta problemática en **InterChile Climatización** mediante el diseño e implementación de un agente autónomo de pre-diagnóstico técnico y triage comercial integrado a WhatsApp Business, modelos de lenguaje (LLM) con arneses de validación determinista contra el ERP **Kronos 2.0**, motor de cotización preliminar en formato PDF, panel web de administración y agendamiento de atenciones y reuniones comerciales.

---

## 2. Fundamentación del Problema

### 2.1. Contexto

El sector de climatización comercial, residencial e industrial (sistemas *Split*, *Cassette*, *Piso-Techo*, *Ducto*, *Chiller* y *VRV/VRF*) opera sobre requerimientos altamente sensibles al tiempo de respuesta y a la precisión técnica. De acuerdo con el estándar **ANSI/ASHRAE/ACCA 180-2018**, la inspección y mantención sistemática de sistemas HVAC resulta indispensable para prevenir la degradación operativa y las detenciones no planificadas (ASHRAE, 2018). En la misma línea, la guía *Operations & Maintenance Best Practices* del Departamento de Energía de Estados Unidos (U.S. DOE / FEMP) documenta que una gestión de mantenimiento meramente reactiva —dependiente de reparaciones de emergencia— incrementa los costos de horas extraordinarias, repuestos urgentes y desperdicio energético, mientras que programas preventivos estructurados permiten ahorros energéticos de entre un **5% y 20%** y reducciones de **8% a 12%** en costos totales de mantenimiento (U.S. Department of Energy [DOE/FEMP], s. f.).

En paralelo, el comportamiento del cliente chileno confirma que WhatsApp es el canal dominante de comunicación cotidiana y comercial: la Duodécima y Undécima Encuesta sobre Acceso y Usos de Internet de la Subsecretaría de Telecomunicaciones reportan niveles históricos de conectividad en hogares cercanos al 96,5%, ubicando a la mensajería instantánea por WhatsApp como una de las actividades digitales más utilizadas a nivel nacional (SUBTEL, 2025). En esta misma línea, el informe *The State of Business Messaging* (sobre 11.056 consumidores en 22 mercados) indica que el 74,6% de las personas confía más en una empresa cuando puede intercambiar mensajes directos con ella, y el 75,1% espera recibir una experiencia de atención tan ágil como conversar con familiares o amigos (Meta & Kantar, 2026).

### 2.2. Situación Actual en InterChile Climatización

En la operación de **InterChile Climatización**, WhatsApp constituye el canal principal de ingreso para solicitudes de reparación de urgencia, mantención preventiva, instalación, arriendo y proyectos comerciales. Sin embargo, el proceso actual (*AS-IS*) presenta cuatro brechas críticas:

1. **Solicitudes iniciales desestructuradas:** Los clientes suelen reportar síntomas generales sin indicar el servicio exacto, tipo de equipo, marca, urgencia ni ubicación, obligando a los ejecutivos a sostener múltiples turnos manuales de preguntas repetitivas para recopilar antecedentes mínimos.
2. **Latencia de respuesta y pérdida de oportunidades comerciales:** La velocidad de primera respuesta incide directamente en la conversión de ventas y servicios. Oldroyd, McElheran y Elkington (2011), en su estudio publicado en *Harvard Business Review*, demostraron que las empresas que responden dentro de la primera hora tienen casi **7 veces más probabilidad** de calificar a un prospecto que aquellas que demoran más de una hora, y más de **60 veces más probabilidad** frente a quienes responden después de 24 horas. La atención manual dependiente del horario hábil expone a InterChile a fugas de clientes hacia competidores más rápidos.
3. **Cálculo manual de presupuestos y desconexión con el ERP y agendas:** La transcripción manual desde chats de WhatsApp hacia el sistema de gestión interno (ERP Kronos 2.0), la elaboración manual de cotizaciones referenciales y la coordinación por chat de visitas técnicas o reuniones con la gerencia comercial (Benjamín Yáñez) introducen demoras administrativas y riesgo de errores o cruces de horario.
4. **Riesgo de alucinación al usar Inteligencia Artificial sin control determinista:** Si bien los Modelos de Lenguaje de Gran Escala (LLM) permiten interpretar lenguaje natural complejo, la literatura científica demuestra que estos modelos son propensos a generar **alucinaciones intrínsecas y extrínsecas** —afirmaciones lingüísticamente coherentes pero falsas o no sustentadas en datos reales del dominio— (Ji et al., 2023). Asimismo, estudios recientes confirman que aumentar el tamaño del modelo por sí solo no elimina la invención de hechos técnicos o precios en dominios especializados (Huang et al., 2025), por lo que un chatbot sin validación contra catálogo y reglas de negocio podría prometer repuestos inexistentes o tarifas erróneas.

### 2.3. Identificación de Causas, Problema Central y Efectos

| Dimensión | Descripción Sintética |
| :--- | :--- |
| **Causas Raíz** | 1. Recepción no automatizada 24/7 ni guiada en WhatsApp.<br>2. Captura manual y desestructurada de tipo de servicio, equipo, marca y urgencia.<br>3. Falta de validación determinista entre IA, catálogo/tarifario del ERP y calendario de atención. |
| **Problema Central** | **Alta latencia operativa, pérdida de trazabilidad y carga manual excesiva en el proceso de admisión (*intake*), pre-diagnóstico técnico, cotización preliminar y coordinación de atenciones vía WhatsApp en InterChile Climatización.** |
| **Efectos en el Negocio** | Pérdida de prospectos por demoras de respuesta fuera de horario (Oldroyd et al., 2011), sobrecarga del equipo comercial en preguntas de filtro inicial, cotizaciones preliminares lentas y riesgo de topones al coordinar visitas o reuniones. |

---

## 3. Alcance del Proyecto y Objetivos

### 3.1. Objetivo General

Diseñar e implementar un sistema de triage comercial y pre-diagnóstico técnico mediante un agente conversacional con inteligencia artificial para InterChile Climatización, que permita automatizar la recepción de solicitudes vía WhatsApp, clasificar requerimientos y generar cotizaciones preliminares, garantizando la trazabilidad de los casos y la derivación oportuna a ejecutivos humanos.

### 3.2. Objetivos Específicos

1. **Objetivo específico 1:** Diseñar e implementar el módulo conversacional de atención para la recepción y clasificación de consultas a través de WhatsApp, guiando la recolección de datos técnicos y el nivel de prioridad del servicio.
2. **Objetivo específico 2:** Implementar la lógica de negocio para la validación de requerimientos técnicos, el cálculo de cotizaciones preliminares con descarga en formato PDF, la gestión de agendamientos y la derivación asistida a ejecutivos humanos integrada con el panel de administración.
3. **Objetivo específico 3:** Verificar el funcionamiento del sistema mediante pruebas funcionales, de integración y de rendimiento, comprobando el cumplimiento de las reglas de atención, la consistencia de las respuestas y la estabilidad operativa.

### 3.3. Propuesta de Solución (TO BE), Alcances y Limitaciones

* **Propuesta de Solución:** Plataforma web y servicio backend en Node.js/Express alojado 24/7 en Render, conectado a la API oficial de WhatsApp Cloud (Meta), base de datos relacional PostgreSQL (Supabase), motor semántico multi-turno con Google Gemini 2.5 Flash validado mediante esquema estricto (`Zod`), arneses algorítmicos contra el catálogo de Kronos 2.0, cotizador determinista en CLP con generación nativa de ficha en PDF, panel web operativo con métricas de calidad/SLA y widget de calendario para reserva de reuniones con el gerente comercial.
* **Dentro del Alcance:** Recepción segura por webhook (`HMAC-SHA256`), menús interactivos para las líneas de servicio de InterChile, clasificación automática de prioridad, prevención de alucinaciones sobre marcas/equipos/precios, cotización referencial en PDF, derivación controlada a ejecutivo, API autenticada con Bearer Token para Kronos 2.0 (`KRON2-152`), gestión de visitas y reservas automáticas de reuniones, y suite de pruebas automatizadas en Jest con medición de cobertura y concurrencia.
* **Limitaciones y Exclusiones:** El sistema emite estimaciones referenciales de triage (*no emite boletas ni facturas electrónicas ante el SII*), no procesa pagos en línea dentro del chat y opera sobre texto, botones interactivos, listas desplegables y recepción de metadatos de imagen (excluyendo transcripción de notas de voz o análisis de video).

---

## 4. Referencias Bibliográficas

* ASHRAE. (2018). *ANSI/ASHRAE/ACCA Standard 180-2018: Standard Practice for Inspection and Maintenance of Commercial Building HVAC Systems*. American Society of Heating, Refrigerating and Air-Conditioning Engineers.
* DataReportal. (2025). *Digital 2025: Chile*. We Are Social / DataReportal. https://datareportal.com/reports/digital-2025-chile
* Huang, L., Yu, W., Ma, W.-T., Zhong, W., Feng, Z.-Y., Wang, H., Chen, Q., Peng, W., Feng, X.-C., Qin, B., & Liu, T. (2025). A Survey on Hallucination in Large Language Models: Principles, Taxonomy, Challenges, and Open Questions. *ACM Transactions on Information Systems (TOIS)*, 43, 1–55. (Preprint arXiv:2311.05232).
* Ji, Z., Lee, N., Frieske, R., Yu, T., Su, D., Xu, Y., Ishii, E., Bang, Y., Madotto, A., & Fung, P. (2023). Survey of Hallucination in Natural Language Generation. *ACM Computing Surveys*, 55(12), Artículo 3571730. https://doi.org/10.1145/3571730
* Meta & Kantar. (2026). *The State of Business Messaging* [Estudio global sobre mensajería comercial en 22 mercados, N = 11.056 consumidores]. Meta Business.
* Oldroyd, J. B., McElheran, K., & Elkington, D. (2011). The Short Life of Online Sales Leads. *Harvard Business Review*, marzo de 2011.
* Subsecretaría de Telecomunicaciones de Chile [SUBTEL]. (2025). *Duodécima Encuesta sobre Acceso, Usos y Usuarios de Internet en Chile* (y serie Undécima Encuesta 2024). Gobierno de Chile. https://www.subtel.gob.cl
* U.S. Department of Energy [DOE/FEMP]. (s. f.). *Operations & Maintenance Best Practices: A Guide to Achieving Operational Efficiency* (Release 3.0). Federal Energy Management Program. https://www.energy.gov
