# Diagrama de Flujo de Negocio — HU-14: Dashboard Web para Administradores

**Proyecto:** Bot Triage Comercial InterChile
**Sprint:** Sprint 2
**Historia de Usuario:** HU-14
**Fecha:** Octubre 2026

---

## Historia de Usuario

> **Como** administrador de InterChile,
> **Quiero** ver en un panel web todos los tickets de triage generados por el bot,
> **Para** poder priorizar la atención a clientes con problemas urgentes y derivar casos a técnicos o ejecutivos.

---

## Criterios de Aceptación (CA) cubiertos por este diagrama

| CA | Descripción |
|---|---|
| CA-1 | El dashboard carga la tabla de tickets con columnas: Fecha, Teléfono, Equipo, Síntoma, Prioridad, Estado |
| CA-2 | Los tickets de prioridad Alta se muestran resaltados visualmente |
| CA-3 | El administrador puede filtrar por: Todos / Prioridad Alta / Requieren Humano / Normal |
| CA-4 | Al presionar "Actualizar", aparecen los tickets nuevos sin recargar la página |

---

## Diagrama de Flujo de Negocio

```mermaid
flowchart TD
    A([👨‍💼 Administrador\nabre el Dashboard\nen el navegador]) --> B

    B[Navegador solicita\nGET /dashboard]

    B --> C[Servidor entrega\nla página HTML del panel]

    C --> D[JavaScript del navegador\nsolicita GET /api/tickets\na Supabase vía servidor]

    D --> E[(🗄️ Supabase\nTabla: casos_triage)]

    E --> F[Retorna lista de\ntodos los tickets\nordenados por fecha DESC]

    F --> G[Dashboard renderiza\nla tabla de tickets]

    G --> H{¿El ticket tiene\nprioridad Alta?}

    H -- Sí --> I[🔴 Fila resaltada\nen color rojo]
    H -- No --> J[🟢 Fila normal]

    I --> K
    J --> K

    K[Tabla completa visible\ncon columnas:\n📅 Fecha | 📞 Teléfono | 👤 Cliente\n🔧 Equipo | 🩺 Síntoma | ⚡ Prioridad | 📋 Estado]

    K --> L{¿Administrador\naplicó un filtro?}

    L -- Filtro: Prioridad Alta --> M[Muestra solo tickets\ncon prioridad = Alta]
    L -- Filtro: Requieren Humano --> N[Muestra solo tickets\ncon requiere_humano = true]
    L -- Filtro: Normal --> O[Muestra solo tickets\ncon prioridad = Normal]
    L -- Sin filtro: Todos --> P[Muestra todos\nlos tickets]

    M --> Q
    N --> Q
    O --> Q
    P --> Q

    Q[Vista filtrada actualizada\ninstantáneamente en pantalla]

    Q --> R{¿Llega un mensaje\nnuevo por WhatsApp\nal bot?}

    R -- Sí --> S[Bot procesa el mensaje\ny guarda ticket en Supabase]

    S --> T{¿Administrador\npresiona Actualizar?}

    T -- Sí --> D
    T -- No, espera actualización\nauto cada 30 seg --> D

    R -- No --> U([⏳ Dashboard en\nestado de espera])
```

---

## Explicación del Flujo por Etapas

### 1. Acceso al Dashboard
El administrador de InterChile abre el navegador y navega a `http://localhost:3000/dashboard`. No requiere autenticación en esta versión (Sprint 2). El servidor entrega la página HTML completa del panel.

### 2. Carga inicial de datos
El JavaScript del navegador hace una llamada automática a la API interna `/api/tickets`. El servidor consulta Supabase y retorna todos los tickets ordenados del más reciente al más antiguo.

### 3. Visualización con prioridades (CA-1, CA-2)
La tabla se renderiza mostrando todas las columnas relevantes. Los tickets marcados con prioridad **Alta** (clientes con urgencia real, como locales sin climatización o clientes presentes en el local) se muestran con una etiqueta roja de alta visibilidad.

### 4. Sistema de filtros (CA-3)
El administrador puede seleccionar filtros en la barra superior:
- **Todos**: Vista completa sin filtro
- **Prioridad Alta**: Solo casos urgentes que necesitan respuesta inmediata
- **Requieren Humano**: Casos donde el bot detectó que se necesita un ejecutivo real
- **Normal**: Consultas estándar sin urgencia

Los filtros actúan en tiempo real sobre los datos ya cargados, sin hacer una nueva consulta a la base de datos.

### 5. Actualización de datos (CA-4)
Cuando llega un mensaje nuevo por WhatsApp, el bot lo procesa y guarda el ticket en Supabase. El administrador puede:
- Presionar el botón **"Actualizar"** para ver el ticket nuevo inmediatamente
- O esperar la actualización automática cada 30 segundos (si está configurada)

### 6. Ciclo continuo
El dashboard permite al equipo de InterChile monitorear en tiempo real la demanda de servicios, priorizar la asignación de técnicos y detectar problemas recurrentes por zona o tipo de equipo.

---

## Evidencia de Funcionamiento (Sprint 2)

Dashboard verificado el **29 de septiembre 2026**:

| Métrica | Valor observado |
|---|---|
| Total de tickets en pantalla | 47 |
| Tickets Prioridad Alta | 20 |
| Tickets Requieren Humano | 0 |
| Tickets Prioridad Normal | 27 |
| Filtro "Prioridad Alta" | ✅ Funciona — muestra solo los 20 rojos |
| Tiempo de carga | < 2 segundos |

---

## Asociación con Código Fuente

| Elemento del diagrama | Archivo | Función |
|---|---|---|
| Ruta del Dashboard | `src/server.js` | `GET /dashboard` → sirve `public/index.html` |
| API de tickets | `src/server.js` | `GET /api/tickets` |
| Consulta a Supabase | `src/db.js` | `getTicketsDashboard()` |
| Filtros visuales | `public/index.html` | JavaScript inline con `filter()` sobre array |
| Resaltado Alta prioridad | `public/index.html` | CSS class `.priority-alta` |

---

## Asociación con HU-02 (Dependencia)

El Dashboard depende directamente de **HU-02**: cada conversación procesada por el arnés de memoria genera un ticket estructurado que el Dashboard muestra. Sin la extracción de datos de HU-02, el Dashboard solo tendría campos vacíos.

```
HU-02 (Memoria + Extracción) ──genera──► Ticket en Supabase ──muestra──► HU-14 (Dashboard)
```
