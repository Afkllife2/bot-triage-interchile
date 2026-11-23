# Análisis del Problema, Objetivo General y Objetivos Específicos (Versión Detallada con KPIs)

**Proyecto de Título:** Desarrollo e Implementación de un Agente Autónomo Conversacional de Pre-Diagnóstico Técnico y Triage Comercial Integrado al Sistema ERP Kronos para InterChile Climatización  
**Empresa Contraparte (Stakeholder Real):** InterChile Climatización (Benjamín Yáñez — Gerente Comercial y de Operaciones)  
**Estudiante:** Carlos Gabriel González Salgado  
**Profesora Metodológica:** Sarita González Catalán  
**Profesor Guía Técnico:** Matías Vargas  
**Fecha de Actualización:** 11 de noviembre de 2026  

---

## 1. Fundamentación y Contexto del Problema

**InterChile Climatización** es una empresa chilena dedicada a la venta, instalación, mantención preventiva, reparación de urgencia, proyectos de ingeniería térmica y arriendo de equipos de aire acondicionado y climatización industrial/comercial (unidades *Split*, *Cassette*, *Piso-Techo*, *Ducto*, *Chiller* y sistemas centralizados *VRV/VRF*).

En la operación diaria de la empresa, **WhatsApp Business** constituye el canal primario por el cual ingresan más del 80% de las solicitudes comerciales y de asistencia técnica de clientes residenciales y corporativos (clínicas médicas, oficinas, locales comerciales y plantas). Sin embargo, previo a este proyecto, el proceso de admisión (*intake*), diagnóstico preliminar y perfilamiento comercial dependía de la atención manual de ejecutivos y supervisores humanos sobre conversaciones informales no estructuradas.

Esta modalidad manual genera un cuello de botella crítico:
1. **Asimetría de información inicial:** Los clientes reportan síntomas ambiguos (ej. *"el equipo blanco gotea"*, *"no enfría la sala de procedimientos"*) omitiendo datos indispensables para asignar un técnico o estimar costos: tipo de servicio requerido (entre las 7 líneas de negocio de InterChile), categoría del equipo, marca/modelo, comuna/dirección y urgencia real.
2. **Fricción operativa y latencia de respuesta:** Un ejecutivo humano tarda entre 15 y 40 minutos de intercambio fragmentado de mensajes por cada prospecto solo para recolectar los datos básicos, provocando tiempos de primera respuesta de entre 4 y 12 horas fuera de horario hábil.
3. **Desconexión con el sistema de gestión (ERP Kronos):** Los antecedentes quedan dispersos en el historial de chat del teléfono, obligando a transcribir manualmente los casos hacia el sistema ERP Kronos y a calcular presupuestos preliminares a mano, con riesgo de errores de tipeo, omisión de IVA o pérdida de seguimiento.
4. **Riesgo de alucinación al usar IA generativa sin control:** La simple conexión de un modelo de lenguaje (LLM) comercial sin validación de negocio conlleva el riesgo de que la IA invente repuestos, confirme disponibilidad de marcas que la empresa no trabaja o entregue precios alucinados.

---

## 2. Análisis Estructurado del Problema

Para diagnosticar con rigor metodológico la situación actual (*AS-IS*), se aplicaron de forma complementaria dos herramientas de ingeniería de requerimientos: el **Árbol de Problemas (Árbol Invertido)** y la **Técnica de los 5 Porqués**.

### 2.1. Técnica 1: Árbol de Problemas (Causa – Problema Central – Efecto)

- **Causas Raíces:**
  - Ausencia de canal inteligente 24/7 con captura estructurada de datos.
  - Mensajes iniciales ambiguos del cliente sin formato ni clasificación de urgencia.
  - Desconexión entre WhatsApp y el ERP Kronos (transcripción y cotización manual).
  - Riesgo de alucinación de modelos LLM sobre inventario o tarifas.
- **Problema Central:** Ineficiencia, alta latencia y pérdida de trazabilidad en el proceso de admisión (intake), pre-diagnóstico técnico y cotización preliminar de solicitudes de climatización vía WhatsApp en InterChile.
- **Efectos:** Fuga de prospectos, sobrecarga operativa del equipo humano, visitas a terreno con información incompleta y demora en la emisión de cotizaciones.

### 2.2. Técnica 2: Análisis de los 5 Porqués (Convergencia a la Causa Raíz)

- **Problema Observado:** InterChile Climatización pierde oportunidades comerciales y sufre sobrecarga operativa en la atención de solicitudes por WhatsApp.
  1. **1° ¿Por qué?** Porque los ejecutivos demoran horas en responder y clasificar cada caso.
  2. **2° ¿Por qué?** Porque deben interrogar manualmente al cliente para averiguar servicio, equipo, marca, falla y dirección.
  3. **3° ¿Por qué?** Porque el canal de WhatsApp no cuenta con un agente autónomo que capture y estructure los datos.
  4. **4° ¿Por qué no un chatbot tradicional o LLM genérico?** Porque un chatbot rígido frustra al usuario y un LLM sin arnés alucina datos.
  5. **5° Causa Raíz Tecnológica:** Inexistencia de una plataforma de software de Triage Comercial que combine procesamiento semántico con arneses deterministas y motor de cotización en CLP.

---

## 3. Definición del Objetivo General y Objetivos Específicos

### 3.1. Objetivo General del Proyecto
> *"Diseñar, desarrollar e implementar un Agente Autónomo Conversacional de Pre-Diagnóstico Técnico y Triage Comercial integrado al ecosistema ERP Kronos para la empresa InterChile Climatización, mediante modelos de lenguaje (Gemini), arneses deterministas anti-alucinaciones y un motor de cotización referencial en PDF, con el fin de automatizar la captura estructurada de requerimientos vía WhatsApp, priorizar urgencias operativas y reducir los tiempos de atención al cliente."*

---

### 3.2. Objetivos Específicos y sus Métricas de Éxito (KPIs)

#### Objetivo Específico 1 (Modelado de Flujos de Triage e Interacción Guiada)
> *"Analizar y modelar los flujos conversacionales de admisión técnica y perfilamiento comercial, implementando recepción segura de webhooks de WhatsApp Cloud API, menús interactivos para las 7 líneas de servicio de InterChile y reglas de clasificación automática de prioridad y derivación a ejecutivo humano."*

#### Objetivo Específico 2 (Motor Semántico Multi-Turno y Arneses Anti-Alucinaciones)
> *"Diseñar e implementar el motor de procesamiento semántico con memoria conversacional multi-turno y arneses algorítmicos de validación contra el catálogo del ERP Kronos, asegurando la intercepción y sanitización de marcas, tipos de equipo o repuestos no verificados."*

#### Objetivo Específico 3 (Persistencia Relacional, Cotizador Determinista CLP y Ficha PDF)
> *"Desarrollar la capa de persistencia transaccional en PostgreSQL (Supabase), el motor determinista de borrador de cotización en pesos chilenos y el generador nativo de fichas técnicas en formato PDF estándar para formalizar las estimaciones preliminares."*

#### Objetivo Específico 4 (Integración ERP Kronos 2.0, Dashboard Operativo y Validación de SLA)
> *"Implementar la interfaz web administrativa de gestión y contingencia operativa (Dashboard Web) junto con el contrato de API autenticado para el ERP Kronos 2.0, validando el cumplimiento de atributos de calidad (latencia SLA y concurrencia) mediante una suite automatizada de pruebas."*
