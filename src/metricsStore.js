const metrics = [];

function anonymizeUserId(userId) {
  if (!userId) return "anonymous";
  const value = String(userId);
  return `user_${Buffer.from(value).toString("base64").slice(0, 10)}`;
}

function saveMetricAsync(metric) {
  setImmediate(() => {
    metrics.push({
      ...metric,
      storedAt: new Date().toISOString()
    });
  });
}

function listMetrics() {
  return metrics;
}

module.exports = {
  anonymizeUserId,
  listMetrics,
  saveMetricAsync
};
