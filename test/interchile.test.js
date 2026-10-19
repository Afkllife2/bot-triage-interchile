// Hacemos un mock completo del SDK de LangChain para Gemini
jest.mock("@langchain/google-genai", () => {
    return {
        ChatGoogleGenerativeAI: jest.fn().mockImplementation(() => {
            return {
                withStructuredOutput: jest.fn().mockReturnValue({
                    invoke: jest.fn().mockImplementation(async (mensajes) => {
                        const ultimoMensaje = mensajes[mensajes.length - 1]?.content || "";

                        if (ultimoMensaje.includes("aparato ese blanco")) {
                            return {
                                tipo_solicitud: "Otra Consulta",
                                cliente_nombre: "",
                                sucursal_comuna: "",
                                sucursal_direccion: "",
                                equipo_tipo: "",
                                equipo_marca: "",
                                sintoma_observacion: "Ambigüedad detectada",
                                prioridad: "Baja",
                                disponibilidad_cliente: "",
                                tiene_fotos: false,
                                requiere_derivacion: false,
                                opciones_botones: ["Falla Técnica", "Mantención", "Cotización", "Arriendo"],
                                respuesta_cliente: "¿Podrías darme más detalles sobre tu equipo de aire?"
                            };
                        } else if (ultimoMensaje.includes("ejecutivo") || ultimoMensaje.includes("persona")) {
                            return {
                                tipo_solicitud: "Otra Consulta",
                                cliente_nombre: "Carlos",
                                sucursal_comuna: "Santiago",
                                sucursal_direccion: "",
                                equipo_tipo: "",
                                equipo_marca: "",
                                sintoma_observacion: "Solicita hablar con ejecutivo",
                                prioridad: "Normal",
                                disponibilidad_cliente: "",
                                tiene_fotos: false,
                                requiere_derivacion: true,
                                opciones_botones: [],
                                respuesta_cliente: "Entendido. Puedes comunicarte directamente con Benjamín al correo Benjamin@interchileclima.cl o al +569 9440 2632."
                            };
                        } else if (ultimoMensaje.includes("urge") || ultimoMensaje.includes("falla")) {
                            return {
                                tipo_solicitud: "Falla Técnica",
                                cliente_nombre: "Clinica Dental",
                                sucursal_comuna: "Las Condes",
                                sucursal_direccion: "",
                                equipo_tipo: "Cassette",
                                equipo_marca: "Midea",
                                sintoma_observacion: "No enfría y gotea",
                                prioridad: "Alta",
                                disponibilidad_cliente: "",
                                tiene_fotos: true,
                                requiere_derivacion: false,
                                opciones_botones: [],
                                respuesta_cliente: "Hemos alertado al equipo de emergencias."
                            };
                        } else {
                            return {
                                tipo_solicitud: "Mantención",
                                cliente_nombre: "Juan",
                                sucursal_comuna: "Maipú",
                                sucursal_direccion: "",
                                equipo_tipo: "Split",
                                equipo_marca: "Anwo",
                                sintoma_observacion: "Limpieza de filtros",
                                prioridad: "Baja",
                                disponibilidad_cliente: "",
                                tiene_fotos: false,
                                requiere_derivacion: false,
                                opciones_botones: [],
                                respuesta_cliente: "Un ejecutivo comercial te contactará para agendar la limpieza."
                            };
                        }
                    })
                })
            };
        })
    };
});

const { extraerFichaTriage, limpiarHistorial } = require("../src/brain");

describe("Unit Tests - Brain (Gemini Triage IA + LangChain Sprint 2)", () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
        limpiarHistorial("test");
    });

    test("CA-1 (HU-03): Asigna Prioridad 'Alta' a emergencias comerciales con falla técnica", async () => {
        const resultado = await extraerFichaTriage("Hola, somos la Clínica Dental. Nuestro aire cassette Midea falla y urge que vengan. Les mando foto.", "56911111111");
        
        expect(resultado).toBeDefined();
        expect(resultado.tipo_solicitud).toBe("Falla Técnica");
        expect(resultado.prioridad).toBe("Alta");
        expect(resultado.tiene_fotos).toBe(true);
        expect(resultado.equipo_tipo).toBe("Cassette");
    });

    test("CA-2 (HU-01): Asigna Prioridad 'Baja' a mantenciones preventivas", async () => {
        const resultado = await extraerFichaTriage("Hola Juan acá. Necesito limpieza de filtros para mi Split Anwo en Maipú.", "56922222222");
        
        expect(resultado).toBeDefined();
        expect(resultado.tipo_solicitud).toBe("Mantención");
        expect(resultado.prioridad).toBe("Baja");
        expect(resultado.respuesta_cliente).toContain("ejecutivo comercial te contactará");
    });

    test("CA-4 (HU-02 / HU-20): Ante ambigüedad pide detalles y sugiere opciones interactivas (incluyendo Arriendo)", async () => {
        const resultado = await extraerFichaTriage("El aparato ese blanco hace ruido urgente.", "56933333333");
        
        expect(resultado).toBeDefined();
        expect(resultado.prioridad).toBe("Baja");
        expect(resultado.respuesta_cliente).toContain("más detalles");
        expect(resultado.opciones_botones).toContain("Arriendo");
    });

    test("HU-06 (CA-1 y CA-3): Detecta derivación a humano, entrega contacto de Benjamín y silencia mensajes posteriores", async () => {
        const tel = "56944444444";
        // Turno 1: Pide hablar con ejecutivo
        const res1 = await extraerFichaTriage("Quiero hablar con un ejecutivo por favor", tel);
        expect(res1.requiere_derivacion).toBe(true);
        expect(res1.respuesta_cliente).toContain("Benjamin@interchileclima.cl");

        // Turno 2: Manda otro mensaje después de ser derivado → recibe respuesta estática en silencio
        const res2 = await extraerFichaTriage("¿Aló? ¿Hay alguien?", tel);
        expect(res2.sintoma_observacion).toBe("Mensaje post-derivación");
        expect(res2.respuesta_cliente).toContain("+569 9440 2632");
    });
});
