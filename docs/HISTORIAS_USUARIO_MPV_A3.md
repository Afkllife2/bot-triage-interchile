# A3 · Historias de Usuario del MPV con Criterios BDD y Aprobación de Stakeholder (INSW422)

**Tablero Jira Oficial:** https://uandresbello-team-bg7iosbc.atlassian.net/jira/software/projects/AAI/boards/202  
**Contraparte / Stakeholder Real:** **Benjamín Yáñez Lasalvia** (Gerente Comercial y de Operaciones — InterChile Clima SpA)  
**Product Owner Metodológica (Seminario):** **Sarita González Catalán** (Docente UNAB)

> Este artefacto consolida en el repositorio las Historias de Usuario del MPV (`Must` y `Should`) implementadas en los Sprints 1, 2 y 3 con criterios en formato **Dado / Cuando / Entonces** (escenario feliz + negativo/borde) y su registro de validación/aprobación.

---

## 1. Historias Base y Conversacionales (Sprints 1 y 2)

### `AAI-5` / `AAI-23` / `AAI-8` (`[INT-HU-01 / HU-03 / HU-04 / HU-NEW]`) — Clasificación, Prioridad, Persistencia y Outbound (`Sprint 1 · 21 SP`)
- **Historia:** Como ejecutivo de InterChile, quiero clasificar automáticamente el motivo principal, prioridad y ficha de consolidación desde WhatsApp hacia PostgreSQL respondiendo al cliente sin cajas negras.
- **Requerimientos:** `RF-01` (`OE-1`), `RNF-02`
- **Escenario Positivo:** *Dado* un mensaje de emergencia clínica en climatización, *Cuando* ingresa al Webhook con firma HMAC-SHA256 válida, *Entonces* asigna `prioridad = 'Alta'`, persiste en `clientes`/`casos_triage` y responde por Graph API (`HTTP 200`).
- **Escenario Negativo:** *Dado* un POST sin firma o con HMAC inválido, *Cuando* llega a `/webhooks/meta`, *Entonces* bloquea con `401 / 403` sin invocar a Gemini.
- **Validación Stakeholder:** Aprobada en cierre Sprint 1 (`docs/ACTA_REVIEW_SPRINT_1.md` · Prof. Sarita González Catalán · `08-09-2026`).

### `AAI-6` (`[INT-HU-02]`) & `AAI-70` (`[INT-HU-20]`) — Diagnóstico Multi-Turno y Menús Interactivos + Arriendo (`Sprint 2 · 13 SP`)
- **Historia:** Como cliente de InterChile, quiero navegar las 7 líneas de servicio (incluido *Arriendo*) mediante botones/lista interactiva o texto libre sin repetir información ya respondida.
- **Requerimientos:** `RF-01`, `RF-02` (`OE-1`)
- **Escenario Positivo:** *Dado* un cliente que entrega nombre/comuna en el turno 1 y marca/falla en el turno 2, *Cuando* LangChain invoca `FichaTriage`, *Entonces* conserva contexto por `10` turnos (`60` min) sin repetir preguntas.
- **Escenario Negativo / Borde:** *Dado* mensajes ambiguos consecutivos o solicitud con `>= 4` opciones (superando límite 3 de Meta), *Cuando* procesa salida, *Entonces* conmuta automáticamente a List Message y habilita derivación tras 3 turnos confusos.
- **Validación Stakeholder:** **Arriendo** solicitado y validado por Benjamín Yáñez Lasalvia; criterios `HU-02` (`4/4`) y `HU-20` (`3/3`) aprobados en [`Acta_Sprint_Review_Sprint_2.md`](./Acta_Sprint_Review_Sprint_2.md) (`22-10-2026`).

