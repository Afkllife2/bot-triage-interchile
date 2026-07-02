const { analyzeWithSimulatedNlp } = require("../nlpSimulator");

function getMaxRetries() { return parseInt(process.env.NLP_MAX_RETRIES || "2", 10); }
function getTimeoutMs() { return parseInt(process.env.NLP_TIMEOUT_MS || "2000", 10); }
const VALID_VERDICTS = new Set(["Verdadero", "Falso", "Impreciso", "Engañoso"]);

function withIntegrationMetadata(analysis, metadata) {
  return {
    ...analysis,
    integration: {
      provider: metadata.provider,
      status: metadata.status,
      attempts: metadata.attempts,
      errorType: metadata.errorType || null,
      fallbackApplied: Boolean(metadata.fallbackApplied)
    }
  };
}

function validateProviderResponse(data) {
  if (!data || typeof data !== "object") {
    throw new Error("Respuesta de NLP vacia o no estructurada.");
  }

  if (!VALID_VERDICTS.has(data.veredicto)) {
    throw new Error("Respuesta de NLP con veredicto invalido.");
  }

  if (typeof data.confianza !== "number" || data.confianza < 0 || data.confianza > 100) {
    throw new Error("Respuesta de NLP con confianza invalida.");
  }
  if (typeof data.certeza !== "number" || data.certeza < 0 || data.certeza > 100) {
    throw new Error("Respuesta de NLP con certeza invalida.");
  }
  if (!data.desglose || typeof data.desglose !== "string") {
    throw new Error("Respuesta de NLP con desglose invalido.");
  }
}

function classifyError(error) {
  if (error.name === "AbortError") return "timeout";
  if (error.message.includes("status")) return "provider_status_error";
  const msg = error.message.toLowerCase();
  if (
    msg.includes("invalid") ||
    msg.includes("invalida") ||
    msg.includes("invalido") ||
    msg.includes("vacia") ||
    msg.includes("vacía") ||
    msg.includes("estructurada")
  ) {
    return "invalid_provider_response";
  }
  return "network_or_unknown_error";
}

function buildSafeFallback(error, attempts) {
  const errorType = classifyError(error);

  return withIntegrationMetadata({
    veredicto: "Impreciso",
    confianza: 50,
    certeza: 0,
    desglose: "No fue posible analizar la afirmación debido a un fallo técnico.",
    tema: "Error de integracion",
    contexto: "El servicio de verificacion experimento problemas de comunicacion o contrato con el motor de IA/NLP.",
    fuentesConsultadas: [],
    senales: [
      "Falla tecnica detectada en la integracion con proveedor NLP/IA.",
      "Se evita entregar un veredicto categorico cuando la respuesta externa no es confiable."
    ],
    justificacion: `No se pudo obtener un veredicto confiable debido a un error tecnico: ${error.message}`,
    recomendacion: "No compartir como hecho confirmado. Reintentar mas tarde o contrastar con fuentes oficiales."
  }, {
    provider: process.env.NLP_PROVIDER_URL ? "external-nlp" : "simulated-nlp",
    status: "fallback",
    attempts,
    errorType,
    fallbackApplied: true
  });
}

