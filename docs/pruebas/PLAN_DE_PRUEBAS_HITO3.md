# A5 · Plan de Pruebas, Defectos e Informe Interpretativo (Hito 3 — INSW422)

**Proyecto:** Agente Autónomo de Triage Comercial, Cotización PDF y Agenda Inteligente — InterChile Clima SpA  
**Framework y Herramientas:** Jest `^29.7.0` · Supertest `^7.0.0` · Harness de Carga HTTP (`docs/calidad/load-test-hito3.js`) · Verificación Viva en Render SSL (`https://bot-triage-interchile.onrender.com`)  
**Reporte JSON bruto generado por la herramienta:** [`jest-report-hito3.json`](./jest-report-hito3.json)  
**Informe Técnico Consolidado con Evidencias Visuales:** [`../INFORME_DE_PRUEBAS_SPRINT_3.md`](../INFORME_DE_PRUEBAS_SPRINT_3.md)

---

## 1. Plan de Pruebas Previsto (Criterios de Entrada y Salida)

### 1.1 Alcance por Nivel de Prueba
1. **Nivel Unitario (`src/*.js` aislado):** Reglas deterministas del arnés anti-alucinación (`src/arneses.js`), cálculo neto + IVA 19% (`src/cotizador.js`), generador binario `%PDF-1.4` (`src/pdfGenerator.js`), colector SLA (`src/metricsStore.js`), normalización y reglas hábiles Lun–Vie (`src/agenda.js`), motor Zod (`src/brain.js`) y contratos SQL/cursores (`src/db.js`).
2. **Nivel Integración (`Supertest` sobre `src/server.js`):** Autenticación `HMAC-SHA256` en `/webhooks/meta`, Bearer privado en `/api/*`, manejo de códigos `400 / 401 / 403 / 404 / 409 / 500 / 503`, cliente remoto Kronos (`5 s` timeout) y render DOM del Dashboard sin exponer tokens.
3. **Nivel Estrés y E2E (`test/sprint3.test.js` + `load-test-hito3.js`):** Ráfaga de `N=20` clientes simultáneos de WhatsApp, flujo unificado `S1+S2+S3` y carga HTTP de `N=50` usuarios virtuales (`500` requests).
4. **Nivel Aceptación (UAT Real):** Ejecución guiada de los Criterios BDD (`Dado / Cuando / Entonces`) en producción Render y WhatsApp oficial (`+56 9 7235 2751`) con participación de **Prof. Sarita González Catalán**, **Prof. Matías Vargas** y contraparte **Benjamín Yáñez Lasalvia**.

### 1.2 Criterios de Entrada y Salida
- **Entrada:** Variables de test aisladas en memoria; ramas de feature integradas con migraciones SQL consolidadas en `supabase/migrations/`.
- **Salida (Para aprobar cierre Hito 3):**
  - `>= 95%` de casos planificados ejecutados;
  - `100%` de requerimientos `Must` con prueba aprobada (incluyendo caso negativo/borde);
  - Cobertura de líneas en lógica de negocio `>= 70%`;
  - `0` defectos críticos o bloqueantes abiertos y `0` *open handles* en Jest.

---

## 2. Cumplimiento: Casos Planificados vs. Ejecutados

| Nivel | Casos Planificados | Casos Ejecutados | Aprobados | No Ejecutados / Motivo | Cumplimiento |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Unitaria (Jest aislado)** | `50` | `50` | `50` | `—` | **`100%`** |
| **Integración API / DB / UI** | `35` | `35` | `35` | `—` | **`100%`** |
| **Sistema E2E & Estrés `N=20` (Jest)** | `2` | `2` | `2` | `—` | **`100%`** |
| **Carga HTTP (`N=50`, `500` reqs + `20` sec.)** | `520` | `520` | `520` | `—` | **`100%`** |
| **Aceptación BDD Sprint 3 (16 CA)** | `16` | `16` | `16` | `—` | **`100%`** |
| **TOTAL SUITE JEST AUTOMATIZADA** | **`87`** | **`87`** | **`87`** | **`0` omitidos (`0 failed`)** | **`100%`** |

*(Nota de Sprint 2–3: Cualquier prueba de integración contra el servidor real en vivo de Kronos 2.0 queda declarada en `DT-01` por no estar aún desplegado el endpoint del ERP por parte del tercero; su adaptador y todos sus escenarios HTTP/timeout sí están ejecutados y cubiertos al `92,85%` en `test/sprint3.test.js`).*

---

