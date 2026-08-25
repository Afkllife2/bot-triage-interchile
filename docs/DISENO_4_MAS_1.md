# Arquitectura 4+1 (Diseño del Incremento - Sprint 1)

**Proyecto:** Bot Triage Comercial InterChile
**Modelo:** Vistas de Arquitectura 4+1 de Kruchten

Este documento presenta el diseño arquitectónico del incremento de software correspondiente al Hito 1, estructurado en las 5 vistas del modelo 4+1, asegurando la trazabilidad con las Historias de Usuario (HU-01 a HU-06).

---

## 1. Vista Lógica (Estructura y Componentes)
Muestra las partes que componen el sistema y cómo se relacionan funcionalmente.
- **Módulo de Recepción (Webhook):** Construido en Node.js/Express. Recibe los JSON de Meta (WhatsApp).
- **Módulo de Triage (Cerebro):** Encargado de las reglas de negocio. Verifica prioridad y tipo de cliente.
- **Módulo de Inteligencia Artificial:** Integración vía API REST con Google Gemini.
- **Módulo de Persistencia:** Cliente ORM (Prisma/pg) que interactúa con Supabase (PostgreSQL).

## 2. Vista de Procesos (Interacción y Concurrencia)
Describe cómo fluye la información en tiempo de ejecución.
- **Proceso Asíncrono Principal:**
  1. Ingresa mensaje HTTP POST al Webhook.
  2. Node.js parsea el texto y lanza request asíncrono a Gemini.
  3. Node.js espera respuesta, formatea el JSON (Entidades extraídas).
  4. Node.js ejecuta un INSERT asíncrono en Supabase.
  5. Se dispara respuesta al usuario vía WhatsApp API.
- *Decisión de Diseño:* Se usan Promesas (`async/await`) en Node.js para evitar el bloqueo del Event Loop durante la llamada al LLM.

## 3. Vista de Desarrollo (Despliegue y Código)
Muestra cómo está estructurado el código fuente y el entorno de desarrollo.
- **Repositorio:** Git (GitHub), estructurado bajo Git Flow (`main`, `develop`).
- **Pila Tecnológica:** Node.js, Express, Jest (Testing), Supabase-js.
- **Gestión de Entorno:** Archivo `.env` para proteger JWT tokens y URLs de pooler (Supavisor).

## 4. Vista Física (Topología de Red)
Muestra dónde se ejecutan los componentes de software físicamente (en la nube).
- **Servidor Backend:** (Proyectado para Render / Heroku / AWS EC2). Ejecuta la instancia Node.js.
- **Base de Datos:** Instancia serverless en AWS (vía Supabase), región `us-east-2`.
- **API Externa 1:** Google Cloud (Gemini API).
- **API Externa 2:** Meta Graph API (WhatsApp).

## 5. Vista de Escenarios (Casos de Uso)
El "más 1". Valida que el diseño soporta las Historias de Usuario.
- **Escenario (HU-04 - Ficha de Consolidación):** El usuario ingresa sus datos. La Vista Lógica orquesta la petición, la Vista de Procesos asegura que no haya timeout con el LLM, y la Vista Física asegura que la conexión segura a la DB en AWS guarde el registro en la tabla `casos_triage`.
