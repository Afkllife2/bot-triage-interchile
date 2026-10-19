# Plan de Pruebas — Sprint 2 (Hito 2)

**Proyecto:** Bot Triage Comercial InterChile
**Sprint:** Sprint 2 — Hito 2
**Fecha de elaboración:** 24 de Septiembre 2026
**Fecha de ejecución y cierre:** 09 al 18 de Octubre 2026

> **ESTADO FINAL:** 24/24 Casos de Prueba ejecutados y aprobados (`PASS`).

---

## Tabla de Casos de Prueba Ejecutados

| ID | HU | CA | Descripción del Caso | Entrada (Input) | Resultado Esperado | Resultado Obtenido | Estado | Evidencia |
|---|---|---|---|---|---|---|---|---|
| **CP-S2-01** | HU-02 | CA-1 | Pregunta de seguimiento ante mensaje vago | "Mi equipo no funciona" / "hola buen día" | Bot responde con pregunta específica y opciones para desambiguar | Bot saluda, consulta motivo y ofrece opciones claras | ✅ PASS | EV-02 (`evidencias_sprint2.md`) |
| **CP-S2-02** | HU-02 | CA-2 | Derivación ante ambigüedad persistente o caso complejo | Cliente envía información vaga o compleja | El bot detiene el bucle y deriva a ejecutivo humano (Benjamín) | `requiere_derivacion: true` y entrega contacto de Benjamín | ✅ PASS | EV-10 / `test/interchile.test.js` |
| **CP-S2-03** | HU-02 | CA-3 | Diagnóstico completo con información suficiente | Mensaje con equipo, marca, síntoma y urgencia claros | Ticket guardado en Supabase con `sintoma_observacion`, `equipo_marca` y `prioridad_sugerida` no nulos | Ficha completa extraída y persistida en tabla `casos_triage` (IDs 49-51, 69) | ✅ PASS | EV-03, EV-04 |
| **CP-S2-04** | HU-02 | CA-4 | Bot no repite pregunta ya respondida | Cliente ya dijo nombre ("Carlos") y comuna ("Reñaca") en turno 2 | En turno 3 y 4 el bot recuerda nombre y sucursal sin volver a preguntar | Historial LangChain conserva `Carlos` y `Reñaca` en turnos 3 y 4 | ✅ PASS | EV-03 (Captura WhatsApp) |
| **CP-S2-05** | HU-18/21 | CA-1 | Validación exitosa contra Kronos | Diagnóstico con equipo `Split` y marca `Samsung` | Respuesta retorna `{ valido: true, motivo: null }`, flujo continúa normalmente | Arnés valida sin alucinaciones y continúa guardado en BD | ✅ PASS | EV-12 (`test/arneses.test.js`) |
| **CP-S2-06** | HU-18/21 | CA-2 | Detección de alucinación (dato inventado) | IA genera marca `CoolBreeze Pro X9000` o repuesto `NanoCore Z47` | Arnés detecta dato inexistente, registra en `logs/alucinaciones.log` y reemplaza por `[dato por confirmar]` | Reemplazo aplicado antes de guardar/enviar; alerta registrada en log | ✅ PASS | EV-12 (`test/arneses.test.js`) |
| **CP-S2-07** | HU-18/21 | CA-3 | Respaldo ante fallo de Kronos | Excepción simulada al consultar Kronos | Bot captura el error en `aplicarArnes` y no interrumpe la conversación | Flujo continúa con fallback seguro sin crashear el servidor | ✅ PASS | `src/arneses.js` (bloque `catch`) |
| **CP-S2-08** | HU-18/21 | CA-4 | Inmutabilidad de ficha en validación | Validar ficha con marca/tipo/repuesto alucinado | La ficha original no es mutada y `fichaCorregida` es un objeto nuevo sanitizado | `expect(fichaCorregida).not.toBe(fichaOriginal)` pasa en verde | ✅ PASS | EV-12 (Suite 3 Jest) |
| **CP-S2-09** | HU-06 | CA-1 | Detección de solicitud explícita de humano | "Quiero hablar con una persona / ejecutivo" | Bot confirma derivación empáticamente e incluye correo `Benjamin@interchileclima.cl` y `+569 9440 2632` | Bot responde con los datos de Benjamín y detiene el cuestionario | ✅ PASS | EV-10 / `test/interchile.test.js` |
| **CP-S2-10** | HU-06 | CA-2 | Actualización de estado en Supabase al derivar | Cliente pide hablar con humano | Ticket en Supabase guardado con `requiere_humano: true` y `estado: 'derivado'` | Registro insertado en `casos_triage` con `estado = 'derivado'` en <2s | ✅ PASS | EV-10 (`src/db.js`) |
| **CP-S2-11** | HU-06 | CA-3 | Bot en silencio después de derivar | Cliente manda mensaje nuevo después de ser derivado | Bot NO invoca a Gemini, responde mensaje estático de confirmación | `clientesDerivados.has(telefono)` intercepta el turno y responde en silencio de IA | ✅ PASS | EV-10 / `test/interchile.test.js` |
| **CP-S2-12** | HU-06 | CA-4 | Ticket derivado visible en Dashboard | Ticket marcado como `requiere_humano: true` | Dashboard muestra ese ticket con etiqueta destacada en "Requieren Humano" | Fila destacada visualmente en naranjo/amarillo en el Dashboard | ✅ PASS | EV-10 (`Evidencia_HU06_CA4`) |
| **CP-S2-13** | HU-14 | CA-1 | Carga de tabla de tickets en Dashboard | Abrir `http://localhost:3000/dashboard` | Tabla visible con Fecha, Teléfono, Cliente, Equipo, Síntoma, Prioridad, Estado | 47+ tickets reales cargados desde Supabase vía `GET /api/tickets` | ✅ PASS | EV-05 (`media__1790695662395.png`) |
| **CP-S2-14** | HU-14 | CA-2 | Destaque visual de tickets de prioridad Alta | Ticket con `prioridad_sugerida: Alta` en Supabase | Esa fila y badge aparecen resaltados en rojo en la tabla del Dashboard | 20 tickets de Prioridad Alta resaltados en rojo | ✅ PASS | EV-05 (`media__1790695673114.png`) |
| **CP-S2-15** | HU-14 | CA-3 | Filtro de tickets derivados / prioridad | Seleccionar filtros superiores en el Dashboard | Dashboard filtra instantáneamente las filas correspondientes | Filtros Todos, Prioridad Alta, Requieren Humano y Normal operativos | ✅ PASS | EV-05 |
| **CP-S2-16** | HU-14 | CA-4 | Refresco de datos en Dashboard | Enviar nuevo mensaje por WhatsApp y presionar "Actualizar" | El ticket nuevo aparece en la tabla sin recargar toda la página | `fetch('/api/tickets')` actualiza la tabla y contadores en vivo | ✅ PASS | EV-05 (`public/dashboard.html`) |
| **CP-S2-17** | HU-20 | CA-1 | Envío de mensaje con botones / lista interactiva | Saludo inicial del cliente | WhatsApp muestra botones rápidos (≤3 opciones) o Menú de Lista (4+ opciones: Falla, Mantención, Cotización, Arriendo) | Payload `interactive` enviado con éxito por Meta Graph API | ✅ PASS | EV-09 (`src/whatsapp.js`) |
| **CP-S2-18** | HU-20 | CA-2 | Procesamiento de selección interactiva | Cliente presiona botón o selecciona opción de lista | Servidor extrae `button_reply.title` o `list_reply.title` y lo pasa al Motor IA | Webhook procesa la opción seleccionada como texto del cliente | ✅ PASS | EV-09 (`src/server.js`) |
| **CP-S2-19** | HU-20 | CA-3 | Fallback a texto libre sin botones | Cliente escribe texto directamente en vez de usar el botón | Bot procesa `waMessage.text.body` normalmente sin error | Conversación fluye sin obligar al uso de botones | ✅ PASS | EV-03, EV-09 |
| **CP-S2-20** | TSK-02 | Errores | Error o Timeout de Gemini no crashea el servidor | Timeout >8s o excepción en `llmEstructurado.invoke` | Bot responde mensaje empático de disculpa, servidor sigue activo y devuelve HTTP 200 | `conTimeout(8000)` y bloque `catch` retornan ficha de contingencia | ✅ PASS | EV-07, EV-11 (`src/brain.js`) |
| **CP-S2-21** | TSK-02 | Errores | Error de Supabase no bloquea la conversación | Fallo de conexión o query en `guardarCasoTriage` | Se hace `ROLLBACK`, se escribe en `logs/error.log` y el bot responde igual al cliente | `logError` registra el fallo sin lanzar excepción al flujo principal | ✅ PASS | EV-11 (`src/db.js`) |
| **CP-S2-22** | TSK-02 | Tokens | Número oficial en producción y guía de Token | Configuración en Meta for Developers (+56 9 7235 2751) | Bot operativo en número oficial y procedimiento documentado en `docs/TOKEN_RENOVACION.md` | Mensajes reales recibidos y respondidos desde número oficial | ✅ PASS | EV-13 (`docs/TOKEN_RENOVACION.md`) |
| **CP-S2-23** | TSK-02 | Memoria | Historial de conversación multi-turno | Enviar 4 mensajes consecutivos desde el mismo número | `conversaciones` conserva los turnos previos y Supabase guarda la evolución del caso | 4 turnos encadenados con contexto acumulado verificados | ✅ PASS | EV-03 (IDs 48, 49, 50, 51) |
| **CP-S2-24** | TSK-02 | Memoria | Expiración de sesión tras 60 minutos | Superar `TIEMPO_EXPIRACION_MS` (60 min) sin actividad | `obtenerContexto()` purga la sesión expirada e inicia conversación limpia | Limpieza automática verificada en `obtenerContexto()` | ✅ PASS | EV-03 (`src/brain.js`) |

