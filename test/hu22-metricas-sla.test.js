/**
 * test/hu22-metricas-sla.test.js
 *
 * Pruebas UNITARIAS e INTEGRACIÓN para [INT-HU-22] (AAI-94):
 * Monitoreo de Métricas de Calidad y SLA (< 4.0s), arnés Kronos y fichas PDF.
 * Cubre CA-1, CA-2, CA-3 y CA-4 incluyendo casos positivos, bordes y fallos.
 */
process.env.META_APP_SECRET = 'secreto_hu22_test';
process.env.META_VERIFY_TOKEN = 'verify_hu22_test';
process.env.TRIAGE_API_TOKEN = 'triage_token_hu22_test';

jest.mock('../src/brain', () => ({ extraerFichaTriage: jest.fn() }));
jest.mock('../src/db', () => ({
  guardarCasoTriage: jest.fn().mockResolvedValue(94),
  getTicketsDashboard: jest.fn().mockResolvedValue([]),
  getTicketsPaginados: jest.fn().mockResolvedValue({ items: [], nextCursor: null }),
  getTicketById: jest.fn().mockResolvedValue(null),
  actualizarEstadoTicket: jest.fn().mockResolvedValue({ status: 200, ok: true, data: {} }),
}));
jest.mock('../src/whatsapp', () => ({
  enviarMensajeWhatsApp: jest.fn().mockResolvedValue(undefined),
  enviarMensajeConBotones: jest.fn().mockResolvedValue(undefined),
}));

const crypto = require('crypto');
const request = require('supertest');
const app = require('../src/server');
const metricsStore = require('../src/metricsStore');
const { extraerFichaTriage } = require('../src/brain');
const { guardarCasoTriage, getTicketsDashboard, getTicketById } = require('../src/db');
const { enviarMensajeWhatsApp } = require('../src/whatsapp');

const AUTH_HEADER = 'Bearer triage_token_hu22_test';
const TEL = '56964361272';

const fichaBase = (extra = {}) => ({
  tipo_solicitud: 'Falla Técnica',
  cliente_nombre: 'Carlos González',
  sucursal_comuna: 'Las Condes',
  sucursal_direccion: 'Av. Apoquindo 4500',
  equipo_tipo: 'Split',
  equipo_marca: 'Daikin',
  sintoma_observacion: 'No enfría correctamente',
  prioridad: 'Normal',
  disponibilidad_cliente: 'Mañana',
  tiene_fotos: false,
  requiere_derivacion: false,
  opciones_botones: [],
  respuesta_cliente: 'Estimado Carlos, recibimos tu solicitud de asistencia.',
  ...extra,
});

function firmarWebhook(body) {
  const raw = JSON.stringify(body);
  const sig = 'sha256=' + crypto.createHmac('sha256', process.env.META_APP_SECRET).update(raw).digest('hex');
  return { raw, sig };
}

function crearPayloadWhatsApp(texto) {
  return {
    object: 'whatsapp_business_account',
    entry: [
      {
        changes: [
          {
            value: {
              contacts: [{ wa_id: TEL }],
              messages: [{ from: TEL, id: 'wamid.hu22.1', type: 'text', text: { body: texto } }],
            },
          },
        ],
      },
    ],
  };
}