### `AAI-26` (`[INT-HU-06]`) — Derivación a Ejecutivo Humano y Silencio Automático (`Sprint 2 · 5 SP`)
- **Historia:** Como cliente con proyecto complejo o necesidad urgente de hablar con una persona, quiero ser transferido a Benjamín Yáñez sin seguir recibiendo preguntas del bot.
- **Requerimientos:** `RF-02` (`OE-1`)
- **Escenario Positivo:** *Dado* que el cliente escribe "quiero hablar con un ejecutivo", *Cuando* el motor detecta derivación, *Entonces* guarda `requiere_humano = true`, `estado = 'derivado'` y entrega `Benjamin@interchileclima.cl` / `+569 9440 2632`.
- **Escenario Negativo:** *Dado* un teléfono ya derivado que vuelve a escribir, *Cuando* ingresa al Webhook, *Entonces* silencia llamadas a Gemini y responde mensaje estático de espera.
- **Validación Stakeholder:** Contacto real aprobado por Benjamín Yáñez; `CA 4/4` validados en Review Sprint 2 (`22-10-2026`).

### `AAI-55` (`[INT-HU-18 / HU-21]`) & `AAI-34` (`[INT-HU-14]`) — Arnés Kronos Anti-Alucinaciones y Dashboard (`Sprint 2 · 13 SP`)
- **Historia:** Como jefe de operaciones, quiero impedir que la IA invente marcas o repuestos inexistentes y visualizar los casos en un panel en tiempo real.
- **Requerimientos:** `RF-03` (`OE-2`), `RF-05` (`OE-4`)
- **Escenario Positivo:** *Dado* un equipo `Split` marca `Samsung`, *Cuando* pasa por `aplicarArnes()`, *Entonces* persiste intacto.
- **Escenario Negativo / Timeout:** *Dado* una marca ficticia (`CoolBreeze Pro X9000` / `InventadaPro`) o timeout `> 5 s` en Kronos, *Cuando* `src/arneses.js` valida, *Entonces* no muta entrada, reemplaza campo por `[dato por confirmar]`, registra `logs/alucinaciones.log` y usa respaldo seguro sin caer.
- **Validación Stakeholder:** Validado con `CA 4/4` en Review Sprint 2 (`22-10-2026`).

---

## 2. Historias de Cierre del MPV (Sprint 3 — Hito 3)

### `AAI-25` (`[INT-HU-05]`) — Borrador de Cotización CLP y Ficha Técnica PDF (`Sprint 3 · 8 SP · Rama feat/AAI-25-HU-05-cotizacion-borrador-pdf`)
- **Historia:** Como cliente de InterChile, quiero recibir una estimación transparente en CLP (Neto + IVA 19%) y contar con una ficha técnica / cotización borrador descargable en PDF oficial.
- **Requerimientos:** `RF-04` (`OE-3`), `RNF-01`
- **Escenario Positivo (`CA-1, CA-2, CA-4`):** *Dado* un servicio estándar (`Mantención` `Split` `Daikin`), *Cuando* el bot y `GET /api/tickets/:id/pdf` procesan el caso, *Entonces* calcula `$45.000 + $8.550 = $53.550 CLP` e imprime en `< 5 ms` un `%PDF-1.4` con logo corporativo InterChile.
- **Escenario Negativo (`CA-3`):** *Dado* un `Proyecto Comercial` o equipo con `[dato por confirmar]`, *Cuando* cotiza o genera PDF, *Entonces* retorna `null` (nunca `$0` ni precio inventado) y emite *Ficha Técnica de Levantamiento* sin monto cerrado.
- **Aprobación del Stakeholder:** Formato visual e información comercial del PDF aprobados por **Benjamín Yáñez Lasalvia (Gerente Comercial, InterChile Clima SpA)**; criterios verificados en Sprint Review (`24-11-2026`).

### `AAI-90` (`[INT-HU-19]`) — Gestión de Estados, Visitas Técnicas (R-15) y Contrato `KRON2-152` (`Sprint 3 · 8 SP · Rama feat/AAI-90-HU-19-agendamiento-estados-dashboard`)
- **Historia:** Como administrador de InterChile, quiero cambiar estados operativos, asignar fecha y hora de visita sin choques y descargar PDFs desde `/dashboard` simulando el módulo operativo ante el atraso de Kronos 2.0 (`R-15`).
- **Requerimientos:** `RF-05` (`OE-4`), `RNF-02`
- **Escenario Positivo (`CA-1..CA-3`):** *Dado* token Bearer `TRIAGE_API_TOKEN` válido y `fecha_visita` completa al pasar a `agendado`, *Cuando* se ejecuta `PATCH /api/tickets/:id`, *Entonces* actualiza la fila y KPIs sin recargar página y habilita botón `PDF`.
- **Escenario Negativo (`CA-4 + Colisión`):** *Dado* token ausente/inválido, `expected_updated_at` antiguo o choque con otra visita en ventana de `60` min, *Cuando* responde la API, *Entonces* rechaza con `401 / 409 horario_visita_ocupado / 409 conflict` preservando la selección en UI.
- **Aprobación del Stakeholder:** Validada la gestión de visitas y detección de errores/choques en Sprint Review (`24-11-2026` · Prof. Sarita González Catalán).

