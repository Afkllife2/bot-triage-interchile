# Plan de Pruebas — Sprint 2 (Hito 2)

**Proyecto:** Bot Triage Comercial InterChile
**Sprint:** Sprint 2 — Hito 2
**Fecha de elaboración:** 24 de Septiembre 2026

> **INSTRUCCIÓN:** Este plan está pre-escrito con los 24 casos de prueba del Sprint 2.
> Al ejecutar cada prueba, completa las columnas "Resultado Obtenido", "Estado" y "Evidencia"
> con la captura de pantalla o log correspondiente. NO modificar el Resultado Esperado.

---

## Tabla de Casos de Prueba

| ID | HU | CA | Descripción del Caso | Entrada (Input) | Resultado Esperado | Resultado Obtenido | Estado | Evidencia |
|---|---|---|---|---|---|---|---|---|
| **CP-S2-01** | HU-02 | CA-1 | Pregunta de seguimiento ante mensaje vago | "Mi equipo no funciona" | Bot responde con pregunta específica (ej: "¿Qué marca y modelo es el equipo?") | — | Pendiente | — |
| **CP-S2-02** | HU-02 | CA-2 | Límite de 3 preguntas sin diagnóstico | Cliente responde vagamente 3 veces seguidas | El bot deja de preguntar y responde "Un ejecutivo te contactará" + ticket marcado `requiere_aclaracion` | — | Pendiente | — |
| **CP-S2-03** | HU-02 | CA-3 | Diagnóstico completo con información suficiente | Mensaje con equipo, marca, síntoma y urgencia claros | Ticket guardado en Supabase con `sintoma_observacion`, `equipo_marca` y `prioridad_sugerida` no nulos | — | Pendiente | — |
| **CP-S2-04** | HU-02 | CA-4 | Bot no repite pregunta ya respondida | Cliente ya dijo el tipo de equipo, bot no vuelve a preguntar por eso | Segunda respuesta del bot pregunta algo diferente (no repite "¿qué equipo es?") | — | Pendiente | — |
| **CP-S2-05** | HU-18 | CA-1 | Validación exitosa contra Kronos | Diagnóstico con equipo/marca que sí existe en Kronos | Respuesta incluye `kronos_validado: true`, flujo continúa normalmente | — | Pendiente | — |
| **CP-S2-06** | HU-18 | CA-2 | Detección de alucinación (dato inventado) | IA genera repuesto ficticio que no existe en Kronos | Sistema bloquea el diagnóstico, log muestra advertencia, IA regenera respuesta | — | Pendiente | — |
| **CP-S2-07** | HU-18 | CA-3 | Respaldo ante fallo de Kronos (timeout) | Simular Kronos sin respuesta por 6+ segundos | Bot responde con mensaje genérico seguro, conversación no se interrumpe | — | Pendiente | — |
| **CP-S2-08** | HU-18 | CA-4 | Límite de 2 reintentos de regeneración | IA alucina 3 veces seguidas | Después del 2° intento, sistema emite respuesta genérica y marca `requiere_revision_manual: true` | — | Pendiente | — |
| **CP-S2-09** | HU-06 | CA-1 | Detección de solicitud explícita de humano | "Quiero hablar con una persona" | Bot responde empáticamente confirmando que un ejecutivo se contactará, sin hacer más preguntas | — | Pendiente | — |
| **CP-S2-10** | HU-06 | CA-2 | Actualización de estado en Supabase al derivar | Cliente pide hablar con humano | Ticket en Supabase actualizado con `requiere_humano: true` y `estado: derivado` en menos de 3 seg | — | Pendiente | — |
| **CP-S2-11** | HU-06 | CA-3 | Bot en silencio después de derivar | Cliente manda mensaje nuevo después de derivar | Bot NO responde con preguntas de IA, solo envía mensaje estático de confirmación | — | Pendiente | — |
| **CP-S2-12** | HU-06 | CA-4 | Ticket derivado visible en Dashboard | Ticket marcado como `requiere_humano: true` | Dashboard muestra ese ticket con etiqueta destacada en sección "Requieren Atención Humana" | — | Pendiente | — |
| **CP-S2-13** | HU-14 | CA-1 | Carga de tabla de tickets en Dashboard | Abrir URL del Dashboard en navegador | Tabla visible con columnas: Fecha, Teléfono, Equipo, Síntoma, Prioridad, Estado. Mínimo 1 ticket real | — | Pendiente | — |
| **CP-S2-14** | HU-14 | CA-2 | Destaque visual de tickets de prioridad Alta | Ticket con `prioridad_sugerida: Alta` en Supabase | Esa fila aparece resaltada en rojo en la tabla del Dashboard | — | Pendiente | — |
| **CP-S2-15** | HU-14 | CA-3 | Filtro de tickets derivados a humano | Aplicar filtro "Requieren Atención Humana" | Dashboard muestra solo tickets con `requiere_humano: true` | — | Pendiente | — |
| **CP-S2-16** | HU-14 | CA-4 | Refresco de datos en Dashboard | Enviar nuevo mensaje por WhatsApp, luego presionar "Actualizar" en Dashboard | El ticket nuevo aparece en la tabla sin recargar la página manualmente | — | Pendiente | — |
| **CP-S2-17** | HU-20 | CA-1 | Envío de mensaje con botones interactivos | Bot necesita confirmar el tipo de equipo | WhatsApp del cliente muestra botones clickeables con opciones (ej: "Aire Acondicionado", "Refrigerador", "Otro") | — | Pendiente | — |
| **CP-S2-18** | HU-20 | CA-2 | Procesamiento de selección de botón | Cliente presiona "Aire Acondicionado" | Sistema extrae el valor "Aire Acondicionado" del payload `interactive` y lo usa directamente en el JSON | — | Pendiente | — |
| **CP-S2-19** | HU-20 | CA-3 | Fallback a texto libre sin botones | Cliente escribe "tengo un aire" en lugar de presionar botón | Bot procesa el texto libre igualmente y continúa el flujo sin error | — | Pendiente | — |
| **CP-S2-20** | TSK-02 | Errores | Error de Gemini no crashea el servidor | Simular error 503 de la API de Gemini | Bot responde con mensaje de disculpa, servidor Node.js sigue corriendo, HTTP 200 al Webhook de Meta | — | Pendiente | — |
| **CP-S2-21** | TSK-02 | Errores | Error de Supabase no bloquea la conversación | Simular error de BD al guardar ticket | Bot responde al cliente que su caso fue recibido, error queda en `error.log` | — | Pendiente | — |
| **CP-S2-22** | TSK-02 | Tokens | Token permanente activo por 24+ horas | Esperar 24h con servidor activo y token de producción | Bot sigue respondiendo sin error `OAuthException 190` | — | Pendiente | — |
| **CP-S2-23** | TSK-02 | Memoria | Historial de conversación persistido | Enviar 3 mensajes consecutivos al bot | Supabase registra los 3 mensajes asociados al mismo número, disponibles como contexto | — | Pendiente | — |
| **CP-S2-24** | TSK-02 | Memoria | Expiración de sesión tras 60 minutos | Iniciar conversación, esperar 60 min, enviar nuevo mensaje | Bot trata el nuevo mensaje como inicio de conversación nueva, sin mezclar contexto anterior | — | Pendiente | — |

---

## Resumen por Historia de Usuario

| HU | Total de CPs | Aprobados | Fallidos | Pendientes |
|---|---|---|---|---|
| HU-02 Diagnóstico Dinámico | 4 | 0 | 0 | 4 |
| HU-18 Integración Kronos | 4 | 0 | 0 | 4 |
| HU-06 Derivación a Humano | 4 | 0 | 0 | 4 |
| HU-14 Dashboard Web | 4 | 0 | 0 | 4 |
| HU-20 Botones WhatsApp | 3 | 0 | 0 | 3 |
| TSK-02 Infraestructura | 5 | 0 | 0 | 5 |
| **TOTAL** | **24** | **0** | **0** | **24** |
