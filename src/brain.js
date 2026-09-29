require('dotenv').config();
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { HumanMessage, AIMessage, SystemMessage } = require('@langchain/core/messages');
const { z } = require('zod');

// ==========================================
// 🧠 MOTOR IA — NÚCLEO DEL SISTEMA
// Refactorizado con LangChain (Sprint 2)
// Implementa: Arnés de Memoria Conversacional
// ==========================================

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
    .describe("Resumen breve del problema o motivo. Ej: 'No enfría', 'Hace ruido', 'Necesito limpiar filtros'."),
  prioridad: z
    .enum(['Alta', 'Media', 'Baja', 'Normal'])
    .describe("Prioridad calculada. Alta si hay interrupción crítica de servicio. Normal/Baja para consultas generales."),
  disponibilidad_cliente: z
    .string()
    .describe("Disponibilidad de horario que indica el cliente para la visita. Si no la dice, dejar vacío."),
  tiene_fotos: z
    .boolean()
    .describe("True si el cliente menciona que tiene fotos, mandó fotos o enviará videos."),
  respuesta_cliente: z
    .string()
    .describe("Una respuesta comercial, empática y breve para enviar de vuelta al cliente por WhatsApp. Si falta información clave (equipo, síntoma, ubicación), preguntar por ella en vez de asumir urgencia."),
});

// --- PROMPT DEL SISTEMA ---
const SYSTEM_PROMPT = `Eres un asistente de triage comercial y técnico para InterChile, empresa de climatización y aire acondicionado.

Tu trabajo en cada turno:
1. RECORDAR todo lo que el cliente ya te dijo en mensajes anteriores de esta conversación.
2. EXTRAER cualquier información nueva que proporcione ahora (nombre, equipo, falla, ubicación, disponibilidad).
3. COMPLETAR la ficha con los datos acumulados entre todos los mensajes.
4. REDACTAR una respuesta (respuesta_cliente) breve, empática y profesional para enviar al cliente.

REGLAS IMPORTANTES:
- Si el cliente ya dio su nombre antes, NO volver a preguntarlo.
- Si ya dio el equipo, NO volver a preguntarlo.
- Solo marcar prioridad 'Alta' si hay interrupción crítica de servicio (sucursal sin climatización, con clientes afectados).
- Si el mensaje es vago o informal (ej: "hola", "buenos días"), responder saludando y pidiendo el motivo de contacto.
- Si falta información clave para el triage (tipo de equipo, síntoma específico, ubicación), pedirla amablemente.
- NUNCA inventar datos. Si no se sabe, dejar vacío.`;

// --- 🛡️ ARNÉS DE MEMORIA CONVERSACIONAL ---
// Almacena el historial de conversación por número de teléfono.
// Expira automáticamente tras 60 minutos de inactividad.
const conversaciones = new Map();
const TIEMPO_EXPIRACION_MS = 60 * 60 * 1000; // 60 minutos
const MAX_MENSAJES_HISTORIAL = 10; // Últimos 5 turnos (human + AI)

// --- INICIALIZACIÓN DEL MODELO LANGCHAIN ---
const llm = new ChatGoogleGenerativeAI({
  model: 'gemini-2.5-flash',
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0,
});

// Modelo con salida estructurada (Arnés de Salida)
const llmEstructurado = llm.withStructuredOutput(FichaTriage);

/**
 * Obtiene o crea el contexto de conversación para un teléfono dado.
 * Limpia conversaciones inactivas automáticamente.
 */
function obtenerContexto(telefono) {
  const ahora = Date.now();

  // Limpiar conversaciones expiradas (mantenimiento)
  for (const [tel, ctx] of conversaciones.entries()) {
    if (ahora - ctx.ultimaActividad > TIEMPO_EXPIRACION_MS) {
      conversaciones.delete(tel);
      console.log(`🗑️ Conversación expirada eliminada para: ${tel}`);
    }
  }

  // Crear nueva conversación si no existe o expiró
  if (!conversaciones.has(telefono)) {
    conversaciones.set(telefono, {
      mensajes: [],
      ultimaActividad: ahora,
    });
    console.log(`🆕 Nueva conversación iniciada para: ${telefono}`);
  }

  const ctx = conversaciones.get(telefono);
  ctx.ultimaActividad = ahora;
  return ctx;
}