## 3. Ejemplos Formales de Casos Negativos y de Borde por Requerimiento `Must`

| ID Caso | Req. / HU | Tipo | Precondición | Pasos | Resultado Esperado | Resultado Obtenido (Commit `1212829`) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`CP-NEG-01`** | `RF-01` / `RNF-02` (`HU-16`) | Negativo | Webhook `/webhooks/meta` activo con `META_APP_SECRET`. | Enviar `POST` sin cabecera `x-hub-signature-256` y luego con firma alterada (`sha256=deadbeef`). | Rechazar con `401` (sin firma) y `403` (firma inválida) **sin invocar a Gemini IA**. | **Aprobado (`PASS`)** en `test/integracion.test.js` y `20/20` en `load-test-report.json`. |
| **`CP-NEG-02`** | `RF-03` (`HU-21`) | Borde / Negativo | Ficha devuelta por IA contiene marca ficticia `CoolBreeze Pro X9000` o repuesto `NanoCore Z47`. | Ejecutar `aplicarArnes()` antes de persistir o responder. | Mutabilidad cero de entrada; reemplaza campo por `[dato por confirmar]` y loguea en `logs/alucinaciones.log`. | **Aprobado (`PASS`)** en `test/arneses.test.js` (`15/15 PASS`). |
| **`CP-NEG-03`** | `RF-04` (`AAI-25`) | Negativo / Excepción | Solicitud es `Proyecto Comercial` o equipo quedó en `[dato por confirmar]`. | Llamar a `calcularCotizacionBorrador()` y descargar `GET /api/tickets/:id/pdf`. | Retorna `null` (nunca `$0` ni monto inventado) y genera Ficha Técnica de Levantamiento sin precio cerrado. | **Aprobado (`PASS`)** en `test/sprint3.test.js` + validación visual en Render. |
| **`CP-NEG-04`** | `RF-05` (`AAI-90`) | Negativo / Concurrencia | Operador A abre ticket `#30`; Operador B lo actualiza antes cambiando `updated_at`. | Operador A ejecuta `PATCH /api/tickets/30` con `expected_updated_at` antiguo o intenta pasar a `agendado` sin hora o en bloque ocupado. | Rechaza con `HTTP 400` (falta fecha/hora) o `HTTP 409 Conflict` (`horario_visita_ocupado` / versión). | **Aprobado (`PASS`)** en `test/db-contrato.test.js` y `test/sprint3.test.js`. |
| **`CP-NEG-05`** | `RF-06` (`AAI-102`) | Negativo / Regla Hábil | Bloque `2026-12-01 10:00` ya tomado, reunión `Presencial` sin dirección desde web o a las `04:00 AM` / sábado. | Invocar `validarReglaHorarioBenjamin`, `validarDetalleModalidad` y `POST /api/reuniones`. | `HTTP 400 FUERA_DE_HORARIO / DIA_INHABIL / LUGAR_PRESENCIAL_REQUERIDO` o `HTTP 409 HORARIO_OCUPADO` devolviendo 3 horas libres cercanas. | **Aprobado (`PASS`)** en `test/hu23-reuniones-agenda.test.js` (`14/14 PASS`) y vivo Render. |

---

## 4. Registro Real de Defectos Detectados y Corregidos

