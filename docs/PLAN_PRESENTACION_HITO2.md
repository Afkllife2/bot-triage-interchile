# Plan de Presentación — Hito 2 (Sprint 2)

**Proyecto:** Bot Triage Comercial InterChile
**Evaluador:** Prof. Matías Vargas Marín
**Formato oficial (rúbrica):** 20 min → 5 min requerimientos/contexto · 5 min diseño técnico · 7 min demo · 3 min evidencia
**Hilo conductor exigido:** Requerimientos → Diseño → Arquitectura → Implementación → Integración → Pruebas

---

## 1. Mapa rúbrica → qué mostramos → dónde está la evidencia

| Criterio (peso) | Qué decimos / mostramos | Evidencia en el repo |
|---|---|---|
| **Incremento funcional (20%)** | Las HU comprometidas funcionando en demo en vivo sobre el número oficial `+56 9 7235 2751`: memoria multi-turno, botones/lista, derivación, arneses, dashboard | `docs/EVIDENCIAS_SPRINT2.md`, tablero Jira en "Listo" |
| **Requerimientos (15%)** | HU con CA en Dado/Cuando/Entonces, priorizadas por épica; feedback real del cliente (Arriendo + contacto de Benjamín) incorporado como cambio controlado | `docs/MATRIZ_TRAZABILIDAD_SPRINT2.md`, `docs/ACTA_REVIEW_SPRINT_2.md`, `docs/REGISTRO_CAMBIOS_PROFESORES.md` |
| **Arquitectura (15%)** | Capas y responsabilidades: `server.js` (entrada + HMAC) → `brain.js` (LangChain + Zod + memoria) → `arneses.js`/`kronos.js` (validación) → `db.js` (Supabase) → `whatsapp.js` (salida) | `docs/ARQUITECTURA_V1.md`, `docs/DISENO_4_MAS_1.md`, 5 diagramas de flujo en `docs/` |
| **Datos, procesos, plataformas (15%)** | Modelo `clientes` / `casos_triage`, estados `en_proceso`/`derivado`, Meta Cloud API, Gemini, Supabase, Cloudflare Tunnel; justificar cada decisión | `supabase/migrations/`, `src/db.js` |
| **Implementación y calidad (15%)** | Salida estructurada con Zod, manejo de errores (timeout 8 s, rollback, `logs/error.log`, handler global), inmutabilidad en arneses | `src/brain.js`, `src/db.js`, `src/arneses.js` |
| **Validación y pruebas (10%)** | 17 tests Jest en verde + 24 casos del plan, cada uno atado a un CA | `docs/PLAN_DE_PRUEBAS_SPRINT2.md`, `test/` |
| **Integración y calidad (5%)** | Integración end-to-end real; atributos: seguridad (HMAC-SHA256), disponibilidad (fallbacks), usabilidad (botones/lista), mantenibilidad | `src/server.js`, demo |
| **Evidencia y evolución (5%)** | Commits, ramas por HU, bitácora, trazabilidad HU→código→prueba, comparación con Hito 1 | `BITACORA_DESARROLLO.md`, ramas en GitHub |

---

## 2. Mejoras logradas respecto al Hito 1 (el relato de "evolución")

| Hito 1 | Hito 2 |
|---|---|
| Prototipo: un mensaje → una ficha, sin contexto | **Memoria multi-turno** por teléfono (10 mensajes, expira a 60 min) |
| SDK de Gemini directo | **LangChain + `withStructuredOutput` (Zod)** |
| Solo texto | **Botones y lista interactiva** (conmuta solo según nº de opciones) |
| Sin escalamiento | **Derivación a humano** + silencio post-derivación + contacto de Benjamín |
| La IA podía inventar datos | **Arneses de IA**: validación contra catálogo Kronos, reemplazo por `[dato por confirmar]`, auditoría en log |
| Cualquier fallo rompía el flujo | **Resiliencia**: timeouts 8 s, rollback, log local, siempre HTTP 200 a Meta |
| Sin visibilidad | **Dashboard web** en tiempo real con filtros y alerta "Requiere Humano" |
| Número de prueba de Meta | **Número oficial de producción** validado por el dueño |
| Sin tests del flujo conversacional | **17 tests** + plan de 24 casos trazados a CA |

---

## 3. Guion de 20 minutos

### Min 0–5 · Requerimientos y contexto
1. Problema de InterChile: triage manual de WhatsApp (falla, mantención, cotización, arriendo).
2. Épicas y HU del Sprint 2 con sus CA (mostrar la matriz de trazabilidad, no leer todo).
3. **Cambio controlado:** el dueño pidió Arriendo y entregar el contacto de Benjamín → entró al sprint con trazabilidad.

