/**
 * test/sprint3.test.js
 *
 * Suite de Pruebas Automatizadas (Unitarias + Integración + Concurrencia) — Sprint 3 y KRON2-152
 *
 * Cobertura:
 * - [INT-HU-05] (AAI-25): Cotizador determinista CLP + IVA 19% y Generador de Ficha/Cotización en PDF (%PDF-1.4).
 * - [INT-HU-19] (AAI-90) + KRON2-152:
 *   - Autenticación Bearer (`TRIAGE_API_TOKEN`) obligatoria y aislada de Meta/Gemini.
 *   - `GET /api/tickets` paginado con cursor estable (`updated_at+id`, `limit` 1-50, `nextCursor`).
 *   - `GET /api/tickets/:id` y `PATCH /api/tickets/:id` con estados, `fecha_visita` obligatoria al agendar y conflicto 409.
 *   - `GET /api/tickets/:id/pdf` privado y autenticado.
 * - [INT-HU-18 / INT-HU-21] + KRON2-152:
 *   - Adaptador `src/kronos.js` contra `GET /api/kronos/catalogo` (catálogo vacío `available:false`, timeout, dato desconocido y distinción de respaldo local `catalogo_verificado=false`).
 * - [INT-HU-22] (AAI-94): Métricas de calidad, SLA (< 4000 ms) y efectividad de arnés (`GET /api/metricas`).
 * - [INT-HU-23] (AAI-98): Prueba de estrés y concurrencia con 20 usuarios simultáneos (100% éxito, 0 colisiones de sesión).
 */

process.env.META_APP_SECRET = 'secreto_sprint3_test';
process.env.META_VERIFY_TOKEN = 'verify_sprint3_test';
process.env.TRIAGE_API_TOKEN = 'triage_bearer_token_exclusivo_sprint3';

const crypto = require('crypto');
const request = require('supertest');

jest.mock('../src/brain', () => ({
  extraerFichaTriage: jest.fn(),
}));

jest.mock('../src/whatsapp', () => ({
  enviarMensajeWhatsApp: jest.fn().mockResolvedValue(undefined),
  enviarMensajeConBotones: jest.fn().mockResolvedValue(undefined),
}));

// Simulamos las operaciones SQL de db.js conservando puras `normalizarTicketRow`, `encodeCursor` y `decodeCursor`
jest.mock('../src/db', () => {
  const actual = jest.requireActual('../src/db');
  return {
    ...actual,
    guardarCasoTriage: jest.fn().mockResolvedValue(101),
    getTicketsDashboard: jest.fn(),
    getTicketsPaginados: jest.fn(),
    getTicketById: jest.fn(),
    actualizarEstadoTicket: jest.fn(),
  };
});

const app = require('../src/server');
const db = require('../src/db');
const { extraerFichaTriage } = require('../src/brain');
const {
  calcularCotizacionBorrador,
  enriquecerRespuestaConCotizacion,
  normalizarCategoriaEquipo,
  formatearCLP,
} = require('../src/cotizador');
const { generarFichaCotizacionPDF } = require('../src/pdfGenerator');
const { enviarMensajeWhatsApp } = require('../src/whatsapp');
const {
  configurarClienteKronos,
  resetClienteKronos,
  validarMarca,
  validarTipoEquipo,
} = require('../src/kronos');
const { validarFichaConKronos } = require('../src/arneses');
const {
  resetMetricas,
  registrarLatencia,
  obtenerResumenMetricas,
} = require('../src/metricsStore');

const AUTH = 'Bearer triage_bearer_token_exclusivo_sprint3';

function firmarWebhook(body) {
  const raw = JSON.stringify(body);
  const sig = 'sha256=' + crypto.createHmac('sha256', process.env.META_APP_SECRET).update(raw).digest('hex');
  return { raw, sig };
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.TRIAGE_API_TOKEN = 'triage_bearer_token_exclusivo_sprint3';
  resetClienteKronos();
  resetMetricas();
});

