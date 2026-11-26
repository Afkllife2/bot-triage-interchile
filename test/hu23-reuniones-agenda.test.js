/**
 * test/hu23-reuniones-agenda.test.js
 *
 * Pruebas UNITARIAS e INTEGRACIÓN para [INT-HU-23] (AAI-102 / AAI-105):
 * Agendamiento automático de reuniones con Benjamín Yáñez vía WhatsApp,
 * endpoints /api/reuniones con prevención anti-topones HTTP 409,
 * y widget interactivo de calendario en Dashboard (CA-1 a CA-4).
 */
process.env.META_APP_SECRET = 'secreto_hu23_test';
process.env.META_VERIFY_TOKEN = 'verify_hu23_test';
process.env.TRIAGE_API_TOKEN = 'triage_token_hu23_test';

jest.mock('../src/brain', () => ({ extraerFichaTriage: jest.fn() }));
jest.mock('../src/db', () => ({
  guardarCasoTriage: jest.fn().mockResolvedValue(230),
  getTicketsDashboard: jest.fn().mockResolvedValue([]),
  getTicketsPaginados: jest.fn().mockResolvedValue({ items: [], nextCursor: null }),
  getTicketById: jest.fn().mockResolvedValue(null),
  actualizarEstadoTicket: jest.fn().mockResolvedValue({ status: 200, ok: true, data: {} }),
  listarReuniones: jest.fn().mockResolvedValue({
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
  crearReservaReunion: jest.fn().mockResolvedValue({
    ok: true,
    status: 201,
    data: {
      id: 1,
      cliente_id: 2,
      cliente_nombre: 'Clínica Sur',
      telefono: '56964361272',
      fecha_reunion: '2026-12-01',
      hora_reunion: '10:00',
      modalidad: 'Presencial',
      motivo: 'Evaluación Chiller',
      origen: 'whatsapp',
      estado: 'ingresada',
    },
  }),
  actualizarEstadoReunion: jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    data: { id: 1, estado: 'cancelada' },
  }),
}));
jest.mock('../src/whatsapp', () => ({
  enviarMensajeWhatsApp: jest.fn().mockResolvedValue(undefined),
  enviarMensajeConBotones: jest.fn().mockResolvedValue(undefined),
}));

const crypto = require('crypto');
const request = require('supertest');
const app = require('../src/server');
const agenda = require('../src/agenda');
const { extraerFichaTriage } = require('../src/brain');
const db = require('../src/db');
const { enviarMensajeWhatsApp, enviarMensajeConBotones } = require('../src/whatsapp');

const AUTH_HEADER = 'Bearer triage_token_hu23_test';
const TEL = '56964361272';

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
              messages: [{ from: TEL, id: 'wamid.hu23.1', type: 'text', text: { body: texto } }],
            },
          },
        ],
      },
    ],
  };
}

