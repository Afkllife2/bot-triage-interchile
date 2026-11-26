# Flujo de Presentación, Demo en Vivo y Auditoría — Defensa Hito 3 (INSW422)

**Fecha de presentación:** Jueves `2026-11-26`  
**Evaluadores:** Prof. Sarita González Catalán · Prof. Matías Vargas Marín  
**Contraparte / Stakeholder:** Benjamín Yáñez Lasalvia (InterChile Clima SpA)  
**Ambiente productivo:** `https://bot-triage-interchile.onrender.com/dashboard` · WhatsApp Oficial **`+56 9 7235 2751`**

---

## 0. Checklist Pre-Defensa (5–10 minutos antes de presentar)

1. **Despertar Render Cloud** (evita cold start del plan gratuito): abrir `https://bot-triage-interchile.onrender.com/healthz` y confirmar que responde **`OK`**.
2. **Dejar abiertas estas 4 pestañas + 2 ventanas en orden:**
   - **Presentación:** `Presentacion_Hito3_Sprint3_InterChile.pptx` en **Vista del Moderador** (tus apuntes ya están en las Notas de cada lámina).
   - **Dashboard en Producción:** `https://bot-triage-interchile.onrender.com/dashboard` ya conectado con tu **`TRIAGE_API_TOKEN`** (botón verde `API Protegida` arriba).
   - **GitHub (Rama `main` / Tag `hito3`):** abierto en `README.md` con enlaces directos a `docs/`.
   - **Tablero Jira:** abierto en el Sprint 3 (`AAI-25`, `AAI-90`, `AAI-94`, `AAI-102`) mostrando criterios BDD, horas y aprobaciones.
   - **WhatsApp Web** (o celular proyectado) en el chat con **`+56 9 7235 2751`**.
   - **Terminal PowerShell** en `c:\Users\count\Documents\New project\bot-verificador-x-prototipo` por si piden correr Jest o probar *"romper a propósito"*.
3. **Revisar bloques libres del viernes `2026-11-27`:** antes de entrar, mira en la sección **Agenda de Reuniones** del Dashboard qué bloque del viernes `2026-11-27` está en verde (ej. **`11:00`** o **`16:00`**). Si el seleccionado en el guion está ocupado, usa cualquier bloque verde de ese día.
4. **Recordatorio previo de cierre:** antes de entrar a defender, verifica que esté creado el **`tag hito3`** y registradas las aprobaciones del stakeholder en los tickets Jira (`AAI-25`, `AAI-90`, `AAI-94`, `AAI-102`).

---

## 1. Bloque 1 — Recorrido Ágil de las 14 Láminas (~6–7 minutos)

> Regla de oro en Hito 3: **no leas texto en las láminas**. Usa los números grandes como ancla visual, explica en 20–30 segundos por lámina y deja el peso fuerte para el **flujo en vivo en la nube** y la **auditoría por muestreo**.

