require('dotenv').config();
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { HumanMessage, AIMessage, SystemMessage } = require('@langchain/core/messages');
const { z } = require('zod');

// ==========================================
// 🧠 MOTOR IA — NÚCLEO DEL SISTEMA
// Refactorizado con LangChain (Sprint 2)
// HU-02: Arnés de Memoria Conversacional
// HU-06: Detección de Derivación a Humano
// HU-16: Manejo de Errores y Timeouts
// HU-20: Sugerencia de Botones Interactivos
// ==========================================

// HU-16 CA-3: Timeout helper (8 segundos para APIs externas)
function conTimeout(promesa, ms = 8000) {
  const reloj = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout: la operación superó ${ms}ms`)), ms)
  );
  return Promise.race([promesa, reloj]);
}

// --- ESQUEMA DE SALIDA ESTRUCTURADA (Zod) ---
const FichaTriage = z.object({
  tipo_solicitud: z
    .enum(['Falla Técnica', 'Mantención', 'Instalación', 'Cotización', 'Proyecto Comercial', 'Otra Consulta'])
    .describe("El tipo principal de solicitud del cliente."),
  cliente_nombre: z
    .string()
    .describe("Nombre del cliente, empresa o persona natural. Si no lo dice, dejar vacío."),
  sucursal_comuna: z
    .string()
    .describe("Comuna o ciudad donde se necesita el servicio. Si no lo dice, dejar vacío."),
  sucursal_direccion: z
    .string()
    .describe("Dirección exacta si la provee. Si no lo dice, dejar vacío."),
  equipo_tipo: z
    .string()
    .describe("El tipo o capacidad del equipo (Ej: Split 24.000 BTU, Cassette, Cortina de aire). Si no lo sabe, dejar vacío."),
  equipo_marca: z
    .string()
    .describe("La marca del equipo (Ej: Samsung, LG, Anwo). Si no la sabe, dejar vacío."),
  sintoma_observacion: z
    .string()
    .describe("Resumen breve del problema o motivo."),
  prioridad: z
    .enum(['Alta', 'Media', 'Baja', 'Normal'])
    .describe("Prioridad calculada. Alta si hay interrupción crítica de servicio. Normal/Baja para consultas generales."),
  disponibilidad_cliente: z
    .string()
    .describe("Disponibilidad de horario que indica el cliente. Si no la dice, dejar vacío."),
  tiene_fotos: z
    .boolean()
    .describe("True si el cliente menciona que tiene fotos o videos."),

  // HU-06: Derivación a Humano
  requiere_derivacion: z
    .boolean()
    .describe("True si el cliente pide explícitamente hablar con una persona, ejecutivo, o humano. También true si está muy frustrado o el problema es demasiado complejo para resolver por chat."),

  // HU-20: Botones interactivos (máx 3 opciones)
  opciones_botones: z
    .array(z.string().max(20))
    .max(3)
    .describe("Lista de hasta 3 opciones cortas para presentar como botones clickeables en WhatsApp. Usar SOLO cuando el cliente necesita elegir entre opciones claras (ej: tipo de equipo, nivel de urgencia). Dejar vacío si no aplica."),

  respuesta_cliente: z
    .string()
    .describe("Respuesta comercial, empática y breve para enviar al cliente. Si requiere_derivacion es true, confirmar que un ejecutivo lo contactará y despedirse. Si hay opciones_botones, redactar el texto que acompaña a los botones."),
});

// --- PROMPT DEL SISTEMA ---
const SYSTEM_PROMPT = `Eres un asistente de triage comercial y técnico para InterChile, empresa de climatización y aire acondicionado.

Tu trabajo en cada turno:
1. RECORDAR todo lo que el cliente ya te dijo en mensajes anteriores de esta conversación.
2. EXTRAER cualquier información nueva que proporcione ahora.
3. COMPLETAR la ficha con los datos acumulados entre todos los mensajes.
4. REDACTAR una respuesta (respuesta_cliente) breve, empática y profesional.

REGLAS IMPORTANTES:
- Si el cliente ya dio su nombre antes, NO volver a preguntarlo.
- Si ya dio el equipo, NO volver a preguntarlo.
- Solo marcar prioridad 'Alta' si hay interrupción crítica de servicio.
- Si el cliente pide hablar con una persona o ejecutivo (palabras como "quiero hablar con alguien", "necesito un humano", "me comunicas con alguien"), marcar requiere_derivacion: true y despedirte confirmando que un ejecutivo lo contactará.
- Usar opciones_botones SOLO cuando el cliente necesita elegir entre opciones limitadas y claras (máx 3, máx 20 caracteres cada una). Ejemplo: si no sabe el tipo de equipo, ofrecer ["Split", "Cassette", "Otro"].
- NUNCA inventar datos. Si no se sabe, dejar vacío.`;

// --- 🛡️ ARNÉS DE MEMORIA CONVERSACIONAL (HU-02) ---
const conversaciones = new Map();
const TIEMPO_EXPIRACION_MS = 60 * 60 * 1000; // 60 minutos
const MAX_MENSAJES_HISTORIAL = 10; // últimos 5 turnos

// HU-06 CA-3: Registro de clientes ya derivados (silencio post-escalada)
const clientesDerivados = new Set();
const MENSAJE_ESTATICO_DERIVADO = 'Tu caso ya fue escalado a nuestro equipo. Un ejecutivo de InterChile se pondrá en contacto contigo a la brevedad. ¡Gracias por tu paciencia! 🙏';

// --- INICIALIZACIÓN DEL MODELO LANGCHAIN ---
const llm = new ChatGoogleGenerativeAI({
  model: 'gemini-2.5-flash',
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0,
});

const llmEstructurado = llm.withStructuredOutput(FichaTriage);

/**
 * Obtiene o crea el contexto de conversación para un teléfono dado.
 */
function obtenerContexto(telefono) {
  const ahora = Date.now();

  for (const [tel, ctx] of conversaciones.entries()) {
    if (ahora - ctx.ultimaActividad > TIEMPO_EXPIRACION_MS) {
      conversaciones.delete(tel);
      console.log(`🗑️ Conversación expirada eliminada para: ${tel}`);
    }
  }

  if (!conversaciones.has(telefono)) {
    conversaciones.set(telefono, { mensajes: [], ultimaActividad: ahora });
    console.log(`🆕 Nueva conversación iniciada para: ${telefono}`);
  }

  const ctx = conversaciones.get(telefono);
  ctx.ultimaActividad = ahora;
  return ctx;
}

/**
 * Función principal del Motor IA.
 * @param {string} mensajeCliente - Texto del mensaje recibido
 * @param {string} telefono - Número de teléfono del cliente
 * @returns {Object} Ficha estructurada con respuesta_cliente
 */
async function extraerFichaTriage(mensajeCliente, telefono = 'test') {
  console.log(`\n🤖 [LangChain] Procesando mensaje de ${telefono}: "${mensajeCliente}"\n`);

  // HU-06 CA-3: Si el cliente ya fue derivado, responder con mensaje estático y no llamar a la IA
  if (clientesDerivados.has(telefono)) {
    console.log(`🔇 [HU-06 CA-3] Cliente ${telefono} ya derivado. Respondiendo con mensaje estático.`);
    return {
      tipo_solicitud: 'Otra Consulta',
      cliente_nombre: '', sucursal_comuna: '', sucursal_direccion: '',
      equipo_tipo: '', equipo_marca: '', sintoma_observacion: 'Mensaje post-derivación',
      prioridad: 'Normal', disponibilidad_cliente: '', tiene_fotos: false,
      requiere_derivacion: false, opciones_botones: [],
      respuesta_cliente: MENSAJE_ESTATICO_DERIVADO,
    };
  }

  const ctx = obtenerContexto(telefono);
  console.log(`💬 Historial: ${ctx.mensajes.length / 2} turno(s) anteriores en memoria`);

  const mensajes = [
    new SystemMessage(SYSTEM_PROMPT),
    ...ctx.mensajes,
    new HumanMessage(mensajeCliente),
  ];

  try {
    // HU-16 CA-3: Timeout de 8 segundos a la llamada de Gemini
    const ficha = await conTimeout(llmEstructurado.invoke(mensajes), 8000);

    console.log('✅ Ficha Estructurada Extraída (Lista para Kronos):');
    console.dir(ficha, { depth: null, colors: true });

    // HU-06 CA-3: Si fue derivado, registrarlo en Set de silencio + limpiar historial
    if (ficha.requiere_derivacion) {
      console.log(`🔀 Cliente derivado a humano. Silenciando futuros mensajes de: ${telefono}.`);
      clientesDerivados.add(telefono);
      conversaciones.delete(telefono);
    } else {
      // Actualizar historial solo si no fue derivado
      ctx.mensajes.push(new HumanMessage(mensajeCliente));
      ctx.mensajes.push(new AIMessage(ficha.respuesta_cliente));

      if (ctx.mensajes.length > MAX_MENSAJES_HISTORIAL) {
        ctx.mensajes = ctx.mensajes.slice(-MAX_MENSAJES_HISTORIAL);
      }
    }

    return ficha;

  } catch (error) {
    // HU-16 CA-1: Error de Gemini o Timeout → respuesta de disculpa, NUNCA lanzar excepción
    const esTimeout = error.message && error.message.startsWith('Timeout');
    console.error(`❌ [HU-16] ${esTimeout ? 'TIMEOUT' : 'ERROR'} Gemini/LangChain:`, error.message);

    return {
      tipo_solicitud: 'Otra Consulta',
      cliente_nombre: '', sucursal_comuna: '', sucursal_direccion: '',
      equipo_tipo: '', equipo_marca: '',
      sintoma_observacion: esTimeout ? 'Timeout de procesamiento' : 'Error de procesamiento',
      prioridad: 'Normal', disponibilidad_cliente: '', tiene_fotos: false,
      requiere_derivacion: false, opciones_botones: [],
      // HU-16 CA-1: Mensaje empático, no técnico
      respuesta_cliente: esTimeout
        ? 'Estamos experimentando alta demanda en este momento. Por favor, reintenta en unos minutos. ¡Te pedimos disculpas! 🙏'
        : 'Gracias por contactarnos. Estamos experimentando dificultades técnicas temporales. Un ejecutivo se comunicará contigo a la brevedad. Disculpe los inconvenientes.',
    };
  }
}

/**
 * Limpia manualmente el historial de un cliente (ej: al cerrar un caso).
 */
function limpiarHistorial(telefono) {
  conversaciones.delete(telefono);
  console.log(`🧹 Historial limpiado para: ${telefono}`);
}

module.exports = { extraerFichaTriage, limpiarHistorial };
