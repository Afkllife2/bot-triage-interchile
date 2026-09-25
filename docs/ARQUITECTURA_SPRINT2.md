# Arquitectura del Sistema — Sprint 2 (Hito 2)

**Proyecto:** Bot Triage Comercial InterChile
**Versión:** 2.0 — Sprint 2
**Fecha:** 25 de Septiembre 2026
**Referencia:** Reunión Prof. Matías Vargas — 25 Sep 2026

> Este documento presenta la arquitectura de componentes del sistema al cierre del Sprint 2,
> siguiendo el enfoque solicitado por el Prof. Matías: **el Motor IA en el centro, rodeado
> por los arneses de validación, memoria y respaldo** que garantizan calidad y trazabilidad.

---

## Diagrama 1: Vista de Componentes (Sprint 2)

El diagrama central del sistema. Muestra el Motor IA como núcleo y los arneses que lo rodean
para controlar entradas, salidas, memoria y validación.

```mermaid
graph TD
    %% ACTORES EXTERNOS
    Cliente(["📱 Cliente\n(cualquier número WhatsApp)"])
    Admin(["🖥️ Administrador\n(Dashboard Web)"])
    KronosDB[("🗄️ Sistema Kronos\nERP Legacy InterChile")]
    SupabaseDB[("☁️ Supabase\nPostgreSQL en AWS")]

    %% CAPA DE ENTRADA
    Meta["☁️ Meta Cloud API\n(WhatsApp Business Platform)"]
    Tunnel["🔒 Cloudflared Tunnel\n(Exposición HTTPS segura)"]
    Webhook["⚙️ Webhook Server\nNode.js / Express\n(Validación HMAC-SHA256)"]

    %% ARNÉS 1: ENTRADA
    ArnesEntrada["🛡️ ARNÉS DE ENTRADA\nValidación de payload\nFiltro de mensajes vacíos\nDetección tipo: text / interactive"]

    %% NÚCLEO IA — CENTRO DEL SISTEMA
    subgraph NUCLEO ["🧠 MOTOR IA — NÚCLEO DEL SISTEMA"]
        direction TB
        LangChain["⛓️ LangChain\nOrquestador de Cadenas"]
        Gemini["✨ Gemini 2.5 Flash\nExtracción de entidades\nDiagnóstico dinámico\nDetección de urgencia"]
        LangChain --> Gemini
    end

    %% ARNÉS 2: MEMORIA CONVERSACIONAL
    ArnesMemoria["🛡️ ARNÉS DE MEMORIA\nConversationBufferMemory\n(LangChain)\nHistorial últimos 5 mensajes\nExpiración: 60 min"]

    %% ARNÉS 3: VALIDACIÓN KRONOS
    ArnesKronos["🛡️ ARNÉS DE VALIDACIÓN\nContraste con Kronos\nDetección de alucinaciones\nReintentos: máx 2\nFallback a respuesta genérica"]

    %% ARNÉS 4: RESPALDO / ERROR
    ArnesRespaldo["🛡️ ARNÉS DE RESPALDO\nManejo de errores Gemini\nManejo de errores Supabase\nTimeout handling\nLogger de errores"]

    %% CAPA DE SALIDA
    ArnesSalida["🛡️ ARNÉS DE SALIDA\nValidación JSON Schema\nFormato respuesta cliente\nTrigger derivación humano"]

    %% INTERFACES DE SALIDA
    WhatsAppOut["📨 Respuesta WhatsApp\n(texto / botones interactivos)"]
    Dashboard["📊 Dashboard Web\n/dashboard\n(Administración en tiempo real)"]

    %% FLUJO PRINCIPAL
    Cliente -->|"Envía mensaje"| Meta
    Meta -->|"HTTP POST"| Tunnel
    Tunnel --> Webhook
    Webhook --> ArnesEntrada
    ArnesEntrada --> NUCLEO

    %% CONEXIONES DE ARNESES AL NÚCLEO
    ArnesMemoria <-->|"Contexto de conversación"| NUCLEO
    ArnesKronos <-->|"Validación de diagnóstico"| NUCLEO
    ArnesRespaldo -.->|"Captura errores"| NUCLEO

    %% FLUJO DE SALIDA
    NUCLEO --> ArnesSalida
    ArnesSalida -->|"Respuesta al cliente"| WhatsAppOut
    ArnesSalida -->|"Guarda ticket"| SupabaseDB
    WhatsAppOut --> Meta
    Meta --> Cliente

    %% CONEXIONES EXTERNAS
    ArnesKronos <-->|"Consulta"| KronosDB
    ArnesMemoria <-->|"Persiste historial"| SupabaseDB
    SupabaseDB <-->|"Lee tickets"| Dashboard
    Admin -->|"Monitorea"| Dashboard

    %% ESTILOS
    style NUCLEO fill:#1e3a5f,stroke:#3b82f6,stroke-width:3px,color:#fff
    style Gemini fill:#4f46e5,stroke:#818cf8,color:#fff
    style LangChain fill:#0f766e,stroke:#2dd4bf,color:#fff
    style ArnesEntrada fill:#1f2937,stroke:#f59e0b,stroke-width:2px,color:#fbbf24
    style ArnesMemoria fill:#1f2937,stroke:#f59e0b,stroke-width:2px,color:#fbbf24
    style ArnesKronos fill:#1f2937,stroke:#f59e0b,stroke-width:2px,color:#fbbf24
    style ArnesRespaldo fill:#1f2937,stroke:#f59e0b,stroke-width:2px,color:#fbbf24
    style ArnesSalida fill:#1f2937,stroke:#f59e0b,stroke-width:2px,color:#fbbf24
    style SupabaseDB fill:#064e3b,stroke:#10b981,color:#fff
    style KronosDB fill:#4c1d95,stroke:#8b5cf6,color:#fff
    style Dashboard fill:#164e63,stroke:#22d3ee,color:#fff
    style Cliente fill:#1e3a5f,stroke:#60a5fa,color:#fff
    style Admin fill:#1e3a5f,stroke:#60a5fa,color:#fff
```