### `AAI-94` (`[INT-HU-22]`) — Métricas de Calidad SLA y Separación Negocio vs. QA (`Sprint 3 · 5 SP · Rama feat/AAI-94-HU-22-metricas-calidad-sla`)
- **Historia:** Como supervisor de operaciones e ingeniería, quiero monitorear SLA (`< 4.0 s`), tasa anti-alucinación del arnés y PDFs emitidos sin ensuciar los KPIs comerciales principales del negocio.
- **Requerimientos:** `RF-07` (`OE-4`), `RNF-01`, `RNF-03`, `RNF-04`
- **Escenario Positivo (`CA-1..CA-3`):** *Dado* turnos atendidos vía Webhook y consultas a `GET /api/metricas`, *Cuando* carga `/dashboard`, *Entonces* muestra **4 KPIs comerciales** arriba y despliega **Auditoría QA (ISO/IEC 25010)** bajo `#btn-toggle-qa`.
- **Escenario Negativo (`CA-4`):** *Dado* una latencia puntual `> 4000 ms` o dato inválido (`NaN`), *Cuando* registra `src/metricsStore.js`, *Entonces* descuenta proporcionalmente `% SLA` y loguea warning sin cortar la respuesta WhatsApp.
- **Aprobación del Stakeholder:** Separación explícita Negocio vs. Panel ISO 25010 solicitada y validada tras Sprint Review (`24-11-2026` · Prof. Sarita González Catalán & Prof. Matías Vargas).

### `AAI-102` (`[INT-HU-23]`) — Agendamiento Automático de Reuniones con Benjamín y Widget Calendario (`Sprint 3 · 8 SP · Rama feat/AAI-102-HU-23-agendamiento-reuniones-calendario`)
- **Historia:** Como cliente o gerente comercial (Benjamín Yáñez), quiero coordinar reuniones en lenguaje natural por WhatsApp o desde el calendario web bajo reglas hábiles reales, flujo de confirmación y cero topones.
- **Requerimientos:** `RF-06` (`OE-4`), `RNF-01`
- **Escenario Positivo (`CA-1, CA-2, CA-4`):** *Dado* un bloque libre entre Lunes–Viernes (`09:00–12:00` o `14:00–18:00`), *Cuando* se solicita por WhatsApp o web, *Entonces* guarda `#R-id` en estado inicial **`ingresada`** permitiendo transición **`ingresada -> confirmada -> completada`** (o `cancelada`) sincronizada entre canales.
- **Escenario Negativo (`CA-3 + Regla Horaria`):** *Dado* solicitud a las `04:00 AM`, colación (`13:00`), fin de semana, pasado o bloque ya ocupado, *Cuando* valida `src/agenda.js` o bloquea `SELECT FOR UPDATE`, *Entonces* responde `HTTP 400` o `HTTP 409 HORARIO_OCUPADO` sugiriendo los `3` horarios libres más cercanos.
- **Aprobación del Stakeholder:** Reglas hábiles, estado inicial `ingresada` y diálogo abierto sin menús IVR validados en Sprint Review (`24-11-2026` · Prof. Sarita González Catalán).

---

> **Checklist para Auditoría Jira (`A3`):** Verifique en las tarjetas `AAI-25`, `AAI-90`, `AAI-94` y `AAI-102` en Atlassian Jira el comentario de cierre dejando constancia de la validación externa (`nombre · rol · fecha`) antes de crear el tag final `hito3`.
