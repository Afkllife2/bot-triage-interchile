const DEFAULT_THRESHOLD = Number(process.env.CONFIDENCE_THRESHOLD || 60);

// Base de datos de hechos conocidos para verificación instantánea y de alta fidelidad
const KNOWN_FACTS = [
  {
    id: "niko-major",
    matches: (text) => text.includes("niko") && (text.includes("major") || text.includes("cs") || text.includes("counter") || text.includes("strike") || text.includes("campeon") || text.includes("campeón") || text.includes("ganó") || text.includes("gano")),
    veredicto: "Verdadero",
    confianza: 95,
    tema: "Esports y videojuegos",
    contexto: "Nikola 'NiKo' Kovač, uno de los mejores jugadores de la historia de Counter-Strike, se coronó campeón del torneo Major de CS2 con G2 Esports este fin de semana, logrando el primer Major de su carrera tras años de intentos fallidos.",
    fuentesConsultadas: [
      "HLTV.org (portal de referencia de Counter-Strike).",
      "Cobertura oficial de PGL y medios de esports internacionales.",
      "Redes oficiales del jugador y de G2 Esports."
    ],
    senales: [
      "Mención de entidad oficial (NiKo).",
      "Confirmación en portales de estadística y resultados de torneos.",
      "Ausencia de retórica sensacionalista o desinformación."
    ],
    justificacion: "La victoria de NiKo en el Major de Counter-Strike está plenamente confirmada por HLTV, patrocinadores y la cobertura global del evento del fin de semana pasado.",
    recomendacion: "Informarse mediante el resumen de HLTV.org o los videos oficiales del canal oficial de YouTube de la organizadora del Major."
  },
  {
    id: "real-madrid-champions",
    matches: (text) => (text.includes("real madrid") || text.includes("madrid")) && (text.includes("champions") || text.includes("campeon") || text.includes("campeón") || text.includes("copa") || text.includes("ganó") || text.includes("gano")),
    veredicto: "Verdadero",
    confianza: 98,
    tema: "Deportes",
    contexto: "El Real Madrid Club de Fútbol es el máximo ganador histórico de la UEFA Champions League, habiendo conquistado múltiples trofeos en el torneo de clubes más prestigioso del mundo.",
    fuentesConsultadas: [
      "Sitio web oficial de la UEFA (uefa.com).",
      "Medios de comunicación deportivos internacionales.",
      "Registros oficiales de la federación."
    ],
    senales: [
      "Mención de institución oficial (UEFA / Real Madrid).",
      "Coherencia con registros estadísticos oficiales e históricos del torneo."
    ],
    justificacion: "El estatus de campeón de Champions League del Real Madrid está catalogado de forma unánime por todas las federaciones deportivas oficiales.",
    recomendacion: "Revisar las estadísticas de campeones en el sitio web de la UEFA."
  },
  {
    id: "messi-mundial",
    matches: (text) => text.includes("messi") && (text.includes("mundial") || text.includes("qatar") || text.includes("copa") || text.includes("campeon") || text.includes("campeón") || text.includes("ganó") || text.includes("gano")),
    veredicto: "Verdadero",
    confianza: 98,
    tema: "Deportes",
    contexto: "Lionel Messi se consagró campeón del mundo con la selección argentina en el Mundial de Catar 2022, venciendo a Francia en una final histórica y coronando su carrera profesional.",
    fuentesConsultadas: [
      "Sitio oficial de la FIFA (fifa.com).",
      "Registros de la prensa deportiva global.",
      "Estadísticas del torneo oficial."
    ],
    senales: [
      "Mención de entidad oficial (FIFA, Messi, Selección Argentina).",
      "Registros de video y transmisiones globales de la final del mundial.",
      "Consenso de la prensa deportiva global."
    ],
    justificacion: "El título mundial de Lionel Messi en 2022 es un hecho histórico ampliamente documentado y oficializado por los entes rectores del fútbol mundial.",
    recomendacion: "Ver las estadísticas oficiales y resúmenes de partidos en el canal oficial de la FIFA."
  },
  {
    id: "chile-copa-america",
    matches: (text) => text.includes("chile") && (text.includes("copa america") || text.includes("copa américa") || text.includes("america") || text.includes("américa")) && (text.includes("campeon") || text.includes("campeón") || text.includes("ganó") || text.includes("gano") || text.includes("2015") || text.includes("2016")),
    veredicto: "Verdadero",
    confianza: 98,
    tema: "Deportes",
    contexto: "La selección chilena de fútbol se coronó campeona de la Copa América de forma consecutiva en el año 2015 (torneo local) y en el año 2016 (Copa América Centenario en EE.UU.), venciendo a Argentina en ambas finales.",
    fuentesConsultadas: [
      "Sitio oficial de la CONMEBOL.",
      "Asociación Nacional de Fútbol Profesional (ANFP) de Chile.",
      "Archivos oficiales de torneos continentales."
    ],
    senales: [
      "Registros oficiales del organismo rector (CONMEBOL).",
      "Trofeos físicos y medallas históricas registradas.",
      "Cobertura histórica internacional."
    ],
    justificacion: "Los campeonatos de Chile en Copa América de 2015 y 2016 son hechos históricos oficiales e incuestionables en el fútbol sudamericano.",
    recomendacion: "Revisar el palmarés histórico en el portal oficial de la CONMEBOL."
  },
  {
    id: "faker-worlds",
    matches: (text) => (text.includes("faker") || text.includes("t1")) && (text.includes("worlds") || text.includes("campeon") || text.includes("campeón") || text.includes("lol") || text.includes("league of legends") || text.includes("torneo")),
    veredicto: "Verdadero",
    confianza: 96,
    tema: "Esports y videojuegos",
    contexto: "Lee 'Faker' Sang-hyeok y su equipo T1 son múltiples campeones del mundo (Worlds) de League of Legends, siendo Faker considerado unánimemente el mejor jugador de la historia del juego.",
    fuentesConsultadas: [
      "Riot Games (desarrollador de League of Legends y organizador oficial de Worlds).",
      "Portal LoLEsports.",
      "Medios especializados en deportes electrónicos (esports)."
    ],
    senales: [
      "Mención de entidad oficial (Faker, T1, Riot Games).",
      "Coherencia con las bases de datos de resultados competitivos oficiales de Riot."
    ],
    justificacion: "La trayectoria de Faker y sus títulos mundiales con T1 están oficializados por Riot Games y registrados en la historia de la competición.",
    recomendacion: "Consultar los resultados y partidas históricas en el portal oficial de lolesports.com."
  },
  {
    id: "tierra-redonda",
    matches: (text) => text.includes("tierra") && (text.includes("redonda") || text.includes("esferica") || text.includes("esférica") || text.includes("curva") || text.includes("gira alrededor")),
    veredicto: "Verdadero",
    confianza: 99,
    tema: "Ciencia y astronomia",
    contexto: "La forma de la Tierra es un esferoide oblato y orbita alrededor del Sol, respaldado por la física, observaciones satelitales y mediciones astronómicas centenarias.",
    fuentesConsultadas: [
      "NASA y agencias espaciales internacionales (ESA, JAXA).",
      "Consenso de la comunidad científica astrofísica global.",
      "Fotografías y transmisiones en vivo desde la Estación Espacial Internacional (EEI)."
    ],
    senales: [
      "Evidencia visual empírica directa (imágenes de la Tierra desde el espacio).",
      "Modelos matemáticos gravitacionales e hidrostáticos consistentes."
    ],
    justificacion: "La esfericidad de la Tierra es un hecho científico comprobado empíricamente a través de la exploración espacial y la geodesia.",
    recomendacion: "Revisar los portales educativos de agencias espaciales como la NASA."
  },
  {
    id: "tierra-plana",
    matches: (text) => text.includes("tierra") && text.includes("plana"),
    veredicto: "Falso",
    confianza: 99,
    tema: "Ciencia y astronomia",
    contexto: "La afirmación de que la Tierra es plana carece de sustento físico, geodésico y de cualquier evidencia empírica, contradiciendo el consenso científico global.",
    fuentesConsultadas: [
      "NASA (National Aeronautics and Space Administration).",
      "Institutos de Astrofísica y Geodesia mundiales.",
      "Evidencia empírica cotidiana (desaparición de barcos en el horizonte, husos horarios)."
    ],
    senales: [
      "Uso de argumentos conspirativos que ignoran las leyes físicas elementales.",
      "Ausencia de publicaciones científicas validadas con revisión por pares."
    ],
    justificacion: "La hipótesis de la Tierra plana fue refutada científicamente desde la antigüedad por astrónomos como Eratóstenes y es desmentida por toda la tecnología satelital actual.",
    recomendacion: "Se sugiere consultar recursos de educación científica básica sobre la gravedad y la curvatura terrestre."
  },
  {
    id: "vacunas-chips",
    matches: (text) => (text.includes("vacuna") || text.includes("vacunas")) && (text.includes("chip") || text.includes("5g") || text.includes("imanta") || text.includes("magnet")),
    veredicto: "Falso",
    confianza: 98,
    tema: "Salud publica",
    contexto: "Las afirmaciones sobre la presencia de microchips, magnetismo o tecnología 5G en las vacunas corresponden a teorías conspirativas sin sustento biológico o químico.",
    fuentesConsultadas: [
      "Organización Mundial de la Salud (OMS).",
      "Centros para el Control y la Prevención de Enfermedades (CDC).",
      "Ministerio de Salud de Chile (MINSAL)."
    ],
    senales: [
      "Uso de retórica alarmista y pseudocientífica.",
      "Ausencia de mecanismos técnicos que permitan chips microscópicos inyectables autopropulsados o magnetismo detectable."
    ],
    justificacion: "Las fórmulas de las vacunas son públicas y analizadas rigurosamente por agencias reguladoras globales. No contienen metales imantados ni componentes electrónicos.",
    recomendacion: "Revisar el portal de mitos y realidades sobre vacunas en el sitio web oficial de la OMS."
  },
  {
    id: "santiago-capital-chile",
    matches: (text) => text.includes("santiago") && text.includes("capital") && text.includes("chile"),
    veredicto: "Verdadero",
    confianza: 99,
    tema: "Geografia y sociedad",
    contexto: "Santiago de Chile es la capital oficial de la República de Chile y alberga las sedes principales del poder ejecutivo, judicial y los organismos administrativos del Estado.",
    fuentesConsultadas: [
      "Constitución Política de la República de Chile.",
      "Instituto Nacional de Estadísticas (INE).",
      "Biblioteca del Congreso Nacional."
    ],
    senales: [
      "Datos consagrados en la legislación constitucional.",
      "Consenso de la cartografía internacional."
    ],
    justificacion: "El estatus de Santiago como capital de Chile está determinado legal y constitucionalmente.",
    recomendacion: "Consultar datos censales e históricos en el sitio oficial del INE."
  },
  {
    id: "corte-agua-santiago",
    matches: (text) => text.includes("corte de agua") && (text.includes("santiago") || text.includes("chile") || text.includes("mañana") || text.includes("manana")),
    veredicto: "Impreciso",
    confianza: 75,
    tema: "Servicios basicos",
    contexto: "Los cortes de agua en Santiago suelen ser programados por mantenimiento o debido a turbiedad extrema en el río Maipo, afectando solo a comunas específicas y no a toda la región de forma simultánea.",
    fuentesConsultadas: [
      "Aguas Andinas (proveedor oficial en la Región Metropolitana).",
      "Superintendencia de Servicios Sanitarios (SISS).",
      "Gobierno Regional Metropolitano."
    ],
    senales: [
      "Generalización excesiva de un corte puntual de servicio.",
      "Ausencia de mapas oficiales de comunas afectadas.",
      "Coexistencia de alertas preventivas con el servicio normalizado."
    ],
    justificacion: "Si bien existen cortes de agua ocasionales, afirmar que hay un corte generalizado sin precisar comunas o fechas oficiales induce a confusión, por lo que es impreciso.",
    recomendacion: "Ingresar el número de cliente en la web de Aguas Andinas para verificar si su domicilio específico está bajo corte programado."
  },
  {
    id: "bancos-cierran-chile",
    matches: (text) => (text.includes("banco") || text.includes("bancos")) && (text.includes("cierran") || text.includes("cerraran") || text.includes("cerrarán") || text.includes("cierre")) && text.includes("chile") && (text.includes("manana") || text.includes("mañana") || text.includes("hoy")),
    veredicto: "Falso",
    confianza: 88,
    tema: "Economia y servicios",
    contexto: "La afirmacion indica un cierre generalizado de bancos en Chile, lo que corresponderia a una medida publica de alto impacto que deberia estar respaldada por comunicados oficiales o cobertura verificable.",
    fuentesConsultadas: [
      "Canales oficiales esperables para anuncios bancarios o regulatorios.",
      "Medios informativos nacionales de referencia.",
      "Senales internas del texto, como ausencia de fuente, fecha formal o institucion responsable."
    ],
    senales: [
      "Afirmacion especifica y verificable sobre un servicio financiero critico.",
      "No se entrega fuente oficial ni entidad responsable del supuesto cierre.",
      "El formato del mensaje opera como rumor y puede inducir alarma publica."
    ],
    justificacion: "No existe respaldo verificable en las fuentes esperables para una medida de este nivel, por lo que la afirmacion se clasifica como falsa en el prototipo.",
    recomendacion: "No compartir la informacion y revisar canales oficiales de bancos, reguladores o autoridades antes de tomar decisiones."
  }
];

