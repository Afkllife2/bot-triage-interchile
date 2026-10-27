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

// HU-16 CA-3: Timeout helper (12 segundos para APIs externas en la nube, dentro del límite de 15s de Meta)
function conTimeout(promesa, ms = 12000) {
  let timer;
  const reloj = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Timeout: la operación superó ${ms}ms`)), ms);
  });
  return Promise.race([promesa, reloj]).finally(() => clearTimeout(timer));
}

// --- ESQUEMA DE SALIDA ESTRUCTURADA (Zod) ---
const FichaTriage = z.object({
  tipo_solicitud: z
    .enum(['Falla Técnica', 'Mantención', 'Instalación', 'Cotización', 'Proyecto Comercial', 'Arriendo', 'Otra Consulta'])
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
    .describe("La marca del equipo y el modelo específico si el cliente lo menciona (Ej: 'Samsung', 'Samsung WindFree', 'LG DualCool', 'Anwo'). Si el cliente menciona un modelo específico junto a la marca, inclúyelo aquí tal cual lo escribió. Si no la sabe, dejar vacío."),
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
    .describe("True si el cliente pide explícitamente hablar con una persona, ejecutivo, o humano, o cuando ya se completó la recolección de datos del caso para pasarlo a Benjamín."),

  // HU-20: Botones interactivos (máx 10 opciones)
  opciones_botones: z
    .array(z.string().max(24))
    .max(10)
    .describe("Lista de opciones cortas para presentar como botones o lista en WhatsApp. Usar SOLO cuando el cliente necesita elegir entre opciones claras. Dejar vacío si no aplica."),

  respuesta_cliente: z
    .string()
    .describe("Respuesta comercial, empática y breve para enviar al cliente. Si requiere_derivacion es true, confirmar que un ejecutivo lo contactará y despedirse. Si hay opciones_botones, redactar el texto que acompaña a los botones."),
});

// --- PROMPT DEL SISTEMA ---
const SYSTEM_PROMPT = `Eres un asistente de triage comercial y técnico para InterChile, empresa de climatización y aire acondicionado. Ofrecemos proyectos, instalación, mantención, reparación y arriendo de equipos.

Tu trabajo en cada turno:
1. RECORDAR todo lo que el cliente ya te dijo en mensajes anteriores de esta conversación.
2. EXTRAER cualquier información nueva que proporcione ahora.
3. COMPLETAR la ficha con los datos acumulados entre todos los mensajes.
4. REDACTAR una respuesta (respuesta_cliente) breve, empática y profesional.

REGLAS IMPORTANTES:
- Si el cliente ya dio su nombre antes, NO volver a preguntarlo.
- Si ya dio el equipo, NO volver a preguntarlo.
- Solo marcar prioridad 'Alta' si hay interrupción crítica de servicio o urgencia explícita.
- CONSULTA DE EQUIPO (MARCA Y MODELO):
  * Cuando el cliente solicite Mantención o Falla Técnica y aún no haya indicado el equipo, pregúntale por el tipo de equipo, la marca y dile que si conoce el modelo específico aún mejor (ej: "¿Me podrías indicar el tipo de equipo, la marca y, si conoces el modelo, aún mejor?").
  * Si el cliente menciona tanto la marca como el modelo, guarda ambos juntos en el campo equipo_marca (ej: "Samsung WindFree" o la marca y modelo que haya escrito).
- PROTOCOLO DE DERIVACIÓN Y PRE-CALIFICACIÓN COMERCIAL (Feedback de Benjamín):
  * Si el cliente selecciona "Proyecto Comercial", solicita cotización o arriendo para empresas, o pide hablar con un ejecutivo, NO debes derivarlo de inmediato en frío si aún no tienes contexto.
  * Primero recopila el contexto mínimo esencial para el ejecutivo:
    1) Comuna o ciudad (sucursal_comuna).
    2) Nombre del cliente o empresa (cliente_nombre).
    3) Tipo de espacio o equipo requerido (ej: oficinas, local comercial, galpón, clínica, o equipo con marca/modelo).
  * Mientras falten estos datos básicos (especialmente la comuna/ciudad y nombre/empresa), mantén requiere_derivacion: false y pídele cordialmente esos detalles al cliente.
  * Una vez que el cliente haya proporcionado los datos completos de su solicitud (o si el cliente insiste explícitamente en hablar con un ejecutivo de inmediato sin dar más detalles), marca requiere_derivacion: true, confirma que su solicitud quedó ingresada y despídete indicándole expresamente que puede contactar a Benjamín al correo Benjamin@interchileclima.cl o al WhatsApp +569 9440 2632.