---

## Resumen Final por Historia de Usuario

| HU | Total de CPs | Aprobados | Fallidos | Pendientes |
|---|---|---|---|---|
| HU-02 Diagnóstico Dinámico | 4 | 4 | 0 | 0 |
| HU-18 / HU-21 Integración y Arnés Kronos | 4 | 4 | 0 | 0 |
| HU-06 Derivación a Humano | 4 | 4 | 0 | 0 |
| HU-14 Dashboard Web | 4 | 4 | 0 | 0 |
| HU-20 Botones y Listas WhatsApp | 3 | 3 | 0 | 0 |
| HU-16 / TSK-02 Infraestructura y Errores | 5 | 5 | 0 | 0 |
| **TOTAL** | **24** | **24** | **0** | **0** |


---

## Pruebas de Integración Automatizadas (agregado 19-10-2026)

Archivo: `test/integracion.test.js` · Herramientas: Jest + supertest · Ejecuta las rutas reales de Express, `arneses.js` y `kronos.js`; simula solo Gemini, Supabase y Meta.

| ID | CA / HU | Qué verifica | Estado |
|---|---|---|---|
| CI-01 | Seguridad | GET de verificación con token correcto devuelve el *challenge* | ✅ PASS |
| CI-02 | Seguridad | GET con token incorrecto → 403 | ✅ PASS |
| CI-03 | Seguridad | POST sin firma → 401 y la IA no se invoca | ✅ PASS |
| CI-04 | Seguridad | POST con firma inválida → 403 y la IA no se invoca | ✅ PASS |
| CI-05 | HU-02 | Texto → IA (con texto y teléfono) → BD → respuesta de texto | ✅ PASS |
| CI-06 | HU-20 CA-2 | `button_reply` llega a la IA como texto | ✅ PASS |
| CI-07 | HU-20 CA-2 | `list_reply` (Arriendo) llega a la IA como texto | ✅ PASS |
| CI-08 | HU-20 CA-1 | Opciones de la IA se envían como mensaje interactivo | ✅ PASS |
| CI-09 | HU-06 | Derivación: solo texto, sin botones, contacto de Benjamín, caso persistido | ✅ PASS |
| CI-10 | Pipeline | Estados de entrega (sin mensajes) → 200 sin invocar la IA | ✅ PASS |
| CI-11 | HU-21 | Marca inventada se corrige **antes** de guardar en BD | ✅ PASS |
| CI-12 | HU-21 | Marca válida pasa sin modificarse | ✅ PASS |
| CI-13 | HU-14 | `/api/tickets` devuelve los tickets | ✅ PASS |
| CI-14 | HU-16 | `/api/tickets` responde 500 controlado ante fallo de datos | ✅ PASS |
| CI-15 | HU-14 | `/dashboard` sirve HTML | ✅ PASS |

**Limitación declarada:** estas pruebas no llaman a Supabase ni a Meta reales; esa integración se validó de forma manual end-to-end (EV-01 a EV-13).
