# Avance Integral de Informe — Portafolio de Título (InterChile Clima SpA)

Facultad de Ingeniería

Escuela de Ingeniería en Computación e Informática

Asignatura de Portafolio de Título — Avance de Informe Integral

Sistema Autónomo Conversacional de Pre-Diagnóstico Técnico, Triage Comercial y Cotización Referencial vía WhatsApp Integrado con ERP Kronos y Dashboard Operativo para InterChile Clima SpA

Definición del Problema, Objetivos, Diseño Arquitectónico, Gestión Scrum y Avance de Implementación (Sprints 1, 2 y 3)

Autor: Carlos Gabriel González Salgado

Profesora de Asignatura / Metodológica: Sarita González Catalán

Profesor Guía Técnico: Matías Vargas

Empresa Contraparte (Stakeholder Real): InterChile Clima SpA — Benjamín Yáñez Lasalvia (Gerente Comercial y de Operaciones)

Repositorio Oficial GitHub: https://github.com/Afkllife2/bot-triage-interchile

Servicio en Producción (24/7): https://bot-triage-interchile.onrender.com/dashboard

Santiago, Chile — Noviembre de 2026


## Tabla de Contenido


| Sección Principal del Informe | Contenido Documentado y Artefactos |
| --- | --- |
| 1. Introducción | Marco de digitalización de atención comercial en Chile y propósito del proyecto modificado. |
| 2. Matriz de Evolución del Proyecto e Indicaciones Docentes | Trazabilidad completa del cambio de enfoque hacia InterChile Clima SpA y ajustes Sprint 1–3. |
| 3. Fundamentación del Problema | 3.1 Contexto HVAC y mensajería en Chile · 3.2 Situación Actual (AS-IS) y 4 brechas críticas. |
| 4. Técnica de Identificación de la Problemática | 4.1 Árbol de Problemas (Figura 1) · 4.2 Análisis de los 5 Porqués · 4.3 Causas de la problemática. |
| 5. Alcance del Proyecto | 5.1 Objetivo General · 5.2 Objetivos Específicos · 5.3 Métricas (KPIs) · 5.4 Solución (TO BE) · 5.5 Alternativas · 5.6 Alcances y Limitaciones. |
| 6. Factibilidades | 6.1 Técnicas · 6.2 Económicas · 6.3 Sociales y Operacionales. |
| 7. Metodología de Desarrollo y Gestión | 7.1 Gestión Scrum adaptado · 7.2 Ingeniería modular · 7.3 Product Backlog consolidado Jira (AAI). |
| 8. Propuesta de Solución | 8.1 Visión sistémica integral · 8.2 Diagrama de Contexto (Figura 2). |
| 9. Arquitectura de Alto Nivel | 9.1 Diagrama de Componentes (Figura 3) · 9.2 Arquitectura modular en capas · 9.3 Decisiones Arquitectónicas (ADRs). |
| 10. Diseño de Alto Nivel (Modelo 4+1) | Casos de Uso (Fig. 4) · 10.1 Vista Lógica y Datos (Fig. 5) · 10.2 Vista Física · 10.3 Vista Despliegue (Fig. 6) · 10.4 Escenarios. |
| 11. Gestión del Proyecto | 11.1 Planificación · 11.2 Plan de Pruebas · 11.3 Configuración y Cambios · 11.4 Monitoreo y Control · 11.5 Matriz de Riesgos (R-01..R-19). |
| 12. Métodos y Materiales | 12.1 Planificación y Hoja de Ruta (Fig. 7) · 12.2 Herramientas SW/HW · 12.3 Ambiente Jira · 12.4 Ambiente Desarrollo/Cloud. |
| 13. Mitigación del Riesgo Técnico Principal | Control determinista contra alucinaciones (R-02/R-16) y Plan de Contingencia autónomo Kronos (R-15). |
| 14. Ejecución del Proyecto (Sprints 1, 2 y Avance Sprint 3) | Iteración 1 (24 SP) · Iteración 2 (39 SP) · Iteración 3 en ejecución (21/34 SP Listo y 70/70 Jest PASS). |
| 15. Trabajos Futuros · 16. Conclusiones | Cierre pendiente Sprint 3 (AAI-102, AAI-98), evolución ERP Kronos y conclusiones de ingeniería. |
| 17. Bibliografía (APA 7.ª ed.) · 18. Anexos | Fuentes científicas/normativas verificadas y capturas reales de WhatsApp, PDF, Dashboard y Jest. |


## 1. Introducción

La masificación de la mensajería instantánea en teléfonos inteligentes ha transformado de manera estructural la interacción comercial entre las empresas de servicios técnicos y sus clientes. En mercados con alta penetración digital como Chile, la conectividad en hogares supera el 96% y aplicaciones como WhatsApp exceden el 90% de uso entre la población conectada, consolidándose como el canal cotidiano prioritario para cotizar, coordinar mantenciones y reportar emergencias operativas (DataReportal, 2025; SUBTEL, 2025). En esta línea, estudios globales sobre mensajería empresarial demuestran que el 73,3% de los consumidores prefiere comunicarse con comercios mediante chat directo y el 72,4% exhibe una mayor disposición a concretar una compra o contratación cuando dispone de este canal (Meta & Kantar, 2026).

Sin embargo, cuando el canal de mensajería se atiende de manera puramente manual y sin mecanismos de captura estructurada, las empresas enfrentan cuellos de botella severos: mensajes iniciales vagos que obligan a múltiples intercambios repetitivos, demoras críticas de primera respuesta fuera del horario hábil, transcripción manual de antecedentes hacia sistemas internos de gestión y errores al estimar presupuestos preliminares. Tal como documentó Harvard Business Review, cada hora de retardo en responder una solicitud comercial reduce drásticamente las probabilidades de calificación y cierre del prospecto (Oldroyd, McElheran, & Elkington, 2011).

El presente informe detalla la formulación, fundamentación, diseño arquitectónico y avance de ejecución del proyecto modificado durante el presente semestre académico para la asignatura de Portafolio de Título en la Universidad Andrés Bello: un Agente Autónomo Conversacional de Pre-Diagnóstico Técnico, Triage Comercial y Cotización Referencial vía WhatsApp integrado con el sistema ERP Kronos 2.0 y un Dashboard Web Operativo para la empresa real InterChile Clima SpA. En cumplimiento con la directriz docente de presentar un avance integral para proyectos re-enfocados durante el semestre, este documento consolida la definición del problema con fuentes verificadas, los objetivos e indicadores de calidad, las vistas arquitectónicas 4+1, la gestión ágil en Jira (Sprints 1, 2 y ejecución real del Sprint 3) y la evidencia empírica de los incrementos desplegados en producción.


## 2. Matriz de Evolución del Proyecto e Indicaciones Docentes

Durante el semestre anterior se formuló inicialmente un prototipo teórico orientado a la verificación de noticias en la red social X. A partir de las sesiones de levantamiento metodológico realizadas junto a la Profesora Sarita González Catalán y al Profesor Guía Matías Vargas, se ejecutó un proceso formal de re-enfoque integral para resolver una necesidad operacional real en colaboración con InterChile Clima SpA (Benjamín Yáñez Lasalvia). La siguiente matriz sintetiza el cambio de proyecto y la trazabilidad de todas las observaciones docentes incorporadas entre los Sprints 1, 2 y 3:


| Origen / Sesión Docente | Hallazgo o Indicación Recibida | Decisión Técnica y Metodológica Aplicada | Evidencia Trazable |
| --- | --- | --- | --- |
| Reunión de Re-enfoque Inicial (Ago 2026 · Prof. Sarita) | Sustituir problemática teórica previa ('Bot Verificador X') por levantamiento real de dolor comercial con contraparte empresarial. | Se realizó entrevista con Benjamín Yáñez (InterChile Clima SpA), reescribiendo por completo Problemática, 5 Porqués, Objetivos, KPIs y Backlog en nuevo proyecto Jira (AAI). | docs/REGISTRO_CAMBIOS_PROFESORES.md · Proyecto Jira AAI (69 ítems) |
| Cierre Sprint 1 / Review (08 Sep 2026 · Prof. Sarita & Madrid) | Exigencia de mensajería de retorno al cliente, trazabilidad DoD en la nube y gestión formal de cambios ante expiración de tokens Meta 24h. | Se incorporó HU-NEW (WhatsApp Outbound), Acta de Review Sprint 1, matriz de alineación con objetivos y transición a System User Token permanente en Meta Business. | docs/ACTA_REVIEW_SPRINT_1.md · src/whatsapp.js · AAI-33 / AAI-57 |
| Sprint 2 & Review (22 Oct 2026 · Prof. Sarita & Matías Vargas) | Requerimiento de cobertura real en Jest (--coverage), plan de contingencia ante eventual atraso del ERP externo Kronos (Riesgo R-15) y soporte a modalidad 'Arriendo'. | Se creó R-15 en Matriz de Riesgos (autonomía total en Dashboard propio), conmutación de listas interactivas (List Messages para 7 líneas) y despliegue 24/7 en Render. | docs/Acta_Sprint_Review_Sprint_2.md · docs/MATRIZ_RIESGOS_V1.md · Render SSL |
| Planning e Inicio Sprint 3 (Nov 2026 · Reglas Metodológicas) | Exigencia de 1 rama Git por cada HU, Time Tracking real y captura adjunta por subtarea en Jira, e informe técnico separado de pruebas. | Aplicado estrictamente en AAI-25 (Cotizador CLP + PDF), AAI-90 (Estados/Visitas Dashboard) y AAI-94 (SLA < 4.0s + rediseño visual interchileclima.cl), alcanzando 70/70 tests PASS. | Ramas feat/AAI-25..94 · test/hu22-metricas-sla.test.js · public/dashboard.html |