// ============================================================================
// 1. [INT-HU-05] (AAI-25): Cotizador Comercial CLP + Generador PDF
// ============================================================================
describe('[INT-HU-05] (AAI-25) — Motor de Cotización Borrador y Ficha PDF', () => {
  test('CA-1: Calcula subtotal_neto, IVA (19%) y total_clp exactos para Mantención de Split', () => {
    const cot = calcularCotizacionBorrador({
      tipo_solicitud: 'Mantención',
      equipo_tipo: 'Split',
      equipo_marca: 'Samsung',
      prioridad: 'Normal',
    });

    expect(cot).not.toBeNull();
    expect(cot.subtotal_neto).toBe(45000);
    expect(cot.iva).toBe(Math.round(45000 * 0.19)); // 8550
    expect(cot.total_clp).toBe(53550);
    expect(cot.es_referencial).toBe(true);
  });

  test('CA-1: Aplica recargo de urgencia cuando es Falla Técnica con prioridad Alta', () => {
    const cot = calcularCotizacionBorrador({
      tipo_solicitud: 'Falla Técnica',
      equipo_tipo: 'Cassette',
      prioridad: 'Alta',
    });

    expect(cot).not.toBeNull();
    expect(cot.subtotal_neto).toBe(45000 + 15000); // 60000
    expect(cot.iva).toBe(11400);
    expect(cot.total_clp).toBe(71400);
  });

  test('CA-2 / KRON2-152: Retorna null (sin inferir 0) cuando el equipo es "[dato por confirmar]" o falta motivo', () => {
    expect(
      calcularCotizacionBorrador({
        tipo_solicitud: 'Mantención',
        equipo_tipo: '[dato por confirmar]',
      })
    ).toBeNull();

    expect(
      calcularCotizacionBorrador({
        tipo_solicitud: 'Otra Consulta',
        equipo_tipo: 'Split',
      })
    ).toBeNull();
  });

  test('CA-3: generarFichaCotizacionPDF construye un binario %PDF-1.4 válido con aviso no oficial', () => {
    const ticket = db.normalizarTicketRow({
      id: 42,
      created_at: '2026-11-09T12:00:00.000Z',
      updated_at: '2026-11-09T12:05:00.000Z',
      nombre_completo: 'Clínica Providencia',
      telefono: '56988887777',
      comuna: 'Providencia',
      direccion: 'Av. Providencia 1234',
      motivo_principal: 'Mantención',
      equipo_tipo: 'Split',
      equipo_marca: 'Samsung',
      sintoma_observacion: 'Limpieza preventiva anual',
      prioridad_sugerida: 'Normal',
      requiere_humano: false,
      estado: 'en_proceso',
      cotizacion_neto: 45000,
      cotizacion_iva: 8550,
      cotizacion_total: 53550,
    });

    const buffer = generarFichaCotizacionPDF(ticket);
    expect(Buffer.isBuffer(buffer)).toBe(true);
    const pdfText = buffer.toString('latin1');
    expect(pdfText.startsWith('%PDF-1.4')).toBe(true);
    expect(pdfText).toContain('No es presupuesto oficial');
    expect(pdfText).toContain('$53.550 CLP');
    expect(pdfText.trim().endsWith('%%EOF')).toBe(true);
  });

  test('CA-3: GET /api/tickets/:id/pdf descarga el PDF autenticado y rechaza sin token', async () => {
    db.getTicketById.mockResolvedValue(
      db.normalizarTicketRow({
        id: 15,
        created_at: '2026-11-09T14:00:00.000Z',
        updated_at: '2026-11-09T14:00:00.000Z',
        nombre_completo: 'María Soto',
        telefono: '56977776666',
        motivo_principal: 'Instalación',
        equipo_tipo: 'Split',
        equipo_marca: 'LG',
        prioridad_sugerida: 'Normal',
        estado: 'en_proceso',
      })
    );

    const unauth = await request(app).get('/api/tickets/15/pdf');
    expect(unauth.status).toBe(401);

    const res = await request(app)
      .get('/api/tickets/15/pdf')
      .set('Authorization', AUTH);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/pdf/);
    expect(res.headers['content-disposition']).toContain('ficha-triage-15.pdf');
    expect(res.body.slice(0, 8).toString('latin1')).toBe('%PDF-1.4');
    expect(res.body.toString('latin1')).toContain('$142.800 CLP');
  });

  test('CA-1 (Aliases y bordes): normaliza fancoil/vrf/ventana y retorna null ante motivos inválidos', () => {
    expect(normalizarCategoriaEquipo('Fancoil cielo')).toBe('ducto');
    expect(normalizarCategoriaEquipo('Sistema VRF central')).toBe('vrv');
    expect(normalizarCategoriaEquipo('Equipo Ventana')).toBe('split');
    expect(normalizarCategoriaEquipo(null)).toBeNull();
    expect(normalizarCategoriaEquipo('Equipo Desconocido XYZ')).toBeNull();
    expect(formatearCLP(NaN)).toBe('Sin estimacion');
    expect(formatearCLP(undefined)).toBe('Sin estimacion');

    expect(
      calcularCotizacionBorrador({
        tipo_solicitud: 'ServicioInexistente',
        equipo_tipo: 'Split',
      })
    ).toBeNull();

    expect(calcularCotizacionBorrador()).toBeNull();
    expect(
      calcularCotizacionBorrador({
        tipo_solicitud: 'Proyecto Comercial',
        equipo_tipo: 'Chiller',
      })
    ).toBeNull();
  });

  test('CA-2 (Kronos, tiempo < 3s y manejo de errores 400/404/500 en GET /api/tickets/:id/pdf)', async () => {
    const t0 = Date.now();
    const pdfVerificado = generarFichaCotizacionPDF({
      id: 77,
      cliente_nombre: 'Empresa Austral',
      motivo_principal: 'Mantención',
      equipo_tipo: 'Split',
      equipo_marca: 'Midea',
      catalogo_verificado: true,
    });
    expect(Date.now() - t0).toBeLessThan(3000);
    const txt = pdfVerificado.toString('latin1').replace(/\\([()])/g, '$1');
    expect(txt).toContain('SI (Equipo verificado en catalogo)');
    expect(txt).toContain('$53.550 CLP');

    const badId = await request(app).get('/api/tickets/no_valido/pdf').set('Authorization', AUTH);
    expect(badId.status).toBe(400);

    db.getTicketById.mockResolvedValueOnce(null);
    const notFound = await request(app).get('/api/tickets/9999/pdf').set('Authorization', AUTH);
    expect(notFound.status).toBe(404);

    db.getTicketById.mockRejectedValueOnce(new Error('Falla transitoria BD'));
    const serverErr = await request(app).get('/api/tickets/15/pdf').set('Authorization', AUTH);
    expect(serverErr.status).toBe(500);
  });

  test('CA-3 (Excepción proyectos complejos y [dato por confirmar]): emite Ficha Técnica de Levantamiento sin precios inventados', () => {
    const pdfProyecto = generarFichaCotizacionPDF(
      db.normalizarTicketRow({
        id: 88,
        nombre_completo: 'Mall Plaza Sur',
        motivo_principal: 'Proyecto Comercial',
        equipo_tipo: 'Chiller',
        equipo_marca: 'Trane',
      })
    ).toString('latin1');

    expect(pdfProyecto).toContain('FICHA TECNICA DE LEVANTAMIENTO');
    expect(pdfProyecto).toContain('Valor sujeto a evaluacion y visita tecnica por ejecutivo comercial');
    expect(pdfProyecto).not.toContain('$450.000 CLP');
    expect(pdfProyecto).not.toContain('Subtotal Neto Estimado');

    const pdfPorConfirmar = generarFichaCotizacionPDF(
      db.normalizarTicketRow({
        id: 89,
        nombre_completo: 'Juan Pérez',
        motivo_principal: 'Falla Técnica',
        equipo_tipo: '[dato por confirmar]',
        equipo_marca: '[dato por confirmar]',
      })
    ).toString('latin1');

    expect(pdfPorConfirmar).toContain('FICHA TECNICA DE LEVANTAMIENTO');
    expect(pdfPorConfirmar).toContain('Valor sujeto a evaluacion y visita tecnica por ejecutivo comercial');
  });

  test('CA-4 (Unitaria + Integración WhatsApp): inyecta valor referencial y contacto comercial al confirmar solicitud', async () => {
    expect(enriquecerRespuestaConCotizacion(null)).toBe('');
    expect(enriquecerRespuestaConCotizacion('', { _noPersistir: false })).toBe('');
    expect(
      enriquecerRespuestaConCotizacion('Hola', { _noPersistir: true, cliente_nombre: 'Ana', sucursal_comuna: 'Ñuñoa' })
    ).toBe('Hola');
    expect(
      enriquecerRespuestaConCotizacion('Confirmado', {
        tipo_solicitud: 'Mantención',
        equipo_tipo: 'Split',
        cliente_nombre: 'Ana',
        sucursal_comuna: 'Ñuñoa',
      })
    ).toContain('$53.550 CLP');

    // Pipeline completo POST /webhooks/meta → Arnés → DB → WhatsApp con estimación CLP + contacto
    db.guardarCasoTriage.mockResolvedValueOnce(321);
    extraerFichaTriage.mockResolvedValueOnce({
      tipo_solicitud: 'Mantención',
      cliente_nombre: 'Camila Rojas',
      sucursal_comuna: 'Providencia',
      sucursal_direccion: 'Av. Suecia 450',
      equipo_tipo: 'Split',
      equipo_marca: 'Samsung',
      sintoma_observacion: 'Mantención anual preventiva',
      prioridad: 'Normal',
      disponibilidad_cliente: 'Viernes AM',
      tiene_fotos: false,
      requiere_derivacion: true,
      opciones_botones: [],
      respuesta_cliente: 'Hemos registrado tu solicitud en InterChile.',
    });

    const bodyOk = {
      object: 'whatsapp_business_account',
      entry: [{
        changes: [{
          value: {
            contacts: [{ wa_id: '56944445555' }],
            messages: [{ type: 'text', text: { body: 'Confirmo mantención Split Samsung en Providencia' } }],
          },
        }],
      }],
    };
    const { raw, sig } = firmarWebhook(bodyOk);
    const resOk = await request(app)
      .post('/webhooks/meta')
      .set('Content-Type', 'application/json')
      .set('x-hub-signature-256', sig)
      .send(raw);

    expect(resOk.status).toBe(200);
    expect(enviarMensajeWhatsApp).toHaveBeenCalledTimes(1);
    const textoEnviado = enviarMensajeWhatsApp.mock.calls[0][1];
    expect(textoEnviado).toContain('Folio #321');
    expect(textoEnviado).toContain('$53.550 CLP');
    expect(textoEnviado).toContain('Benjamin@interchileclima.cl');

    // Caso Proyecto Comercial / dato por confirmar: NO inventa monto CLP y avisa evaluación comercial
    jest.clearAllMocks();
    db.guardarCasoTriage.mockResolvedValueOnce(322);
    extraerFichaTriage.mockResolvedValueOnce({
      tipo_solicitud: 'Proyecto Comercial',
      cliente_nombre: 'Constructora Norte',
      sucursal_comuna: 'Las Condes',
      sucursal_direccion: '',
      equipo_tipo: 'Chiller',
      equipo_marca: 'MarcaInventada',
      sintoma_observacion: 'Climatización edificio 6 pisos',
      prioridad: 'Normal',
      disponibilidad_cliente: 'Lunes',
      tiene_fotos: false,
      requiere_derivacion: true,
      opciones_botones: [],
      respuesta_cliente: 'Tu requerimiento comercial fue ingresado.',
    });

    const { raw: rawProy, sig: sigProy } = firmarWebhook(bodyOk);
    const resProy = await request(app)
      .post('/webhooks/meta')
      .set('Content-Type', 'application/json')
      .set('x-hub-signature-256', sigProy)
      .send(rawProy);

    expect(resProy.status).toBe(200);
    const textoProy = enviarMensajeWhatsApp.mock.calls[0][1];
    expect(textoProy).toContain('Valor sujeto a evaluación y visita técnica por ejecutivo comercial');
    expect(textoProy).toContain('Benjamin@interchileclima.cl');
    expect(textoProy).not.toContain('Total estimado $');
  });
});

