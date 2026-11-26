# ADR-04: Topología Cloud 24/7, Desacople Operativo (R-15) y Separación UX Negocio vs. QA

- **Estado:** Aceptada e implementada (`render.yaml`, `Dockerfile`, `public/dashboard.html`)
- **Requerimientos Vinculados:** `RF-01`, `RF-05`, `RF-07` (`OE-1`, `OE-4`), `RNF-01`, `RNF-04`

## Contexto
Durante el Sprint 2 surgieron tres desafíos de arquitectura y negocio: (1) el túnel Cloudflare efímero rompía el Webhook de Meta en cada reinicio (`R-11`); (2) el nuevo ERP Kronos 2.0 de la empresa podía retrasarse más allá del Hito 3 (`R-15`); y (3) mezclar métricas de ingeniería (latencia en `ms`, tasa de arnés) con KPIs comerciales generaba ruido para la gerencia (observación de Sprint Review, `24-11-2026`).

## Alternativas Evaluadas
1. **Alternativa A (Seleccionada): Monolito Modular en Render PaaS (`HTTPS/SSL`) + Plataforma Autónoma Contingencia R-15 con Vista Dual (4 KPIs Negocio arriba + Panel colapsable `#btn-toggle-qa` ISO/IEC 25010)**.
2. **Alternativa B (Descartada): Arquitectura de Microservicios separados + Túnel local + Dashboard técnico mezclado**.

## Matriz de Decisión Ponderada (Escala 1 a 5 · Peso = 100%)

| Criterio (derivado de RF/RNF) | Peso | Alt. A · Render + Modular + Vista Dual | Alt. B · Microservicios / Local |
| :--- | :---: | :---: | :---: |
| **Disponibilidad continua `24/7` sin túneles (`RF-01`, `RNF-01`)** | `40%` | `5` | `2` |
| **Autonomía operativa ante atraso de Kronos 2.0 (`RF-05`, `R-15`)** | `35%` | `5` | `2` |
| **Usabilidad ejecutiva y mantenibilidad unipersonal (`RF-07`, `RNF-04`)** | `25%` | `4` | `3` |
| **Puntaje Ponderado Total** | **`100%`** | **`4,75`** | **`2,25`** |

## Consecuencias y Evidencia
- Despliegue estable 24/7 en `https://bot-triage-interchile.onrender.com/dashboard` conectado a `+56 9 7235 2751` (Token Permanente Meta `R-07`).
- Gerencia visualiza exclusivamente **4 KPIs comerciales**, mientras QA/comisión accede en un clic a **`Observabilidad Técnica (ISO/IEC 25010)`**.
