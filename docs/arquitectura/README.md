# A7 · Arquitectura, Modelamiento y Decisiones (Hito 3 — INSW422)

**Camino de Modelamiento Elegido: Camino A — UML** *(Decisión excluyente de Camino B C4 + BPMN, coherente con las vistas UML construidas desde el Hito 1 y desplegadas en `src/` y `public/`).*

---

## 1. Stack Tecnológico Justificado desde las Decisiones Arquitectónicas

El sistema implementa un **Monolito Modular en Capas con Adaptadores Desacoplados** (`src/server.js`, `src/brain.js`, `src/arneses.js`, `src/kronos.js`, `src/cotizador.js`, `src/pdfGenerator.js`, `src/agenda.js`, `src/db.js`, `src/whatsapp.js`, `src/metricsStore.js`), desplegado en Render Cloud y conectado a Supabase PostgreSQL, Google Gemini y Meta Cloud API. Cada pieza del stack responde directamente a las decisiones ponderadas de la Sección 2:

| Capa / Tecnología | Versión / Plataforma | Justificación Ligada a ADRs y Requerimientos |
| :--- | :--- | :--- |
| **Runtime & Framework** | Node.js `>= 18` + Express `^4.22.2` | I/O asíncrono no bloqueante ideal para Webhook `POST /webhooks/meta` + llamadas paralelas sin complejidad distribuida de microservicios (`RNF-01`, `RNF-03`). |
| **Motor Semántico** | `@langchain/google-genai` (`gemini-2.5-flash`) + `Zod ^4.6.7` | Benchmark empírico en Sprint 2 demostró latencia `~2–3 s` frente a `> 50 s` en modelos pesados; `Zod` fuerza esquema tipado en tiempo de ejecución (`RF-01`, `RNF-01`). |
| **Lógica Determinista** | `src/cotizador.js`, `src/arneses.js`, `src/agenda.js` | Aísla aritmética CLP + IVA `19%`, catálogo Kronos y reglas hábiles Lun–Vie fuera del LLM (`ADR-01`, `RF-03`, `RF-04`). |
| **Generador PDF** | `src/pdfGenerator.js` (`%PDF-1.4` nativo en memoria) | Emite documentos corporativos en `< 5 ms` y `< 60 KB` evitando `> 300 MB` de RAM de Chromium en contenedores Render Free 512 MB (`ADR-03`, `RNF-01`). |
| **Base de Datos** | PostgreSQL en Supabase (`pg ^8.11.5`, Pool SSL) | Garantiza integridad relacional 1:N (`clientes`, `casos_triage`, `reuniones`), cursor keyset con microsegundos, `created_at` inmutable y locks `FOR UPDATE` (`ADR-02`, `RF-04`). |
| **Hosting & Seguridad** | Render SSL (`https://bot-triage-interchile.onrender.com`) | URL HTTPS fija para Webhook permanente de Meta (`R-11`), `HMAC-SHA256`, Bearer aislado y `timingSafeEqual` (`RNF-02`). |

---

## 2. Registros de Decisiones Arquitectónicas (ADRs) con Matriz Ponderada

> **Índice de archivos individuales:** [`adr/ADR-01-calculo-y-arnes-fuera-del-llm.md`](./adr/ADR-01-calculo-y-arnes-fuera-del-llm.md) · [`adr/ADR-02-motor-persistencia-postgresql.md`](./adr/ADR-02-motor-persistencia-postgresql.md) · [`adr/ADR-03-generador-nativo-pdf.md`](./adr/ADR-03-generador-nativo-pdf.md) · [`adr/ADR-04-despliegue-cloud-y-separacion-ux.md`](./adr/ADR-04-despliegue-cloud-y-separacion-ux.md)

### Resumen de Matrices Ponderadas (Escala 1 a 5 · Pesos 100%)