// ============================================================================
// 2. [INT-HU-19] (AAI-90) + KRON2-152: Contrato Bot↔Kronos, Paginación y Estados
// ============================================================================
describe('[INT-HU-19] (AAI-90) & KRON2-152 — Seguridad Bearer, Paginación Cursor y PATCH 409', () => {
  test('Bloquea con 503 si TRIAGE_API_TOKEN no está configurado o reutiliza el token de Meta', async () => {
    delete process.env.TRIAGE_API_TOKEN;
    const res1 = await request(app).get('/api/tickets').set('Authorization', AUTH);
    expect(res1.status).toBe(503);

    process.env.TRIAGE_API_TOKEN = process.env.META_VERIFY_TOKEN;
    const res2 = await request(app)
      .get('/api/tickets')
      .set('Authorization', `Bearer ${process.env.META_VERIFY_TOKEN}`);
    expect(res2.status).toBe(503);
  });

  test('normalizarTicketRow mapea nombre_completo -> cliente_nombre y deja null los campos no disponibles', () => {
    const norm = db.normalizarTicketRow({
      id: 7,
      created_at: '2026-11-09T10:00:00.000Z',
      nombre_completo: 'Empresa Norte',
      telefono: '56912345678',
      motivo_principal: 'Falla Técnica',
      prioridad_sugerida: 'Alta',
      requiere_humano: 1,
      estado: 'derivado',
    });

    expect(norm).toEqual({
      id: 7,
      created_at: '2026-11-09T10:00:00.000Z',
      updated_at: '2026-11-09T10:00:00.000Z',
      cliente_nombre: 'Empresa Norte',
      nombre_completo: 'Empresa Norte',
      telefono: '56912345678',
      sucursal_comuna: null,
      sucursal_direccion: null,
      motivo_principal: 'Falla Técnica',
      equipo_tipo: null,
      equipo_marca: null,
      sintoma_observacion: null,
      prioridad_sugerida: 'Alta',
      requiere_humano: true,
      estado: 'derivado',
      fecha_visita: null,
      cotizacion_neto: null,
      cotizacion_iva: null,
      cotizacion_total: null,
      catalogo_verificado: false,
    });
  });

  test('GET /api/tickets soporta paginación con limit (1-50) y cursor estable updated_at+id', async () => {
    const cursor = db.encodeCursor('2026-11-09T15:00:00.000Z', 20);
    db.getTicketsPaginados.mockResolvedValue({
      data: [{ id: 19, updated_at: '2026-11-09T14:59:00.000Z', cliente_nombre: 'Cliente 19' }],
      nextCursor: db.encodeCursor('2026-11-09T14:59:00.000Z', 19),
    });

    const res = await request(app)
      .get(`/api/tickets?limit=10&cursor=${encodeURIComponent(cursor)}`)
      .set('Authorization', AUTH);

    expect(res.status).toBe(200);
    expect(db.getTicketsPaginados).toHaveBeenCalledWith({ limit: 10, cursor });
    expect(res.body.ok).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.nextCursor).toBeTruthy();

    // Limit fuera de rango (ej. 99) -> 400
    const badLimit = await request(app)
      .get('/api/tickets?limit=99')
      .set('Authorization', AUTH);
    expect(badLimit.status).toBe(400);

    // Cursor corrupto -> 400
    const badCursor = await request(app)
      .get('/api/tickets?cursor=cursor_invalido_sin_fecha')
      .set('Authorization', AUTH);
    expect(badCursor.status).toBe(400);
  });

  test('GET /api/tickets/:id devuelve 200 con el detalle o 404 si no existe', async () => {
    db.getTicketById.mockResolvedValueOnce({ id: 8, cliente_nombre: 'Ana', estado: 'en_proceso' });
    const okRes = await request(app).get('/api/tickets/8').set('Authorization', AUTH);
    expect(okRes.status).toBe(200);
    expect(okRes.body.data.cliente_nombre).toBe('Ana');

    db.getTicketById.mockResolvedValueOnce(null);
    const notFoundRes = await request(app).get('/api/tickets/999').set('Authorization', AUTH);
    expect(notFoundRes.status).toBe(404);
  });

  test('PATCH /api/tickets/:id exige fecha_visita al agendar y retorna 409 ante versión antigua', async () => {
    // 1. Falta fecha_visita al pasar a agendado -> 400
    db.actualizarEstadoTicket.mockResolvedValueOnce({
      ok: false,
      status: 400,
      error: 'missing_fecha_visita',
      message: 'El campo fecha_visita (ISO UTC) es obligatorio al pasar al estado agendado',
    });

    const res400 = await request(app)
      .patch('/api/tickets/12')
      .set('Authorization', AUTH)
      .send({ estado: 'agendado' });
    expect(res400.status).toBe(400);

    // 2. Conflicto de versión (expected_updated_at antiguo) -> 409
    db.actualizarEstadoTicket.mockResolvedValueOnce({
      ok: false,
      status: 409,
      error: 'conflict',
      message: 'Conflicto de versión: el ticket fue modificado recientemente',
      current: { id: 12, estado: 'resuelto', updated_at: '2026-11-09T16:00:00.000Z' },
    });

    const res409 = await request(app)
      .patch('/api/tickets/12')
      .set('Authorization', AUTH)
      .send({
        estado: 'agendado',
        fecha_visita: '2026-11-12T14:00:00.000Z',
        expected_updated_at: '2026-11-09T15:00:00.000Z',
      });
    expect(res409.status).toBe(409);
    expect(res409.body.code).toBe('conflict');

    // 3. Actualización exitosa a agendado con fecha_visita ISO UTC -> 200
    db.actualizarEstadoTicket.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: {
        id: 12,
        estado: 'agendado',
        fecha_visita: '2026-11-12T14:00:00.000Z',
        updated_at: '2026-11-09T16:10:00.000Z',
      },
    });

    const res200 = await request(app)
      .patch('/api/tickets/12')
      .set('Authorization', AUTH)
      .send({
        estado: 'agendado',
        fecha_visita: '2026-11-12T14:00:00.000Z',
        expected_updated_at: '2026-11-09T16:00:00.000Z',
      });
    expect(res200.status).toBe(200);
    expect(res200.body.data.estado).toBe('agendado');
    expect(res200.body.data.fecha_visita).toBe('2026-11-12T14:00:00.000Z');
  });
});