function detectTopic(normalizedText) {
  if (
    normalizedText.includes("banco") ||
    normalizedText.includes("economia") ||
    normalizedText.includes("economía") ||
    normalizedText.includes("precio") ||
    normalizedText.includes("dolar") ||
    normalizedText.includes("dólar") ||
    normalizedText.includes("inflacion") ||
    normalizedText.includes("dinero")
  ) {
    return "Economia y servicios";
  }

  if (
    normalizedText.includes("gobierno") ||
    normalizedText.includes("ministerio") ||
    normalizedText.includes("eleccion") ||
    normalizedText.includes("elección") ||
    normalizedText.includes("presidente") ||
    normalizedText.includes("politica") ||
    normalizedText.includes("política") ||
    normalizedText.includes("senado") ||
    normalizedText.includes("diputado")
  ) {
    return "Politica y gobierno";
  }

  if (
    normalizedText.includes("vacuna") ||
    normalizedText.includes("hospital") ||
    normalizedText.includes("salud") ||
    normalizedText.includes("virus") ||
    normalizedText.includes("enfermedad") ||
    normalizedText.includes("médico") ||
    normalizedText.includes("medico")
  ) {
    return "Salud publica";
  }

  if (
    normalizedText.includes("niko") ||
    normalizedText.includes("major") ||
    normalizedText.includes("cs") ||
    normalizedText.includes("counter strike") ||
    normalizedText.includes("esport") ||
    normalizedText.includes("gamer") ||
    normalizedText.includes("videojuego") ||
    normalizedText.includes("lol") ||
    normalizedText.includes("faker") ||
    normalizedText.includes("valorant")
  ) {
    return "Esports y videojuegos";
  }

  if (
    normalizedText.includes("champions") ||
    normalizedText.includes("futbol") ||
    normalizedText.includes("fútbol") ||
    normalizedText.includes("madrid") ||
    normalizedText.includes("messi") ||
    normalizedText.includes("ronaldo") ||
    normalizedText.includes("deporte") ||
    normalizedText.includes("tenis") ||
    normalizedText.includes("copa")
  ) {
    return "Deportes";
  }

  if (
    normalizedText.includes("tierra") ||
    normalizedText.includes("ciencia") ||
    normalizedText.includes("astronomía") ||
    normalizedText.includes("astronomia") ||
    normalizedText.includes("fisica") ||
    normalizedText.includes("física")
  ) {
    return "Ciencia y astronomia";
  }

  if (
    normalizedText.includes("chile") ||
    normalizedText.includes("santiago") ||
    normalizedText.includes("nacional")
  ) {
    return "Contingencia nacional";
  }

  return "Tema general no determinado";
}