---

## Diagrama 2: Comparativa Sprint 1 vs Sprint 2

Muestra el crecimiento del sistema. Lo que existía antes (Sprint 1) y lo que se agrega ahora (Sprint 2).

```mermaid
graph LR
    subgraph S1 ["✅ Sprint 1 — MVP Intake (DONE)"]
        direction TB
        WH1["Webhook\nWhatsApp"]
        AI1["Gemini\nbrain.js"]
        DB1["Supabase\ncasos_triage"]
        WH1 --> AI1 --> DB1
    end

    subgraph S2 ["🔨 Sprint 2 — Integración (EN CURSO)"]
        direction TB
        MEM["⛓️ LangChain\nMemoria multi-turno"]
        KRON["🛡️ Arnés Kronos\nAnti-alucinación"]
        HUMAN["👤 Derivación\na Humano"]
        DASH["📊 Dashboard\nWeb Admin"]
        BOTONES["💬 Botones\nInteractivos"]
        PROD["📱 Número\nProducción Meta"]
    end

    S1 -->|"Extiende"| S2

    style S1 fill:#064e3b,stroke:#10b981,color:#fff
    style S2 fill:#1e3a5f,stroke:#3b82f6,color:#fff
```

---

## Diagrama 3: Vista de Despliegue (Infraestructura)

Dónde vive físicamente cada componente del sistema.

```mermaid
graph TD
    subgraph LOCAL ["💻 Máquina Local (Desarrollo)"]
        NodeJS["Node.js / Express\nsrc/server.js"]
        Brain["brain.js\n+ LangChain"]
        Dashboard["Dashboard\npublic/dashboard.html"]
        Cloudflared["cloudflared\nTúnel HTTPS"]
        NodeJS --- Brain
        NodeJS --- Dashboard
        NodeJS --- Cloudflared
    end

    subgraph AWS ["☁️ AWS (vía Supabase) — us-east-2"]
        Supa["PostgreSQL\nclientes\ncasos_triage\nconversaciones"]
    end

    subgraph GOOGLE ["☁️ Google Cloud"]
        GeminiAPI["Gemini API\n2.5 Flash"]
    end

    subgraph META ["☁️ Meta Infrastructure"]
        MetaAPI["WhatsApp\nBusiness Platform"]
        NumProd["📱 Número de\nProducción"]
    end

    subgraph KRONOS ["🏢 InterChile (On-premise / Mock)"]
        KronosMock["Kronos ERP\n(Mock para Sprint 2)"]
    end

    Cloudflared <-->|"HTTPS"| MetaAPI
    Brain <-->|"REST API"| GeminiAPI
    NodeJS <-->|"pg Pooler\n(Supavisor)"| Supa
    Brain <-->|"Consulta"| KronosMock
    MetaAPI --- NumProd

    style LOCAL fill:#1e3a5f,stroke:#3b82f6,color:#fff
    style AWS fill:#064e3b,stroke:#10b981,color:#fff
    style GOOGLE fill:#1e1b4b,stroke:#818cf8,color:#fff
    style META fill:#1c1917,stroke:#f97316,color:#fff
    style KRONOS fill:#4c1d95,stroke:#8b5cf6,color:#fff
```

---

## Leyenda de Arneses

| Arnés | Propósito | HU que lo requiere |
|---|---|---|
| 🛡️ **Arnés de Entrada** | Filtra y valida todo lo que entra al sistema antes de llegar a la IA | HU-20 (Botones) |
| 🛡️ **Arnés de Memoria** | Mantiene el historial de conversación para diagnóstico multi-turno | HU-02 (Diagnóstico) |
| 🛡️ **Arnés de Validación** | Contrasta el output de la IA contra Kronos para detectar alucinaciones | HU-18 (Kronos) |
| 🛡️ **Arnés de Respaldo** | Captura errores de Gemini/Supabase sin crashear el servidor | TSK-02 |
| 🛡️ **Arnés de Salida** | Valida el JSON final y decide si derivar a humano | HU-06 (Derivación) |

---

## Contraste: ¿Se construyó como se diseñó?

> Esta sección se completa al **cierre del Sprint 2** comparando el diseño inicial
> con lo efectivamente implementado.

| Componente diseñado | ¿Implementado? | Observaciones |
|---|---|---|
| Motor IA en el centro (Gemini + LangChain) | ⏳ En progreso | LangChain pendiente de integrar |
| Arnés de Memoria | ⏳ En progreso | Subtarea de HU-02 |
| Arnés de Validación Kronos | ⏳ En progreso | HU-18 |
| Arnés de Respaldo | ⏳ En progreso | TSK-02 subtarea |
| Dashboard Web | ✅ Implementado | CP-S2-13 a CP-S2-16 pendientes de evidencia |
| Número de Producción Meta | ⏳ En gestión | Pendiente liberación SIM |
