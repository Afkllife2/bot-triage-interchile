function extractUrls(text) {
  const matches = text.match(/https?:\/\/[^\s]+/gi);
  return matches || [];
}

function cleanTweetText(text) {
  return text
    .replace(/https?:\/\/[^\s]+/gi, "")
    .replace(/[^\p{L}\p{N}\s.,:;!?¿¡@#-]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function preprocessTweet(text) {
  return {
    originalText: text,
    cleanText: cleanTweetText(text),
    urls: extractUrls(text)
  };
}

module.exports = {
  cleanTweetText,
  extractUrls,
  preprocessTweet
};