## 3. Fundamentación del Problema


### 3.1. Contexto

El sector de climatización comercial, residencial e industrial abarca sistemas de alta criticidad operativa —tales como unidades Split, Cassette, Piso-Techo, Ducto, Chiller y centrales VRV/VRF— instalados en clínicas médicas, oficinas corporativas, locales comerciales, laboratorios y plantas productivas. Conforme al estándar técnico ANSI/ASHRAE/ACCA 180-2018, la inspección periódica y mantención sistemática de los equipos HVAC resulta indispensable para preservar la calidad ambiental interior, evitar fallas catastróficas en componentes críticos y prevenir detenciones operacionales costosas (ASHRAE, 2018).

En esa misma línea, la guía Operations & Maintenance Best Practices del Departamento de Energía de Estados Unidos (U.S. Department of Energy [DOE/FEMP], s. f.) documenta que las estrategias puramente reactivas —dependientes de atenciones de emergencia sin planificación preventiva ni levantamiento técnico previo— elevan sustancialmente los gastos en horas extraordinarias, traslados improductivos y recambio urgente de repuestos; por el contrario, una gestión preventiva ordenada genera ahorros energéticos de entre un 5% y un 20% y disminuciones del 8% al 12% en los costos totales de mantenimiento.

Simultáneamente, el ecosistema digital en Chile confirma que WhatsApp constituye la principal puerta de entrada comercial. La Duodécima Encuesta sobre Acceso y Usos de Internet de la Subsecretaría de Telecomunicaciones reporta niveles históricos de conectividad en hogares en torno al 96,5%, posicionando a la mensajería instantánea como la actividad cotidiana preponderante (SUBTEL, 2025), cifra coherente con una penetración superior al 90% entre usuarios chilenos de internet (DataReportal, 2025). Complementariamente, el estudio global The State of Business Messaging —aplicado sobre 11.056 consumidores en 22 mercados— evidencia que el 74,6% de las personas deposita mayor confianza en una empresa cuando puede interactuar por mensajería directa y el 75,1% espera recibir una respuesta con la misma agilidad que en una conversación personal (Meta & Kantar, 2026).


### 3.2. Situación Actual en InterChile Clima SpA (Flujo AS-IS)

En la operación cotidiana de InterChile Clima SpA, WhatsApp concentra la mayoría de los requerimientos entrantes de asistencia técnica de urgencia, mantención preventiva, instalación, cotizaciones estándar, arriendo de climatizadores industriales y proyectos comerciales complejos. Sin embargo, el diagnóstico del flujo operacional previo al proyecto (AS-IS) reveló cuatro brechas críticas:

- 1. Solicitudes iniciales desestructuradas: Los clientes suelen reportar síntomas generales y ambiguos (por ejemplo, 'el equipo blanco gotea en la consulta' o 'no enfría la sala') sin precisar cuál de las 7 líneas de servicio requieren, la categoría del equipo, su marca/modelo, la comuna ni la criticidad del recinto. Esto obliga a los ejecutivos a sostener múltiples rondas manuales de preguntas repetitivas por cada contacto (15 a 40 minutos de intercambio fragmentado).
- 2. Latencia de primera respuesta y fuga de oportunidades comerciales: La rapidez del primer contacto incide directamente en la tasa de conversión comercial. Oldroyd, McElheran y Elkington (2011), en su investigación publicada en Harvard Business Review, demostraron que las organizaciones que responden un requerimiento dentro de la primera hora tienen casi 7 veces más probabilidad de calificar al prospecto que quienes superan los 60 minutos, y más de 60 veces más probabilidad respecto a quienes responden después de 24 horas. La dependencia manual del horario laboral dejaba a InterChile expuesto a la fuga de emergencias nocturnas o de fin de semana (demoras de 4 a 12 horas).
- 3. Cálculo manual de cotizaciones y desconexión con el ERP y agendas: La transcripción manual desde chats de WhatsApp hacia el sistema de gestión interno (ERP Kronos 2.0), la confección manual de cotizaciones preliminares (cálculo de neto e IVA 19%) y la coordinación artesanal de visitas técnicas o reuniones comerciales con Benjamín Yáñez producían pérdida de trazabilidad, riesgo de errores aritméticos y potenciales topones horarios.
- 4. Riesgo de alucinaciones al usar Inteligencia Artificial sin control determinista: Si bien los Modelos de Lenguaje de Gran Escala (LLM) permiten interpretar lenguaje coloquial chileno y desambiguar fallas, la literatura científica demuestra que estos modelos exhiben alucinaciones intrínsecas y extrínsecas: afirmaciones lingüísticamente convincentes pero falsas o carentes de sustento en datos reales del dominio (Ji et al., 2023). Estudios recientes ratifican que incrementar el tamaño paramétrico del modelo no elimina por sí solo la invención de entidades técnicas o tarifas (Huang et al., 2025). En consecuencia, conectar un LLM sin arneses deterministas implicaría el riesgo crítico de confirmar repuestos inexistentes o inventar precios erróneos.

## 4. Técnica de Identificación de la Problemática


### 4.1. Árbol de Problemas (Árbol Invertido)

Para diagnosticar la problemática con rigor ingenieril, se empleó la técnica del Árbol de Problemas (Árbol Invertido). Esta herramienta permite desagregar el fenómeno observado separando sus síntomas visibles en el negocio (ramas superiores / efectos), el problema central medular (tronco) y las deficiencias estructurales subyacentes (raíces / causas). Aislar las causas tecnológicas concretas habilitó derivar directamente los módulos funcionales que el sistema debía construir.

Figura 1: Árbol de Problemas (Efectos, Problema Central y Causas Raíz) aplicado al proceso de triage y atención comercial en InterChile Clima SpA.


### 4.2. Análisis Iterativo de los 5 Porqués

Complementariamente al Árbol Invertido, se ejecutó la técnica iterativa de Los 5 Porqués con el fin de asegurar la convergencia hacia la causa raíz tecnológica:

● Problema Base Observado:

InterChile Clima SpA sufre sobrecarga operativa, errores de trazabilidad y pérdida de oportunidades comerciales en la atención inicial de solicitudes de climatización vía WhatsApp.

- 1. ¿Por qué pierde oportunidades y sufre sobrecarga? Porque los ejecutivos demoran horas en responder fuera de horario hábil y dedican tiempo extenso a filtrar manualmente cada chat entrante.
- 2. ¿Por qué deben filtrar manualmente cada conversación? Porque los clientes envían mensajes ambiguos y desestructurados sin precisar tipo de servicio, equipo, marca, urgencia ni sucursal.
- 3. ¿Por qué el canal WhatsApp no captura ni clasifica estos datos al instante? Porque la empresa carecía de un agente conversacional 24/7 conectado a la API oficial de WhatsApp capaz de guiar la entrevista técnica con memoria multi-turno.
- 4. ¿Por qué no bastaba un chatbot de botones rígidos o un LLM genérico? Porque un árbol estático frustra al cliente ante fallas descritas en lenguaje natural, mientras que un LLM libre sin control alucina marcas, repuestos o precios.
- 5. ¿Cuál es la Causa Raíz Tecnológica? La inexistencia de una plataforma autónoma de Triage Comercial que combine procesamiento semántico (LLM con esquema estricto) con arneses deterministas conectados al catálogo ERP Kronos, motor de cotización CLP/PDF, agenda anti-topones y panel web operativo.

### 4.3. Descripción Consolidada de Causas, Problema Central y Efectos