| Lámina | Tiempo | Frase clave para decir en voz alta |
| :--- | :---: | :--- |
| **1. Portada** | `0:20` | *"Presentamos el cierre de Sprint 3 e Hito 3 para InterChile Clima SpA: un MVP operativo 24/7 en Render, con **87/87 pruebas PASS**, **91,58% de cobertura** y **169 ms p95** bajo carga."* |
| **2. Problema y Propuesta (`A1`)** | `0:40` | *"Pasamos de 4 a 12 horas sin respuesta fuera de horario y filtros manuales de hasta 40 minutos a atención en **~2,67 segundos**, **100% de bloqueo anti-alucinación** y **0 topones de agenda**."* |
| **3. Objetivos Medidos (`A1`)** | `0:45` | *"Cada objetivo específico tiene línea base, meta numérica y medición repetible validada con el stakeholder: cumplimos SLA bajo 4 s (`~2,67 s`), 100% en arnés (`15/15`), PDF nativo bajo 5 ms (`$53.550` exactos) y `91,58%` de cobertura global."* |
| **4. Alcance y BDD (`A2–A3`)** | `0:40` | *"Delimitamos explícitamente 7 RF y 4 RNF dentro del MVP (`MPV` en la rúbrica), dejando fuera SII, audios/videos y recordatorios 24 h para versiones futuras. Cada HU tiene escenarios BDD felices y negativos en Jira y en `docs/HISTORIAS_USUARIO_MPV_A3.md`."* |
| **5. Trazabilidad (`A4`)** | `0:40` | *"Nuestra matriz es auditable en ambos sentidos en 6 eslabones. Tenemos **0 Must sin prueba**, **0 Must sin modelo UML** y **0 HUs cerradas sin BDD**. Más adelante pueden auditar cualquier fila al azar."* |
| **6. Pruebas y Defectos (`A5`)** | `0:45` | *"No es solo cantidad: ejecutamos 87 casos entre unitarias, integración, estrés `N=20` y UAT, con casos negativos por cada Must. Además documentamos los 4 defectos reales encontrados y corregidos (`D-01` a `D-04`)."* |
| **7. Seguridad y Eficiencia (`A6`)** | `0:45` | *"Tras `npm audit fix` quedamos con **0 hallazgos críticos ni altos** (2 moderados heredados de Express 4 mitigados y justificados en A6), **20/20 accesos sin token rechazados (401/403)**, y prueba de carga `N=50` con **500/500 OK** y `p95 = 169,06 ms`. Además implementamos la separación entre KPIs de negocio y panel QA ISO 25010."* |
| **8. Evidencia Ejecutada** | `0:30` | *"Todo está respaldado con reportes JSON fechados y ligados a commit (`jest-report-hito3.json` y `load-test-report.json`). Declaramos con honestidad que las pruebas automatizadas aíslan APIs externas con mocks, por lo que validamos la integración real en vivo en Render."* |
| **9. Solución · Cotizador & PDF** | `0:35` | *"Nunca le pedimos a Gemini calcular dinero: `cotizador.js` calcula Neto + IVA 19% fuera del LLM. Si el equipo no existe en catálogo, el arnés lo marca `[dato por confirmar]` y emite Ficha de Levantamiento sin precio."* |
| **10. Solución · Agenda & Review** | `0:45` | *"Acogimos los ajustes de la Review con la Prof. Sarita: conversación libre sin menú numérico tipo call-center, bloqueo de horas fuera de rango como las `04:00 AM` o fines de semana, y flujo `ingresada -> confirmada -> completada` para proteger la agenda humana."* |
| **11. Modelamiento UML (`A7`)** | `0:30` | *"Optamos de forma excluyente por **Camino A: UML** declarado en `docs/arquitectura/README.md`, manteniendo coherencia 1:1 entre diagramas, migraciones SQL y módulos desplegados."* |
| **12. ADRs Ponderados (`A7`)** | `0:45` | *"Justificamos 4 decisiones con matrices ponderadas: lógica determinista fuera de IA (`4,80 vs 2,40`), PostgreSQL sobre MongoDB (`4,70 vs 3,30`), generador PDF nativo frente a Chromium (`4,75 vs 2,35`) y Monolito Modular en Render."* |
| **13. Gobernanza y Riesgos (`A8–A9`)** | `0:35` | *"Trabajamos con 1 rama por historia (`feat/AAI-*`), DoD directa de 5 condiciones, riesgos materializados documentados (`R-07`, `R-09`, `R-11`, `R-15`) y deuda técnica declarada (`DT-01` a `DT-04`)."* |
| **14. Transición a Vivo (`Criterio 7`)** | `0:15` | *"Paso ahora directamente al ambiente productivo en Render y WhatsApp para demostrar el flujo de punta a punta y quedar atento a la auditoría por muestreo."* |

---

## 2. Bloque 2 — Demo en Vivo en la Nube (~5–6 minutos)

