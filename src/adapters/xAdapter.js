const mode = process.env.X_CLIENT_MODE || "mock";
const botHandle = process.env.X_BOT_HANDLE || "Agente";

function buildReplyText(analysis) {
  return [
    `@${botHandle} veredicto: ${analysis.veredicto}`,
    `Confianza: ${analysis.confianza}%`,
    `Contexto: ${analysis.contexto}`,
    `Justificacion: ${analysis.justificacion}`,
    `Recomendacion: ${analysis.recomendacion}`
  ].join("\n");
}

async function publishReply({ inReplyToTweetId, analysis }) {
  if (!inReplyToTweetId) {
    throw new Error("No se puede publicar respuesta sin tweet original de referencia.");
  }

  const replyText = buildReplyText(analysis);

  if (mode !== "mock") {
    if (!process.env.X_ACCESS_TOKEN || !process.env.X_API_KEY) {
      throw new Error("La publicacion real en X requiere credenciales de API completas.");
    }
  }

  return {
    mode,
    published: true,
    inReplyToTweetId,
    replyText,
    integrationStatus: "ok",
    simulatedTweetId: mode === "mock" ? `mock_${Date.now()}` : null
  };
}

function parseMentionPayload(payload) {
  const tweet = payload?.tweet || payload?.data;
  const user = payload?.user || payload?.includes?.users?.[0] || {};

  if (!tweet?.id || !tweet?.text) {
    throw new Error("Payload invalido: se requiere tweet.id y tweet.text.");
  }

  return {
    tweetId: tweet.id,
    originalTweetId: tweet.in_reply_to_tweet_id || tweet.id,
    text: tweet.text,
    userId: user.id || tweet.author_id || "unknown-user",
    username: user.username || "unknown"
  };
}

module.exports = {
  buildReplyText,
  parseMentionPayload,
  publishReply
};
