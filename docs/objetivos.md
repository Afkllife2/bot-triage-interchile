# A1 · Problema, Hipótesis y Objetivos Medibles (Hito 3 — INSW422)

**Proyecto:** Agente Autónomo de Triage Comercial, Cotización Referencial PDF y Agenda Inteligente  
**Empresa Contraparte (Stakeholder Real):** InterChile Clima SpA — Benjamín Yáñez Lasalvia (Gerente Comercial y de Operaciones)  
**Estudiante:** Carlos Gabriel González Salgado  
**Docentes Evaluadores:** Prof. Sarita González Catalán (Metodológica) · Prof. Matías Vargas (Guía Técnico)  
**Producción Cloud (24/7):** https://bot-triage-interchile.onrender.com/dashboard  
**Canal WhatsApp Oficial:** `+56 9 7235 2751`

---

## 1. Definición del Problema (Actores, Causas y Consecuencias)

En **InterChile Clima SpA** (climatización comercial e industrial: equipos *Split*, *Cassette*, *Piso-Techo*, *Ducto*, *Chiller* y *VRV/VRF*), más del **80% de las solicitudes comerciales y urgencias técnicas ingresan por WhatsApp**. Antes del proyecto, todo el proceso de admisión (*intake*), pre-diagnóstico, estimación referencial y coordinación de visitas se realizaba manualmente sin soporte automatizado.

| Dimensión | Situación Observada (AS-IS Documentado con Contraparte) |
| :--- | :--- |
| **Actores afectados** | Clientes residenciales y B2B (clínicas, oficinas, plantas), ejecutivos comerciales y jefatura técnica de InterChile (Benjamín Yáñez). |
| **Causas raíz** | 1) Ausencia de canal conversacional estructurado 24/7.<br>2) Mensajes iniciales ambiguos sin tipo de servicio, equipo, marca ni urgencia.<br>3) Desconexión contractual entre WhatsApp, el tarifario CLP/IVA, la agenda comercial y el futuro ERP Kronos 2.0.<br>4) Riesgo de alucinación técnica/financiera si se conecta un LLM sin validación determinista (Ji et al., 2023). |
| **Consecuencias medibles** | Demoras de **4 a 12 horas** en primera respuesta fuera de horario hábil; **15 a 40 minutos** de filtro manual fragmentado por prospecto; fuga de urgencias; errores de tipeo/IVA y riesgo de topones en visitas o reuniones. |

*(Análisis completo en [`ANALISIS_PROBLEMA_Y_OBJETIVOS_DETALLADO.md`](./ANALISIS_PROBLEMA_Y_OBJETIVOS_DETALLADO.md) y Árbol de Problemas [`Informe_Fig1_Arbol_Problemas.png`](./diagramas_png/Informe_Fig1_Arbol_Problemas.png)).*

---

## 2. Hipótesis de Solución

> **Si** desplegamos un agente autónomo 24/7 en WhatsApp Cloud API que combine comprensión semántica multi-turno (**Gemini 2.5 Flash + Zod**) con **arneses deterministas anti-alucinación** contra catálogo, un **cotizador financiero + PDF (`%PDF-1.4`) desacoplado del LLM** y un **sistema transaccional de agenda con bloqueos `FOR UPDATE` y Dashboard corporativo**, **entonces** la primera respuesta bajará de horas a **menos de 4,0 segundos**, **0%** de marcas o precios inventados llegarán al cliente, los presupuestos borradores tendrán **100%** de precisión aritmética (IVA 19%) y las reuniones/visitas operarán con **0 topones horarios**.

---

## 3. Objetivo General

Diseñar, desarrollar e implementar un sistema autónomo conversacional de triage comercial, cotización referencial en PDF y agendamiento inteligente para **InterChile Clima SpA**, desplegado 24/7 en la nube e integrado contractualmente hacia el ERP Kronos 2.0, garantizando seguridad criptográfica, ausencia de alucinaciones técnicas/financieras y cumplimiento medible de atributos de calidad **ISO/IEC 25010**.

---

## 4. Objetivos Específicos y Resultados Medidos (MPV Desplegado)

