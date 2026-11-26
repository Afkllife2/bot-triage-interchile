/**
 * docs/calidad/load-test-hito3.js
 *
 * Script reproducible de prueba de carga, concurrencia y seguridad HTTP para Hito 3 (INSW422 — Artefacto A6).
 * Ejecuta N=50 usuarios virtuales concurrentes (500 peticiones totales) + ráfaga negativa de seguridad (20 ataques simulados)
 * contra el servidor Express real (`src/server.js`), midiendo p50, p95, p99, tasa de error y cumplimiento SLA (< 4000 ms).
 *
 * Uso: node docs/calidad/load-test-hito3.js
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const crypto = require('crypto');
const { execSync } = require('child_process');

// Variables aisladas de prueba en memoria (sin exponer credenciales reales)
process.env.META_APP_SECRET = process.env.META_APP_SECRET || 'load_test_meta_secret_hito3';
process.env.META_VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'load_test_verify_hito3';
process.env.TRIAGE_API_TOKEN = process.env.TRIAGE_API_TOKEN || 'load_test_triage_bearer_hito3_isolated';

// Mocks livianos en memoria para módulos externos (Gemini LLM, Meta API, Pool PG) manteniendo intacto Express + middleware + cotizador + PDF + arnés + metricsStore
const mockRequire = (relPath, stubExports) => {
  const abs = require.resolve(path.join(__dirname, '..', '..', relPath));
  require.cache[abs] = {
    id: abs,
    filename: abs,
    loaded: true,
    exports: stubExports,
  };
};

mockRequire('src/brain.js', {
  extraerFichaTriage: async (_texto, _tel) => ({
    tipo_solicitud: 'Mantención',
    cliente_nombre: 'Cliente Carga',
    sucursal_comuna: 'Las Condes',
    sucursal_direccion: 'Av. Apoquindo 4500',
    equipo_tipo: 'Split',
    equipo_marca: 'Daikin',
    sintoma_observacion: 'Mantención preventiva programada',
    prioridad: 'Normal',
    disponibilidad_cliente: 'Lunes a Viernes 10:00',
    tiene_fotos: false,
    requiere_derivacion: false,
    solicita_reunion: false,
    opciones_botones: [],
    respuesta_cliente: 'Recibimos tu solicitud de mantención.',
  }),
});

mockRequire('src/whatsapp.js', {
  enviarMensajeWhatsApp: async () => undefined,
  enviarMensajeConBotones: async () => undefined,
});

const dbStub = {
  normalizarTicketRow: (r) => r,
  encodeCursor: () => 'cursor',
  decodeCursor: () => ({ id: 1, updated_at: '2026-11-25T00:00:00Z' }),
  cerrarCasosEnProcesoPorTelefono: async () => 0,
  guardarCasoTriage: async () => 94,
  getTicketsDashboard: async () => [
    { id: 94, estado: 'en_proceso', prioridad: 'Normal', requiere_humano: false, equipo_tipo: 'Split', equipo_marca: 'Daikin' },
  ],
  getTicketsPaginados: async ({ limit = 50 }) => ({
    data: [
      {
        id: 94,
        created_at: '2026-10-27T02:48:31.364000Z',
        updated_at: '2026-11-25T10:00:00.000000Z',
        cliente_nombre: 'Carlos',
        telefono: '56964361272',
        motivo_principal: 'Mantención',
        equipo_tipo: 'Split',
        equipo_marca: 'Daikin',
        prioridad_sugerida: 'Normal',
        estado: 'en_proceso',
        cotizacion_neto: 45000,
        cotizacion_iva: 8550,
        cotizacion_total: 53550,
      },
    ].slice(0, limit),
    nextCursor: null,
  }),
  getTicketById: async (id) =>
    Number(id) === 94
      ? {
          id: 94,
          created_at: '2026-10-27T02:48:31.364000Z',
          updated_at: '2026-11-25T10:00:00.000000Z',
          cliente_nombre: 'Carlos',
          telefono: '56964361272',
          sucursal_comuna: 'Las Condes',
          motivo_principal: 'Mantención',
          equipo_tipo: 'Split',
          equipo_marca: 'Daikin',
          prioridad_sugerida: 'Normal',
          estado: 'en_proceso',
          cotizacion_neto: 45000,
          cotizacion_iva: 8550,
          cotizacion_total: 53550,
        }
      : null,
  listarReuniones: async () => ({
    ok: true,
    status: 200,
    data: [],
    disponibilidad: {
      fecha: '2026-12-01',
      bloques_totales: ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
      ocupados: [],
      disponibles: ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
    },
  }),
};
mockRequire('src/db.js', dbStub);

const app = require('../../src/server');

function httpRequest(port, { method = 'GET', reqPath = '/healthz', headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: reqPath,
        method,
        headers,
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const ms = performance.now() - start;
          resolve({
            status: res.statusCode,
            ms,
            bytes: Buffer.concat(chunks).length,
          });
        });
      }
    );
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function percentile(sorted, p) {
  if (!sorted.length) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return Number(sorted[idx].toFixed(2));
}

async function run() {
  const server = await new Promise((resolve) => {
    const srv = app.listen(0, '127.0.0.1', () => resolve(srv));
  });
  const port = server.address().port;
  const AUTH = `Bearer ${process.env.TRIAGE_API_TOKEN}`;

  const VUS = 50;
  const ROUNDS = 10; // 50 VUs * 10 rondas = 500 peticiones bajo concurrencia
  const latencies = [];
  let okCount = 0;
  let errCount = 0;
  const routeStats = {};

  const suiteStart = performance.now();

  for (let round = 0; round < ROUNDS; round++) {
    const promises = [];
    for (let vu = 0; vu < VUS; vu++) {
      const idx = round * VUS + vu;
      const mode = idx % 4;
      let reqOpts;
      let label;

      if (mode === 0) {
        label = 'GET /api/reuniones';
        reqOpts = {
          method: 'GET',
          reqPath: '/api/reuniones?fecha=2026-12-01',
          headers: { Authorization: AUTH },
        };
      } else if (mode === 1) {
        label = 'GET /api/tickets';
        reqOpts = {
          method: 'GET',
          reqPath: '/api/tickets?limit=20',
          headers: { Authorization: AUTH },
        };
      } else if (mode === 2) {
        label = 'GET /api/tickets/94/pdf';
        reqOpts = {
          method: 'GET',
          reqPath: '/api/tickets/94/pdf',
          headers: { Authorization: AUTH },
        };
      } else {
        label = 'POST /webhooks/meta';
        const payload = JSON.stringify({
          object: 'whatsapp_business_account',
          entry: [
            {
              changes: [
                {
                  value: {
                    contacts: [{ wa_id: `56999${String(idx).padStart(6, '0')}` }],
                    messages: [{ from: `56999${String(idx).padStart(6, '0')}`, id: `load.${idx}`, type: 'text', text: { body: 'Mantención Split' } }],
                  },
                },
              ],
            },
          ],
        });
        const sig = 'sha256=' + crypto.createHmac('sha256', process.env.META_APP_SECRET).update(payload).digest('hex');
        reqOpts = {
          method: 'POST',
          reqPath: '/webhooks/meta',
          headers: {
            'Content-Type': 'application/json',
            'x-hub-signature-256': sig,
            'Content-Length': Buffer.byteLength(payload),
          },
          body: payload,
        };
      }

      promises.push(
        httpRequest(port, reqOpts).then((r) => {
          latencies.push(r.ms);
          if (!routeStats[label]) routeStats[label] = { count: 0, ok: 0, ms: [] };
          routeStats[label].count++;
          routeStats[label].ms.push(r.ms);
          if (r.status >= 200 && r.status < 300) {
            okCount++;
            routeStats[label].ok++;
          } else {
            errCount++;
          }
        })
      );
    }
    await Promise.all(promises);
  }

  // Ráfaga negativa de seguridad (20 intentos no autorizados: sin firma HMAC, firma falsa, sin Bearer, token falso)
  const secChecks = [];
  for (let i = 0; i < 20; i++) {
    const kind = i % 4;
    if (kind === 0) {
      secChecks.push(httpRequest(port, { method: 'GET', reqPath: '/api/tickets' }).then((r) => ({ kind: 'no_bearer', expected: 401, got: r.status })));
    } else if (kind === 1) {
      secChecks.push(httpRequest(port, { method: 'GET', reqPath: '/api/metricas', headers: { Authorization: 'Bearer token_falso_invalido' } }).then((r) => ({ kind: 'bad_bearer', expected: 401, got: r.status })));
    } else if (kind === 2) {
      const payload = JSON.stringify({ object: 'whatsapp_business_account' });
      secChecks.push(httpRequest(port, { method: 'POST', reqPath: '/webhooks/meta', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }, body: payload }).then((r) => ({ kind: 'no_hmac', expected: 401, got: r.status })));
    } else {
      const payload = JSON.stringify({ object: 'whatsapp_business_account' });
      secChecks.push(httpRequest(port, { method: 'POST', reqPath: '/webhooks/meta', headers: { 'Content-Type': 'application/json', 'x-hub-signature-256': 'sha256=deadbeef', 'Content-Length': Buffer.byteLength(payload) }, body: payload }).then((r) => ({ kind: 'bad_hmac', expected: 403, got: r.status })));
    }
  }
  const secResults = await Promise.all(secChecks);
  const secDenied = secResults.filter((x) => x.got === x.expected).length;

  const totalDurationMs = Number((performance.now() - suiteStart).toFixed(2));
  await new Promise((resolve) => server.close(resolve));

  latencies.sort((a, b) => a - b);
  const avgMs = Number((latencies.reduce((acc, v) => acc + v, 0) / latencies.length).toFixed(2));

  let commitSha = 'unknown';
  try {
    commitSha = execSync('git rev-parse --short HEAD').toString().trim();
  } catch (_) {}

  const summary = {
    generated_at: new Date().toISOString(),
    commit: commitSha,
    tool: 'node_http_load_harness (src/server.js)',
    config: {
      virtual_users_concurrent: VUS,
      rounds: ROUNDS,
      total_requests: okCount + errCount,
      security_probe_requests: secResults.length,
    },
    efficiency_results: {
      total_duration_ms: totalDurationMs,
      throughput_rps: Number((((okCount + errCount) / totalDurationMs) * 1000).toFixed(2)),
      http_2xx: okCount,
      errors: errCount,
      error_rate_pct: Number(((errCount / (okCount + errCount)) * 100).toFixed(3)),
      latency_ms: {
        min: Number(latencies[0].toFixed(2)),
        avg: avgMs,
        p50: percentile(latencies, 50),
        p95: percentile(latencies, 95),
        p99: percentile(latencies, 99),
        max: Number(latencies[latencies.length - 1].toFixed(2)),
      },
      rnf01_meta_p95_ms: 2000,
      rnf01_meta_error_pct: 1.0,
      rnf01_cumple: percentile(latencies, 95) <= 2000 && errCount === 0,
      by_endpoint: Object.fromEntries(
        Object.entries(routeStats).map(([k, v]) => {
          const s = [...v.ms].sort((a, b) => a - b);
          return [
            k,
            {
              requests: v.count,
              ok: v.ok,
              p50_ms: percentile(s, 50),
              p95_ms: percentile(s, 95),
              max_ms: Number(s[s.length - 1].toFixed(2)),
            },
          ];
        })
      ),
    },
    security_probe_results: {
      total_attempts: secResults.length,
      properly_denied: secDenied,
      denial_rate_pct: Number(((secDenied / secResults.length) * 100).toFixed(1)),
      rnf02_cumple: secDenied === secResults.length,
    },
    known_limitation:
      'Ejecutado en instancia HTTP Express loopback simulando proveedores externos (Gemini API, Meta Graph y pool Supabase) para aislar latencia del servidor, serialización %PDF-1.4, middleware HMAC/Bearer y evitar cuotas externas.',
  };

  const outFile = path.join(__dirname, 'load-test-report.json');
  fs.writeFileSync(outFile, JSON.stringify(summary, null, 2), 'utf8');
  console.log(JSON.stringify(summary, null, 2));
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