| Dimensión Analítica | Síntesis Estructurada del Diagnóstico |
| --- | --- |
| Causas Raíz Tecnológicas y Operacionales | 1) Ausencia de recepción automatizada 24/7 en WhatsApp Cloud API con taxonomía guiada de 7 líneas de servicio.<br>2) Inexistencia de motor semántico multi-turno con memoria y clasificación de urgencia comercial.<br>3) Desconexión contractual entre el canal conversacional, el tarifario oficial CLP/IVA, el ERP Kronos 2.0 y la agenda comercial.<br>4) Falta de arneses algorítmicos deterministas para prevenir alucinaciones técnicas y numéricas de la IA generativa. |
| Problema Central | Alta latencia operativa (4–12 h fuera de horario), pérdida de trazabilidad y sobrecarga manual excesiva en el proceso de admisión (intake), pre-diagnóstico técnico, estimación referencial y coordinación de atenciones vía WhatsApp en InterChile Clima SpA. |
| Efectos en el Negocio | Fuga de prospectos hacia competidores más veloces (Oldroyd et al., 2011), desgaste administrativo del equipo comercial en preguntas de filtro inicial, emisión lenta de presupuestos borradores, riesgo de cotizar datos erróneos y topones horarios en visitas o reuniones. |


## 5. Alcance del Proyecto


### 5.1. Objetivo General


| Objetivo General del Proyecto de Título<br>Diseñar e implementar un sistema de triage comercial y pre-diagnóstico técnico mediante un agente conversacional con inteligencia artificial para InterChile Climatización (InterChile Clima SpA), que permita automatizar la recepción de solicitudes vía WhatsApp, clasificar requerimientos y generar cotizaciones preliminares en formato PDF, garantizando la trazabilidad de los casos, el control anti-alucinaciones frente al ERP Kronos y la derivación oportuna a ejecutivos humanos. |
| --- |


### 5.2. Objetivos Específicos

- Objetivo Específico 1 (Admisión Conversacional Multi-Turno): Diseñar e implementar el módulo conversacional de atención 24/7 para la recepción segura (HMAC-SHA256) y clasificación de consultas a través de WhatsApp Cloud API, guiando la recolección multi-turno de datos técnicos y el nivel de prioridad del servicio sin repetir preguntas ya respondidas.
- Objetivo Específico 2 (Validación Determinista, Cotizador PDF y Gestión Operativa): Implementar la lógica de negocio determinista para la validación de marcas, tipos de equipo y repuestos mediante arneses conectados al catálogo Kronos 2.0, el cálculo exacto de cotizaciones preliminares en CLP con descarga en formato PDF (%PDF-1.4), la gestión de estados/agendamientos y la derivación asistida a ejecutivos humanos integrada con el Dashboard Web administrativo.
- Objetivo Específico 3 (Calidad, Concurrencia y Verificación Integral): Verificar el funcionamiento integral del sistema mediante pruebas unitarias, de integración, de rendimiento SLA (< 4.0 s) y de concurrencia multi-usuario en Jest y Supertest, comprobando el cumplimiento de las reglas anti-alucinación, la consistencia de las respuestas y la estabilidad operativa en la nube.

### 5.3. Métricas Objetivos (Indicadores Clave de Rendimiento — KPIs)

Con el fin de garantizar una evaluación objetiva y verificable frente a la comisión de titulación, cada objetivo específico se traduce en métricas cuantitativas auditadas automáticamente mediante src/metricsStore.js y la suite Jest:


| Objetivo Asociado | Indicador Clave (KPI) | Meta Cuantitativa Comprometida | Mecanismo de Medición / Evidencia Real |
| --- | --- | --- | --- |
| OE 1 · Recepción y Clasificación WhatsApp | Latencia promedio de respuesta extremo a extremo (SLA) y captura Webhook | < 4.0 s promedio (< 4000 ms) · 100% peticiones Webhook HTTP 200 sin caída | src/metricsStore.js (GET /api/metricas) · Badge SLA en vivo en public/dashboard.html |
| OE 2 · Arneses Kronos y Cotizador PDF | Efectividad anti-alucinación del arnés y tasa de generación exitosa de fichas PDF | 100% datos inventados interceptados ([dato por confirmar]) · 100% PDFs %PDF-1.4 generados en < 3s (excepción null en proyectos) | src/arneses.js + logs/alucinaciones.log · src/cotizador.js · src/pdfGenerator.js |
| OE 2 · Operación y Contrato Kronos 2.0 | Integridad transaccional, paginación estable y control de concurrencia en estados | 0 duplicados en cursor (updated_at+id) · 100% rechazos 409 Conflict ante colisión · Respuesta 401/503 sin Token | src/db.js (PATCH /api/tickets/:id) · test/db-contrato.test.js · public/dashboard.html |
| OE 3 · Calidad y Estabilidad de Suite | Cobertura y tasa de éxito bajo concurrencia multi-usuario (N=20) | > 99% éxito con N=20 clientes simultáneos (0 colisiones) · 100% suite Jest PASS | npx jest --coverage: 6/6 suites, 70/70 tests PASS (89.06% Stmts / 90.3% Lines) |


### 5.4. Propuesta de Solución (Escenario TO BE)

La solución TO BE transforma un proceso reactivo, manual y disperso en una arquitectura automatizada continua 24/7. El flujo inicia cuando el cliente escribe al número oficial de WhatsApp de InterChile (+56 9 7235 2751); Express valida la firma HMAC-SHA256 de Meta y ofrece botones rápidos o un menú de lista interactiva con las 7 líneas de negocio de la empresa (Falla Técnica, Mantención, Instalación, Cotización, Proyecto Comercial, Arriendo y Otra Consulta).

Luego, el módulo conversacional (src/brain.js con LangChain, Google Gemini 2.5 Flash y esquema Zod) sostiene un diálogo contextualizado por número telefónico hasta recopilar los antecedentes mínimos sin repetir información ya declarada. Previo a persistir en PostgreSQL (Supabase) o responder por WhatsApp, el Arnés Anti-Alucinaciones (src/arneses.js + src/kronos.js) contrasta marcas, tipos de equipo y repuestos contra el catálogo de Kronos; si detecta cualquier entidad inexistente o por verificar, la sanitiza como '[dato por confirmar]'. A continuación, el motor determinista (src/cotizador.js) calcula neto, IVA (19%) y total en CLP —devolviendo null en Proyectos Comerciales o equipos por confirmar para jamás inventar precios— y habilita la emisión instantánea de una Ficha Técnica Corporativa en PDF (%PDF-1.4) con logotipo oficial y sello de estimación referencial. Todo el ciclo es supervisado desde un Dashboard Web seguro cuya estética replica 1:1 la identidad oficial de interchileclima.cl.


### 5.5. Alternativas de Solución Evaluadas


| Alternativa Analizada | Principales Ventajas | Limitaciones Críticas Detectadas | Evaluación |
| --- | --- | --- | --- |
| 1. Atención Manual Tradicional (WhatsApp Business Web) | Trato humano directo sin desarrollo de software previo. | No escala 24/7; demora 15–40 min por filtro manual; sin cotizador automático ni trazabilidad estructurada hacia ERP. | Descartada |
| 2. Chatbot Clásico Basado en Reglas y Botones Fijos | Predecible, bajo costo computacional, cero alucinaciones de texto libre. | Alta fricción cuando el usuario describe fallas complejas libremente; limitado a flujos rígidos y hasta 3 botones en Meta. | Descartada como núcleo único |
| 3. LLM Generativo Directo sin Arnés ni Cotizador Puro | Comprensión fluida de lenguaje coloquial y rápida puesta en marcha. | Riesgo severo de alucinaciones en repuestos/marcas (Ji et al., 2023) y errores aritméticos de IVA/tarifas no auditables. | Descartada por riesgo |
| 4. Arquitectura Híbrida: Menús Meta + Gemini Zod + Arnés Kronos + Cotizador/PDF Determinista | Combina empatía y flexibilidad semántica con 100% determinismo técnico/tarifario, fallback seguro y trazabilidad SQL + Dashboard. | Requiere modularización en adaptadores, gestión de timeouts (12s Gemini / 5s Kronos) y suite continua de validación. | SELECCIONADA |


### 5.6. Alcances y Limitaciones del Proyecto

