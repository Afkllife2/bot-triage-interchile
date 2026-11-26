# A6 · Reportes de Seguridad y Eficiencia (Hito 3 — INSW422)

**Proyecto:** Bot Triage Comercial InterChile Clima SpA  
**Requerimientos Verificados:** `RNF-01` (Eficiencia de Desempeño) y `RNF-02` (Seguridad) definidos en [`docs/requerimientos.md`](../requerimientos.md).  
**Artefactos ejecutables y reportes brutos en esta carpeta:**
- Script reproducible de prueba de carga y sonda de seguridad: [`load-test-hito3.js`](./load-test-hito3.js)
- Reporte JSON fechado de carga HTTP: [`load-test-report.json`](./load-test-report.json)
- Reporte JSON oficial de escáner de dependencias (`npm audit`): [`npm-audit-hito3.json`](./npm-audit-hito3.json)

---

## 1. Comparación Cara a Cara con Escenarios de Calidad (`A2`)

| Escenario (`A2`) | Medida Pedida (Umbral) | Resultado Medido (Hito 3) | Evidencia Verificable | Estado |
| :--- | :--- | :--- | :--- | :---: |
| **RNF-01 · Eficiencia (Carga HTTP API & PDF)** | **`p95 <= 2000 ms`**, tasa de errores **`< 1%`** con `N=50` usuarios concurrentes; PDF **`< 3000 ms`**. | **`p95 = 169,06 ms`** (`avg = 70,87 ms`, `p50 = 33,76 ms`, `p99 = 239,87 ms`), **`0%` error (`500/500 OK`)** a **`294,6 req/s`**. PDF `p95 = 122,67 ms`. | [`load-test-report.json`](./load-test-report.json) (`commit 1212829`, `2026-11-26T01:40:58Z`) | **CUMPLIDO** |
| **RNF-01 · Eficiencia (Flujo Bot WhatsApp)** | Promedio **`< 4000 ms` (`< 4,0 s`)** y **`> 99%`** éxito bajo **`N=20`** usuarios simultáneos. | **`20 / 20` (`100%`) HTTP 200** sin colisión de sesiones en `test/sprint3.test.js`; promedio en producción Render **`~2,67 s`** (`src/metricsStore.js`). | [`docs/pruebas/jest-report-hito3.json`](../pruebas/jest-report-hito3.json) · [`INFORME_DE_PRUEBAS_SPRINT_3.md`](../INFORME_DE_PRUEBAS_SPRINT_3.md) | **CUMPLIDO** |
| **RNF-02 · Seguridad (Autenticación & Criptografía)** | **`100%`** de accesos sin `HMAC-SHA256` o `Bearer` denegados (`401/403/503`); `0` secretos en DOM/Git. | **`20 / 20` (`100%`)** ataques bloqueados en sonda HTTP; validación en tiempo constante `crypto.timingSafeEqual`; `0` tokens en HTML. | [`load-test-report.json`](./load-test-report.json) · [`test/integracion.test.js`](../../test/integracion.test.js) | **CUMPLIDO** |
| **RNF-02 · Seguridad (Escáner de Dependencias)** | **`0` hallazgos críticos o altos abiertos sin justificación** en `npm audit`. | **Tras remediación (`npm audit fix`): `0` críticos, `0` altos, `2` moderados residuales** (documentados y mitigados abajo). | [`npm-audit-hito3.json`](./npm-audit-hito3.json) (`387` paquetes auditados: `99` prod, `288` dev) | **CUMPLIDO** |

---

## 2. Escáner de Seguridad (`npm audit`) y Remediación Ejecutada

### 2.1 Evolución Antes y Después de Remediación
1. **Escaneo inicial detectado (`2026-11-25`):** `8` vulnerabilidades (`1` crítica en `proxy-addr`, `5` altas en `body-parser`, `zod`, `brace-expansion`, `browserslist`, `js-yaml`, y `2` moderadas en `qs`, `baseline-browser-mapping`).
   En dependencias de producción (`--omit=dev`): `1` crítica (`proxy-addr`), `2` altas (`body-parser`, `zod`), `1` moderada (`qs`).