> **Modo visual ideal:** Mitad izquierda **WhatsApp Web** (`+56 9 7235 2751`), mitad derecha **Dashboard en Render** (`https://bot-triage-interchile.onrender.com/dashboard`).

### Acto 1 · Lenguaje Natural + Cotizador CLP + Ficha PDF + Visita Técnica `409` (`RF-04`, `RF-05`)

1. **En WhatsApp:** enviar:
   ```text
   /reset
   ```
   *(Esperar confirmación de reinicio).*
2. **Enviar mensaje único en lenguaje natural** (destacando que no hay menú rígido "presione 1/2"):
   ```text
   Hola, soy Carlos González de Providencia, necesito mantención para mi equipo Split marca Daikin.
   ```
3. **Qué señalar en WhatsApp (`< 4 s`):**
   - El bot extrae solicitud, equipo y comuna en una interacción natural.
   - Entrega la estimación calculada determinísticamente por `cotizador.js`: **Neto `$45.000 CLP` + IVA 19% `$8.550 CLP` = Total estimado `$53.550 CLP`**.
4. **En Dashboard (clic en `↻ Actualizar`):**
   - Aparece arriba el ticket con **`Mantención · Split · Daikin`** y **`$53.550 CLP`**.
   - Clic en **`📄 PDF`** -> abre/descarga **`ficha-triage-<id>.pdf`** (`02 COTIZACIÓN BORRADOR REFERENCIAL`).
   - En ese mismo ticket, cambiar el estado a **`Agendado`** (al seleccionarlo aparecerá al instante el campo de fecha/hora, antes oculto para mantener limpia la tabla) y presionar **`Guardar`** sin fecha -> mostrar la validación controlada.
   - Luego elegir una fecha/hora (ej. **hoy `26-11-2026 15:00`**) -> **`Guardar`** -> pasa a **`agendado`** sin recargar la página.

---

### Acto 2 · Arnés Anti-Alucinación `[dato por confirmar]` + Panel Negocio vs. QA (`RF-03`, `RF-07`)

1. **En WhatsApp:** enviar:
   ```text
   /reset
   ```
2. **Enviar equipo y marca inexistentes:**
   ```text
   Urgente en Las Condes, soy Camila Rojas, falla crítica en equipo SuperTurboX990 marca InventadaPro, está apagado.
   ```
3. **Qué señalar en WhatsApp:**
   - El cliente recibe un trato cordial sin fricción, pero el arnés (`src/arneses.js`) interceptó los datos antes de responder/guardar.
   - **No inventa ningún monto CLP**: responde `"Valor sujeto a evaluación y visita técnica por ejecutivo comercial."`
4. **En Dashboard (clic en `↻ Actualizar`):**
   - Sube el contador **`#02 Urgencias / Prioridad Alta`**.
   - La fila muestra **`[dato por confirmar]`** y **`Por evaluar / Ref.`**.
   - Clic en **`📄 PDF`** -> descarga **`03 FICHA TÉCNICA DE LEVANTAMIENTO (SIN PRECIO CERRADO)`**.
5. **Mostrar separación solicitada en Review:**
   - Señalar que arriba están **solo los 4 KPIs comerciales** para gerencia/Benjamín.
   - Hacer clic en **`🔬 Auditoría QA (ISO 25010)`** -> se despliegan **QA-01** (`Latencia < 4.0s` medida en vivo), **QA-02** (`100% Arnés Kronos`) y **QA-03** (`100% Tasa de éxito PDF`).

---

### Acto 3 · Agenda Inteligente con Benjamín: Bloqueo `04:00 AM` + Reserva Real + 3 Estados (`RF-06`)

1. **En WhatsApp:** enviar:
   ```text
   /reset
   ```