| ADR | Decisión Evaluada (Req. Ligado) | Alternativa Seleccionada (Puntaje) | Alternativa Descartada (Puntaje) | Respaldo Empírico en Repo |
| :--- | :--- | :--- | :--- | :--- |
| **ADR-01** | Cálculo CLP e IVA y validación técnica (`RF-03`, `RF-04`, `RNF-02`) | Motor determinista + Arnés fuera de Gemini (**4,80**) | Delegar tarifas/catálogo en prompt LLM (**2,40**) | `src/cotizador.js` (`100%` cobertura), `src/arneses.js` (`15/15 PASS`) |
| **ADR-02** | Base de datos y bloqueo de agenda (`RF-05`, `RF-06`, `RNF-01`) | PostgreSQL Supabase + `FOR UPDATE` + índice `23505` (**4,70**) | MongoDB / NoSQL documental (**3,30**) | `supabase/migrations/*.sql`, `test/db-contrato.test.js` (`409 Conflict`) |
| **ADR-03** | Generación de Ficha PDF en nube (`RF-04`, `RNF-01`) | Ensamblador nativo `%PDF-1.4` en RAM (**4,75**) | Chromium / Puppeteer Headless (**2,35**) | `src/pdfGenerator.js` (`< 5 ms` ensamblado, `p95 = 122,67 ms` bajo `N=50` carga) |
| **ADR-04** | Topología, Hosting y Separación UX (`RF-01`, `RF-07`, `RNF-01`) | Monolito Modular Render + Gemini 2.5 Flash + Panel QA aislado (**4,75**) | Microservicios + Túnel Cloudflare + Dashboard mezclado (**2,45**) | `render.yaml`, `public/dashboard.html` (`#btn-toggle-qa`) |

---

## 3. Modelamiento UML (Camino A) Coherente con lo Desplegado

Todos los diagramas UML se encuentran versionados en `docs/diagramas_png/` y detallados en [`modelos/README.md`](./modelos/README.md), reflejando **1:1** los componentes, tablas SQL y endpoints efectivamente desplegados:

1. **Diagrama de Casos de Uso (`UC-01` a `UC-10`):** [`../diagramas_png/Informe_Fig4_Casos_Uso.png`](../diagramas_png/Informe_Fig4_Casos_Uso.png) — Actores: *Cliente InterChile*, *Meta Cloud API*, *Admin / Benjamín Yáñez*, *ERP Kronos 2.0*.
2. **Modelo Entidad-Relación / Clases de Dominio:** [`../diagramas_png/Informe_Fig5_Modelo_ER_Clases.png`](../diagramas_png/Informe_Fig5_Modelo_ER_Clases.png) — Tablas `public.clientes`, `public.casos_triage` y `public.reuniones` (migración `20261122000000_sprint3_reuniones_schema.sql`), contratos `FichaTriage` (Zod) y `CotizacionBorrador`.
3. **Diagrama de Secuencia Integrativo E2E (Escenarios Feliz + Negativos `401/403` y `409`):** [`../diagramas_png/Diagrama_Secuencia_Integrativo_Sprint3_E2E.png`](../diagramas_png/Diagrama_Secuencia_Integrativo_Sprint3_E2E.png) — Fuente Mermaid también en [`../ARQUITECTURA_INTEGRATIVA_SPRINT_3.md`](../ARQUITECTURA_INTEGRATIVA_SPRINT_3.md).
4. **Diagramas de Actividades / Flujos de Negocio:** [`../diagramas_png/Diagrama_Flujo_HU02_Memoria.png`](../diagramas_png/Diagrama_Flujo_HU02_MEMORIA.png), [`../diagramas_png/Diagrama_Flujo_HU06_Derivacion.png`](../diagramas_png/Diagrama_Flujo_HU06_Derivacion.png), [`../diagramas_png/Diagrama_Flujo_HU14_Dashboard.png`](../diagramas_png/Diagrama_Flujo_HU14_Dashboard.png), [`../diagramas_png/Diagrama_Flujo_HU18_HU21_Arneses_Kronos.png`](../diagramas_png/Diagrama_Flujo_HU18_HU21_Arneses_Kronos.png), [`../diagramas_png/Diagrama_Flujo_HU20_Botones_WhatsApp.png`](../diagramas_png/Diagrama_Flujo_HU20_Botones_WhatsApp.png).
5. **Diagrama de Componentes y Despliegue Físico:** [`../diagramas_png/Informe_Fig3_Arquitectura_Componentes.png`](../diagramas_png/Informe_Fig3_Arquitectura_Componentes.png) y [`../diagramas_png/Informe_Fig6_Diagrama_Despliegue.png`](../diagramas_png/Informe_Fig6_Diagrama_Despliegue.png).
