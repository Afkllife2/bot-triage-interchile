# Modelos UML del Sistema (Camino A — A7)

**Declaración metodológica:** Se adopta exclusivamente el **Camino A: UML**, verificando coherencia directa entre los diagramas versionados, la estructura de módulos en `src/` y el servicio desplegado en Render (`https://bot-triage-interchile.onrender.com`).

---

## Inventario de Vistas UML Versionadas

| Vista UML Requerida (A7) | Artefacto en el Repositorio | Qué Representa en el Código Real Desplegado |
| :--- | :--- | :--- |
| **1. Casos de Uso** | [`../../diagramas_png/Informe_Fig4_Casos_Uso.png`](../../diagramas_png/Informe_Fig4_Casos_Uso.png) | `UC-01` a `UC-10` cubriendo `RF-01`..`RF-07` entre los actores *Cliente WhatsApp (`+56 9 7235 2751`)*, *Meta Cloud API*, *Admin / Benjamín Yáñez* y *ERP Kronos 2.0*. |
| **2. Clases / Modelo Entidad-Relación** | [`../../diagramas_png/Informe_Fig5_Modelo_ER_Clases.png`](../../diagramas_png/Informe_Fig5_Modelo_ER_Clases.png) y [`../../../supabase/migrations/`](../../../supabase/migrations/) | Tablas `public.clientes` (1:N), `public.casos_triage` (`created_at` inmutable, `cotizacion_*`, `fecha_visita`) y `public.reuniones` (`uq_reuniones_slot_activo`); contratos Zod `FichaTriage` y `CotizacionBorrador`. |
| **3. Secuencia (Escenario Feliz + Negativos)** | [`../../diagramas_png/Diagrama_Secuencia_Integrativo_Sprint3_E2E.png`](../../diagramas_png/Diagrama_Secuencia_Integrativo_Sprint3_E2E.png) | Flujo 1 (WhatsApp -> HMAC -> LangChain/Gemini -> Arnés Kronos -> Cotizador/Agenda -> Meta + SLA) y Flujo 2 (Dashboard -> Cursor Keyset -> PDF `%PDF-1.4` -> Agenda `409` -> Panel ISO 25010), incluyendo bifurcaciones `alt` negativas (`401/403`, `[dato por confirmar]`, `HTTP 409 HORARIO_OCUPADO`). |
| **4. Actividades / Flujos por Módulo** | [`../../diagramas_png/Diagrama_Flujo_HU02_Memoria.png`](../../diagramas_png/Diagrama_Flujo_HU02_Memoria.png), [`HU06`](../../diagramas_png/Diagrama_Flujo_HU06_Derivacion.png), [`HU14`](../../diagramas_png/Diagrama_Flujo_HU14_Dashboard.png), [`HU18/21`](../../diagramas_png/Diagrama_Flujo_HU18_HU21_Arneses_Kronos.png), [`HU20`](../../diagramas_png/Diagrama_Flujo_HU20_Botones_WhatsApp.png) | Lógica paso a paso de memoria multi-turno (`10` msgs / `60` min), handoff silencioso, conmutación botones/listas Meta y sanitización del arnés anti-alucinaciones. |
| **5. Componentes y Despliegue Físico** | [`../../diagramas_png/Informe_Fig3_Arquitectura_Componentes.png`](../../diagramas_png/Informe_Fig3_Arquitectura_Componentes.png) y [`../../diagramas_png/Informe_Fig6_Diagrama_Despliegue.png`](../../diagramas_png/Informe_Fig6_Diagrama_Despliegue.png) | Topología en producción: Render Web Service (Node.js/Express `src/*.js` + `public/dashboard.html`) <-> Supabase PostgreSQL (`AWS us-east-2`, Pool SSL) <-> Google Gemini 2.5 Flash <-> Meta Graph API `v21.0`. |