- Alcance Técnico y Funcional: Backend Node.js/Express desplegado 24/7 en Render con HTTPS/SSL; Webhook WhatsApp Cloud API v21.0 (+56 9 7235 2751); diagnóstico multi-turno en español chileno para las 7 líneas de InterChile; arnés anti-alucinaciones conectado a contrato Kronos; cotizador determinista CLP + IVA 19% con generador nativo PDF (%PDF-1.4); Dashboard Web corporativo autenticado con gestión de estados/visitas, KPIs SLA y descarga PDF; contrato API REST Bearer para ERP Kronos 2.0 (KRON2-152).
- Alcance de Compatibilidad: Agnóstico al sistema operativo móvil del cliente final (opera nativamente dentro de WhatsApp iOS/Android/Web sin descargas adicionales) y accesible desde cualquier navegador web moderno para administradores e ingenieros de soporte.
- Limitaciones y Exclusiones Explícitas: El sistema genera estimaciones y borradores referenciales de triage (*no emite boletas ni facturas tributarias electrónicas ante el SII*); no procesa pagos ni transferencias bancarias dentro del chat; opera sobre texto libre, botones interactivos y listas desplegables (excluyendo transcripción de notas de voz o análisis computacional de video); y mantiene su operación condicionada a cuotas/ventanas de servicio de Meta Cloud API y disponibilidad externa del módulo ERP Kronos 2.0 (mitigado mediante Plan de Contingencia R-15).

## 6. Factibilidades


### 6.1. Factibilidad Técnica

El proyecto es plenamente factible desde el punto de vista técnico al cimentarse sobre tecnologías maduras, estandarizadas y ya validadas en producción real durante los Sprints 1, 2 y 3: Node.js + Express para orquestación asíncrona de baja latencia, Meta Graph API v21.0 con System User Token permanente, Google Gemini 2.5 Flash vía LangChain con contratos Zod tipados en tiempo de ejecución, PostgreSQL gestionado en Supabase (AWS us-east-2) y despliegue continuo en Render Cloud. Decisiones de ingeniería como implementar un ensamblador nativo de flujos PDF %PDF-1.4 en memoria (< 5 ms) —en lugar de instanciar navegadores Chromium headless— garantizan una operación estable dentro de contenedores económicos de 512 MB de RAM sin riesgo de desbordamiento de memoria.


### 6.2. Factibilidad Económica

Financieramente, el diseño arquitectónico optimiza costos aprovechando infraestructuras cloud serverless y modelos de precios por consumo real, manteniendo un presupuesto mensual marginal para una operación PYME comercial (~$0 a $17 USD mensuales):

- Meta WhatsApp Cloud API: $0 USD en conversaciones de servicio iniciadas por el cliente dentro de la ventana de atención de 24 horas (facturación free_customer_service).
- Hosting Backend 24/7 (Render Web Service): $0 USD (Free Tier validación) a $7 USD/mes (Starter 24/7 sin suspensión por inactividad).
- Base de Datos Relacional (Supabase PostgreSQL): $0 USD mensuales en plan gestionado con Pooler SSL e índices B-Tree.
- Consumo de Inferencia IA (Google Gemini 2.5 Flash): ~$1 a $10 USD/mes variables según volumen de conversaciones mensuales; las selecciones mediante List Messages y Botones (HU-20) ahorran llamadas al LLM.
- Herramientas de Ingeniería (GitHub, Jest, Jira Cloud): $0 USD (licenciamiento gratuito/académico). El retorno sobre la inversión resulta inmediato frente a las 15–40 horas mensuales ahorradas al equipo comercial en preguntas manuales repetitivas.

### 6.3. Factibilidad Social y Operacional

A nivel operacional y social, la solución presenta barreras de adopción prácticamente nulas: tanto clientes residenciales como jefes de mantenimiento de clínicas y comercios ya utilizan WhatsApp diariamente. Al entregar respuestas empáticas, precios referenciales transparentes con aviso explícito de no oficialidad y un mecanismo inmediato de traspaso a Benjamín Yáñez ante solicitudes complejas o frustración (HU-06), la herramienta potencia la calidad de servicio humano en lugar de reemplazarlo.


## 7. Metodología de Desarrollo y Gestión de Proyecto


### 7.1. Metodología de Gestión (Scrum Adaptado Unipersonal)

Se adopta el marco ágil Scrum adaptado a ejecución unipersonal en ciclos iterativos de dos a tres semanas, gobernados desde un tablero en Jira Cloud (proyecto AAI). Cada iteración comprende Sprint Planning con historias en formato BDD (Dado / Cuando / Entonces), seguimiento mediante subtareas técnicas desglosadas con estimación y registro horario real (Time Tracking), Sprint Review formal con acta frente a los docentes y la contraparte de InterChile, y Retrospectiva con compromisos auditables (por ejemplo, metodología Barco a Vela en Sprint 2).


### 7.2. Metodología de Desarrollo

En la dimensión de ingeniería de software, se sigue una arquitectura modular en capas sobre un backend Node.js desacoplado de las dependencias externas (adaptadores independientes para Meta, Gemini, Kronos 2.0 y PostgreSQL). El control de versiones se ejecuta bajo Git Flow estricto sobre GitHub (ramas estables main y develop, integrando cada Historia de Usuario desde su rama dedicada feat/AAI-XX-... mediante commits semánticos). Cada incremento exige superar sin regresiones la batería automatizada en Jest + Supertest antes de ser fusionado.


### 7.3. Product Backlog Consolidado del Proyecto (Jira AAI)

La siguiente tabla consolida la totalidad del Product Backlog activo del proyecto en Jira (4 Épicas, 14 Historias/Tareas principales y 97 Story Points totales), especificando su estado verificado al 17 de noviembre de 2026:


| Key Jira | Código | Épica / Historia de Usuario o Tarea Técnica | Sprint | SP | Estado Real |
| --- | --- | --- | --- | --- | --- |
| AAI-5 | INT-HU-01 | Clasificación automática de motivo principal de solicitud HVAC (Gemini + Zod) | Sprint 1 | 8 | Listo |
| AAI-23 | INT-HU-03 | Asignación automática de prioridad (Alta / Normal / Baja) y escalamiento urgente | Sprint 1 | 5 | Listo |
| AAI-8 | INT-HU-04 | Generación y persistencia de Ficha de Consolidación en Supabase + Outbound (AAI-33) | Sprint 1 | 8 | Listo |
| AAI-58 | INT-HT-ADM | Base metodológica, matrices de pruebas, riesgos, trazabilidad y vistas 4+1 | Sprint 1 | 3 | Listo |
| AAI-6 | INT-HU-02 | Diagnóstico dinámico multi-turno con memoria conversacional y perfilamiento comercial | Sprint 2 | 8 | Listo |
| AAI-26 | INT-HU-06 | Derivación empática a ejecutivo humano (Benjamín) y silenciamiento post-handoff | Sprint 2 | 5 | Listo |
| AAI-34 | INT-HU-14 | Dashboard Web operativo en tiempo real con alertas rojas y filtros por prioridad | Sprint 2 | 5 | Listo |
| AAI-55 | INT-HU-18/21 | Integración con catálogo Kronos y Arnés determinista anti-alucinaciones | Sprint 2 | 8 | Listo |
| AAI-70 | INT-HU-20 | Mensajes interactivos WhatsApp (Reply Buttons <=3 y List Messages 7 líneas) | Sprint 2 | 5 | Listo |
| AAI-72 | INT-TSK-02 | Infraestructura 24/7 en Render, Token Permanente Meta y número oficial +56 9 7235 2751 | Sprint 2 | 8 | Listo |
| AAI-25 | INT-HU-05 | Motor cotizador CLP + IVA 19%, inyección WhatsApp y PDF Corporativo (%PDF-1.4) | Sprint 3 | 8 | Listo |
| AAI-90 | INT-HU-19 | Gestión de estados (4), agendamiento de visitas, PATCH 409 optimista y PDF en Dashboard | Sprint 3 | 8 | Listo |
| AAI-94 | INT-HU-22 | Métricas SLA (< 4.0s), alertas consola, tarjetas KPI y rediseño visual interchileclima.cl | Sprint 3 | 5 | Listo |
| AAI-102 | INT-HU-23 | Agendamiento automático de reuniones con Benjamín (WhatsApp + Widget Calendario) | Sprint 3 | 8 | Por hacer |
| AAI-98 | INT-TSK-03 | Validación concurrencia N=20 final, Diagrama E2E e Informe Formal de Pruebas Sprint 3 | Sprint 3 | 5 | Por hacer |


## 8. Propuesta de Solución

Desde la dimensión técnica, la propuesta de solución se materializa como un servicio web y orquestador conversacional desacoplado que actúa como capa inteligente de admisión entre los clientes de InterChile Clima SpA en WhatsApp y las plataformas administrativas de la compañía (Dashboard Operativo y ERP Kronos 2.0).


### 8.1. Diagrama de Contexto

La Figura 2 ilustra los límites del sistema central, sus actores externos y los protocolos de intercambio seguro establecidos entre Meta Graph API, Google Gemini 2.5 Flash, Supabase PostgreSQL, el navegador del equipo comercial y el contrato de sincronización bidireccional con Kronos 2.0.