2. **Acción ejecutada (`npm audit fix`):** Actualización no disruptiva en `package-lock.json` (`zod 4.6.5 -> 4.6.7`, `body-parser 1.20.5 -> 1.20.9`, `proxy-addr 2.0.7 -> 2.0.8`, `qs 6.15.2 -> 6.15.4`, `js-yaml`, `brace-expansion`, `browserslist`), seguida de re-ejecución completa de la suite Jest (**`86/86 PASS`** sin regresiones).
3. **Escaneo final verificado ([`npm-audit-hito3.json`](./npm-audit-hito3.json)):**
   - **Críticas:** `0`
   - **Altas:** `0`
   - **Bajas / Info:** `0`
   - **Moderadas:** `2` (`qs <= 6.16.0` como dependencia transitiva interna de `express@4.22.2`).

### 2.2 Justificación Técnica de los Hallazgos Moderados Residuales (`qs` / `express 4.x`)
- **Qué son:** Advisories moderados en `qs` (`GHSA-4mjr-xmp4-gh2g` DoS vía `isBuffer` y `GHSA-6pq8-jhm2-2vcw` en `qs.stringify` con formato `comma`, CVSS `5.3`).
- **Por qué no se corrigen ahora en MVP:** `express 4.22.2` fija el rango `qs` dentro de su línea estable `4.x`; forzar la actualización mayor rompería compatibilidad de contrato antes de la defensa sin aportar mejora funcional.
- **Mitigación activa y riesgo residual:** Ningún endpoint de `src/server.js` invoca `qs.stringify(..., { arrayFormat: 'comma' })` ni deserializa objetos anidados desde query strings: `/api/tickets` (`/limit`, `/cursor`) y `/api/reuniones` (`/fecha`, `/todos`, `/incluir_canceladas`) validan exclusivamente tipos escalares primitivos (`Number.isInteger`, regex `YYYY-MM-DD`, comparación literal `'true'`) y requieren `Bearer TRIAGE_API_TOKEN` antes de operar. El riesgo explotable residual en producción es **bajo/controlado** (`DT-03` recomienda migración planificada a `express@5` Post-Hito 3).

---

## 3. Prueba de Carga y Concurrencia HTTP (`load-test-hito3.js`)

Ejecutada contra el servidor Express real (`src/server.js`) con **`N=50` usuarios virtuales concurrentes x `10` rondas (`500` requests)** distribuidos en partes iguales entre los 4 flujos críticos más **`20` intentos de intrusión**:

| Endpoint Evaluado | Requests | Éxitos (`2xx`) | `p50 (ms)` | `p95 (ms)` | `Max (ms)` | Meta `RNF-01` |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **`GET /api/reuniones?fecha=2026-12-01`** | `125` | `125` (`100%`) | `30,30` | `123,05` | `124,77` | `< 2000 ms` ✅ |
| **`GET /api/tickets?limit=20`** | `125` | `125` (`100%`) | `30,38` | `122,86` | `124,88` | `< 2000 ms` ✅ |
| **`GET /api/tickets/94/pdf`** (`%PDF-1.4`) | `125` | `125` (`100%`) | `30,19` | `122,67` | `124,66` | `< 3000 ms` ✅ |
| **`POST /webhooks/meta`** (con HMAC-SHA256) | `125` | `125` (`100%`) | `154,73` | `239,65` | `242,04` | `< 4000 ms` ✅ |
| **TOTAL CARGA (`N=50` concurrentes)** | **`500`** | **`500 (100%)`** | **`33,76`** | **`169,06`** | **`242,04`** | **`294,6 req/s`** ✅ |

### Limitación Conocida Declarada
El script `load-test-hito3.js` se ejecuta sobre una instancia loopback local simulando las salidas de red hacia Google Gemini, Meta Graph API y el pool de PostgreSQL en Supabase, con el fin de aislar el rendimiento determinista de Express, las validaciones criptográficas (`HMAC` / `Bearer`), el arnés Kronos, el cotizador CLP y la serialización binaria `%PDF-1.4` sin consumir cuotas de API externas. En producción real (`Render + Supabase + Gemini`), la latencia de punta a punta observada en el bot promedia `~2,67 s` (`< 4,0 s`), dominada por la inferencia externa de Gemini 2.5 Flash.
