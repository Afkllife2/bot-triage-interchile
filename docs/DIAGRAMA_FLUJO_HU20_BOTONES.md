# Diagrama de Flujo de Negocio — HU-20: Botones y Listas Interactivas en WhatsApp

**Proyecto:** Bot Triage Comercial InterChile
**Sprint:** Sprint 2
**Historia de Usuario:** HU-20
**Fecha:** Octubre 2026

---

## Historia de Usuario

> **Como** cliente que se comunica por WhatsApp con InterChile,
> **Quiero** poder seleccionar el motivo de mi consulta tocando botones o un menú interactivo en vez de escribir todo a mano,
> **Para** agilizar mi atención y evitar errores al describir lo que necesito (Falla Técnica, Mantención, Cotización o Arriendo).

---

## Criterios de Aceptación (CA) cubiertos por este diagrama

| CA | Descripción |
|---|---|
| CA-1 | Envío de opciones interactivas cuando la IA sugiere `opciones_botones` (botones rápidos si son ≤3 opciones, o Menú de Lista si son 4 a 10 opciones como al incluir "Arriendo") |
| CA-2 | Procesamiento transparente cuando el cliente presiona un botón (`button_reply`) o elige un ítem de lista (`list_reply`) |
| CA-3 | Fallback a texto libre si el cliente prefiere escribir en lugar de usar los botones, o si la API interactiva falla |

---

## Diagrama de Flujo de Negocio

```mermaid
flowchart TD
    A(["🤖 Ficha de IA lista para enviar\nal cliente por WhatsApp"]) --> B

    B{"¿ficha.opciones_botones\ntiene opciones (> 0)?"}

    B -- "No" --> C["Enviar mensaje de texto plano\nenviarMensajeWhatsApp()"]

    B -- "Sí (CA-1)" --> D{"¿Cuántas opciones\ntiene el arreglo?"}

    D -- "1 a 3 opciones" --> E["Construir Payload Interactivo\ntipo: 'button' (máx 3 botones, 20 chars)"]
    D -- "4 a 10 opciones\n(Ej: Falla, Mantención, Cotización, Arriendo)" --> F["Construir Payload Interactivo\ntipo: 'list' con botón 'Ver opciones' (24 chars)"]

    E --> G["Enviar POST a Meta Graph API\ncon Timeout de 8s"]
    F --> G

    G --> H{"¿Meta API respondió\n200 OK?"}

    H -- "No (Error)" --> I["Fallback (CA-3):\nFormatear opciones como lista numerada\ny enviar como texto plano"]
    H -- "Sí" --> J(["📱 Cliente ve botones o menú\nen su WhatsApp"])

    J --> K{"¿Cómo responde\nel cliente?"}

    K -- "Toca Botón Rápido" --> L["Webhook recibe interactive.button_reply.title\n(CA-2)"]
    K -- "Selecciona de Lista" --> M["Webhook recibe interactive.list_reply.title\n(CA-2)"]
    K -- "Escribe texto libre" --> N["Webhook recibe text.body\n(CA-3)"]

    L --> O(["🧠 Pasa como textoCliente\nal Motor IA en el siguiente turno"])
    M --> O
    N --> O
```

---

## Asociación con Código Fuente

| Elemento del diagrama | Archivo | Función / Bloque |
|---|---|---|
| Generación de opciones | `src/brain.js` | Campo Zod `opciones_botones: z.array(z.string().max(24)).max(10)` |
| Decisión Botones vs Lista | `src/whatsapp.js` | `enviarMensajeConBotones()` (`opciones.length <= 3`) |
| Recepción `button_reply` y `list_reply` | `src/server.js` | Bloque `if (waMessage.type === 'interactive')` |
| Fallback a lista numerada | `src/whatsapp.js` | Catch / `!response.ok` en `enviarMensajeConBotones()` |