/**
 * Función principal del Motor IA.
 * Procesa el mensaje del cliente con memoria conversacional usando LangChain.
 * @param {string} mensajeCliente - Texto del mensaje recibido de WhatsApp
 * @param {string} telefono - Número de teléfono del cliente
 * @returns {Object} Ficha estructurada con respuesta_cliente
 */
async function extraerFichaTriage(mensajeCliente, telefono = 'test') {
  console.log(`\n🤖 [LangChain] Procesando mensaje de ${telefono}: "${mensajeCliente}"\n`);

  // 1. Obtener historial de conversación (Arnés de Memoria)
  const ctx = obtenerContexto(telefono);
  const turnosAnteriores = ctx.mensajes.length / 2;
  console.log(`💬 Historial: ${turnosAnteriores} turno(s) anteriores en memoria`);

  // 2. Construir la cadena de mensajes con historial completo
  const mensajes = [
    new SystemMessage(SYSTEM_PROMPT),
    ...ctx.mensajes,                         // Historial previo
    new HumanMessage(mensajeCliente),        // Mensaje actual
  ];

  try {
    // 3. Invocar LangChain con Gemini (salida estructurada)
    const ficha = await llmEstructurado.invoke(mensajes);

    console.log('✅ Ficha Estructurada Extraída (Lista para Kronos):');
    console.dir(ficha, { depth: null, colors: true });

    // 4. Actualizar historial de conversación
    ctx.mensajes.push(new HumanMessage(mensajeCliente));
    ctx.mensajes.push(new AIMessage(ficha.respuesta_cliente));

    // Limitar historial a los últimos MAX_MENSAJES_HISTORIAL mensajes
    if (ctx.mensajes.length > MAX_MENSAJES_HISTORIAL) {
      ctx.mensajes = ctx.mensajes.slice(-MAX_MENSAJES_HISTORIAL);
    }

    return ficha;

  } catch (error) {
    console.error('❌ Error al comunicarse con LangChain/Gemini:', error.message);

    // Arnés de Respaldo: respuesta genérica si falla la IA
    return {
      tipo_solicitud: 'Otra Consulta',
      cliente_nombre: '',
      sucursal_comuna: '',
      sucursal_direccion: '',
      equipo_tipo: '',
      equipo_marca: '',
      sintoma_observacion: 'Error de procesamiento',
      prioridad: 'Normal',
      disponibilidad_cliente: '',
      tiene_fotos: false,
      respuesta_cliente: 'Gracias por contactarnos. En este momento estamos experimentando dificultades técnicas. Un ejecutivo se comunicará con usted a la brevedad. Disculpe los inconvenientes.',
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

// ==========================================
// ZONA DE PRUEBAS (Simulador multi-turno)
// ==========================================
async function correrPruebas() {
  const telefonoPrueba = '+56912345678';

  console.log('\n=== PRUEBA MULTI-TURNO CON MEMORIA ===\n');

  // Turno 1: Saludo sin contexto
  await extraerFichaTriage('hola buen día', telefonoPrueba);

  // Turno 2: Da su nombre y ubicación
  await extraerFichaTriage('me llamo Roberto, llamo de la sucursal de Viña del Mar', telefonoPrueba);

  // Turno 3: Describe el problema (sin repetir nombre/ubicación)
  await extraerFichaTriage('tenemos un split Samsung que no enfría, hace un ruido raro', telefonoPrueba);

  // Turno 4: Agrega urgencia
  await extraerFichaTriage('es urgente, estamos con clientes en el local', telefonoPrueba);
}

// Ejecutar si se corre directamente desde la consola
if (require.main === module) {
  correrPruebas();
}

module.exports = { extraerFichaTriage, limpiarHistorial };
