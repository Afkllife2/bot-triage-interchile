# Plan de Pruebas Unitarias e Integración v1

**Proyecto:** Bot Triage Comercial InterChile (Hito 1)
**Fecha:** Agosto 2026

Este documento define la estrategia inicial de QA (Aseguramiento de Calidad) para el bot de triage, garantizando que los módulos core funcionen correctamente antes de ser desplegados a los usuarios.

---

## 1. Pruebas Unitarias (Componentes Aislados)

El objetivo de las pruebas unitarias es verificar que cada función individual de lógica de negocio opere sin errores. Se utilizará el framework **Jest** para ejecutar estas pruebas.

| ID Prueba | Componente | Descripción de la Prueba | Resultado Esperado |
| :--- | :--- | :--- | :--- |
| `PU-01` | **Validador de Teléfono** | Ingresar número de WhatsApp sin formato internacional. | La función debe formatear el número a `+569XXXXXXXX`. |
| `PU-02` | **Extractor de Entidades (Mock)** | Proveer un texto con síntomas ("El aire split suena raro y no enfría"). | La función debe retornar un objeto JSON con `tipo_equipo: "split"` y `sintoma: "ruido, no enfría"`. |
| `PU-03` | **Calculador de Prioridad** | Ingresar motivo "Falla en equipo industrial server room". | Retornar estado `PRIORIDAD: URGENTE` basado en palabras clave. |
| `PU-04` | **Regla de Handoff** | Ingresar una intención clasificada como `RECLAMO_FUERTE`. | La función `shouldTriggerHandoff()` debe retornar `true`. |

---

## 2. Pruebas de Integración (Conexión entre Sistemas)

Verifican que el flujo de datos entre Node.js, Gemini AI y Supabase sea fluido y no existan cuellos de botella o timeouts.

| ID Prueba | Componentes Involucrados | Descripción del Escenario | Criterio de Éxito |
| :--- | :--- | :--- | :--- |
| `PI-01` | Node.js ↔ API Gemini | Enviar petición semántica completa al LLM. | Recepción de respuesta HTTP 200 en menos de 3.5 segundos con formato JSON válido. |
| `PI-02` | Node.js ↔ Supabase | Intentar insertar un nuevo `cliente` y un nuevo `caso_triage`. | Las filas deben aparecer en las tablas y las FK (Foreign Keys) deben enlazar correctamente. |
| `PI-03` | Webhook ↔ Node.js | Simular POST request desde WhatsApp al endpoint `/webhook`. | El servidor responde `200 OK` inmediatamente antes de procesar para evitar retries de WhatsApp. |

---

## 3. Pruebas End-to-End (E2E) - Manuales / UAT

Se ejecutarán simulaciones de usuario real usando un entorno de Sandbox.

**Escenario de Prueba E2E 1: Flujo Feliz de Falla Técnica**
1. **Paso 1:** Usuario envía "Hola, mi aire gotea agua".
2. **Paso 2:** Bot responde saludando, solicitando la marca y confirmando si es mantención o falla.
3. **Paso 3:** Usuario responde "Es marca Samsung, falla".
4. **Validación:** Se verifica que en Supabase se haya creado el `caso_triage` con `sintomas: gotea agua` y `marca: Samsung`, y que el estado sea `ABIERTO`.

---

## 4. Entorno y Herramientas

- **Framework de Testing:** Jest (Unitarias).
- **Herramienta de API:** Postman / cURL para pruebas de webhook.
- **Base de Datos:** Entorno local de Supabase conectado al pooler de desarrollo.
- **Mocks:** Se simularán las respuestas de WhatsApp para no agotar la cuota de la API oficial durante las pruebas de CI/CD.