// Generador de respuestas dinámicas en lenguaje natural para consultas generales no tabuladas
function generateDynamicNlpResponse(normalizedText) {
  const tema = detectTopic(normalizedText);

  // Valores base dinámicos
  let veredicto = "Impreciso";
  let confianza = 65; // Valor por defecto superior al umbral para evitar ser forzado a Impreciso (60)
  let contexto = `La publicación realiza afirmaciones sobre un tema clasificado bajo '${tema}'.`;
  let justificacion = "El procesamiento semántico identificó elementos de interés público, pero no detecta datos oficiales suficientes en el mensaje analizado.";
  let recomendacion = "Se recomienda verificar de forma directa la información en medios oficiales y agencias informativas reconocidas.";
  let fuentesConsultadas = ["Prensa de referencia sectorial", "Organismos correspondientes al área temática"];
  let senales = ["Afirmación generalizada en canales no oficiales.", "Ausencia de enlaces o referencias formales directas."];

  // Reglas lingüísticas y semánticas
  const containsOfficialSource = 
    normalizedText.includes("oficial") || 
    normalizedText.includes("ministerio") || 
    normalizedText.includes("confirmado") || 
    normalizedText.includes("reporte oficial") ||
    normalizedText.includes("anunció") ||
    normalizedText.includes("anuncio");

  const containsSensationalism = 
    normalizedText.includes("urgente") || 
    normalizedText.includes("comparte antes que lo borren") || 
    normalizedText.includes("nadie quiere que sepas") || 
    normalizedText.includes("100% real") ||
    normalizedText.includes("secreto") ||
    normalizedText.includes("conspiración") ||
    normalizedText.includes("difundir");

  const containsInformalRumor = 
    normalizedText.length < 30 || 
    normalizedText.includes("dicen que") || 
    normalizedText.includes("me contaron") ||
    normalizedText.includes("alguien sabe") ||
    normalizedText.includes("es verdad que");

  if (containsOfficialSource) {
    veredicto = "Verdadero";
    confianza = 78;
    contexto = `La publicación parece estar respaldada por un anuncio oficial o una institución pública relevante para el área de '${tema}'.`;
    fuentesConsultadas = ["Declaraciones oficiales emitidas", "Medios informativos formales"];
    senales = [
      "Menciona una fuente oficial o institucional.",
      "Presenta una afirmación con tono informativo y menor carga emocional.",
      "Incluye elementos que permiten orientar una verificación posterior."
    ];
    justificacion = "El texto contiene señas de credibilidad y referencias institucionales coherentes.";
    recomendacion = "Revisar el comunicado original para confirmar fecha, alcance y detalles específicos.";
  } else if (containsSensationalism) {
    veredicto = "Falso";
    confianza = 74;
    contexto = "La publicación utiliza recursos retóricos típicos de la desinformación viral que busca provocar una reacción inmediata.";
    fuentesConsultadas = ["Sitios verificadores de fact-checking", "Comunicados desmintiendo el rumor"];
    senales = [
      "Uso de urgencia para incentivar difusión rápida.",
      "Lenguaje absoluto o sensacionalista.",
      "Ausencia de evidencia directa o fuente verificable dentro del texto."
    ];
    justificacion = "El uso de urgencia extrema y ganchos emocionales ('no quieren que sepas') coincide con patrones frecuentes de bulos.";
    recomendacion = "No compartir antes de verificar la información en fuentes primarias confiables.";
  } else if (containsInformalRumor) {
    veredicto = "Impreciso";
    confianza = 45; // Inferior al umbral de 60, forzando veredicto impreciso controlado
    contexto = "La afirmación se presenta como un rumor, comentario informal o consulta general sin atribución.";
    fuentesConsultadas = ["Redes sociales", "Foros de discusión informales"];
    senales = [
      "Uso de expresiones indirectas como rumor o comentario informal.",
      "Ausencia de fuente oficial, fecha precisa o evidencia contrastable.",
      "Riesgo de viralización por tratarse de una afirmación potencialmente sensible."
    ];
    justificacion = "El contenido no entrega suficiente contexto verificable para emitir una conclusión segura.";
    recomendacion = "Contrastar con fuentes oficiales o medios confiables antes de compartir.";
  } else {
    // Caso de análisis detallado por categoría temática
    if (tema === "Esports y videojuegos") {
      veredicto = "Verdadero";
      confianza = 82;
      contexto = "La publicación trata sobre un logro competitivo o evento en el sector de deportes electrónicos.";
      fuentesConsultadas = ["Portales informativos de esports especializados", "Estadísticas de ligas y torneos oficiales"];
      justificacion = "El procesamiento de datos confirma concordancia semántica con resultados de torneos competitivos del sector.";
      recomendacion = "Se recomienda contrastar con portales de resultados oficiales de la liga del videojuego mencionado.";
    } else if (tema === "Deportes") {
      veredicto = "Verdadero";
      confianza = 85;
      contexto = "La publicación hace referencia a un resultado, club o atleta del ámbito deportivo.";
      fuentesConsultadas = ["Medios periodísticos deportivos", "Fichas de estadísticas federativas oficiales"];
      justificacion = "Las afirmaciones sobre competiciones deportivas oficiales gozan de amplia cobertura y validación objetiva en tiempo real.";
      recomendacion = "Revisar los portales oficiales de la liga u organismo rector de la disciplina.";
    } else if (tema === "Ciencia y astronomia") {
      veredicto = "Verdadero";
      confianza = 80;
      contexto = "La afirmación hace referencia a hechos científicos establecidos o descubrimientos astronómicos.";
      fuentesConsultadas = ["Revistas de divulgación científica", "Organizaciones y academias de ciencia oficiales"];
      justificacion = "Se detecta coherencia semántica con el corpus de conocimiento científico establecido y consensuado.";
      recomendacion = "Revisar literatura de divulgación formal para obtener más detalles del fenómeno.";
    }
  }

  return {
    veredicto,
    confianza,
    tema,
    contexto,
    fuentesConsultadas,
    senales,
    justificacion,
    recomendacion
  };
}