Figura 2: Diagrama de Contexto del Bot Triage Comercial InterChile, ilustrando canales de entrada, procesamiento cognitivo/determinista y puntos de integración externa.


## 9. Arquitectura de Alto Nivel

Figura 3: Diagrama de Componentes y Arquitectura Modular en Capas implementada en src/ y public/ (estado Sprint 3).


### 9.1. Arquitectura Utilizada y Decisiones de Diseño (ADRs)

El sistema implementa una arquitectura de Monolito Modular en Capas con adaptadores desacoplados. Esta decisión evita la sobrecarga operacional y latencias de red distribuidas propias de microservicios puros dentro de un proyecto académico de un desarrollador, manteniendo a su vez una separación estricta de responsabilidades que permite reemplazar proveedores externos (por ejemplo, catálogo local simulado de Kronos por endpoint productivo) sin modificar el dominio central:

- ADR-01 · Cotizador Determinista Desacoplado del LLM (src/cotizador.js): El LLM únicamente clasifica tipo_solicitud, equipo_tipo y prioridad; todo cálculo monetario en CLP (Subtotal Neto, IVA 19% y Total) se ejecuta algorítmicamente en reglas puras, retornando null ante Proyectos Comerciales o equipos '[dato por confirmar]' para erradicar alucinaciones aritméticas.
- ADR-02 · Generador Nativo %PDF-1.4 en Memoria (src/pdfGenerator.js): Construye en < 5 ms un binario %PDF-1.4 estándar con compresión FlateDecode RGB del logotipo de InterChile Clima SpA y tabla xref calculada en RAM, prescindiendo de Chromium/Puppeteer (> 300 MB) para operar holgadamente en Render (512 MB).
- ADR-03 · Paginación por Cursor Estable y Concurrencia Optimista 409 (src/db.js): Reemplaza consultas por OFFSET mediante paginación keyset (updated_at, id) codificada en base64url, conserva created_at inmutable tras el upsert y valida expected_updated_at en PATCH /api/tickets/:id respondiendo HTTP 409 Conflict ante ediciones concurrentes.
- ADR-04 · Autenticación Privada Bearer (TRIAGE_API_TOKEN): Todas las rutas administrativas y de integración Kronos validan el encabezado Authorization: Bearer mediante crypto.timingSafeEqual, bloqueando peticiones sin credencial (401) o fallas de configuración insegura que reutilicen secretos de Meta o Gemini (503).

## 10. Diseño de Alto Nivel (Modelo 4+1)

El diseño de alto nivel consolida el sistema bajo las vistas complementarias del modelo arquitectónico 4+1 de Kruchten, asegurando la coherencia entre los requerimientos del negocio (Casos de Uso), la estructura lógica y de datos, la infraestructura física de nube y la topología de despliegue productivo.

Figura 4: Diagrama de Casos de Uso del sistema Bot Triage InterChile Clima SpA (actores, flujos activos Sprints 1–3 y alcance calendario AAI-102).


### 10.1. Vista Lógica y Modelo de Datos

La Vista Lógica organiza el software en nueve módulos cohesivos: src/server.js (controlador HTTP y middlewares), src/brain.js (LangChain + Gemini 2.5 Flash + Zod + memoria 60 min + Handoff), src/arneses.js + src/kronos.js (validación determinista contra catálogo), src/cotizador.js (matriz tarifaria CLP), src/pdfGenerator.js (exportación corporativa PDF), src/metricsStore.js (telemetría SLA), src/whatsapp.js (botón/lista/texto) y src/db.js (transacciones SQL). La persistencia relacional consolidada en Supabase se muestra en la Figura 5.

Figura 5: Modelo Entidad-Relación consolidado en PostgreSQL (Supabase) y contratos de dominio FichaTriage y CotizacionBorrador.


### 10.2. Vista Física

