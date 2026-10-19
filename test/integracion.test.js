/**
 * test/integracion.test.js
 *
 * Pruebas de INTEGRACIÓN del pipeline completo (HTTP → HMAC → IA → Arnés/Kronos → BD → WhatsApp)
 * usando las rutas reales de Express con supertest.
 *
 * Se simulan SOLO los bordes externos (Gemini, Supabase y Meta Graph API);
 * server.js, arneses.js y kronos.js se ejecutan reales.
 */
process.env.META_APP_SECRET = 'secreto_de_prueba';
process.env.META_VERIFY_TOKEN = 'token_de_prueba';

jest.mock('../src/brain', () => ({ extraerFichaTriage: jest.fn() }));
jest.mock('../src/db', () => ({
  guardarCasoTriage: jest.fn().mockResolvedValue(1),
  getTicketsDashboard: jest.fn(),
}));
jest.mock('../src/whatsapp', () => ({
  enviarMensajeWhatsApp: jest.fn().mockResolvedValue(undefined),
  enviarMensajeConBotones: jest.fn().mockResolvedValue(undefined),
}));

const crypto = require('crypto');
const request = require('supertest');
const app = require('../src/server');
const { extraerFichaTriage } = require('../src/brain');
const { guardarCasoTriage, getTicketsDashboard } = require('../src/db');
const { enviarMensajeWhatsApp, enviarMensajeConBotones } = require('../src/whatsapp');

const TEL = '56911112222';

const fichaBase = (extra = {}) => ({
  tipo_solicitud: 'Otra Consulta',
  cliente_nombre: '', sucursal_comuna: '', sucursal_direccion: '',
  equipo_tipo: '', equipo_marca: '', sintoma_observacion: '',
  prioridad: 'Normal', disponibilidad_cliente: '', tiene_fotos: false,
  requiere_derivacion: false, opciones_botones: [],
  respuesta_cliente: 'Respuesta de prueba',
  ...extra,
});

function payload(message) {
  return {
    object: 'whatsapp_business_account',
    entry: [{ changes: [{ value: { contacts: [{ wa_id: TEL }], messages: [message] } }] }],
  };
}

function firmar(body) {
  const raw = JSON.stringify(body);
  const sig = 'sha256=' + crypto.createHmac('sha256', process.env.META_APP_SECRET).update(raw).digest('hex');
  return { raw, sig };
}

function enviarWebhook(body) {
  const { raw, sig } = firmar(body);
  return request(app)
    .post('/webhooks/meta')
    .set('Content-Type', 'application/json')
    .set('x-hub-signature-256', sig)
    .send(raw);
}

beforeEach(() => {
  jest.clearAllMocks();
  guardarCasoTriage.mockResolvedValue(1);
  extraerFichaTriage.mockResolvedValue(fichaBase());
});

describe('Integración — Seguridad del Webhook (arnés de entrada)', () => {
  test('GET verificación con token correcto devuelve el challenge', async () => {
    const res = await request(app).get('/webhooks/meta')
      .query({ 'hub.mode': 'subscribe', 'hub.verify_token': 'token_de_prueba', 'hub.challenge': 'abc123' });
    expect(res.status).toBe(200);
    expect(res.text).toBe('abc123');
  });

  test('GET verificación con token incorrecto devuelve 403', async () => {
    const res = await request(app).get('/webhooks/meta')
      .query({ 'hub.mode': 'subscribe', 'hub.verify_token': 'malo', 'hub.challenge': 'abc123' });
    expect(res.status).toBe(403);
  });

  test('POST sin firma es rechazado (401) y no invoca a la IA', async () => {
    const res = await request(app).post('/webhooks/meta').send(payload({ type: 'text', text: { body: 'hola' } }));
    expect(res.status).toBe(401);
    expect(extraerFichaTriage).not.toHaveBeenCalled();
  });

  test('POST con firma inválida es rechazado (403) y no invoca a la IA', async () => {
    const res = await request(app).post('/webhooks/meta')
      .set('x-hub-signature-256', 'sha256=firmafalsa')
      .send(payload({ type: 'text', text: { body: 'hola' } }));
    expect(res.status).toBe(403);
    expect(extraerFichaTriage).not.toHaveBeenCalled();
  });
});