describe('[INT-HU-22] (AAI-94) — Unitarias de metricsStore (SLA < 4.0s, Kronos y PDFs)', () => {
  beforeEach(() => {
    metricsStore.resetMetricas();
    jest.restoreAllMocks();
  });

  test('CA-1: Ignora latencias inválidas (NaN, negativas, null, Infinity) y mantiene métricas en baseline seguro', () => {
    metricsStore.registrarLatencia(NaN);
    metricsStore.registrarLatencia(-150);
    metricsStore.registrarLatencia(null);
    metricsStore.registrarLatencia('1200');
    metricsStore.registrarLatencia(Infinity);

    const resumen = metricsStore.obtenerResumenMetricas([]);
    expect(resumen.latencia_promedio_ms).toBe(0);
    expect(resumen.porcentaje_sla_cumplido).toBe(100);
    expect(resumen.sla.muestras_latencia).toBe(0);
    expect(resumen.sla.cumple_sla).toBe(true);
    expect(resumen.sla.alertas_sla).toBe(0);
  });

  test('CA-1: Registra latencias válidas dentro de umbral (< 4000 ms) sin disparar alertas SLA', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    metricsStore.registrarLatencia(499.6);
    metricsStore.registrarLatencia(1501);
    metricsStore.registrarLatencia(3999);

    const resumen = metricsStore.obtenerResumenMetricas();
    expect(resumen.latencia_promedio_ms).toBe(2000);
    expect(resumen.sla.latencia_max_ms).toBe(3999);
    expect(resumen.porcentaje_sla_cumplido).toBe(100);
    expect(resumen.sla.cumplimiento_sla_pct).toBe(100);
    expect(resumen.sla.cumple_sla).toBe(true);
    expect(resumen.sla.alertas_sla).toBe(0);
    expect(resumen.sla.ultima_alerta_sla).toBeNull();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  test('CA-4: Respuesta > 4000 ms descuenta proporcionalmente % SLA y emite console.warn sin lanzar excepción', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    metricsStore.registrarLatencia(200);
    metricsStore.registrarLatencia(400);
    metricsStore.registrarLatencia(4600);

    const resumen = metricsStore.obtenerResumenMetricas([]);
    expect(resumen.sla.muestras_latencia).toBe(3);
    expect(resumen.latencia_promedio_ms).toBe(1733);
    expect(resumen.porcentaje_sla_cumplido).toBe(66.7);
    expect(resumen.sla.cumple_sla).toBe(true);
    expect(resumen.sla.alertas_sla).toBe(1);
    expect(resumen.sla.ultima_alerta_sla).toEqual(
      expect.objectContaining({
        latencia_ms: 4600,
        umbral_ms: 4000,
      })
    );
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('[HU-22 SLA]'));
  });

  test('CA-4: Promedio global > 4000 ms marca cumple_sla=false y porcentaje_sla_cumplido=0', () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});

    metricsStore.registrarLatencia(4500);
    metricsStore.registrarLatencia(5500);

    const resumen = metricsStore.obtenerResumenMetricas([]);
    expect(resumen.latencia_promedio_ms).toBe(5000);
    expect(resumen.sla.cumple_sla).toBe(false);
    expect(resumen.porcentaje_sla_cumplido).toBe(0);
    expect(resumen.sla.alertas_sla).toBe(2);
  });

  test('CA-1 (Ventana móvil MAX_SAMPLES=200): Mantiene acotado el buffer de muestras', () => {
    for (let i = 1; i <= 205; i += 1) {
      metricsStore.registrarLatencia(100);
    }
    const resumen = metricsStore.obtenerResumenMetricas([]);
    expect(resumen.sla.muestras_latencia).toBe(200);
    expect(resumen.latencia_promedio_ms).toBe(100);
  });

  test('CA-2: Consolida bloqueos del arnés Kronos, PDFs (exitosos/fallidos) y distribución de tickets', () => {
    metricsStore.registrarEventoArnes(false);
    metricsStore.registrarEventoArnes(true);
    metricsStore.registrarEventoArnes(false);
    metricsStore.registrarGeneracionPdf(true);
    metricsStore.registrarGeneracionPdf(true);
    metricsStore.registrarGeneracionPdf(false);

    const resumen = metricsStore.obtenerResumenMetricas([
      { estado: 'en_proceso' },
      { estado: 'derivado' },
      { estado: 'agendado' },
      { estado: 'resuelto' },
      { estado: 'desconocido' },
      {},
    ]);

    expect(resumen.total_alucinaciones_bloqueadas).toBe(1);
    expect(resumen.arnes).toEqual({
      total_validaciones: 3,
      alucinaciones_interceptadas: 1,
      tasa_intercepcion_pct: 100,
    });
    expect(resumen.total_pdfs_generados).toBe(2);
    expect(resumen.pdf).toEqual({
      generados: 2,
      fallidos: 1,
      tasa_exito_pct: 66.7,
    });
    expect(resumen.tickets).toEqual({
      total: 6,
      por_estado: {
        en_proceso: 2,
        derivado: 1,
        agendado: 1,
        resuelto: 1,
      },
    });
  });
});