2. **Caso Negativo (regla hábil Lun–Vie pedida por Prof. Sarita):** enviar:
   ```text
   Hola, soy Camila Rojas, quiero agendar una reunión online con Benjamín para el viernes 27 de noviembre a las 04:00 de la mañana.
   ```
   - **Qué señalar:** Gemini extrae `2026-11-27` y `04:00`, pero `src/agenda.js` (`validarReglaHorarioBenjamin`) **rechaza la hora** porque Benjamín atiende solo Lun–Vie (`09:00–12:00` y `14:00–18:00`, sin colación `13:00`) y sugiere los bloques libres más cercanos.
3. **Caso Feliz (sin `/reset`, usando memoria multi-turno `HU-02`):** responder:
   ```text
   Ah disculpa, entonces resérvala para el viernes 27 de noviembre a las 11:00 hrs en modalidad Online.
   ```
   *(Nota: usa otro bloque verde como `15:00` o `16:00` si en tu revisión previa viste el de las `11:00` ocupado).*
   - **Qué señalar:** Confirma reserva ingresada para evaluación humana.
4. **En Dashboard (`↻ Actualizar` y clic en la pestaña superior `📅 Agenda Benjamín` — sin scroll):**
   - Seleccionar fecha **`2026-11-27`** -> mostrar que el bloque reservado ya aparece marcado **`Ocup.`** en rojo (y si cambias a sábado **`2026-11-28`**, muestra la alerta de fin de semana).
   - **Mostrar diferenciación simple `Online` vs `Presencial`:**
     - En el switch superior **`[ 💻 Online | 📍 Presencial ]`**, con **`💻 Online`** seleccionado basta elegir día y hora (enlace Google Meet es opcional).
     - Al pulsar **`📍 Presencial`**, aparece el campo obligatorio **Dirección o Sede** con el botón rápido **`Usar Oficina InterChile`** (1 clic) o escritura directa de dirección en terreno.
   - En la tabla **`Reuniones Programadas`**, señalar la cita creada desde **`📱 WhatsApp`** en estado **`⏳ ingresada`** (mostrando su badge `💻 Online` + acceso `🔗 Google Meet` o `📍 Presencial` + `📌 Dirección`, además de los filtros `Todas / 💻 Online / 📍 Presencial`).
   - Presionar **`✓ Confirmar`** -> pasa a **`✓ confirmada`** -> presionar **`✔ Completar`** -> pasa a **`✔ completada`**.

---

## 3. Bloque 3 — Chuleta de Auditoría por Muestreo (`Criterio 7 · 15 pts`)

En la rúbrica, la comisión elige **3 requerimientos al azar** (normalmente 1 Funcional, 1 Seguridad, 1 Eficiencia) y **1 ADR**. Abre [`docs/trazabilidad.md`](./trazabilidad.md) y usa estas rutas directas:

### Rutas rápidas para los 3 requerimientos clave

1. **Funcional — `RF-04` (Cotizador CLP + PDF Corporativo):**
   - `OE-3` ([`docs/objetivos.md`](./objetivos.md)) -> `RF-04` ([`docs/requerimientos.md`](./requerimientos.md)) -> `UC-03, UC-08, Secuencia Flujo 1–2` ([`docs/arquitectura/README.md`](./arquitectura/README.md)) -> `AAI-25 / INT-HU-05` ([`docs/HISTORIAS_USUARIO_MPV_A3.md`](./HISTORIAS_USUARIO_MPV_A3.md) + Jira) -> `CP-HU05-01..09` ([`test/sprint3.test.js`](../test/sprint3.test.js)) -> [`docs/pruebas/jest-report-hito3.json`](./pruebas/jest-report-hito3.json) (`100%` líneas en [`src/cotizador.js`](../src/cotizador.js) y `98,46%` en [`src/pdfGenerator.js`](../src/pdfGenerator.js)) -> Rama `feat/AAI-25-HU-05-cotizacion-borrador-pdf` / commit `9acd69e` / tag `v3.0.0-sprint3`.