describe('[INT-HU-23] (AAI-102) — Pruebas Unitarias de src/agenda.js', () => {
  test('fechaHoyChile retorna YYYY-MM-DD válido y tolera errores de Intl', () => {
    const d = new Date('2026-11-23T15:00:00.000Z');
    expect(agenda.fechaHoyChile(d)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const origDTF = Intl.DateTimeFormat;
    Intl.DateTimeFormat = jest.fn(() => {
      throw new Error('Intl error');
    });
    expect(agenda.fechaHoyChile(d)).toBe('2026-11-23');
    Intl.DateTimeFormat = origDTF;
  });

  test('normalizarFechaReunion valida fechas calendario reales y rechaza fechas inexistentes', () => {
    expect(agenda.normalizarFechaReunion(' 2026-12-01 ')).toBe('2026-12-01');
    expect(agenda.normalizarFechaReunion('2026-02-30')).toBeNull();
    expect(agenda.normalizarFechaReunion('2026-13-01')).toBeNull();
    expect(agenda.normalizarFechaReunion('01-12-2026')).toBeNull();
    expect(agenda.normalizarFechaReunion(null)).toBeNull();
  });

  test('normalizarHoraReunion acepta formatos HH / HH:mm hrs en jornada laboral y rechaza fuera de rango', () => {
    expect(agenda.normalizarHoraReunion('9')).toBe('09:00');
    expect(agenda.normalizarHoraReunion('9:00')).toBe('09:00');
    expect(agenda.normalizarHoraReunion('15:30 hrs')).toBe('15:30');
    expect(agenda.normalizarHoraReunion('19:00 horas')).toBe('19:00');
    expect(agenda.normalizarHoraReunion('07:30')).toBeNull();
    expect(agenda.normalizarHoraReunion('19:01')).toBeNull();
    expect(agenda.normalizarHoraReunion('tarde')).toBeNull();
    expect(agenda.normalizarHoraReunion(10)).toBeNull();
  });

  test('normalizarModalidad distingue Presencial/Online y aplica estricto/defecto', () => {
    expect(agenda.normalizarModalidad('Presencial en terreno')).toBe('Presencial');
    expect(agenda.normalizarModalidad('en oficina')).toBe('Presencial');
    expect(agenda.normalizarModalidad('Videollamada Meet')).toBe('Online');
    expect(agenda.normalizarModalidad('Zoom')).toBe('Online');
    expect(agenda.normalizarModalidad('', { estricto: false, defecto: 'Online' })).toBe('Online');
    expect(agenda.normalizarModalidad('', { estricto: true })).toBeNull();
    expect(agenda.normalizarModalidad('Carta', { estricto: true })).toBeNull();
    expect(agenda.normalizarModalidad('Carta', { estricto: false, defecto: 'Online' })).toBe('Online');
  });

  test('construirDetalleModalidad y validarDetalleModalidad diferencian Online (canal/link) vs Presencial (lugar obligatorio)', () => {
    expect(agenda.construirDetalleModalidad({ modalidad: 'Online' })).toBe(agenda.DETALLE_ONLINE_DEFECTO);
    expect(agenda.construirDetalleModalidad({ modalidad: 'Online', detalle_modalidad: 'https://meet.google.com/abc-xyz' }))
      .toBe('https://meet.google.com/abc-xyz');

    expect(agenda.construirDetalleModalidad({
      modalidad: 'Presencial',
      direccion: 'Av. Apoquindo 4500',
      comuna: 'Las Condes',
    })).toBe('Av. Apoquindo 4500, Las Condes');

    const failPresencial = agenda.validarDetalleModalidad({
      modalidad: 'Presencial',
      detalle_modalidad: '',
      origen: 'dashboard',
    });
    expect(failPresencial.ok).toBe(false);
    expect(failPresencial.status).toBe(400);
    expect(failPresencial.codigo).toBe('LUGAR_PRESENCIAL_REQUERIDO');

    const okPresencial = agenda.validarDetalleModalidad({
      modalidad: 'Presencial',
      detalle_modalidad: 'Oficina InterChile Clima SpA (Santiago)',
      origen: 'dashboard',
    });
    expect(okPresencial).toEqual({
      ok: true,
      detalle_modalidad: 'Oficina InterChile Clima SpA (Santiago)',
    });

    const okOnlineSinLink = agenda.validarDetalleModalidad({
      modalidad: 'Online',
      detalle_modalidad: '',
      origen: 'dashboard',
    });
    expect(okOnlineSinLink).toEqual({
      ok: true,
      detalle_modalidad: agenda.DETALLE_ONLINE_DEFECTO,
    });
  });

  test('calcularDisponibilidadDia y sugerirHorariosCercanos excluyen bloques ocupados y ordenan por cercanía', () => {
    const disp = agenda.calcularDisponibilidadDia('2026-12-01', ['10:00', '14:00']);
    expect(disp.ocupados).toEqual(['10:00', '14:00']);
    expect(disp.disponibles).not.toContain('10:00');
    expect(disp.disponibles).not.toContain('14:00');
    expect(disp.bloques_totales).toHaveLength(9);

    const sugs = agenda.sugerirHorariosCercanos('10:00', ['10:00', '11:00'], 3);
    expect(sugs).toEqual(['09:00', '12:00', '14:00']);
  });

  test('validarReglaHorarioBenjamin bloquea madrugadas (04:00), colación (13:00), fines de semana y fechas pasadas', () => {
    expect(agenda.esDiaHabilReunion('2026-12-01')).toBe(true); // Martes
    expect(agenda.esDiaHabilReunion('2026-11-28')).toBe(false); // Sábado
    expect(agenda.esDiaHabilReunion('2026-11-29')).toBe(false); // Domingo
    expect(agenda.esDiaHabilReunion('no-es-fecha')).toBe(false);
    expect(agenda.siguienteDiaHabil('2026-11-28')).toBe('2026-11-30');
    expect(agenda.validarReglaHorarioBenjamin({ fecha: 'invalida', hora: '10:00' }).codigo).toBe('FECHA_INVALIDA');

    const madrugada = agenda.validarReglaHorarioBenjamin({
      fecha: '2026-12-01',
      hora: '04:00',
      hoy: '2026-11-24',
    });
    expect(madrugada.ok).toBe(false);
    expect(madrugada.status).toBe(400);
    expect(madrugada.codigo).toBe('FUERA_DE_HORARIO');
    expect(madrugada.sugerencias).toEqual(['09:00', '10:00', '11:00']);

    const colacion = agenda.validarReglaHorarioBenjamin({
      fecha: '2026-12-01',
      hora: '13:00',
      hoy: '2026-11-24',
    });
    expect(colacion.ok).toBe(false);
    expect(colacion.codigo).toBe('FUERA_DE_HORARIO');

    const domingo = agenda.validarReglaHorarioBenjamin({
      fecha: '2026-11-29',
      hora: '10:00',
      hoy: '2026-11-24',
    });
    expect(domingo.ok).toBe(false);
    expect(domingo.codigo).toBe('DIA_INHABIL');
    expect(domingo.proximo_dia_habil).toBe('2026-11-30');

    const pasada = agenda.validarReglaHorarioBenjamin({
      fecha: '2026-11-20',
      hora: '10:00',
      hoy: '2026-11-24',
    });
    expect(pasada.ok).toBe(false);
    expect(pasada.codigo).toBe('FECHA_PASADA');

    const ok = agenda.validarReglaHorarioBenjamin({
      fecha: '2026-12-01',
      hora: '10:00',
      hoy: '2026-11-24',
    });
    expect(ok).toEqual({ ok: true, fecha: '2026-12-01', hora: '10:00' });
  });

  test('construirMensajeReunionWhatsApp formatea ingreso (201), colisión (409), fuera de regla (400) y día lleno', () => {
    const okMsg = agenda.construirMensajeReunionWhatsApp('Perfecto, lo coordino.', {
      ok: true,
      data: {
        id: 7,
        fecha_reunion: '2026-12-01',
        hora_reunion: '10:00',
        modalidad: 'Presencial',
        detalle_modalidad: 'Av. Providencia 2200, Providencia',
        estado: 'ingresada',
      },
    });
    expect(okMsg).toContain('#R-7');
    expect(okMsg).toContain('Ingresada');
    expect(okMsg).toContain('2026-12-01 a las 10:00 hrs');
    expect(okMsg).toContain('Presencial');
    expect(okMsg).toContain('Av. Providencia 2200, Providencia');
    expect(okMsg).toContain('Benjamin@interchileclima.cl');

    const okOnlineMsg = agenda.construirMensajeReunionWhatsApp('Listo.', {
      ok: true,
      data: {
        id: 8,
        fecha_reunion: '2026-12-01',
        hora_reunion: '11:00',
        modalidad: 'Online',
        detalle_modalidad: 'https://meet.google.com/demo-123',
        estado: 'ingresada',
      },
    });
    expect(okOnlineMsg).toContain('Online (Videollamada)');
    expect(okOnlineMsg).toContain('https://meet.google.com/demo-123');
    expect(okOnlineMsg).toContain('Sesión remota sin traslado');

    const regla400Msg = agenda.construirMensajeReunionWhatsApp('Quedó agendada a las 4 AM', {
      ok: false,
      status: 400,
      codigo: 'FUERA_DE_HORARIO',
      message: 'El horario solicitado (04:00) está fuera de los bloques de atención.',
      sugerencias: ['09:00', '10:00', '11:00'],
    }, { fecha: '2026-12-01', hora: '04:00', modalidad: 'Online' });
    expect(regla400Msg).toContain('No fue posible agendar');
    expect(regla400Msg).not.toContain('Quedó agendada a las 4 AM');
    expect(regla400Msg).toContain('09:00 hrs, 10:00 hrs, 11:00 hrs');

    const colMsg = agenda.construirMensajeReunionWhatsApp('Base', {
      status: 409,
      sugerencias: ['09:00', '11:00'],
    }, { fecha: '2026-12-01', hora: '10:00', modalidad: 'Online' });
    expect(colMsg).toContain('ya se encuentra ocupado');
    expect(colMsg).toContain('09:00 hrs, 11:00 hrs');

    const fullMsg = agenda.construirMensajeReunionWhatsApp('Base', {
      status: 409,
      sugerencias: [],
    }, { fecha: '2026-12-01', hora: '10:00' });
    expect(fullMsg).toContain('No quedan bloques libres');

    expect(agenda.construirMensajeReunionWhatsApp('Base original', null)).toBe('Base original');
    expect(agenda.construirMensajeReunionWhatsApp('Base original', { status: 500 })).toBe('Base original');
  });
});

describe('[INT-HU-23] (AAI-102) — Integración WhatsApp + API /api/reuniones + Widget Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('CA-1 Integración WhatsApp: detecta solicita_reunion, persiste reserva origen=whatsapp y confirma #R-id', async () => {
    extraerFichaTriage.mockResolvedValue({
      tipo_solicitud: 'Cotización Proyecto',
      cliente_nombre: 'Clínica Sur',
      sucursal_comuna: 'Providencia',
      sucursal_direccion: 'Av. Providencia 2200',
      equipo_tipo: 'Chiller',
      equipo_marca: 'Carrier',
      sintoma_observacion: 'Evaluación Chiller 40TR',
      prioridad: 'Normal',
      disponibilidad_cliente: '2026-12-01 10:00',
      tiene_fotos: false,
      requiere_derivacion: false,
      solicita_reunion: true,
      reunion_fecha: '2026-12-01',
      reunion_hora: '10:00',
      reunion_modalidad: 'Presencial',
      opciones_botones: [],
      respuesta_cliente: 'Perfecto Clínica Sur, estoy registrando tu reunión con Benjamín.',
    });

    const payload = crearPayloadWhatsApp('Quiero agendar reunión presencial con Benjamín el 2026-12-01 a las 10:00');
    const { raw, sig } = firmarWebhook(payload);

    const res = await request(app)
      .post('/webhooks/meta')
      .set('X-Hub-Signature-256', sig)
      .set('Content-Type', 'application/json')
      .send(raw);

    expect(res.status).toBe(200);
    expect(db.crearReservaReunion).toHaveBeenCalledWith(
      expect.objectContaining({
        cliente_nombre: 'Clínica Sur',
        telefono: TEL,
        fecha_reunion: '2026-12-01',
        hora_reunion: '10:00',
        modalidad: 'Presencial',
        origen: 'whatsapp',
      })
    );
    expect(enviarMensajeWhatsApp).toHaveBeenCalledTimes(1);
    const textoEnviado = enviarMensajeWhatsApp.mock.calls[0][1];
    expect(textoEnviado).toContain('#R-1');
    expect(textoEnviado).toContain('2026-12-01 a las 10:00 hrs');
    expect(textoEnviado).toContain('Presencial');
  });

  test('CA-3 Integración WhatsApp: ante topón horario (409), alerta bloque ocupado, ofrece sugerencias y omite botones', async () => {
    extraerFichaTriage.mockResolvedValue({
      tipo_solicitud: 'Cotización Proyecto',
      cliente_nombre: 'Hotel Andes',
      sucursal_comuna: 'Las Condes',
      sucursal_direccion: 'Isidora 3000',
      equipo_tipo: 'VRF',
      equipo_marca: 'Daikin',
      sintoma_observacion: 'Proyecto VRF',
      prioridad: 'Normal',
      disponibilidad_cliente: '2026-12-01 10:00',
      tiene_fotos: false,
      requiere_derivacion: false,
      solicita_reunion: true,
      reunion_fecha: '2026-12-01',
      reunion_hora: '10:00',
      reunion_modalidad: 'Online',
      opciones_botones: ['Soporte', 'Cotización'],
      respuesta_cliente: 'Revisando disponibilidad...',
    });

    db.crearReservaReunion.mockResolvedValueOnce({
      ok: false,
      status: 409,
      codigo: 'HORARIO_OCUPADO',
      message: 'El bloque 2026-12-01 a las 10:00 hrs ya se encuentra reservado con Benjamín Yáñez',
      sugerencias: ['09:00', '11:00', '12:00'],
    });

    const payload = crearPayloadWhatsApp('Agéndame para el 2026-12-01 a las 10:00 online');
    const { raw, sig } = firmarWebhook(payload);

    const res = await request(app)
      .post('/webhooks/meta')
      .set('X-Hub-Signature-256', sig)
      .set('Content-Type', 'application/json')
      .send(raw);

    expect(res.status).toBe(200);
    expect(enviarMensajeConBotones).not.toHaveBeenCalled();
    expect(enviarMensajeWhatsApp).toHaveBeenCalledTimes(1);
    const aviso = enviarMensajeWhatsApp.mock.calls[0][1];
    expect(aviso).toContain('ya se encuentra ocupado');
    expect(aviso).toContain('09:00 hrs, 11:00 hrs, 12:00 hrs');
  });

  test('CA-3B Integración WhatsApp: ante horario inválido (04:00 AM / fin de semana -> 400), rechaza y sugiere horario hábil', async () => {
    extraerFichaTriage.mockResolvedValue({
      tipo_solicitud: 'Proyecto Comercial',
      cliente_nombre: 'Cliente Nocturno',
      sucursal_comuna: 'Santiago',
      sucursal_direccion: '',
      equipo_tipo: 'Split',
      equipo_marca: 'Daikin',
      sintoma_observacion: 'Reunión madrugada',
      prioridad: 'Normal',
      disponibilidad_cliente: '04:00',
      tiene_fotos: false,
      requiere_derivacion: false,
      solicita_reunion: true,
      reunion_fecha: '2026-12-01',
      reunion_hora: '04:00',
      reunion_modalidad: 'Online',
      opciones_botones: ['Opción 1'],
      respuesta_cliente: 'Revisando agenda...',
    });

    db.crearReservaReunion.mockResolvedValueOnce({
      ok: false,
      status: 400,
      codigo: 'FUERA_DE_HORARIO',
      message: 'El horario solicitado (04:00) está fuera de los bloques de atención de Benjamín Yáñez.',
      sugerencias: ['09:00', '10:00', '11:00'],
    });

    const payload = crearPayloadWhatsApp('Quiero reunión con Benjamín el 2026-12-01 a las 4 de la mañana');
    const { raw, sig } = firmarWebhook(payload);

    const res = await request(app)
      .post('/webhooks/meta')
      .set('X-Hub-Signature-256', sig)
      .set('Content-Type', 'application/json')
      .send(raw);

    expect(res.status).toBe(200);
    expect(enviarMensajeConBotones).not.toHaveBeenCalled();
    expect(enviarMensajeWhatsApp).toHaveBeenCalledTimes(1);
    const msg = enviarMensajeWhatsApp.mock.calls[0][1];
    expect(msg).toContain('No fue posible agendar');
    expect(msg).toContain('09:00 hrs, 10:00 hrs, 11:00 hrs');
  });

  test('CA-2 + CA-4 API: GET /api/reuniones requiere Bearer, lista reservas sincronizadas y maneja errores', async () => {
    const unauth = await request(app).get('/api/reuniones');
    expect(unauth.status).toBe(401);

    db.listarReuniones.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: [
        { id: 1, cliente_nombre: 'Cliente WA', fecha_reunion: '2026-12-01', hora_reunion: '10:00', modalidad: 'Presencial', origen: 'whatsapp', estado: 'confirmada' },
        { id: 2, cliente_nombre: 'Cliente Dash', fecha_reunion: '2026-12-01', hora_reunion: '11:00', modalidad: 'Online', origen: 'dashboard', estado: 'confirmada' },
      ],
      disponibilidad: { fecha: '2026-12-01', bloques_totales: ['09:00', '10:00', '11:00'], ocupados: ['10:00', '11:00'], disponibles: ['09:00'] },
    });

    const okRes = await request(app)
      .get('/api/reuniones?fecha=2026-12-01&todos=true&incluir_canceladas=false')
      .set('Authorization', AUTH_HEADER);

    expect(okRes.status).toBe(200);
    expect(okRes.body.ok).toBe(true);
    expect(okRes.body.data).toHaveLength(2);
    expect(okRes.body.disponibilidad.ocupados).toEqual(['10:00', '11:00']);
    expect(db.listarReuniones).toHaveBeenCalledWith({
      fecha: '2026-12-01',
      todos: true,
      incluirCanceladas: false,
    });

    db.listarReuniones.mockResolvedValueOnce({ ok: false, status: 400, message: 'Fecha inválida' });
    const badRes = await request(app).get('/api/reuniones?fecha=mal').set('Authorization', AUTH_HEADER);
    expect(badRes.status).toBe(400);

    db.listarReuniones.mockRejectedValueOnce(new Error('Pool drop'));
    const err500 = await request(app).get('/api/reuniones').set('Authorization', AUTH_HEADER);
    expect(err500.status).toBe(500);
  });

  test('CA-2 + CA-3 API: POST /api/reuniones crea reserva (201), previene topón (409) y PATCH cambia estado (200/404/500)', async () => {
    const createOk = await request(app)
      .post('/api/reuniones')
      .set('Authorization', AUTH_HEADER)
      .send({
        cliente_nombre: 'Clínica Norte',
        telefono: '56911223344',
        fecha_reunion: '2026-12-03',
        hora_reunion: '14:00',
        modalidad: 'Online',
        motivo: 'Cotización Split',
      });
    expect(createOk.status).toBe(201);
    expect(db.crearReservaReunion).toHaveBeenCalledWith(
      expect.objectContaining({ origen: 'dashboard', fecha_reunion: '2026-12-03', hora_reunion: '14:00' })
    );

    db.crearReservaReunion.mockResolvedValueOnce({
      ok: false,
      status: 409,
      codigo: 'HORARIO_OCUPADO',
      message: 'Bloque ocupado',
      sugerencias: ['15:00', '16:00'],
    });
    const conflictRes = await request(app)
      .post('/api/reuniones')
      .set('Authorization', AUTH_HEADER)
      .send({
        cliente_nombre: 'Clínica Duplicada',
        fecha_reunion: '2026-12-03',
        hora_reunion: '14:00',
        modalidad: 'Online',
      });
    expect(conflictRes.status).toBe(409);
    expect(conflictRes.body.codigo).toBe('HORARIO_OCUPADO');
    expect(conflictRes.body.sugerencias).toEqual(['15:00', '16:00']);

    db.crearReservaReunion.mockRejectedValueOnce(new Error('DB down'));
    const postErr = await request(app)
      .post('/api/reuniones')
      .set('Authorization', AUTH_HEADER)
      .send({ cliente_nombre: 'X', fecha_reunion: '2026-12-03', hora_reunion: '14:00' });
    expect(postErr.status).toBe(500);

    const patchOk = await request(app)
      .patch('/api/reuniones/1')
      .set('Authorization', AUTH_HEADER)
      .send({ estado: 'cancelada' });
    expect(patchOk.status).toBe(200);
    expect(patchOk.body.data.estado).toBe('cancelada');

    db.actualizarEstadoReunion.mockResolvedValueOnce({ ok: false, status: 404, message: 'No encontrada' });
    const patch404 = await request(app)
      .patch('/api/reuniones/999')
      .set('Authorization', AUTH_HEADER)
      .send({ estado: 'cancelada' });
    expect(patch404.status).toBe(404);

    db.actualizarEstadoReunion.mockRejectedValueOnce(new Error('Fail'));
    const patch500 = await request(app)
      .patch('/api/reuniones/1')
      .set('Authorization', AUTH_HEADER)
      .send({ estado: 'completada' });
    expect(patch500.status).toBe(500);
  });

  test('CA-2 + CA-4 UI Dashboard: GET /dashboard incluye el widget de calendario, grilla horaria y tabla sincronizada sin tokens embebidos', async () => {
    const res = await request(app).get('/dashboard');
    expect(res.status).toBe(200);
    expect(res.text).toContain('id="calendario-reuniones"');
    expect(res.text).toContain('id="reunion-fecha"');
    expect(res.text).toContain('id="reunion-slots"');
    expect(res.text).toContain('id="reunion-modalidad"');
    expect(res.text).toContain('id="agenda-modalidad-info"');
    expect(res.text).toContain('id="reunion-subtipo"');
    expect(res.text).toContain('id="reunion-detalle-modalidad"');
    expect(res.text).toContain('actualizarUISegunModalidad');
    expect(res.text).toContain('filtrarReunionesPorModalidad');
    expect(res.text).toContain('id="tabla-reuniones"');
    expect(res.text).toContain('id="tbody-reuniones"');
    expect(res.text).toContain('/api/reuniones');
    expect(res.text).toContain('crearReservaDashboard');
    expect(res.text).toContain('cambiarEstadoReunion');
    expect(res.text).toContain('badge-ingresada');
    expect(res.text).toContain('Confirmar');
    expect(res.text).not.toContain(process.env.TRIAGE_API_TOKEN);
  });
});