describe('Integración — Flujo mensaje → IA → BD → WhatsApp', () => {
  test('Mensaje de texto: la IA recibe el texto y el teléfono, se guarda el caso y se responde con texto', async () => {
    const res = await enviarWebhook(payload({ type: 'text', text: { body: 'hola buen día' } }));

    expect(res.status).toBe(200);
    expect(extraerFichaTriage).toHaveBeenCalledWith('hola buen día', TEL);
    expect(guardarCasoTriage).toHaveBeenCalledTimes(1);
    expect(enviarMensajeWhatsApp).toHaveBeenCalledWith(TEL, 'Respuesta de prueba');
    expect(enviarMensajeConBotones).not.toHaveBeenCalled();
  });

  test('HU-20 CA-2: un clic en botón (button_reply) llega a la IA como texto', async () => {
    await enviarWebhook(payload({ type: 'interactive', interactive: { button_reply: { id: 'btn_1', title: 'Mantención' } } }));
    expect(extraerFichaTriage).toHaveBeenCalledWith('Mantención', TEL);
  });

  test('HU-20 CA-2: una selección de lista (list_reply, ej. Arriendo) llega a la IA como texto', async () => {
    await enviarWebhook(payload({ type: 'interactive', interactive: { list_reply: { id: 'row_3', title: 'Arriendo' } } }));
    expect(extraerFichaTriage).toHaveBeenCalledWith('Arriendo', TEL);
  });

  test('HU-20 CA-1: si la IA sugiere opciones, se envían como mensaje interactivo', async () => {
    const opciones = ['Falla Técnica', 'Mantención', 'Cotización', 'Arriendo'];
    extraerFichaTriage.mockResolvedValue(fichaBase({ opciones_botones: opciones }));

    await enviarWebhook(payload({ type: 'text', text: { body: 'hola' } }));

    expect(enviarMensajeConBotones).toHaveBeenCalledWith(TEL, 'Respuesta de prueba', opciones);
    expect(enviarMensajeWhatsApp).not.toHaveBeenCalled();
  });

  test('HU-06: derivación envía solo texto (sin botones) y persiste el caso', async () => {
    extraerFichaTriage.mockResolvedValue(fichaBase({
      requiere_derivacion: true,
      opciones_botones: ['Falla Técnica'],
      respuesta_cliente: 'Contacta a Benjamin@interchileclima.cl / +569 9440 2632',
    }));

    await enviarWebhook(payload({ type: 'text', text: { body: 'quiero hablar con un ejecutivo' } }));

    expect(guardarCasoTriage.mock.calls[0][0].requiere_derivacion).toBe(true);
    expect(enviarMensajeWhatsApp).toHaveBeenCalledWith(TEL, expect.stringContaining('Benjamin@interchileclima.cl'));
    expect(enviarMensajeConBotones).not.toHaveBeenCalled();
  });

  test('Estados de entrega (sin mensajes) responden 200 sin invocar a la IA', async () => {
    const res = await enviarWebhook({
      object: 'whatsapp_business_account',
      entry: [{ changes: [{ value: { statuses: [{ status: 'delivered' }] } }] }],
    });
    expect(res.status).toBe(200);
    expect(extraerFichaTriage).not.toHaveBeenCalled();
  });
});

describe('Integración — Arnés HU-21 con catálogo Kronos dentro del pipeline', () => {
  test('Una marca inventada por la IA se corrige ANTES de guardar en BD', async () => {
    extraerFichaTriage.mockResolvedValue(fichaBase({ equipo_marca: 'CoolBreeze Pro X9000', equipo_tipo: 'Split' }));

    await enviarWebhook(payload({ type: 'text', text: { body: 'mi equipo falla' } }));

    const fichaGuardada = guardarCasoTriage.mock.calls[0][0];
    expect(fichaGuardada.equipo_marca).toBe('[dato por confirmar]');
    expect(fichaGuardada.equipo_tipo).toBe('Split');
  });

  test('Una marca válida del catálogo pasa sin modificarse', async () => {
    extraerFichaTriage.mockResolvedValue(fichaBase({ equipo_marca: 'Samsung', equipo_tipo: 'Split' }));

    await enviarWebhook(payload({ type: 'text', text: { body: 'split samsung' } }));

    expect(guardarCasoTriage.mock.calls[0][0].equipo_marca).toBe('Samsung');
  });
});

describe('Integración — Dashboard (HU-14)', () => {
  test('GET /api/tickets devuelve los tickets de la capa de datos', async () => {
    getTicketsDashboard.mockResolvedValue([{ id: 1, prioridad_sugerida: 'Alta' }]);
    const res = await request(app).get('/api/tickets');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, data: [{ id: 1, prioridad_sugerida: 'Alta' }] });
  });

  test('GET /api/tickets responde 500 controlado si la capa de datos lanza una excepción', async () => {
    getTicketsDashboard.mockRejectedValue(new Error('BD caída'));
    const res = await request(app).get('/api/tickets');
    expect(res.status).toBe(500);
    expect(res.body.ok).toBe(false);
  });

  test('GET /dashboard sirve la página HTML', async () => {
    const res = await request(app).get('/dashboard');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
  });
});