2. **Funcional / Concurrencia — `RF-06` (Agenda Benjamín):**
   - `OE-4` -> `RF-06` -> `UC-10, ER public.reuniones` -> `AAI-102` -> `CP-HU23-01..14` ([`test/hu23-reuniones-agenda.test.js`](../test/hu23-reuniones-agenda.test.js)) -> `14/14 PASS` y `100%` cobertura en [`src/agenda.js`](../src/agenda.js) -> Rama `feat/AAI-102-HU-23-agendamiento-reuniones-calendario` / merge `ec24b17` + reglas Review en `1212829`.
3. **Seguridad — `RNF-02` (HMAC-SHA256 + Bearer Token + `npm audit`):**
   - `Transversal` -> `RNF-02` (escenario 6 partes en [`docs/requerimientos.md`](./requerimientos.md)) -> `Componentes Capas 1–2` -> `HU-16, AAI-90` -> `CP-RNF-02` -> [`docs/calidad/npm-audit-hito3.json`](./calidad/npm-audit-hito3.json) (`0` críticos, `0` altos tras `npm audit fix`) + `20/20` ataques HTTP `401/403` bloqueados en [`docs/calidad/load-test-report.json`](./calidad/load-test-report.json) y [`docs/calidad/REPORTE_SEGURIDAD_Y_EFICIENCIA.md`](./calidad/REPORTE_SEGURIDAD_Y_EFICIENCIA.md).
4. **Eficiencia — `RNF-01` (Carga `N=50` y Latencia `< 4s`):**
   - `OE-1, OE-4` -> `RNF-01` -> `Diagrama Despliegue Fig6` -> `AAI-94, AAI-98` -> `CP-RNF-01` ([`docs/calidad/load-test-hito3.js`](./calidad/load-test-hito3.js) + `test/sprint3.test.js`) -> `500/500 OK`, `294,6 req/s`, `p95 = 169,06 ms` (`PDF p95 = 122,67 ms`) en [`docs/calidad/load-test-report.json`](./calidad/load-test-report.json) -> Rama `feat/AAI-98-TSK-03-concurrencia-informe-pruebas` (`3a117fc`).

### Demo de 30 segundos: *"Rompe a propósito este comportamiento: ¿la prueba lo detecta?"*

Si la comisión pide demostrar en vivo que un test realmente falla cuando el requisito se rompe:

1. Abrir [`src/arneses.js`](../src/arneses.js#L68) línea **68**:
   - Línea real: `fichaCorregida.equipo_marca = '[dato por confirmar]';`
   - Cambio temporal: `fichaCorregida.equipo_marca = ficha.equipo_marca;`
2. Ejecutar en terminal:
   ```powershell
   npx jest test/arneses.test.js --no-color
   ```
   -> Fallan de inmediato los tests de `CA-2` mostrando que esperaba `'[dato por confirmar]'` y recibió `'CoolBreeze Pro X9000'`.
3. Restaurar inmediatamente sin dejar cambios sucios:
   ```powershell
   git checkout -- src/arneses.js; npx jest test/arneses.test.js --no-color
   ```
   -> Vuelve a **`15/15 PASS`** en verde.

---

## 4. Plan B de Contingencia (Solo si falla Wi-Fi, Meta o Gemini supera timeout en sala)

- Si WhatsApp Web se desconecta o Meta tiene retraso de entrega: proyectar las capturas reales versionadas en [`docs/evidencias_png/`](./evidencias_png/) (`Evidencia_AAI_88_WhatsApp_Cotizacion_PDF.png`, `Evidencia_AAI_25_PDF_Corporativo_Real.jpg`, `Evidencia_AAI_104_Widget_Calendario_Reuniones.png`), abrir el Dashboard directo en Render y mostrar `POST /api/reuniones` + validación de horario hábil directo desde la UI web.
- Si piden repetir la prueba de carga o cobertura en vivo sin internet:
  ```powershell
  npx jest --coverage --no-color
  node docs/calidad/load-test-hito3.js
  ```