- Usar opciones_botones SOLO cuando el cliente necesita elegir entre opciones limitadas y claras (máx 10, máx 24 caracteres cada una). Ejemplo inicial: ["Falla Técnica", "Mantención", "Instalación", "Cotización", "Proyecto Comercial", "Arriendo", "Otra Consulta"].
- NUNCA inventar datos. Si no se sabe, dejar vacío.`;

// --- 🛡️ ARNÉS DE MEMORIA CONVERSACIONAL (HU-02) ---
const conversaciones = new Map();
const TIEMPO_EXPIRACION_MS = 60 * 60 * 1000; // 60 minutos
const MAX_MENSAJES_HISTORIAL = 10; // últimos 5 turnos

// HU-06 CA-3: Registro de clientes ya derivados (silencio post-escalada)
const clientesDerivados = new Set();
const MENSAJE_ESTATICO_DERIVADO = 'Tu caso ya fue escalado a nuestro equipo. Por favor contacta directamente a Benjamín al correo Benjamin@interchileclima.cl o al WhatsApp +569 9440 2632. ¡Gracias! 🙏';

// --- INICIALIZACIÓN DEL MODELO LANGCHAIN ---
const llm = new ChatGoogleGenerativeAI({
  model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
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

  // Comando rápido para reiniciar sesión durante pruebas o demostraciones en vivo
  const textoLimpio = (mensajeCliente || '').trim().toLowerCase();
  if (textoLimpio === '/reset' || textoLimpio === 'reset' || textoLimpio === 'reiniciar') {
    limpiarHistorial(telefono);
    return {
      _noPersistir: true,
      tipo_solicitud: 'Otra Consulta',
      cliente_nombre: '', sucursal_comuna: '', sucursal_direccion: '',
      equipo_tipo: '', equipo_marca: '', sintoma_observacion: 'Reinicio de sesión',
      prioridad: 'Normal', disponibilidad_cliente: '', tiene_fotos: false,
      requiere_derivacion: false,
      opciones_botones: [
        'Falla Técnica',
        'Mantención',
        'Instalación',
        'Cotización',
        'Proyecto Comercial',
        'Arriendo',
        'Otra Consulta',
      ],
      respuesta_cliente: '🔄 Sesión reiniciada. ¡Hola! Bienvenido a InterChile. ¿En qué podemos ayudarte hoy?',
    };
  }

  // HU-06 CA-3: Si el cliente ya fue derivado, responder con mensaje estático y no llamar a la IA
  if (clientesDerivados.has(telefono)) {
    console.log(`🔇 [HU-06 CA-3] Cliente ${telefono} ya derivado. Respondiendo con mensaje estático.`);
    return {
      _noPersistir: true,
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
    // HU-16 CA-3: Timeout de 12 segundos a la llamada de Gemini (configurable vía env)
    const timeoutMs = parseInt(process.env.GEMINI_TIMEOUT_MS, 10) || 12000;
    const ficha = await conTimeout(llmEstructurado.invoke(mensajes), timeoutMs);

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
 * Limpia manualmente el historial y el estado de derivación de un cliente.
 */
function limpiarHistorial(telefono) {
  conversaciones.delete(telefono);
  clientesDerivados.delete(telefono);
  console.log(`🧹 Historial limpiado para: ${telefono}`);
}

module.exports = { extraerFichaTriage, limpiarHistorial };
