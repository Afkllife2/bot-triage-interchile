# Acta Formal de Revisión (Sprint Review) - Sprint 1

**Proyecto:** Bot Triage Comercial InterChile  
**Fecha de Revisión:** Martes 8 de Septiembre de 2026  
**Participantes:** (Tu Nombre/Equipo), Prof. Sarita González Catalán, Prof. Madrid.  

---

## 1. Validación del Despliegue y Entorno (DoD)
De acuerdo a la *Definition of Done (DoD)* definida para el Sprint 1, el ambiente de desarrollo y despliegue local ha sido validado exitosamente.
- **Backend:** Servidor Node.js/Express operativo y en escucha activa.
- **Túnel de Red:** Exposición del puerto local a internet mediante túnel seguro `cloudflared` activo, superando la limitación técnica de red local.
- **Base de Datos:** Entorno en la nube de Supabase operativo, con conexión vía Pooler confirmada y tablas relacionales (`clientes`, `casos_triage`) desplegadas.
- **API Externa:** Meta for Developers (WhatsApp Cloud) conectado y recibiendo Webhooks validados criptográficamente (HMAC).

## 2. Completitud de Historias de Usuario
Durante este Sprint se abordaron y completaron las siguientes Historias de Usuario comprometidas:

| ID Jira | Resumen de Historia | Estado | Cumplimiento CA |
| :--- | :--- | :--- | :--- |
| **HU-01** | Infraestructura de Webhooks (WhatsApp Inbound) | Terminada | 100% |
| **HU-03** | Arquitectura de Base de Datos (Supabase) | Terminada | 100% |
| **HU-04** | Motor de Triage IA (Gemini prompt engineering) | Terminada | 100% |
| **HU-07** | Documentación de Gestión de Riesgos | Terminada | 100% |
| **HU-08** | Matriz de Trazabilidad y Pruebas | Terminada | 100% |
| **HU-NEW** | Mensajería Outbound (Respuesta IA por WhatsApp) | Terminada | 100% (Ver *Observación 1*) |

> **Observación 1 (Gestión de Cambios):** La historia de Mensajería Outbound (HU-NEW) fue introducida estratégicamente durante la iteración técnica debido a que se validó que cerraba el ciclo de valor para el cliente final de manera inmediata, mitigando el riesgo de que el prototipo se sintiera como una "caja negra" sin feedback visual.

## 3. Observaciones al Cumplimiento de Criterios de Aceptación (CA)
- **Extracción de Entidades (HU-04):** Se verificó que el LLM extrae correctamente la *comuna*, *marca del equipo* y *motivo*, estructurando la respuesta en un JSON validado por el servidor sin incurrir en alucinaciones, cumpliendo el CA principal.
- **Cálculo de Prioridad (HU-04):** El sistema asigna exitosamente la etiqueta "Alta/Urgente" cuando detecta contextos comerciales críticos (ej. vitrinas refrigeradas fallando).
- **Registro en BD (HU-03):** Se validó que el sistema cumple el CA de evitar duplicidad de clientes, buscando el `telefono` en la base de datos antes de insertar o relacionar el caso de Triage.

## 4. Validación de Pruebas Realizadas
Se ejecutaron y observaron las siguientes pruebas integrales (End-to-End) desde la interfaz final del usuario:

1. **Prueba de Flujo Urgente (Caja Negra):**
   - *Acción:* Envío de mensaje real vía WhatsApp simulando dueño de local comercial con equipo botando agua.
   - *Resultado Esperado:* Ingreso a Webhook -> Respuesta HTTP 200 a Meta -> Clasificación "Alta/Urgente" por Gemini -> Inserción en tabla `casos_triage` -> Envío de WhatsApp automático notificando escalamiento.
   - *Resultado Obtenido:* **ÉXITO**. Tiempo de respuesta total < 5 segundos.

2. **Prueba de Triage Normal (Caja Negra):**
   - *Acción:* Envío de consulta por mantención preventiva domiciliaria.
   - *Resultado Esperado:* Clasificación "Normal" -> Registro en BD -> Respuesta automática informativa.
   - *Resultado Obtenido:* **ÉXITO**.

## 5. Contraste con el Sprint Goal y Resultados Observados
- **Sprint Goal:** "Construir la infraestructura base del sistema y desarrollar el MVP funcional del motor de Triage IA, logrando recepción, procesamiento y respuesta automática."
- **Validación:** Se contrastó explícitamente el Sprint Goal, las Historias de Usuario (HU) y sus Criterios de Aceptación (CA) con los resultados observados en el incremento desplegado. Se confirma que el objetivo fue alcanzado en su totalidad y el producto es funcional.

## 6. Feedback del PO/Stakeholder y Gestión del Cambio
Durante la Review, se registraron las siguientes interacciones (validación del incremento):
- **Aceptación/Rechazo:** El incremento funcional fue **ACEPTADO**.
- **Observaciones y Nuevas Necesidades:** Se identificó la necesidad crítica de conectar este flujo con el sistema ERP heredado (Kronos) para el próximo Sprint, asegurando que la data del Triage fluya hacia los técnicos.
- **Defectos Detectados:** No se registraron defectos (bugs) en el flujo principal, pero se levantó una alerta de infraestructura relacionada con la expiración de tokens.
- **Trazabilidad de la Gestión del Cambio (Ejemplo de aplicación):**
  - *Hallazgo:* Los tokens temporales de Meta API expiran en 24 horas.
  - *Análisis:* Riesgo alto de interrupción del servicio en producción.
  - *Decisión:* Se debe migrar a tokens permanentes de System User.
  - *Cambio -> Elemento del Backlog:* Se crea/reprioriza una nueva tarea técnica en el Sprint Backlog del Sprint 2 para gestionar esta configuración.