describe('[INT-HU-22] (AAI-94) — Integración Webhook → metricsStore → API /api/metricas → Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    metricsStore.resetMetricas();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('CA-1 + CA-2: POST /webhooks/meta mide latencia real del turno, contabiliza bloqueo Kronos y /api/metricas lo expone', async () => {
    extraerFichaTriage.mockResolvedValue(
      fichaBase({ equipo_marca: 'MarcaAlucinadaXYZ' })
    );
    getTicketsDashboard.mockResolvedValue([
      { id: 94, estado: 'en_proceso' },
      { id: 95, estado: 'agendado' },
    ]);

    const body = crearPayloadWhatsApp('Tengo un equipo MarcaAlucinadaXYZ fallando en Las Condes');
    const { raw, sig } = firmarWebhook(body);

    const webhookRes = await request(app)
      .post('/webhooks/meta')
      .set('Content-Type', 'application/json')
      .set('X-Hub-Signature-256', sig)
      .send(raw);

    expect(webhookRes.status).toBe(200);
    expect(guardarCasoTriage).toHaveBeenCalledTimes(1);
    expect(enviarMensajeWhatsApp).toHaveBeenCalledTimes(1);

    const metRes = await request(app)
      .get('/api/metricas')
      .set('Authorization', AUTH_HEADER);

    expect(metRes.status).toBe(200);
    expect(metRes.body.ok).toBe(true);
    expect(metRes.body.data).toMatchObject({
      porcentaje_sla_cumplido: 100,
      total_alucinaciones_bloqueadas: 1,
      total_pdfs_generados: 0,
      sla: expect.objectContaining({
        umbral_ms: 4000,
        muestras_latencia: 1,
        cumple_sla: true,
        alertas_sla: 0,
      }),
      tickets: {
        total: 2,
        por_estado: { en_proceso: 1, derivado: 0, agendado: 1, resuelto: 0 },
      },
    });
    expect(typeof metRes.body.data.latencia_promedio_ms).toBe('number');
    expect(metRes.body.data.latencia_promedio_ms).toBeGreaterThanOrEqual(0);
  });

  test('CA-4 Integración: Si un turno tarda > 4000 ms, no interrumpe WhatsApp, emite warning y descuenta SLA', async () => {
    let fakeNow = 1_700_000_000_000;
    const nowSpy = jest.spyOn(Date, 'now').mockImplementation(() => fakeNow);
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    extraerFichaTriage.mockImplementation(async () => {
      fakeNow += 4500;
      return fichaBase();
    });

    const body = crearPayloadWhatsApp('Urgente mi Split no enfría');
    const { raw, sig } = firmarWebhook(body);

    const webhookRes = await request(app)
      .post('/webhooks/meta')
      .set('Content-Type', 'application/json')
      .set('X-Hub-Signature-256', sig)
      .send(raw);

    nowSpy.mockRestore();

    expect(webhookRes.status).toBe(200);
    expect(enviarMensajeWhatsApp).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('[HU-22 SLA]'));

    const metRes = await request(app)
      .get('/api/metricas')
      .set('Authorization', AUTH_HEADER);

    expect(metRes.status).toBe(200);
    expect(metRes.body.data.latencia_promedio_ms).toBeGreaterThanOrEqual(4500);
    expect(metRes.body.data.porcentaje_sla_cumplido).toBe(0);
    expect(metRes.body.data.sla.cumple_sla).toBe(false);
    expect(metRes.body.data.sla.alertas_sla).toBe(1);
  });

  test('CA-2: GET /api/tickets/:id/pdf incrementa total_pdfs_generados y /api/metricas maneja 401/500', async () => {
    getTicketById.mockResolvedValue({
      id: 94,
      telefono: TEL,
      cliente_nombre: 'Carlos',
      motivo_principal: 'Falla Técnica',
      sucursal_comuna: 'Las Condes',
      equipo_tipo: 'Split',
      equipo_marca: '[dato por confirmar]',
      sintoma_observacion: 'El equipo no enfría',
      prioridad_sugerida: 'Normal',
      requiere_humano: false,
      estado: 'en_proceso',
      created_at: '2026-10-27T02:48:31Z',
    });

    const pdfRes = await request(app)
      .get('/api/tickets/94/pdf')
      .set('Authorization', AUTH_HEADER);
    expect(pdfRes.status).toBe(200);

    const unauthRes = await request(app).get('/api/metricas');
    expect(unauthRes.status).toBe(401);

    const metOk = await request(app)
      .get('/api/metricas')
      .set('Authorization', AUTH_HEADER);
    expect(metOk.status).toBe(200);
    expect(metOk.body.data.total_pdfs_generados).toBe(1);
    expect(metOk.body.data.pdf.generados).toBe(1);

    getTicketsDashboard.mockRejectedValueOnce(new Error('Falla de conexión Supabase'));
    const errRes = await request(app)
      .get('/api/metricas')
      .set('Authorization', AUTH_HEADER);
    expect(errRes.status).toBe(500);
    expect(errRes.body.ok).toBe(false);
  });

  test('CA-3: GET /dashboard renderiza todas las tarjetas KPI de calidad, SLA (< 4.0s), Kronos y PDFs', async () => {
    const dashRes = await request(app).get('/dashboard');

    expect(dashRes.status).toBe(200);
    expect(dashRes.headers['content-type']).toMatch(/html/);
    expect(dashRes.text).toContain('id="stat-latencia"');
    expect(dashRes.text).toContain('id="stat-sla-badge"');
    expect(dashRes.text).toContain('id="stat-arnes"');
    expect(dashRes.text).toContain('id="stat-pdfs"');
    expect(dashRes.text).toContain('/api/metricas');
    expect(dashRes.text).toContain('porcentaje_sla_cumplido');
    expect(dashRes.text).toContain('total_pdfs_generados');
  });
});