// ============================================================================
// 3. KRON2-152: Contrato de Catálogo Remoto (`GET /api/kronos/catalogo`)
// ============================================================================
describe('KRON2-152 — Validación contra GET /api/kronos/catalogo y distinción de respaldo local', () => {
  test('Sin catálogo remoto configurado, usa respaldo local pero marca catalogo_verificado=false', async () => {
    const resMarca = await validarMarca('Samsung');
    expect(resMarca.existe).toBe(true);
    expect(resMarca.source).toBe('local_fallback');
    expect(resMarca.catalogo_verificado).toBe(false);

    const resArnes = await validarFichaConKronos({
      tipo_solicitud: 'Mantención',
      equipo_marca: 'Samsung',
      equipo_tipo: 'Split',
      sintoma_observacion: 'Limpieza normal',
    });
    expect(resArnes.valido).toBe(true);
    expect(resArnes.catalogo_verificado).toBe(false);
    expect(resArnes.fichaCorregida.catalogo_verificado).toBe(false);
  });

  test('Cuando Kronos responde { available: false, source: "kronos" }, marca "[dato por confirmar]" y catalogo_verificado=false', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        available: false,
        source: 'kronos',
        marcas: [],
        modelos: [],
        tipos: [],
        repuestos: [],
      }),
    });

    configurarClienteKronos({
      baseUrl: 'https://kronos.interchile.local',
      token: 'token_catalogo_kronos',
      fetchImpl: mockFetch,
    });

    const resultado = await validarFichaConKronos({
      tipo_solicitud: 'Falla Técnica',
      equipo_marca: 'Samsung',
      equipo_tipo: 'Split',
      sintoma_observacion: 'No enfría',
    });

    expect(mockFetch).toHaveBeenCalled();
    expect(resultado.valido).toBe(false);
    expect(resultado.catalogo_verificado).toBe(false);
    expect(resultado.fichaCorregida.equipo_marca).toBe('[dato por confirmar]');
    expect(resultado.fichaCorregida.equipo_tipo).toBe('[dato por confirmar]');
    expect(resultado.fichaCorregida.catalogo_verificado).toBe(false);
  });

  test('Cuando el catálogo de Kronos sufre timeout, marca "[dato por confirmar]" y catalogo_verificado=false', async () => {
    const slowFetch = jest.fn().mockImplementation((_url, options) => {
      return new Promise((_resolve, reject) => {
        if (options?.signal) {
          options.signal.addEventListener('abort', () => {
            const err = new Error('The operation was aborted');
            err.name = 'AbortError';
            reject(err);
          });
        }
      });
    });

    configurarClienteKronos({
      baseUrl: 'https://kronos.interchile.local',
      token: 'token_catalogo_kronos',
      timeoutMs: 40,
      fetchImpl: slowFetch,
    });

    const resultado = await validarFichaConKronos({
      tipo_solicitud: 'Mantención',
      equipo_marca: 'Daikin',
      equipo_tipo: 'Cassette',
      sintoma_observacion: 'Ruido en turbina',
    });

    expect(resultado.valido).toBe(false);
    expect(resultado.catalogo_verificado).toBe(false);
    expect(resultado.fichaCorregida.equipo_marca).toBe('[dato por confirmar]');
    expect(resultado.fichaCorregida.equipo_tipo).toBe('[dato por confirmar]');
  });

  test('Cuando Kronos responde catálogo oficial activo (available: true), distingue dato oficial (catalogo_verificado=true) de desconocido', async () => {
    const officialFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        available: true,
        source: 'kronos',
        marcas: ['daikin', 'mitsubishi'],
        modelos: ['vrv'],
        tipos: ['cassette', 'split'],
        repuestos: ['compresor'],
      }),
    });

    configurarClienteKronos({
      baseUrl: 'https://kronos.interchile.local',
      token: 'token_catalogo_kronos',
      fetchImpl: officialFetch,
    });

    // Caso 1: Marca y tipo presentes en catálogo oficial Kronos -> catalogo_verificado = true
    const okRes = await validarFichaConKronos({
      tipo_solicitud: 'Mantención',
      equipo_marca: 'Daikin',
      equipo_tipo: 'Cassette',
      sintoma_observacion: 'Revisión anual',
    });
    expect(okRes.valido).toBe(true);
    expect(okRes.catalogo_verificado).toBe(true);
    expect(okRes.fichaCorregida.catalogo_verificado).toBe(true);

    // Caso 2: Marca que existe en respaldo local ("Anwo") pero NO en el catálogo oficial Kronos -> por confirmar
    const unknownInOfficial = await validarFichaConKronos({
      tipo_solicitud: 'Mantención',
      equipo_marca: 'Anwo',
      equipo_tipo: 'Split',
      sintoma_observacion: 'Revisión anual',
    });
    expect(unknownInOfficial.valido).toBe(false);
    expect(unknownInOfficial.catalogo_verificado).toBe(false);
    expect(unknownInOfficial.fichaCorregida.equipo_marca).toBe('[dato por confirmar]');
  });
});