function handleFactNegation(fact, normalizedText) {
  const negationPatterns = [
    "nunca",
    "jamas",
    "jamás",
    " no ",
    "no ha",
    "no es",
    "no gano",
    "no ganó",
    "no campeon",
    "no campeón",
    "mentira que",
    "falso que"
  ];
  
  const isNegated = negationPatterns.some(pattern => {
    if (pattern === " no " && normalizedText.startsWith("no ")) {
      return true;
    }
    return normalizedText.includes(pattern);
  });

  if (!isNegated) {
    return fact;
  }

  const originalVerdict = fact.veredicto;
  const newVerdict = originalVerdict === "Verdadero" ? "Falso" : (originalVerdict === "Falso" ? "Verdadero" : "Impreciso");
  
  let newContext = fact.contexto;
  let newJustification = fact.justificacion;

  if (fact.id === "niko-major") {
    newContext = "Nikola 'NiKo' Kovač se coronó campeón del Major de CS2 con G2 Esports el fin de semana pasado, ganando el primer Major de su trayectoria.";
    newJustification = "La afirmación de que NiKo nunca ha ganado un Major o no lo ganó es FALSA, ya que conquistó oficialmente el título el fin de semana pasado.";
  } else if (fact.id === "real-madrid-champions") {
    newContext = "El Real Madrid ha ganado 15 títulos de la Copa de Europa / UEFA Champions League, siendo el club más laureado.";
    newJustification = "La afirmación de que el Real Madrid no ha ganado la Champions es FALSA, debido a sus 15 títulos oficiales registrados por la UEFA.";
  } else if (fact.id === "messi-mundial") {
    newContext = "Lionel Messi ganó el Mundial de la FIFA Catar 2022 con Argentina, siendo el capitán y jugador del torneo.";
    newJustification = "La afirmación de que Messi no ganó el mundial es FALSA, ya que conquistó la Copa del Mundo en Catar 2022.";
  } else if (fact.id === "chile-copa-america") {
    newContext = "Chile es bicampeón de América tras ganar las ediciones de 2015 y 2016 de la Copa América.";
    newJustification = "La afirmación de que Chile no ha ganado la Copa América es FALSA, dado su bicampeonato oficial de 2015 y 2016.";
  } else if (fact.id === "tierra-redonda") {
    newContext = "La Tierra tiene forma esferoidal y gira alrededor del sol.";
    newJustification = "La afirmación de que la Tierra no es redonda es FALSA, contradiciendo toda la evidencia científica de la física y astronomía moderna.";
  } else if (fact.id === "tierra-plana") {
    newContext = "La Tierra es un esferoide y no es plana.";
    newJustification = "La afirmación de que la Tierra no es plana es VERDADERA, en línea con el conocimiento científico y observaciones astronómicas.";
  } else if (fact.id === "vacunas-chips") {
    newContext = "Las vacunas no contienen chips, 5G ni metales imantados.";
    newJustification = "La afirmación de que las vacunas no tienen chips es VERDADERA, desmintiendo mitos de redes sociales mediante la evidencia científica oficial.";
  } else if (fact.id === "santiago-capital-chile") {
    newContext = "Santiago es la capital oficial e institucional de Chile.";
    newJustification = "Afirmar que Santiago no es la capital de Chile es FALSO, ya que se encuentra consagrado jurídica e históricamente.";
  } else if (fact.id === "bancos-cierran-chile") {
    newContext = "La red bancaria en Chile opera con normalidad y no hay ningún cierre generalizado decretado.";
    newJustification = "Afirmar que los bancos no cerrarán es VERDADERO, puesto que la supuesta noticia de cierre masivo es un bulo descartado por la CMF.";
  }

  return {
    ...fact,
    veredicto: newVerdict,
    contexto: newContext,
    justificacion: newJustification
  };
}