| ID | Defecto Detectado Durante Pruebas / Review | Severidad | Causa Raíz | Corrección y Commit | Verificación Final |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **`D-01`** | Al enviar mensajes en WhatsApp tras agregar campos de reunión en `FichaTriage`, Gemini API respondía `400 Bad Request` (`enum[2]: cannot be empty`). | **Alta** | `z.enum(['Presencial', 'Online', ''])` en `src/brain.js` incluía cadena vacía `''` rechazada por `responseSchema` de Gemini. | Commit `c7167be` (reemplazo por `'No especificada'` y fallback en `normalizarModalidad`). | Verificado en producción WhatsApp `+56 9 7235 2751` y `test/hu23-reuniones-agenda.test.js`. |
| **`D-02`** | Al enviar `/reset` e iniciar el Escenario B por WhatsApp, la ficha nueva sobrescribía el ticket `#95` anterior conservando una cotización CLP antigua (`$53.550`). | **Alta** | `/reset` limpiaba solo la RAM sin cerrar filas `en_proceso` en PostgreSQL y el `UPDATE` usaba `COALESCE($12, cotizacion_total)`. | Commit `92eb4ff` (`cerrarCasosEnProcesoPorTelefono` al ejecutar `/reset` + limpieza a `null` si nuevo caso es levantamiento). | Verificado en `test/db-contrato.test.js` y prueba en Render/Supabase. |
| **`D-03`** | Cuando un cliente pedía reunión a las `04:00 AM` en lunes, las sugerencias devolvían `10:00, 11:00, 12:00` omitiendo el bloque `09:00` más cercano. | **Media** | `sugerirHorariosCercanos()` recibía `null` en `normalizarHoraReunion('04:00')` y filtraba igualdad contra el primer bloque. | Commit `1212829` (cálculo explícito de distancia en minutos sobre los 9 bloques de `09:00–18:00` en `src/agenda.js`). | Verificado con aserción unitaria exacta (`['09:00', '10:00', '11:00']`) en `test/hu23-reuniones-agenda.test.js`. |
| **`D-04`** | En `npm audit`, dependencias transitivas (`proxy-addr`, `body-parser`, `zod`) presentaban vulnerabilidades críticas/altas reportadas en el repositorio. | **Alta** | Versiones `patch` desactualizadas en `package-lock.json` (`zod 4.6.5`, `body-parser 1.20.5`, `proxy-addr 2.0.7`). | Ejecución de `npm audit fix` en cierre Hito 3 (actualización limpia `4.6.7`, `1.20.9`, `2.0.8`). | Re-ejecutado `npm audit` (`0` críticos, `0` altos) + `87/87` Jest PASS (`jest-report-hito3.json`). |

**Defectos críticos o altos abiertos al cierre Hito 3:** **`0`**.

---

## 5. Informe Interpretativo de Resultados (Qué se Probó, Qué Resultó y Qué Significa)

| Nivel / Suite | Qué se Probó | Resultado Medido (`2026-11-26`) | Qué Significa y Limitación Declarada |
| :--- | :--- | :--- | :--- |
| **Unitarias (`50` casos)** | Lógica determinista de `arneses.js`, `cotizador.js`, `pdfGenerator.js`, `agenda.js`, `metricsStore.js`, `brain.js` (mock LLM) y contratos `db.js` (mock PG). | **`50 / 50` PASS** · Cobertura global: **`91,58%` líneas / `90,59%` stmts** (`cotizador.js`, `metricsStore.js` y `agenda.js` al **`100%`**). | La totalidad de reglas de negocio financieras, horarias, de modalidad (`Online` vs `Presencial`) y sanitización cumplen su especificación sin defectos internos y superan ampliamente la meta (`>= 70%`). El `~8,4%` no cubierto corresponde principalmente a ramas defensivas `catch` de red y pool PG (`db.js` `79,02%`). |
| **Integración (`35` casos)** | Pipeline Express (`src/server.js`): firmas HMAC, tokens Bearer (`401/503`), paginación cursor, `PATCH 409`, `/api/reuniones`, `/api/metricas`, `/dashboard` HTML. | **`35 / 35` PASS** (`test/integracion.test.js`, `hu22`, `hu23`, `sprint3`). | Los endpoints REST y protecciones criptográficas operan de extremo a extremo. *Limitación declarada:* las pruebas Jest simulan Gemini, Meta y Postgres para ser rápidas y deterministas en CI/local; por ello se complementaron con pruebas vivas contra Supabase y Render. |
| **Estrés y Carga (`N=20` Jest + `N=50` HTTP)** | Ráfaga simultánea de `20` usuarios WhatsApp sin cruce de contexto (`sprint3.test.js`) y `50` usuarios HTTP concurrentes (`500` reqs + `20` probes en `load-test-hito3.js`). | **`20/20` HTTP 200** (`N=20`) y **`500/500 OK`** (`294,6 req/s`, **`p95 = 169,06 ms`**) + **`20/20` bloqueos `401/403`**. | El servidor Node.js/Express no bloquea el Event Loop ni mezcla memorias por teléfono bajo concurrencia simultánea y cumple con creces `RNF-01` y `RNF-02`. |
| **Aceptación Real en Vivo (Render + WhatsApp)** | Flujos reales sobre `https://bot-triage-interchile.onrender.com` y `+56 9 7235 2751` (cotización `$53.550`, `InventadaPro`, `04:00 AM -> 400`, `ingresada->confirmada->completada`, descarga `%PDF-1.4`). | **`16 / 16` CA aprobados** con evidencias PNG y validaciones con Benjamín Yáñez y Prof. Sarita González. | Demuestra que el sistema desplegado funciona en producción real 24/7 con latencia `~2,67 s` (`< 4,0 s`) y satisface las necesidades comerciales reales de InterChile Clima SpA. |