// ============================================================================
// 4. [INT-HU-22] (AAI-94): Monitoreo de Métricas de Calidad y SLA
// ============================================================================
describe('[INT-HU-22] (AAI-94) — Métricas de Calidad y Cumplimiento de SLA', () => {
  test('GET /api/metricas retorna latencia promedio (< 4000 ms), intercepción del arnés y conteo por estados', async () => {
    registrarLatencia(420);
    registrarLatencia(580);
    await validarFichaConKronos({
      tipo_solicitud: 'Falla Técnica',
      equipo_marca: 'MarcaInventadaXYZ',
      equipo_tipo: 'Split',
      sintoma_observacion: 'Falla',
    });

    db.getTicketsDashboard.mockResolvedValue([
      { id: 1, estado: 'en_proceso' },
      { id: 2, estado: 'agendado' },
      { id: 3, estado: 'resuelto' },
    ]);

    const res = await request(app).get('/api/metricas').set('Authorization', AUTH);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.sla.latencia_promedio_ms).toBe(500);
    expect(res.body.data.sla.cumple_sla).toBe(true);
    expect(res.body.data.arnes.total_validaciones).toBe(1);
    expect(res.body.data.arnes.alucinaciones_interceptadas).toBe(1);
    expect(res.body.data.tickets.por_estado).toEqual({
      en_proceso: 1,
      derivado: 0,
      agendado: 1,
      resuelto: 1,
    });
  });
});

