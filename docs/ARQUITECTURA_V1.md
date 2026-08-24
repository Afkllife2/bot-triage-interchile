# Arquitectura Inicial v1 (Hito 1) - Bot Triage InterChile

Este documento presenta la vista de componentes y capas de la arquitectura del proyecto para el Hito 1.

## Diagrama de Componentes (Mermaid)

```mermaid
graph TD
    %% Capa de Interacción (Usuario)
    subgraph Capa de Interacción
        W[WhatsApp / Telegram]
    end

    %% Capa de Lógica de Negocio (Backend)
    subgraph Capa de Lógica de Negocio
        API[Node.js Webhook / API]
        RAG[Módulo de Triage y Prompts]
        Handoff[Módulo de Handoff a Humano]
    end

    %% Capa de Inteligencia Artificial
    subgraph Capa de Inteligencia Artificial
        Gemini[Google Gemini LLM]
    end

    %% Capa de Persistencia (Base de Datos)
    subgraph Capa de Persistencia
        Supabase[(Supabase - PostgreSQL)]
    end

    %% Flujos de Información
    W -- "Mensaje (Texto/Audio/Foto)" --> API
    API -- "Inyección de Contexto" --> RAG
    RAG -- "Petición Semántica" --> Gemini
    Gemini -- "Respuesta + Entidades Extraídas" --> RAG
    
    %% Flujo de Base de datos
    RAG -- "Inserta Ficha Comercial" --> Supabase
    
    %% Flujo de Handoff
    RAG -- "Si intención == 'Urgente/Industrial'" --> Handoff
    Handoff -- "Notifica a Ejecutivo" --> W
    
    %% Estilos (Opcional)
    classDef usuario fill:#25D366,stroke:#fff,stroke-width:2px,color:#fff;
    classDef backend fill:#339933,stroke:#fff,stroke-width:2px,color:#fff;
    classDef ia fill:#4285F4,stroke:#fff,stroke-width:2px,color:#fff;
    classDef db fill:#3ECF8E,stroke:#fff,stroke-width:2px,color:#1c1c1c;
    
    class W usuario;
    class API,RAG,Handoff backend;
    class Gemini ia;
    class Supabase db;
```

## Descripción de Componentes

1. **Capa de Interacción:** 
   - El cliente se comunica exclusivamente mediante una aplicación de mensajería (ej. WhatsApp).
2. **Capa de Lógica de Negocio (Node.js):**
   - **Webhook:** Recibe los eventos del cliente.
   - **Módulo Triage:** Orquesta el flujo, mantiene la memoria de la conversación y decide qué hacer.
   - **Módulo Handoff:** Encargado de detener el bot y escalar a un humano cuando el negocio lo amerita.
3. **Capa de IA (Gemini):**
   - Se encarga del procesamiento de lenguaje natural (NLP). Entiende modismos chilenos sobre aires acondicionados y extrae entidades (síntoma, marca, dirección).
4. **Capa de Persistencia (Supabase):**
   - Base de datos relacional PostgreSQL donde se almacena el resumen final (Ficha) del caso, listo para el técnico.