| ID | Objetivo Específico | Métrica | Línea Base (Origen) | Meta Numérica | Método de Medición (Repetible) | Resultado Medido (Hito 3) | Validación Stakeholder |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **OE-1** | Automatizar la recepción segura 24/7 y el triage conversacional multi-turno de las 7 líneas de negocio de InterChile por WhatsApp. | Tiempo de respuesta e2e por turno (`ms`) y tasa de recepción válida. | **4–12 h** fuera de horario hábil y **15–40 min** de filtro manual (levantamiento AS-IS con Benjamín Yáñez). | **< 4,0 s (`< 4000 ms`)** promedio y **100%** `HTTP 200` en Webhook. | Registro automático en `src/metricsStore.js` (`GET /api/metricas`), ráfaga de estrés `N=20` en `test/sprint3.test.js` y sesiones reales en `+56 9 7235 2751`. | **`~2,67 s` prom. (`100%` SLA cumplido)**; en servidor Express `N=50` carga HTTP: **`p95 = 169,06 ms`** (`0%` error). Limitación declarada: depende de latencia externa Gemini (`~2–3 s`). | Probado en vivo con Benjamín Yáñez (+ opción **Arriendo** agregada tras su revisión) y en Sprint Reviews con Prof. Sarita González. |
| **OE-2** | Interceptar y sanitizar marcas, tipos de equipo y repuestos alucinados mediante un arnés determinista previo al guardado y respuesta. | `%` de entidades no catalogadas interceptadas y convertidas a `[dato por confirmar]`. | **0%** control algorítmico al usar un LLM sin arnés (literatura Ji et al., 2023). | **100%** de alucinaciones bloqueadas antes de responder/persistir (`0` precios cerrados en casos no verificados). | Ejecución de `test/arneses.test.js` (`15` tests) + Escenario B vivo (*InventadaPro*) en WhatsApp y `/dashboard`. | **`100%` interceptado (`15/15 PASS`, `96,92%` líneas en `src/arneses.js`)**; emite Ficha Técnica de Levantamiento sin monto cerrado. | Validado con Prof. Sarita González (Escenario B WhatsApp + Ficha `03 LEVANTAMIENTO`) y contrato catálogo `KRON2-152`. |
| **OE-3** | Formalizar borradores de cotización CLP (Neto + IVA 19%) fuera del LLM y emitir fichas corporativas en formato `%PDF-1.4`. | Exactitud aritmética (`%`) y tiempo de ensamblado binario `%PDF-1.4` (`ms`). | Cálculo manual en hoja/chat con riesgo de error de IVA y demora de envío. | **100%** exactitud aritmética · **100%** descarga `%PDF-1.4` en **< 3,0 s**. | Suite `[INT-HU-05]` (`test/sprint3.test.js`), prueba carga `GET /api/tickets/94/pdf` (`N=125` reqs) y validación visual del formato impreso. | **`100%` exacto** (`$45.000 + $8.550 = $53.550 CLP`) · **`p95 = 122,67 ms`** bajo carga (`< 5 ms` ensamblado unitario, `100%` PDFs válidos). | Formato oficial de Ficha PDF validado y aprobado directamente por **Benjamín Yáñez Lasalvia** (`Evidencia_AAI_25_PDF_Corporativo_Real.jpg`). |
| **OE-4** | Entregar autonomía operativa ante el desfase de Kronos 2.0 (Contingencia R-15) con agenda sin topones, Dashboard corporativo y calidad verificada. | Topones horarios (`HTTP 409`), separación Negocio/QA y cobertura lógica de negocio (`Jest`). | **0%** automatización de agenda / **0%** suite de cobertura al inicio del proyecto. | **0** topones horarios · **`>= 70%`** cobertura de líneas en lógica de negocio. | Pruebas de concurrencia PostgreSQL `FOR UPDATE` (`test/db-contrato.test.js`, `test/hu23-reuniones-agenda.test.js`) y `npx jest --coverage` con carga HTTP `N=50`. | **`0` topones** (`HTTP 409 HORARIO_OCUPADO` + reglas Lun–Vie `09:00–12:00 / 14:00–18:00`) · **`91,37%` cobertura líneas global** (`100%` en `cotizador.js`, `metricsStore.js` y `agenda.js`). | Reglas de negocio (4 KPIs arriba, QA ISO colapsable, estados `ingresada->confirmada->completada` y horario Benjamín) aprobadas tras Sprint Review (24-11-2026). |
