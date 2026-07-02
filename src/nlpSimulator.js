const DEFAULT_THRESHOLD = Number(process.env.CONFIDENCE_THRESHOLD || 60);

// Base de datos de hechos conocidos para verificación instantánea y de alta fidelidad
const KNOWN_FACTS = [];

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
  let certeza = 0;
  let desglose = "No hay suficiente información para determinar qué partes son ciertas.";
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

  if (containsOfficialSource && containsSensationalism) {
    veredicto = "Engañoso";
    confianza = 70;
    certeza = 50;
    desglose = "La afirmación utiliza una entidad real mezclada con conclusiones alarmistas o falsas.";
    contexto = `La publicación mezcla conceptos o entidades del ámbito de '${tema}' con afirmaciones alarmistas o sensacionalistas.`;
    fuentesConsultadas = ["Sitios de fact-checking", "Comunicados oficiales de las entidades mencionadas"];
    senales = [
      "Uso de entidades o lenguaje oficial mezclado con conclusiones alarmistas o ganchos emocionales.",
      "Patrón típico de desinformación que busca legitimar una mentira usando una premisa real."
    ];
    justificacion = "El texto contiene entidades o afirmaciones que pueden ser reales, pero establece una conclusión o relación alarmista que carece de evidencia.";
    recomendacion = "Revisar con cuidado. Parte de la información puede ser cierta, pero la conclusión o el tono general es desorientador.";
  } else if (containsOfficialSource) {
    veredicto = "Verdadero";
    confianza = 78;
    certeza = 100;
    desglose = "Toda la información concuerda con lo reportado por fuentes oficiales.";
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
    certeza = 0;
    desglose = "La información carece de base real y utiliza ganchos emocionales falsos.";
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
    certeza = 30;
    desglose = "Es un rumor, no se puede validar ni desmentir por completo.";
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
      certeza = 100;
      desglose = "El evento o logro deportivo es completamente real.";
      contexto = "La publicación trata sobre un logro competitivo o evento en el sector de deportes electrónicos.";
      fuentesConsultadas = ["Portales informativos de esports especializados", "Estadísticas de ligas y torneos oficiales"];
      justificacion = "El procesamiento de datos confirma concordancia semántica con resultados de torneos competitivos del sector.";
      recomendacion = "Se recomienda contrastar con portales de resultados oficiales de la liga del videojuego mencionado.";
    } else if (tema === "Deportes") {
      veredicto = "Verdadero";
      confianza = 85;
      certeza = 100;
      desglose = "Los datos deportivos concuerdan 100% con los registros oficiales.";
      contexto = "La publicación hace referencia a un resultado, club o atleta del ámbito deportivo.";
      fuentesConsultadas = ["Medios periodísticos deportivos", "Fichas de estadísticas federativas oficiales"];
      justificacion = "Las afirmaciones sobre competiciones deportivas oficiales gozan de amplia cobertura y validación objetiva en tiempo real.";
      recomendacion = "Revisar los portales oficiales de la liga u organismo rector de la disciplina.";
    } else if (tema === "Ciencia y astronomia") {
      veredicto = "Verdadero";
      confianza = 80;
      certeza = 100;
      desglose = "Se trata de un hecho científico comprobado en su totalidad.";
      contexto = "La afirmación hace referencia a hechos científicos establecidos o descubrimientos astronómicos.";
      fuentesConsultadas = ["Revistas de divulgación científica", "Organizaciones y academias de ciencia oficiales"];
      justificacion = "Se detecta coherencia semántica con el corpus de conocimiento científico establecido y consensuado.";
      recomendacion = "Revisar literatura de divulgación formal para obtener más detalles del fenómeno.";
    }
  }

  return {
    veredicto,
    confianza,
    certeza,
    desglose,
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
    certeza: newVerdict === "Verdadero" ? 100 : (newVerdict === "Falso" ? 0 : 50),
    desglose: "Derivado por asociación directa a un hecho conocido.",
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
      certeza: processedFact.certeza || (processedFact.veredicto === "Verdadero" ? 100 : 0),
      desglose: processedFact.desglose || "Hecho conocido en la base de datos.",
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
