require('dotenv').config();
const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');

// Inicializar el SDK de Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Definir el esquema (Schema) estricto de salida basado en Kronos
const responseSchema = {
    type: SchemaType.OBJECT,
    properties: {
        tipo_solicitud: {
            type: SchemaType.STRING,
            description: "El tipo principal de solicitud. Puede ser: 'Falla Técnica', 'Mantención', 'Instalación', 'Cotización', 'Proyecto Comercial', u 'Otra Consulta'."
        },
        cliente_nombre: {
            type: SchemaType.STRING,
            description: "Nombre del cliente, empresa o persona natural. Si no lo dice, dejar vacío."
        },
        sucursal_comuna: {
            type: SchemaType.STRING,
            description: "Comuna o ciudad donde se necesita el servicio. Si no lo dice, dejar vacío."
        },
        sucursal_direccion: {
            type: SchemaType.STRING,
            description: "Dirección exacta si la provee. Si no lo dice, dejar vacío."
        },
        equipo_tipo: {
            type: SchemaType.STRING,
            description: "El tipo o capacidad del equipo (Ej: Split 24.000 BTU, Cassette, Cortina de aire). Si no lo sabe, dejar vacío."
        },
        equipo_marca: {
            type: SchemaType.STRING,
            description: "La marca del equipo (Ej: Samsung, LG, Anwo). Si no lo sabe, dejar vacío."
        },
        sintoma_observacion: {
            type: SchemaType.STRING,
            description: "Resumen breve del problema o motivo. Ej: 'No enfría', 'Hace ruido', 'Necesito limpiar filtros'."
        },
        prioridad: {
            type: SchemaType.STRING,
            description: "Prioridad calculada. Si es un local comercial/empresa o un equipo crítico detenido, es 'Alta/Urgente'. Si es residencial o mantención, es 'Normal'."
        },
        disponibilidad_cliente: {
            type: SchemaType.STRING,
            description: "Disponibilidad de horario que indica el cliente para la visita. Si no la dice, dejar vacío."
        },
        tiene_fotos: {
            type: SchemaType.BOOLEAN,
            description: "True si el cliente menciona que tiene fotos, mandó fotos o enviará videos. False en caso contrario."
        }
    },
    required: [
        "tipo_solicitud",
        "cliente_nombre",
        "sucursal_comuna",
        "equipo_tipo",
        "sintoma_observacion",
        "prioridad",
        "tiene_fotos"
    ]
};

async function extraerFichaTriage(mensajeCliente) {
    console.log(`\n🤖 Procesando mensaje: "${mensajeCliente}"\n`);
    
    // Usamos gemini-2.5-flash porque es el más rápido y eficiente para clasificación de texto
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
        systemInstruction: "Eres un asistente de triage comercial y técnico para InterChile, una empresa de climatización y aire acondicionado. Tu único trabajo es leer el mensaje del cliente y extraer la información clave para llenar una ficha estructurada compatible con el sistema Kronos. Nunca inventes datos; si el cliente no menciona algo, déjalo vacío o usa tus mejores capacidades de inferencia para la prioridad y tipo de solicitud."
    });

    try {
        const result = await model.generateContent(mensajeCliente);
        const responseText = result.response.text();
        
        // Parsear el JSON devuelto por Gemini
        const fichaJson = JSON.parse(responseText);
        
        console.log("✅ Ficha Estructurada Extraída (Lista para Kronos):");
        console.dir(fichaJson, { depth: null, colors: true });
        return fichaJson;

    } catch (error) {
        console.error("❌ Error al comunicarse con Gemini:", error);
    }
}

// ==========================================
// ZONA DE PRUEBAS (Simulador de clientes)
// ==========================================
async function correrPruebas() {
    // Prueba 1: Cliente Comercial Urgente
    await extraerFichaTriage("Hola, soy de la panadería San Juan en Las Condes. Tenemos un split cassette que dejó de enfriar y está goteando agua encima de los pasteles. Necesito que vengan urgente hoy en la tarde. Les mando foto del equipo.");

    // Prueba 2: Cliente Residencial (Mantención)
    await extraerFichaTriage("Buenas, me gustaría saber cuánto cuesta limpiar los filtros de 2 aires Anwo que tengo en mi casa en Maipú. Funcionan bien pero hace 2 años no los revisan.");
    
    // Prueba 3: Mensaje súper corto
    await extraerFichaTriage("hola necesito q arreglen mi aire q no prende saludos juan");
}

// Ejecutar si se corre directamente desde la consola
if (require.main === module) {
    correrPruebas();
}

module.exports = { extraerFichaTriage };