Físicamente, la aplicación se compone de un runtime Node.js + Express sirviendo tanto los webhooks/API REST como la aplicación web SPA ligera public/dashboard.html (HTML5/CSS3/JS nativo sin pasos de compilación que sobrecarguen el contenedor, estilizada con el sistema visual corporativo de https://interchileclima.cl/). La persistencia reside en PostgreSQL 15 gestionado sobre infraestructura AWS us-east-2 vía Supabase y conexiones SSL mediante pooler Supavisor.


### 10.3. Vista de Despliegue

A diferencia del prototipo inicial en Sprint 1 (expuesto localmente mediante túneles efímeros cloudflared), desde el Sprint 2 el sistema opera en entorno productivo continuo 24/7 sobre Render Cloud con certificados SSL automáticos (https://bot-triage-interchile.onrender.com), conectado mediante TLS al grafo oficial de Meta (número +56 9 7235 2751) y a la API de Google Cloud Gemini.

Figura 6: Diagrama de Despliegue Productivo en la Nube (Render Web Service, Supabase AWS us-east-2, Meta Cloud API y Google Gemini).


### 10.4. Vista de Escenarios

- Escenario 1 (Falla Técnica Comercial con Arnés y Cotización): Un local reporta urgencia en equipo Split marca Samsung -> Gemini estructura JSON (prioridad Alta) -> Arnés verifica contra catálogo -> Cotizador calcula neto + recargo urgencia + IVA 19% -> BD persiste con created_at inmutable -> WhatsApp confirma folio y valor referencial.
- Escenario 2 (Alucinación Interceptada / Proyecto Complejo): Si la IA propone una marca inexistente o el cliente solicita un Proyecto Comercial -> src/arneses.js sanitiza a '[dato por confirmar]' y registra logs/alucinaciones.log -> Cotizador retorna null -> PDF emitido como 'Ficha Técnica de Levantamiento' sin inventar montos.
- Escenario 3 (Derivación y Silencio Automático HU-06): El cliente pide hablar con un ejecutivo -> estado = 'derivado', requiere_humano = true -> entrega contacto directo de Benjamín Yáñez -> mensajes posteriores activan silencio de IA evitando costos de LLM e interferencia humana.
- Escenario 4 (Concurrencia Optimista Dashboard / Kronos PATCH 409): Dos operadores abren el ticket #94; el primero agenda visita técnica; cuando el segundo envía PATCH con expected_updated_at obsoleto, el servidor responde HTTP 409 Conflict y sincroniza automáticamente la vista en pantalla.

## 11. Gestión del Proyecto


### 11.1. Planificación del Proyecto

La planificación combina un horizonte macro dividido en tres Hitos/Sprints (Agosto–Noviembre 2026) con descomposición granular en Jira Software (AAI-1 a AAI-105). Mientras el Sprint 1 aseguró la columna vertebral de ingreso WhatsApp–Gemini–Supabase, el Sprint 2 maduró el diálogo multi-turno, los arneses anti-alucinación, el Dashboard y la puesta en producción 24/7 en Render, dejando el Sprint 3 enfocado en el cierre comercial PDF, autogestión ante R-15, métricas SLA y calendario.


### 11.2. Plan de Pruebas y Matriz de Casos Validados

La estrategia de aseguramiento de calidad abarca cuatro niveles progresivos ejecutados mediante Jest y Supertest: (1) Pruebas unitarias de funciones puras (arneses, cotizador, pdfGenerator, metricsStore, contrato db); (2) Pruebas de integración extremo a extremo sobre Express simulando exclusivamente bordes externos (Gemini, Meta, Supabase); (3) Pruebas de resiliencia y degradación elegante (timeouts 12s/5s, firmas HMAC inválidas, errores 400/401/404/409/500/503); y (4) Pruebas de concurrencia sobre N=20 clientes simultáneos.


| Suite Jest / Archivo | Alcance Principal Verificado | Cobertura Módulo | Tests / Estado |
| --- | --- | --- | --- |
| test/interchile.test.js | Clasificación Alta/Baja, ambigüedad interactiva (Arriendo), derivación Benjamín y silencio post-handoff (HU-01..06). | brain.js: 85.24% Stmts | 4/4 PASS |
| test/arneses.test.js | Validación catálogo Kronos, detección e intercepción de marca/tipo/repuesto falso e inmutabilidad (HU-21). | arneses.js: 96.92% Stmts | 15/15 PASS |
| test/integracion.test.js | Pipeline HTTP -> HMAC-SHA256 -> Brain -> Arnés -> BD -> WhatsApp (botón/lista) y seguridad /dashboard (S2). | server.js: 90.85% Stmts | 16/16 PASS |
| test/db-contrato.test.js | Inmutabilidad created_at, cursor paginado updated_at+id sin duplicados y PATCH 400/404/409 (KRON2-152). | db.js: 70.55% Lines | 4/4 PASS |
| test/sprint3.test.js | Cotizador CLP+IVA, PDF %PDF-1.4 (+ excepción Proyecto Comercial), PATCH 4 estados/visitas y concurrencia N=20. | cotizador 100% / pdfGen 98.05% | 21/21 PASS |
| test/hu22-metricas-sla.test.js | Telemetría SLA < 4.0s, guarda Number.isFinite(ms), warning > 4000 ms, ventana 200 muestras, /api/metricas y KPIs UI. | metricsStore.js: 100% Stmts/Lines | 10/10 PASS |


### 11.3. Plan de Gestión de la Configuración y Control de Cambios

Todo artefacto reside bajo versionamiento Git en GitHub (Afkllife2/bot-triage-interchile), protegidos con .gitignore estricto sobre credenciales (.env), logs locales y carpetas auxiliares (scripts/, coverage/). A partir del Sprint 3 rige la regla obligatoria de una rama exclusiva por Historia de Usuario (feat/AAI-XX-...). Cualquier variación funcional surgida con el cliente o profesores atraviesa un control formal:


| Etapa Control | Entrada | Criterio de Evaluación | Salida Trazable |
| --- | --- | --- | --- |
| 1. Levantamiento | Review Docente / Feedback Benjamín | Impacto en dolor real del cliente y alineación a Objetivos. | Acta Review / Registro Cambios |
| 2. Análisis Técnico | Hallazgo documentado (ej. límite 3 botones / R-15) | Viabilidad técnica, impacto en arquitectura y esfuerzo en SP. | ADR / Actualización Riesgos |
| 3. Formalización | Aprobación en Backlog | Redacción de HU con Criterios BDD y subtareas con horas est. | Ticket en Jira (proyecto AAI) |
| 4. Implementación | Ticket En curso + Rama dedicada | Commits semánticos con clave AAI-XX y cobertura Jest 100% PASS. | PR / Merge --no-ff a develop |
| 5. Validación | Worklog real + Captura PNG + Demo | Verificación funcional en vivo y evidencia adjunta en Jira. | Subtarea e Historia -> Listo |


### 11.4. Plan de Monitoreo y Control

El monitoreo operativo combina dos planos: (a) Seguimiento metodológico en Jira Software mediante trabajo incremental por subtarea, horas estimadas vs. horas reales registradas en worklog (11h 15m reales registradas en las 10 subtareas cerradas del Sprint 3) y capturas adjuntas de cada avance; y (b) Observabilidad en tiempo de ejecución vía GET /api/metricas, que expone latencia media en ms, porcentaje de cumplimiento SLA (< 4.0 s), bloqueos del arnés Kronos y fichas PDF generadas.


### 11.5. Plan de Gestión de Riesgos (Matriz Viva R-01 a R-19)


| ID | Riesgo Identificado | P x I | Estado Actual (Nov 2026) | Mitigación / Plan de Contingencia Aplicado |
| --- | --- | --- | --- | --- |
| R-02 / R-16 | Alucinación de IA en marcas, repuestos y cálculo numérico CLP/IVA 19%. | 6–9 | MITIGADO | Arnés src/arneses.js ([dato por confirmar]) + cálculo puro en src/cotizador.js (null en proyectos). |
| R-07 / R-11 | Expiración de token Meta (24h) y caída de túneles locales Cloudflare. | 9 | CERRADO (S2) | System User Token permanente en Meta Business y servicio estable 24/7 en Render SSL. |
| R-08 | Suspensión de proyecto Supabase gratuito por inactividad. | 9 | MITIGADO | Instancia reactivada y validada en vivo con 50+ tickets, esquema e índices B-Tree consolidados. |
| R-09 | Límite de 3 botones de Meta frente a las 7 líneas de servicio de InterChile. | 6 | CERRADO (S2) | Conmutación automática a List Messages (hasta 10 opciones) en src/whatsapp.js. |
| R-13 | Exposición accidental de credenciales y secretos de API en código. | 6 | MITIGADO | Bearer privado TRIAGE_API_TOKEN separado en .env/Render y timingSafeEqual; 0 secretos en Dashboard. |
| R-15 | Atraso en desarrollo externo del ERP Kronos 2.0 fuera de plazos académicos. | 9 (Crítico) | EN EJECUCIÓN (S3) | Plan Contingencia activo: autogestión de estados, visitas y PDF en Dashboard (AAI-90) y calendario (AAI-102). |
| R-17 | Desbordamiento RAM (512 MB Render) al generar documentos PDF. | 6 | MITIGADO | Ensamblador nativo %PDF-1.4 en RAM sin Chromium (< 5 ms), probado al 100% en AAI-25. |
| R-18 | Condiciones de carrera bajo ráfagas WhatsApp o colisiones en Dashboard. | 4 | MITIGADO PARCIAL | PATCH 409 optimista cerrado (AAI-90); validación final concurrencia N=20 en AAI-98. |
| R-19 | Topones horarios al reservar reuniones con Benjamín Yáñez. | 6 | PLANIFICADO | Validación atómica de bloques en BD con bloqueo 409 a implementar en AAI-102. |


## 12. Métodos y Materiales


### 12.1. Planificación Operativa y Cronograma (Roadmap Sprints 1–3)

La ejecución del proyecto modificado se distribuyó entre agosto y noviembre de 2026 en tres Sprints consecutivos reflejados en Jira Cloud:

Figura 7: Hoja de Ruta y Cronograma Real de Sprints 1, 2 y avance Sprint 3 en Jira Cloud (84 SP completados de 97 SP totales).


| Sprint / Hito | Periodo Ejecución | Alcance Principal Ejecutado | Story Points | Estado en Jira |
| --- | --- | --- | --- | --- |
| Sprint 1 (Hito 1) | 24 Ago – 06 Sep 2026 | Webhook HMAC WhatsApp, Gemini JSON, Supabase clientes/casos_triage, Outbound (HU-NEW) y matrices QA. | 24 SP | 100% Listo |
| Sprint 2 (Hito 2) | 24 Sep – 22 Oct 2026 | Memoria multi-turno LangChain, derivación Benjamín, botones/listas Meta (Arriendo), Arnés Kronos, Dashboard y Render 24/7. | 39 SP | 100% Listo |
| Sprint 3 (Hito 3) | Noviembre 2026 (en curso) | Cotizador CLP + PDF corporativo (AAI-25), Estados/Visitas Dashboard (AAI-90), SLA + UI interchileclima.cl (AAI-94); pendientes AAI-102 y AAI-98. | 21 / 34 SP Listo | 61.8% Listo (En progreso final) |


### 12.2. Selección de Herramientas de Software y Hardware

- Backend y Orquestación (Node.js + Express): Seleccionado por su modelo de E/S asíncrono no bloqueante idóneo para webhooks concurrentes de mensajería y llamadas HTTPS paralelas a LLM/BD.
- Motor Semántico e Integridad Estructural (LangChain + Google Gemini 2.5 Flash + Zod): Benchmark empírico del Sprint 2 demostró inferencias en ~2.5–4.0 s frente a > 50 s en modelos más pesados; Zod fuerza tipado estricto pre-persistencia.
- Persistencia Relacional (Supabase / PostgreSQL 15): Soporte ACID completo para transacciones cliente-caso, bloqueos optimistas por timestamp (updated_at) e índices B-Tree sobre consultas de bandeja.
- Mensajería Oficial y Hosting Cloud (Meta Graph API v21.0 + Render): Canal oficial verificado +56 9 7235 2751 sin intermediarios no autorizados, alojado 24/7 con SSL automático.
- Aseguramiento de Calidad y Gestión (Jest + Supertest + GitHub + Jira): Cobertura medible de código, mocks deterministas de red y trazabilidad biunívoca rama–commit–ticket. Prescinde de hardware especializado al ejecutarse en estaciones convencionales y PaaS cloud.

### 12.3. Creación de Ambiente de Gestión (Jira) y Ambiente de Desarrollo

El ambiente de gestión se estructuró íntegramente en Jira Software bajo el proyecto AAI (tablero Scrum 202) con 4 Épicas de negocio/técnicas y subtareas estimadas en horas. El ambiente de desarrollo estandariza migraciones SQL reproducibles (supabase/migrations/20261019000000_sprint2_consolidated_schema.sql y ampliaciones Sprint 3), plantilla .env.example sin secretos en el repositorio y scripts automatizados de verificación (npm test / npx jest --coverage).


## 13. Mitigación del Riesgo Técnico Principal

A diferencia de un software CRUD tradicional, incorporar Inteligencia Artificial Generativa en procesos comerciales de climatización introduce dos amenazas de severidad crítica: (1) Alucinación técnica o numérica en repuestos y tarifas (R-02 / R-16), y (2) Bloqueo de cierre operativo por retraso en el ERP externo Kronos 2.0 (R-15).


| Riesgo Técnico Crítico | Impacto en InterChile | Probabilidad | Impacto | Nivel |
| --- | --- | --- | --- | --- |
| R-02 / R-16: Generación de marcas, repuestos o precios CLP inventados por el LLM | Compromiso comercial inválido frente al cliente, desconfianza técnica y desfase con tarifario oficial. | Alta (sin arnés) | Alto | CRÍTICO |
| R-15: Indisponibilidad externa del ERP Kronos 2.0 dentro del plazo académico | Imposibilidad de agendar atenciones o descargar fichas operativas si el sistema dependiera 100% del ERP externo. | Alta | Alto | CRÍTICO |

Para mitigar la alucinación técnica y financiera se evaluaron tres alternativas arquitectónicas en el dominio cognitivo:


| Alternativa de Mitigación Evaluada | Ventaja Técnica | Limitación Detectada | Decisión Final |
| --- | --- | --- | --- |
| 1. Restringir IA únicamente vía Prompt Engineering | Cero líneas adicionales de código de validación. | No garantiza cumplimiento frente a entradas ambiguas ni cálculos de IVA 19%; imposible de auditar determinísticamente. | Descartada |
| 2. Bloquear por completo al cliente cuando falta un dato de catálogo | Cero riesgo de pasar datos no verificados a base de datos. | Detiene la conversación en WhatsApp y frustra al cliente ante fallas urgentes de equipos poco comunes. | Descartada |
| 3. Arnés Determinista (src/arneses.js) + Cotizador Puro (src/cotizador.js) con sanitización '[dato por confirmar]' | Intercepta al 100% entidades no halladas en catálogo Kronos sin interrumpir la atención, deriva el caso a revisión humana y nunca inventa precios (retorna null). | Exige mantener sincronizado el adaptador GET /api/kronos/catalogo y reglas tarifarias en código auditable. | SELECCIONADA |


## 14. Ejecución del Proyecto (Sprints 1, 2 y Avance Sprint 3)

Atendiendo la directriz de entregar un avance lo más completo y verídico posible para proyectos modificados este semestre, se detalla a continuación la ejecución real alcanzada en las tres iteraciones hasta el 17 de noviembre de 2026:


### Iteración 1 — Sprint 1 (Hito 1: MVP Intake Comercial)

Duración y Contexto: 2 semanas (del 24 de agosto al 06 de septiembre de 2026). Estableció la arquitectura base, el modelo relacional en Supabase y el primer flujo end-to-end funcional por WhatsApp.

Meta del Sprint: Finalizar el MVP de Intake Comercial y los artefactos metodológicos exigidos para el Hito 1.

- Historias Realizadas (24 SP / 100% Completadas en Jira): AAI-5 ([INT-HU-01] Clasificación de Motivo, 8 SP), AAI-23 ([INT-HU-03] Priorización Automática, 5 SP), AAI-8 ([INT-HU-04] Ficha de Consolidación Supabase + AAI-33/HU-NEW Mensajería Outbound WhatsApp, 8 SP) y AAI-58 ([INT-HT-ADMIN] Planes de Pruebas, Riesgos, Trazabilidad y Vistas 4+1, 3 SP).
- Diseño Detallado y Funcionalidades: Se programó el webhook receptor con firma criptográfica HMAC-SHA256 (src/server.js), el extractor JSON inicial con Google Gemini (src/brain.js), las transacciones relacionales cliente-caso en PostgreSQL (src/db.js) y el módulo de respuesta automática WhatsApp Cloud API (src/whatsapp.js).
- Riesgos Gatillados y Mitigación: Se materializó la inestabilidad de túneles ngrok (reemplazados inicialmente por cloudflared), errores HTTP 400 de formato en plantillas Meta y la expiración de tokens de 24 horas (motivando la creación de tarea para System User Token en Sprint 2).
- Pruebas, Monitoreo y Liberación: Validado en Sprint Review del 08 de septiembre de 2026 (Prof. Sarita y Prof. Madrid) con pruebas de caja negra end-to-end (< 5 s) para urgencias comerciales y mantenciones normales (ACTA_REVIEW_SPRINT_1.md).
- Problemas Abiertos al Cierre S1: Memoria conversacional multi-turno, arneses contra catálogo ERP Kronos, derivación silenciosa a humanos y reemplazo de túnel local por hosting 24/7.

### Iteración 2 — Sprint 2 (Hito 2: Multi-Turno, Arneses Kronos y Producción 24/7)

Duración y Contexto: Del 24 de septiembre al 22 de octubre de 2026 (Acta Review 22/10/2026). Consolidó la transición desde un clasificador de un turno hacia una plataforma productiva 24/7 en Render.

Meta del Sprint: Evolucionar el bot hacia diagnóstico dinámico multi-turno, menú interactivo en WhatsApp, arnés determinista anti-alucinación frente a catálogo Kronos, derivación a humano con silencio automático y Dashboard Web operativo.

- Historias Realizadas (39 SP / 100% Completadas en Jira): AAI-6 ([INT-HU-02] Diagnóstico Dinámico Multi-Turno LangChain + Zod, 8 SP), AAI-26 ([INT-HU-06] Derivación a Benjamín y Silencio IA, 5 SP), AAI-34 ([INT-HU-14] Dashboard Web Administradores, 5 SP), AAI-55 ([INT-HU-18/21] Catálogo Kronos + Arnés Anti-Alucinaciones, 8 SP), AAI-70 ([INT-HU-20] Botones y Listas Interactivas Meta incl. 'Arriendo', 5 SP) y AAI-72 ([INT-TSK-02] Render 24/7, Token Permanente y +56 9 7235 2751, 8 SP).
- Diseño Detallado y Riesgos Gatillados: Se migró a Gemini 2.5 Flash con timeout de 12 s para evitar demoras sobre 8–50 s (R-14); se implementó conmutación automática a List Messages ante el límite de 3 botones de Meta (R-09); se activó System User Token permanente (R-07); y tras la Review docente se formalizó el Riesgo R-15 (contingencia autónoma ante atraso externo de Kronos 2.0).
- Pruebas, Retrospectiva y Liberación: 24/24 casos de prueba funcionales (CP-S2-01..24) y 34/34 tests automatizados en Jest + Supertest en estado PASS bajo tag v2.0.0-sprint2. La retrospectiva con técnica Barco a Vela (RETROSPECTIVA_SPRINT_2.md) levantó los 4 compromisos de mejora continua para el Sprint 3 (1 rama por HU, Time Tracking + capturas por subtarea y --coverage).

### Iteración 3 — Sprint 3 (Hito 3: Avance Real Consolidado al 17 de Noviembre de 2026)

Estado de Avance: Noviembre 2026 (en ejecución previa a evaluación final de la próxima semana). Avance real alcanzado: 21 de 34 Story Points completados ('Listo' en Jira e integrados en develop), con 10 de 16 subtareas cerradas y 11 horas 15 minutos reales trazadas con commits y evidencias.

Meta Verificable del Sprint: Consolidar cierre operativo con cotizaciones borrador PDF, gestión de estados/visitas en Dashboard (Contingencia R-15), métricas de calidad SLA (< 4.0s), calendario de reuniones con Benjamín y pruebas de concurrencia e informe formal.

- 1. AAI-25 ([INT-HU-05] — 8 SP · LISTO · Rama feat/AAI-25-HU-05-cotizacion-borrador-pdf · Merge 9acd69e): Se implementó el motor tarifario determinista CLP + IVA 19% (src/cotizador.js) con excepción obligatoria sin precios inventados (null) en Proyectos Comerciales o equipos por confirmar; el generador nativo %PDF-1.4 (src/pdfGenerator.js) con logotipo corporativo y diseño editorial oficial de InterChile Clima SpA; endpoint autenticado GET /api/tickets/:id/pdf e inyección referencial por WhatsApp; validado en vivo contra Ticket #94 en Supabase (5h 35m reales en AAI-86..89).
- 2. AAI-90 ([INT-HU-19] — 8 SP · LISTO · Rama feat/AAI-90-HU-19-agendamiento-estados-dashboard · Merge c5747c2): Se endureció el contrato API Bearer (TRIAGE_API_TOKEN), paginación estable por cursor updated_at+id y control de concurrencia optimista HTTP 409 Conflict en src/db.js (PATCH /api/tickets/:id); se corrigió desfase horario Chile UTC-3 en datetime-local, actualización instantánea sin recargar la página y descarga directa de PDF en cada fila del Dashboard (3h 15m reales en AAI-91..93).
- 3. AAI-94 ([INT-HU-22] — 5 SP · LISTO · Rama feat/AAI-94-HU-22-metricas-calidad-sla · Merge 05c1b47): Se completó el colector de telemetría src/metricsStore.js (SLA < 4.0s, descuento proporcional y alerta consola [HU-22 SLA] ante > 4000 ms, guarda !Number.isFinite(ms)), panel KPI de 6 tarjetas numeradas en vivo en public/dashboard.html y rediseño estético corporativo 1:1 alineado al sitio oficial https://interchileclima.cl/, junto a la suite test/hu22-metricas-sla.test.js (2h 25m reales en AAI-95..97).
- Resultados Actuales de Ejecución de Pruebas (Post-Edición Final sobre develop): Comando npx jest --coverage --runInBand --detectOpenHandles: 6/6 suites PASS, 70/70 pruebas aprobadas en 7.094 s; cobertura global 89.06% Stmts / 75.26% Branch / 87.5% Funcs / 90.3% Lines (cotizador.js 100% Stmts/Lines, metricsStore.js 100% Stmts/Lines, pdfGenerator.js 98.05% Stmts, arneses.js 96.92% Stmts, server.js 90.85% Stmts).
- Trabajo Abierto Restante para Cierre Total del Sprint 3 (13 SP · En Cola): AAI-102 ([INT-HU-23] 8 SP — Agendamiento automático de reuniones con Benjamín en WhatsApp + Widget interactivo de Calendario anti-topones en Dashboard, subtareas AAI-103..105) y AAI-98 ([INT-TSK-03] 5 SP — Validación final integral de concurrencia N=20 tras el calendario, diagrama integrativo E2E e informe separado docs/INFORME_DE_PRUEBAS_SPRINT_3.md).

## 15. Trabajos Futuros

- Cierre Inmediato del Sprint 3 (Próxima Semana): Completar AAI-102 (Widget de Calendario anti-topones y reserva de reuniones con Benjamín vía WhatsApp) y AAI-98 (Informe consolidado de pruebas Sprint 3 y Tag de release final v3.0.0) integrando también las variables TRIAGE_API_TOKEN en producción Render.
- Conexión Productiva Bidireccional con ERP Kronos 2.0: Enlazar src/kronos.js al endpoint productivo oficial GET /api/kronos/catalogo y activar la sincronización continua de tickets desde el módulo /modulos/triage una vez que InterChile habilite su infraestructura productiva.
- Persistencia Distribuida de Memoria Conversacional (PostgreSQL / Redis): Migrar el historial multi-turno y el registro de sesiones derivadas desde memoria RAM hacia almacenamiento compartido en Redis/PostgreSQL para soportar escalamiento horizontal multi-instancia sin pérdida de contexto ante reinicios.
- Soporte Multimodal Avanzado en Terreno: Incorporar transcripción automática de notas de voz de WhatsApp y análisis preliminar asistido de fotografías de placas de equipos HVAC para agilizar levantamientos en planta.

## 16. Conclusiones

La reformulación y ejecución del proyecto hacia un caso industrial real en InterChile Clima SpA demuestra la viabilidad técnica, económica y operacional de automatizar el triage comercial y pre-diagnóstico técnico de servicios de climatización vía WhatsApp. A lo largo de los Sprints 1, 2 y el avance consolidado del Sprint 3, se transformó un flujo manual con latencias de 4 a 12 horas en una plataforma en la nube disponible 24/7 que entrevista inteligentemente al cliente, valida marcas y repuestos sin alucinar, calcula estimaciones exactas en pesos chilenos e IVA, emite fichas técnicas corporativas en PDF y provee autogestión operativa completa frente al riesgo R-15.

Desde la ingeniería de software, el desacoplamiento estricto entre la inferencia probabilística del LLM (Gemini 2.5 Flash bajo contratos Zod) y los módulos deterministas (Arnés Kronos, Cotizador CLP, Generador %PDF-1.4 y Control Optimista 409) resolvió la causa raíz del problema sin comprometer confiabilidad financiera ni disponibilidad. Con 84 de 97 Story Points ejecutados, 70 pruebas automatizadas aprobadas al 100% (90.3% de cobertura de líneas) y un portal operativo alineado a la identidad visual de interchileclima.cl, el sistema presenta un grado sólido de madurez técnica para afrontar su cierre definitivo.


## 17. Bibliografía

ASHRAE. (2018). ANSI/ASHRAE/ACCA Standard 180-2018: Standard Practice for Inspection and Maintenance of Commercial Building HVAC Systems. American Society of Heating, Refrigerating and Air-Conditioning Engineers.

Atlassian. (2026). Jira Software Cloud REST API v3 Documentation. Atlassian Developer. https://developer.atlassian.com/cloud/jira/platform/rest/v3/

DataReportal. (2025). Digital 2025: Chile. We Are Social & Meltwater. https://datareportal.com/reports/digital-2025-chile

Express.js. (2026). Express: Fast, unopinionated, minimalist web framework for Node.js (v4). OpenJS Foundation. https://expressjs.com/

Google AI. (2026). Gemini API Documentation: Structured Outputs & Gemini 2.5 Flash Reference. Google Cloud. https://ai.google.dev/gemini-api/docs

Hohmann, L. (2006). Innovation Games: Creating Breakthrough Products Through Collaborative Play (Sailboat Retrospective Framework). Addison-Wesley Professional.

Huang, L., Yu, W., Ma, W.-T., Zhong, W., Feng, Z.-Y., Wang, H., Chen, Q., Peng, W., Feng, X.-C., Qin, B., & Liu, T. (2025). A Survey on Hallucination in Large Language Models: Principles, Taxonomy, Challenges, and Open Questions. ACM Transactions on Information Systems (TOIS), 43, 1–55.

Jest. (2026). Jest: Delightful JavaScript Testing & Coverage Framework. OpenJS Foundation. https://jestjs.io/

Ji, Z., Lee, N., Frieske, R., Yu, T., Su, D., Xu, Y., Ishii, E., Bang, Y., Madotto, A., & Fung, P. (2023). Survey of Hallucination in Natural Language Generation. ACM Computing Surveys, 55(12), Artículo 3571730. https://doi.org/10.1145/3571730

Meta & Kantar. (2026). The State of Business Messaging [Estudio global sobre mensajería comercial en 22 mercados, N = 11.056 consumidores]. Meta Business.

Meta Platforms. (2026). WhatsApp Business Cloud API v21.0: Interactive Messages & Webhooks Security Reference. Meta for Developers. https://developers.facebook.com/docs/whatsapp/cloud-api/

Oldroyd, J. B., McElheran, K., & Elkington, D. (2011). The Short Life of Online Sales Leads. Harvard Business Review, marzo de 2011.

PostgreSQL Global Development Group. (2026). PostgreSQL 15 Documentation: Transaction Isolation & Indexing. https://www.postgresql.org/docs/15/

Subsecretaría de Telecomunicaciones de Chile [SUBTEL]. (2025). Duodécima Encuesta sobre Acceso, Usos y Usuarios de Internet en Chile (y serie Undécima Encuesta 2024). Gobierno de Chile. https://www.subtel.gob.cl

U.S. Department of Energy [DOE/FEMP]. (s. f.). Operations & Maintenance Best Practices: A Guide to Achieving Operational Efficiency (Release 3.0). Federal Energy Management Program. https://www.energy.gov


## 18. Anexos — Evidencia Verificada de Gestión, Operación y Pruebas

Los siguientes anexos documentan visualmente la trazabilidad metodológica en Jira Software, la operación en vivo sobre WhatsApp oficial (+56 9 7235 2751), la generación de documentos corporativos PDF, el portal web corporativo conectado a Supabase y los resultados certificados de pruebas automatizadas en Jest:

Anexo 1: Tablero Scrum y Product Backlog en Jira Software (Proyecto AAI — Historias de Usuario estimadas en Story Points).

Anexo 2: Dinámica visual de Retrospectiva del Sprint 2 (Barco a Vela) y compromisos de mejora continua aplicados en Sprint 3.

Anexo 3: Interacción real en WhatsApp oficial de producción (+56 9 7235 2751) con despliegue de menú interactivo de servicios (HU-20).

Anexo 4: Ficha Técnica de Levantamiento / Borrador PDF corporativo (%PDF-1.4) generado en tiempo real para Ticket #94 de Supabase (AAI-25).

Anexo 5: Dashboard Web Operativo rediseñado según identidad visual de interchileclima.cl con tarjetas KPI 01–06, cumplimiento SLA y 50 tickets en vivo (AAI-94).

Anexo 6: Ejecución integral de suite automatizada Jest + Supertest con cobertura de código: 6/6 suites y 70/70 tests PASS (89.06% Stmts / 90.3% Lines).
