const request = require("supertest");
const app = require("../src/app");
const db = require("../src/config/db");
const metricsRepository = require("../src/repositories/metricsRepository");
const nlpAdapter = require("../src/adapters/nlpAdapter");
const xAdapter = require("../src/adapters/xAdapter");
const { cleanTweetText, extractUrls } = require("../src/textProcessor");

beforeAll(() => {
  db.setMockActive(true);
});

beforeEach(() => {
  db.clearMockDb();
  jest.restoreAllMocks();
  delete process.env.NLP_PROVIDER_URL;
  delete process.env.NLP_MAX_RETRIES;
  delete process.env.NLP_TIMEOUT_MS;
  delete process.env.GEMINI_API_KEY;
});

describe("Unit Tests - Text Processor", () => {
  test("cleanTweetText removes emojis and normalizes spaces", () => {
    const cleaned = cleanTweetText("URGENTE!!! 😱😱   revisa esto   https://example.com");
    expect(cleaned).toBe("URGENTE!!! revisa esto");
  });

  test("extractUrls returns urls from tweet text", () => {
    const urls = extractUrls("Mira https://example.com y http://test.cl/noticia");
    expect(urls).toEqual(["https://example.com", "http://test.cl/noticia"]);
  });
});

describe("Unit Tests - NLP Local Simulator (Domain Rules)", () => {
  test("low confidence analysis defaults to Impreciso", async () => {
    const result = await nlpAdapter.analyzeText("Dicen que algo paso");
    expect(result.veredicto).toBe("Impreciso");
    expect(result.confianza).toBeLessThan(60);
    expect(result.integration.status).toBe("ok");
    expect(result.integration.provider).toBe("simulated-nlp");
  });

  test("unsupported bank closure claim is classified as Falso", async () => {
    const result = await nlpAdapter.analyzeText("Dicen que manana cierran todos los bancos en Chile");
    expect(result.veredicto).toBe("Falso");
    expect(result.tema).toBe("Economia y servicios");
    expect(result.confianza).toBeGreaterThanOrEqual(60);
  });

  test("official-source text is classified as Verdadero", async () => {
    const result = await nlpAdapter.analyzeText("Reporte oficial del ministerio confirma nueva informacion publica");
    expect(result.veredicto).toBe("Verdadero");
    expect(result.confianza).toBeGreaterThanOrEqual(60);
  });
});

describe("Unit Tests - X Adapter", () => {
  test("publishReply rejects missing tweet reference", async () => {
    await expect(xAdapter.publishReply({
      inReplyToTweetId: null,
      analysis: { veredicto: "Impreciso", confianza: 50, contexto: "x", justificacion: "x", recomendacion: "x" }
    })).rejects.toThrow("tweet original");
  });
});

describe("Integration Tests - Database Repository", () => {
  test("saveMetric inserts metrics and listMetrics returns them sorted", async () => {
    const metricData = {
      userId: "test-user-123",
      latencyMs: 120,
      veredicto: "Falso",
      confianza: 85,
      source: "jest-test",
      text: "Mensaje de prueba"
    };

    const saved = await metricsRepository.saveMetric(metricData);
    expect(saved).toBeDefined();
    expect(saved.id).toBeDefined();
    expect(saved.user_id).toBe(metricsRepository.anonymizeUserId("test-user-123"));
    expect(saved.veredicto).toBe("Falso");
    expect(saved.status).toBe("ok");
    expect(saved.provider).toBe("unknown");

    const list = await metricsRepository.listMetrics();
    expect(list.length).toBe(1);
    expect(list[0].id).toBe(saved.id);
  });
});

describe("Integration Tests - API Endpoints (Supertest)", () => {
  test("GET /health returns 200 and ok status", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  test("POST /verify returns structured analysis and saves metrics", async () => {
    const res = await request(app)
      .post("/verify")
      .send({ text: "Dicen que mañana cierran todos los bancos en Chile", userId: "user12" });

    expect(res.status).toBe(200);
    expect(res.body.veredicto).toBe("Falso");
    expect(res.body.confianza).toBe(88);
    expect(res.body.integration.status).toBe("ok");
    expect(res.body.integration.provider).toBe("simulated-nlp");
    expect(res.body.metricId).toBeDefined();

    const metricsRes = await request(app).get("/metrics");
    expect(metricsRes.body.total).toBe(1);
    expect(metricsRes.body.metrics[0].veredicto).toBe("Falso");
    expect(metricsRes.body.metrics[0].status).toBe("ok");
  });

  test("POST /x/webhook parses mention payload and replies mock", async () => {
    const mockPayload = {
      tweet: {
        id: "tw12345",
        text: "@Agente Reporte oficial del ministerio confirma nueva informacion publica",
        in_reply_to_tweet_id: "twOriginal",
        author_id: "author99"
      },
      user: {
        id: "author99",
        username: "test_user"
      }
    };

    const res = await request(app)
      .post("/x/webhook")
      .send(mockPayload);

    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);
    expect(res.body.mention.tweetId).toBe("tw12345");
    expect(res.body.publication.published).toBe(true);
    expect(res.body.publication.inReplyToTweetId).toBe("twOriginal");
    expect(res.body.publication.integrationStatus).toBe("ok");
  });
});

describe("Resilience & Fallback Tests - NLP Adapter", () => {
  test("NLP adapter retries upon fetch error and falls back gracefully", async () => {
    process.env.NLP_PROVIDER_URL = "https://nlp-engine-mock.local/analyze";
    process.env.NLP_MAX_RETRIES = "2";
    process.env.NLP_TIMEOUT_MS = "100";

    const fetchMock = jest.spyOn(global, "fetch").mockRejectedValue(new Error("Network Error"));

    const result = await nlpAdapter.analyzeText("Texto dudoso");
    
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(result.veredicto).toBe("Impreciso");
    expect(result.tema).toBe("Error de integracion");
    expect(result.contexto).toContain("El servicio de verificacion experimento problemas");
    expect(result.integration.status).toBe("fallback");
    expect(result.integration.attempts).toBe(3);
    expect(result.integration.errorType).toBe("network_or_unknown_error");
  });

  test("NLP adapter rejects invalid provider response and reports integration fallback", async () => {
    process.env.NLP_PROVIDER_URL = "https://nlp-engine-mock.local/analyze";
    process.env.NLP_MAX_RETRIES = "0";

    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ veredicto: "Quizas", confianza: 150 })
    });

    const result = await nlpAdapter.analyzeText("Texto con respuesta invalida del proveedor");

    expect(result.veredicto).toBe("Impreciso");
    expect(result.integration.status).toBe("fallback");
    expect(result.integration.attempts).toBe(1);
    expect(result.integration.errorType).toBe("invalid_provider_response");
  });

  test("POST /verify stores fallback metrics when NLP provider fails", async () => {
    process.env.NLP_PROVIDER_URL = "https://nlp-engine-mock.local/analyze";
    process.env.NLP_MAX_RETRIES = "0";

    jest.spyOn(global, "fetch").mockRejectedValue(new Error("Network Error"));

    const res = await request(app)
      .post("/verify")
      .send({ text: "Texto a verificar con proveedor caido", userId: "user-error" });

    expect(res.status).toBe(200);
    expect(res.body.veredicto).toBe("Impreciso");
    expect(res.body.integration.status).toBe("fallback");

    const metricsRes = await request(app).get("/metrics");
    expect(metricsRes.body.metrics[0].status).toBe("fallback");
    expect(metricsRes.body.metrics[0].error_type).toBe("network_or_unknown_error");
    expect(metricsRes.body.metrics[0].provider).toBe("external-nlp");
  });
});
