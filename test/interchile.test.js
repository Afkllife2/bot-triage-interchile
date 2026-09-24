const { extraerFichaTriage } = require("../src/brain");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Hacemos un mock completo del SDK de Gemini
jest.mock("@google/generative-ai", () => {
    return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => {
            return {
                getGenerativeModel: jest.fn().mockReturnValue({
                    generateContent: jest.fn().mockImplementation(async (mensaje) => {
                        // Simulamos las respuestas según el texto ingresado
                        let mockRespuesta = {};

                        if (mensaje.includes("aparato ese blanco")) {
                            mockRespuesta = {
                                tipo_solicitud: "Otra Consulta",
                                cliente_nombre: "",
                                sucursal_comuna: "",
                                equipo_tipo: "",
                                equipo_marca: "",
                                sintoma_observacion: "Ambigüedad detectada",
                                prioridad: "Baja",
                                tiene_fotos: false,
                                respuesta_cliente: "¿Podrías darme más detalles sobre tu equipo de aire?"
                            };
                        } else if (mensaje.includes("urge") || mensaje.includes("falla")) {
                            mockRespuesta = {
                                tipo_solicitud: "Falla Técnica",
                                cliente_nombre: "Clinica Dental",
                                sucursal_comuna: "Las Condes",
                                equipo_tipo: "Cassette",
                                equipo_marca: "Midea",
                                sintoma_observacion: "No enfría y gotea",
                                prioridad: "Alta",
                                tiene_fotos: true,
                                respuesta_cliente: "Hemos alertado al equipo de emergencias."
                            };
                        } else {
                            mockRespuesta = {
                                tipo_solicitud: "Mantención",
                                cliente_nombre: "Juan",
                                sucursal_comuna: "Maipú",
                                equipo_tipo: "Split",
                                equipo_marca: "Anwo",
                                sintoma_observacion: "Limpieza de filtros",
                                prioridad: "Baja",
                                tiene_fotos: false,
                                respuesta_cliente: "Un ejecutivo comercial te contactará para agendar la limpieza."
                            };
                        }

                        return {
                            response: {
                                text: () => JSON.stringify(mockRespuesta)
                            }
                        };
                    })
                })
            };
        }),
        SchemaType: {
            OBJECT: "object",
            STRING: "string",
            BOOLEAN: "boolean"
        }
    };
});

describe("Unit Tests - Brain (Gemini Triage IA)", () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("CA-1: Asigna Prioridad 'Alta' a emergencias comerciales con falla técnica", async () => {
        const resultado = await extraerFichaTriage("Hola, somos la Clínica Dental. Nuestro aire cassette Midea falla y urge que vengan. Les mando foto.");
        
        expect(resultado).toBeDefined();
        expect(resultado.tipo_solicitud).toBe("Falla Técnica");
        expect(resultado.prioridad).toBe("Alta");
        expect(resultado.tiene_fotos).toBe(true);
        expect(resultado.equipo_tipo).toBe("Cassette");
    });

    test("CA-2: Asigna Prioridad 'Baja' a mantenciones preventivas", async () => {
        const resultado = await extraerFichaTriage("Hola Juan acá. Necesito limpieza de filtros para mi Split Anwo en Maipú.");
        
        expect(resultado).toBeDefined();
        expect(resultado.tipo_solicitud).toBe("Mantención");
        expect(resultado.prioridad).toBe("Baja");
        expect(resultado.respuesta_cliente).toContain("ejecutivo comercial te contactará");
    });

    test("CA-4: (Ambigüedad) No asume urgencia falsa y pide más detalles", async () => {
        const resultado = await extraerFichaTriage("El aparato ese blanco hace ruido urgente.");
        
        expect(resultado).toBeDefined();
        expect(resultado.prioridad).toBe("Baja");
        expect(resultado.respuesta_cliente).toContain("más detalles");
    });
});