async function queryGeminiApi(query) {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const currentDate = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  const systemInstruction = `Eres el motor de IA/NLP de 'Bot Verificador X', un bot diseñado para verificar la veracidad de publicaciones y tuits.
La fecha actual del sistema es: ${currentDate}. Por favor, evalúa todos los eventos, afirmaciones y datos temporales teniendo en cuenta que nos encontramos en esta fecha actual (junio de 2026). El Mundial de la FIFA 2026 y otros eventos de mediados de 2026 están ocurriendo EN ESTE MOMENTO.
IMPORTANTE CONTEXTO GEOGRÁFICO: Este bot está diseñado principalmente para ciudadanos chilenos. A menos que el tuit especifique expresamente otro país, debes asumir SIEMPRE que el usuario es de Chile. Por lo tanto, si el tuit habla de "el gobierno", "el presidente", "las autoridades" o "nuestro país", se refiere indefectiblemente al Gobierno de Chile y al Presidente de Chile.
Tu tarea es analizar la afirmación del usuario utilizando tu herramienta nativa de Google Search para obtener el contexto de búsqueda web en tiempo real.
Debes responder estrictamente en formato JSON utilizando el esquema requerido, sin bloques markdown ni texto explicativo adicional.
Esquema de respuesta JSON:
{
  "veredicto": "Verdadero" | "Falso" | "Impreciso" | "Engañoso",
  "confianza": número entero entre 0 y 100,
  "certeza": número entero entre 0 y 100 (qué porcentaje del tuit es información real y comprobada),
  "desglose": "Breve explicación de qué partes de la afirmación son verdad y qué partes son falsas o engañosas.",
  "tema": "Tema detectado (ej. Deportes, Esports, Política, Salud, Ciencia)",
  "contexto": "Breve resumen objetivo del hecho real basado en las fuentes.",
  "fuentesConsultadas": ["Nombre de fuente 1 (ej. HLTV.org)", "Nombre de fuente 2"],
  "senales": ["Señal de veracidad o falsedad detectada en el análisis de redes"],
  "justificacion": "Explicación clara de por qué se asignó el veredicto.",
  "recomendacion": "Consejo práctico para el usuario respecto a la información."
}

Considera:
- Utiliza la herramienta de Google Search internamente para fundamentar el contexto.
- Si el tuit del usuario afirma que algo ocurrió pero las fuentes demuestran que ocurrió, el veredicto es 'Verdadero'.
- Si el tuit afirma que algo ocurrió pero las fuentes demuestran que NO ocurrió (o viceversa), el veredicto es 'Falso'.
- Si el tuit mezcla hechos reales con conclusiones falsas, descontextualizadas o alarmistas (ej. 'Kast es presidente y por eso caerá un meteorito'), el veredicto es 'Engañoso'.
- Si el tuit contiene negaciones directas sobre hechos reales (ej. 'NiKo nunca ha ganado un major', cuando sí lo ganó), debes verificar la veracidad de la negación y clasificarla de forma correcta (en ese caso sería Falso).
- Si la información es contradictoria, desactualizada o insuficiente para concluir, el veredicto es 'Impreciso'.
- Justifica de manera neutral en español chileno/neutro.`;

  const promptText = `Afirmación del tuit a verificar:\n"${query}"`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `${systemInstruction}\n\n${promptText}`
        }]
      }],
      tools: [{
        googleSearch: {}
      }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API retornó código ${response.status}`);
  }

  const data = await response.json();
  const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textResponse) {
    throw new Error("No se obtuvo respuesta de texto de Gemini API.");
  }

  return JSON.parse(textResponse);
}

async function analyzeText(cleanText, simulateFailure = false) {
  // 1. Si no hay proveedor externo y no estamos forzando una falla, vemos si coincide con un hecho conocido de demostración
  if (!process.env.NLP_PROVIDER_URL && !simulateFailure) {
    const localResult = analyzeWithSimulatedNlp(cleanText);
    if (localResult.isDemoFact) {
      return withIntegrationMetadata(localResult, {
        provider: "simulated-nlp",
        status: "ok",
        attempts: 1,
        fallbackApplied: false
      });
    }
  }

  // 2. Si es una consulta general, no hay clave externa de proveedor y hay Gemini API, usamos RAG y búsqueda en tiempo real
  if (!process.env.NLP_PROVIDER_URL && process.env.GEMINI_API_KEY && !simulateFailure) {
    try {
      const searchQuery = cleanText.replace(/@\w+/g, "").replace(/\s+/g, " ").trim();
      console.log(`[RAG] Buscando fuentes en vivo para: "${searchQuery}"...`);
      console.log(`[RAG] Delegando búsqueda en tiempo real a la herramienta nativa de Google Search de Gemini API...`);
      const data = await queryGeminiApi(searchQuery);
      validateProviderResponse(data);
      
      console.log(`[RAG] Análisis completado con éxito por Gemini API. Veredicto: ${data.veredicto}`);
      return withIntegrationMetadata({
        veredicto: data.veredicto,
        confianza: data.confianza,
        certeza: data.certeza,
        desglose: data.desglose || "Desglose no disponible.",
        tema: data.tema || "General",
        contexto: data.contexto || "Sin contexto adicional.",
        fuentesConsultadas: data.fuentesConsultadas || [],
        senales: data.senales || [],
        justificacion: data.justificacion || "Procesado por motor de IA con búsqueda en tiempo real.",
        recomendacion: data.recomendacion || "Verificar en canales oficiales."
      }, {
        provider: "gemini-api",
        status: "ok",
        attempts: 1,
        fallbackApplied: false
      });
    } catch (err) {
      console.warn(`[RAG] Fallo en la integración con Gemini API. Cayendo al simulador local. Error: ${err.message}`);
    }
  }

  // 3. Si no hay proveedor externo ni Gemini API, o si se simuló una falla de red, corremos el motor lingüístico local (Fallback)
  const providerUrl = process.env.NLP_PROVIDER_URL;
  if (!providerUrl || simulateFailure) {
    return withIntegrationMetadata(analyzeWithSimulatedNlp(cleanText), {
      provider: "simulated-nlp",
      status: simulateFailure ? "fallback_local" : "ok",
      attempts: 1,
      fallbackApplied: simulateFailure
    });
  }

  // 3. Flujo con Mock NLP de integración externa (usado en tests unitarios y de stress)
  const finalProviderUrl = providerUrl || "https://nlp-engine-mock.local/analyze";
  let attempt = 0;
  const maxRetries = getMaxRetries();
  while (attempt <= maxRetries) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), getTimeoutMs());

    try {
      if (simulateFailure) {
        throw new Error("Network Error");
      }
      const response = await fetch(finalProviderUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NLP_API_KEY || ""}`
        },
        body: JSON.stringify({ text: cleanText }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`NLP provider returned status ${response.status}`);
      }

      const data = await response.json();
      validateProviderResponse(data);

      return withIntegrationMetadata({
        veredicto: data.veredicto,
        confianza: data.confianza,
        certeza: data.certeza,
        desglose: data.desglose || "Desglose no disponible.",
        tema: data.tema || "General",
        contexto: data.contexto || "Sin contexto adicional.",
        fuentesConsultadas: data.fuentesConsultadas || [],
        senales: data.senales || [],
        justificacion: data.justificacion || "Procesado por proveedor NLP externo.",
        recomendacion: data.recomendacion || "Verificar en canales oficiales."
      }, {
        provider: "external-nlp",
        status: "ok",
        attempts: attempt + 1,
        fallbackApplied: false
      });

    } catch (err) {
      clearTimeout(timeoutId);
      attempt++;
      console.warn(`Intento ${attempt} fallido al consultar NLP: ${err.message}`);

      if (attempt > maxRetries) {
        console.error("Maximo de reintentos alcanzado para NLP. Aplicando fallback seguro.");
        return buildSafeFallback(err, attempt);
      }
    }
  }
}

module.exports = {
  analyzeText,
  validateProviderResponse,
  classifyError
};