### Min 5–10 · Diseño técnico
1. Diagrama de arquitectura por capas y flujo de un mensaje de punta a punta.
2. Decisiones y su porqué: Zod (salida determinista), arneses separados de la IA (validación determinista), lista vs botones (límite de 3 de Meta), memoria en RAM (simplicidad en prototipo).
3. Modelo de datos y estados del ticket.

### Min 10–17 · Demo en vivo (7 min) — orden sugerido
1. Saludo → **botones** (`Falla Técnica / Mantención / Cotización`) o **lista** con Arriendo.
2. Conversación de 3–4 turnos: dar nombre y comuna, luego "el split samsung no enfría" → **el bot no repite preguntas**, escala a prioridad Alta con "es urgente".
3. Pedir ejecutivo / proyecto industrial con planos → **derivación** con contacto de Benjamín.
4. Abrir `/dashboard`: ticket nuevo, fila roja de Alta, alerta amarilla "Requiere Humano".
5. Mensaje extra al número derivado → respuesta estática, la IA no se invoca.
6. (Si hay tiempo) `npm test` en terminal: 17/17.

> **Plan B de demo:** tener grabado un video/capturas de cada paso por si falla el túnel o Meta. Las capturas están en `docs/evidencias_png/`.

### Min 17–20 · Evidencia
Jira (todo en Listo con adjuntos), GitHub (ramas por HU), `EVIDENCIAS_SPRINT2.md`, bitácora y comparación con Hito 1.

---

## 4. Checklist previo a la demo
- [ ] `npm run dev` + `cloudflared tunnel --url http://localhost:3000` arriba **antes** de presentar.
- [ ] La URL de `trycloudflare` cambia en cada arranque → actualizarla en Meta (Configuración de webhooks → Editar) y verificar.
- [ ] Token de acceso vigente (el temporal expira); probar enviando un "hola" 10 min antes.
- [ ] Dashboard abierto en otra pestaña y limpio de tickets de prueba confusos.
- [ ] Capturas/video de respaldo a mano.
- [ ] Hablar con otro número que no esté en `clientesDerivados` (se reinicia con el servidor).

---

## 5. Brechas honestas (conviene decirlas tú antes de que pregunten)
Una rúbrica técnica premia reconocer límites con un plan; esconderlos baja credibilidad.

### ✅ Resueltas el 19-10-2026
- Tests de integración con supertest: `test/integracion.test.js` (15) → suite total **32/32**.
- Arquitectura real: `docs/ARQUITECTURA_V2.md` y sección Sprint 2 en `docs/DISENO_4_MAS_1.md`.
- Diseño de datos: `docs/DISENO_DATOS_SPRINT2.md`.
- Riesgos actualizados: R-07 a R-14 en `docs/MATRIZ_RIESGOS_V1.md`.

### ⏳ Pendientes / a declarar
| Brecha | Cómo plantearla | Proyección Hito 3 |
|---|---|---|
| **Kronos es un catálogo simulado** (`src/kronos.js`) | "Validamos contra un catálogo representativo; la interfaz está aislada para cambiarla por la API real" | HU-18 real |
| **Los tests de integración simulan Gemini, Supabase y Meta**; la integración real se validó a mano (EV-01 a EV-13) | Mostrar ambas evidencias y decirlo explícitamente | Pruebas contra entorno de staging |
| **Memoria y lista de derivados en RAM** | Decisión consciente de prototipo; el ticket sí persiste | Persistir sesión en BD |
| **La migración SQL del repo no coincide con el esquema que usa el código** (ver `DISENO_DATOS_SPRINT2.md`) | Reconocerlo y mostrar el modelo actual | Nueva migración consolidada |
| **Túnel Cloudflare efímero** | Hosting con URL fija para producción | Despliegue |

### 🚨 Riesgo inmediato para la demo
Al intentar leer el esquema, la conexión a Supabase falló con `tenant/user ... not found`. Lo más probable es que **el proyecto esté pausado por inactividad** (plan gratuito). Hay que reactivarlo desde el panel de Supabase y verificar que `DATABASE_URL` siga vigente **antes** de presentar; sin BD no se guardan tickets ni carga el dashboard.

### Seguridad (corrección)
`.env`, `scripts/` y `scratch/` están en `.gitignore`, así que **los tokens NO están en GitHub** (lo había supuesto antes y estaba equivocado). Aun así hay tokens de Jira en texto plano en esos archivos locales y se mostraron durante esta sesión: conviene rotarlos en Atlassian como higiene.