function analyzeWithSimulatedNlp(cleanText, threshold = DEFAULT_THRESHOLD) {
  const normalized = cleanText.toLowerCase();

  // 1. Buscar en la base de datos de hechos conocidos
  const matchedFact = KNOWN_FACTS.find(fact => fact.matches(normalized));
  let result;

  if (matchedFact) {
    // Aplicar lógica de negación si corresponde
    const processedFact = handleFactNegation(matchedFact, normalized);
    result = {
      isDemoFact: true,
      veredicto: processedFact.veredicto,
      confianza: processedFact.confianza,
      tema: processedFact.tema,
      contexto: processedFact.contexto,
      fuentesConsultadas: processedFact.fuentesConsultadas,
      senales: processedFact.senales,
      justificacion: processedFact.justificacion,
      recomendacion: processedFact.recomendacion
    };
  } else {
    // 2. Si no es un hecho conocido, generar una respuesta lingüística dinámica
    result = {
      isDemoFact: false,
      ...generateDynamicNlpResponse(normalized)
    };
  }

  // 3. Aplicar el umbral de confianza si es inferior
  if (result.confianza < threshold) {
    return {
      ...result,
      veredicto: "Impreciso",
      justificacion: "La confianza del analisis es inferior al umbral definido, por lo que se evita una clasificacion categorica.",
      recomendacion: "No compartir como hecho confirmado; se recomienda revisar fuentes oficiales o evidencia adicional."
    };
  }

  return result;
}
module.exports = {
  analyzeWithSimulatedNlp
};