// ============================================================================
// 5. [INT-HU-23] (AAI-98): Prueba de Estrés y Concurrencia (20 Usuarios Simultáneos)
// ============================================================================
describe('[INT-HU-23] (AAI-98) — Estrés y Concurrencia sobre 20 Usuarios Simultáneos', () => {
  test('Procesa 20 solicitudes concurrentes de WhatsApp con 100% éxito (>99%), 0 colisiones y latencia < 4.0s', async () => {
    extraerFichaTriage.mockImplementation(async (texto, telefono) => ({
      tipo_solicitud: 'Mantención',
      cliente_nombre: `Cliente_${telefono}`,
      sucursal_comuna: 'Santiago',
      sucursal_direccion: 'Av. Central 100',
      equipo_tipo: 'Split',
      equipo_marca: 'Samsung',
      sintoma_observacion: `Solicitud de ${telefono}: ${texto}`,
      prioridad: 'Normal',
      disponibilidad_cliente: 'Mañana',
      tiene_fotos: false,
      requiere_derivacion: false,
      opciones_botones: [],
      respuesta_cliente: `Confirmado para ${telefono}`,
    }));

    const N = 20;
    const inicio = Date.now();

    const promesas = Array.from({ length: N }, (_, idx) => {
      const telefono = `569900000${String(idx + 1).padStart(2, '0')}`;
      const body = {
        object: 'whatsapp_business_account',
        entry: [
          {
            changes: [
              {
                value: {
                  contacts: [{ wa_id: telefono }],
                  messages: [{ type: 'text', text: { body: `Mensaje concurrente #${idx + 1}` } }],
                },
              },
            ],
          },
        ],
      };
      const { raw, sig } = firmarWebhook(body);
      return request(app)
        .post('/webhooks/meta')
        .set('Content-Type', 'application/json')
        .set('x-hub-signature-256', sig)
        .send(raw);
    });

    const respuestas = await Promise.all(promesas);
    const duracionTotalMs = Date.now() - inicio;
    const promedioPorRequestMs = duracionTotalMs / N;

    const exitosas = respuestas.filter(r => r.status === 200);
    expect(exitosas).toHaveLength(N); // 100% éxito (> 99%)
    expect(promedioPorRequestMs).toBeLessThan(4000); // < 4.0s SLA

    // Verificar aislamiento de sesión (20 teléfonos distintos persistidos sin colisión)
    expect(db.guardarCasoTriage).toHaveBeenCalledTimes(N);
    const telefonosPersistidos = new Set(db.guardarCasoTriage.mock.calls.map(call => call[1]));
    expect(telefonosPersistidos.size).toBe(N);
  });
});
