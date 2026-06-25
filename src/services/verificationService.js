const { preprocessTweet } = require("../textProcessor");
const nlpAdapter = require("../adapters/nlpAdapter");
const xAdapter = require("../adapters/xAdapter");
const metricsRepository = require("../repositories/metricsRepository");

const DEFAULT_THRESHOLD = Number(process.env.CONFIDENCE_THRESHOLD || 60);

async function verifyClaim({ text, userId, source = "manual", simulateFailure = false }) {
  const startedAt = Date.now();
  const processed = preprocessTweet(text);

  const analysis = await nlpAdapter.analyzeText(processed.cleanText, simulateFailure);

  const threshold = DEFAULT_THRESHOLD;
  if (analysis.confianza < threshold && analysis.integration?.status !== "fallback") {
    analysis.veredicto = "Impreciso";
    analysis.justificacion = "La confianza del analisis es inferior al umbral definido, por lo que se evita una clasificacion categorica.";
    analysis.recomendacion = "No compartir como hecho confirmado; se recomienda revisar fuentes oficiales o evidencia adicional.";
  }

  const latencyMs = Date.now() - startedAt;
  const integration = analysis.integration || {};

  let metricResult = null;
  try {
    metricResult = await metricsRepository.saveMetric({
      userId,
      latencyMs,
      veredicto: analysis.veredicto,
      confianza: analysis.confianza,
      source,
      text: processed.cleanText,
      status: integration.status || "ok",
      errorType: integration.errorType || null,
      provider: integration.provider || "unknown",
      attempts: integration.attempts || 1
    });
  } catch (err) {
    console.error("Error al registrar metrica:", err.message);
  }

  return {
    ...analysis,
    processed,
    latencyMs,
    metricId: metricResult ? metricResult.id : null
  };
}

async function verifyMentionFromX(body, simulateFailure = false) {
  const startedAt = Date.now();
  const mention = xAdapter.parseMentionPayload(body);
  
  const verification = await verifyClaim({
    text: mention.text,
    userId: mention.userId,
    source: "x-webhook",
    simulateFailure
  });

  const publication = await xAdapter.publishReply({
    inReplyToTweetId: mention.originalTweetId,
    analysis: verification
  });

  return {
    received: true,
    mention,
    analysis: verification,
    publication,
    latencyMs: Date.now() - startedAt
  };
}

module.exports = {
  verifyClaim,
  verifyMentionFromX
};
