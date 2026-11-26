# ADR-03: Ensamblador Nativo `%PDF-1.4` en Memoria vs. Navegador Headless

- **Estado:** Aceptada e implementada (`src/pdfGenerator.js`, endpoint `GET /api/tickets/:id/pdf`)
- **Requerimientos Vinculados:** `RF-04` (`OE-3`), `RNF-01` (`Eficiencia < 3s` / RAM Render 512 MB)

## Contexto
Cada ticket debe poder descargarse desde `/dashboard` o Kronos 2.0 en **menos de 3 segundos** como PDF corporativo con membrete e imagen oficial de **InterChile Clima SpA** (formato validado con Benjamín Yáñez), ejecutándose dentro de un contenedor gratuito en Render limitado a **512 MB de RAM** (`R-17`).

## Alternativas Evaluadas
1. **Alternativa A (Seleccionada): Ensamblador Binario `%PDF-1.4` Puro en Node.js (`src/pdfGenerator.js`)** — Construye en memoria los objetos PDF, tabla burdeo `#9e1046`, logo embebido (`XObject`) y sello de estimación referencial sin procesos hijos ni binarios externos.
2. **Alternativa B (Descartada): Renderizado HTML-a-PDF vía Puppeteer / Chromium Headless** — Facilidad para reutilizar CSS, pero consume `> 300 MB` de RAM por arranque de Chromium y supera los límites de Render Free.

## Matriz de Decisión Ponderada (Escala 1 a 5 · Peso = 100%)

| Criterio (derivado de RF/RNF) | Peso | Alt. A · Nativo `%PDF-1.4` | Alt. B · Chromium Headless |
| :--- | :---: | :---: | :---: |
| **Consumo de memoria en Render 512 MB (`RNF-01`)** | `40%` | `5` | `1` |
| **Latencia de generación (`< 3000 ms`, real `< 5 ms`) (`RF-04`)** | `35%` | `5` | `2` |
| **Flexibilidad estética de diseño corporativo** | `25%` | `4` | `5` |
| **Puntaje Ponderado Total** | **`100%`** | **`4,75`** | **`2,35`** |

## Consecuencias y Evidencia
- `src/pdfGenerator.js` logra **`98,46%` cobertura de líneas**, ensamblado en **`< 5 ms`** y **`p95 = 122,67 ms`** bajo carga HTTP concurrente (`125/125 OK` en `load-test-report.json`), manteniendo estable el servicio en Render.
