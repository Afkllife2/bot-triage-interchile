/**
 * test/db-contrato.test.js
 *
 * Pruebas unitarias de la capa de persistencia `src/db.js` (KRON2-152 + Sprint 3):
 * - Inmutabilidad de `created_at` y actualización de `updated_at` en `guardarCasoTriage`.
 * - Paginación por cursor estable `updated_at+id` en `getTicketsPaginados` (2 páginas sintéticas).
 * - Control de concurrencia optimista (`409 Conflict`) y obligatoriedad de `fecha_visita` en `actualizarEstadoTicket`.
 */

const mockQuery = jest.fn();
const mockRelease = jest.fn();

jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue({
      query: mockQuery,
      release: mockRelease,
    }),
  })),
}));

const db = require('../src/db');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Capa de Datos `src/db.js` — Contrato KRON2-152 y Sprint 3', () => {
  test('guardarCasoTriage conserva created_at inmutable al actualizar un caso existente y actualiza updated_at', async () => {
    mockQuery
      .mockResolvedValueOnce({}) // ensureSchema (o BEGIN si ya corrió)
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({ rows: [{ id: 10 }] }) // SELECT cliente
      .mockResolvedValueOnce({}) // UPDATE cliente nombre
      .mockResolvedValueOnce({ rows: [{ id: 55 }] }) // SELECT caso activo en_proceso
      .mockResolvedValueOnce({ rows: [{ id: 55 }] }) // UPDATE casos_triage
      .mockResolvedValueOnce({}); // COMMIT

    const casoId = await db.guardarCasoTriage(
      {
        tipo_solicitud: 'Mantención',
        cliente_nombre: 'Pedro Rojas',
        equipo_tipo: 'Split',
        equipo_marca: 'Samsung',
        sintoma_observacion: 'Mantención anual',
        prioridad: 'Normal',
        catalogo_verificado: false,
      },
      '56955554444'
    );

    expect(casoId).toBe(55);
    const sqlQueries = mockQuery.mock.calls.map(c => String(c[0]));
    const updateQuery = sqlQueries.find(q => q.includes('UPDATE casos_triage'));
    expect(updateQuery).toBeDefined();
    expect(updateQuery).toContain('updated_at = CURRENT_TIMESTAMP');
    expect(updateQuery).not.toContain('created_at = CURRENT_TIMESTAMP');
  });

  test('getTicketsPaginados recorre dos páginas de tickets sintéticos con cursor updated_at+id sin duplicados', async () => {
    const page1Rows = [
      {
        id: 3,
        created_at: '2026-11-09T10:00:00.000Z',
        updated_at: '2026-11-09T12:00:00.000Z',
        nombre_completo: 'Cliente 3',
        telefono: '56900000003',
        motivo_principal: 'Falla Técnica',
        prioridad_sugerida: 'Alta',
        requiere_humano: false,
        estado: 'en_proceso',
      },
      {
        id: 2,
        created_at: '2026-11-09T09:00:00.000Z',
        updated_at: '2026-11-09T11:00:00.000Z',
        cursor_updated_at: '2026-11-09T11:00:00.000789Z',
        nombre_completo: 'Cliente 2',
        telefono: '56900000002',
        motivo_principal: 'Mantención',
        prioridad_sugerida: 'Normal',
        requiere_humano: false,
        estado: 'en_proceso',
      },
      // Fila extra (limit + 1) que indica que hay página siguiente
      {
        id: 1,
        created_at: '2026-11-09T08:00:00.000Z',
        updated_at: '2026-11-09T10:00:00.000Z',
        nombre_completo: 'Cliente 1',
        telefono: '56900000001',
        motivo_principal: 'Instalación',
        prioridad_sugerida: 'Baja',
        requiere_humano: false,
        estado: 'resuelto',
      },
    ];

    mockQuery.mockResolvedValueOnce({ rows: page1Rows });
    const page1 = await db.getTicketsPaginados({ limit: 2 });

    expect(page1.data).toHaveLength(2);
    expect(page1.data.map(r => r.id)).toEqual([3, 2]);
    expect(page1.nextCursor).toBeTruthy();

    // Página 2 usando nextCursor
    mockQuery.mockResolvedValueOnce({ rows: [page1Rows[2]] });
    const page2 = await db.getTicketsPaginados({ limit: 2, cursor: page1.nextCursor });
    expect(mockQuery.mock.calls.at(-1)[1]).toEqual(['2026-11-09T11:00:00.000789Z', 2, 3]);

    expect(page2.data).toHaveLength(1);
    expect(page2.data[0].id).toBe(1);
    expect(page2.nextCursor).toBeNull();
  });

  test('actualizarEstadoTicket detecta conflicto 409 cuando expected_updated_at no coincide y exige fecha_visita al agendar', async () => {
    // 1. Sin fecha_visita al agendar -> 400 sin tocar BD
    const sinFecha = await db.actualizarEstadoTicket(10, { estado: 'agendado' });
    expect(sinFecha.status).toBe(400);
    expect(sinFecha.error).toBe('missing_fecha_visita');

    // 2. Con expected_updated_at desactualizado -> 409 Conflict
    mockQuery
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({
        rows: [
          {
            id: 10,
            created_at: '2026-11-09T10:00:00.000Z',
            updated_at: '2026-11-09T16:30:00.000Z',
            nombre_completo: 'Empresa Sur',
            estado: 'en_proceso',
          },
        ],
      })
      .mockResolvedValueOnce({}); // ROLLBACK

    const conflicto = await db.actualizarEstadoTicket(10, {
      estado: 'agendado',
      fecha_visita: '2026-11-15T14:00:00.000Z',
      expected_updated_at: '2026-11-09T15:00:00.000Z',
    });

    expect(conflicto.status).toBe(409);
    expect(conflicto.error).toBe('conflict');
    expect(conflicto.current.updated_at).toBe('2026-11-09T16:30:00.000Z');
  });

  test('actualizarEstadoTicket valida ID/estado/fecha (400/404) y persiste transición agendado (200)', async () => {
    const badId = await db.actualizarEstadoTicket('abc', { estado: 'en_proceso' });
    expect(badId.status).toBe(400);
    expect(badId.error).toBe('invalid_id');

    const badState = await db.actualizarEstadoTicket(10, { estado: 'estado_falso' });
    expect(badState.status).toBe(400);
    expect(badState.error).toBe('invalid_state');

    const badDate = await db.actualizarEstadoTicket(10, { estado: 'agendado', fecha_visita: 'fecha-mala' });
    expect(badDate.status).toBe(400);
    expect(badDate.error).toBe('invalid_fecha_visita');

    // Ticket inexistente -> 404 + ROLLBACK
    mockQuery
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({ rows: [] }) // SELECT FOR UPDATE vacío
      .mockResolvedValueOnce({}); // ROLLBACK
    const notFound = await db.actualizarEstadoTicket(999, { estado: 'resuelto' });
    expect(notFound.status).toBe(404);
    expect(notFound.error).toBe('not_found');

    // Transición exitosa normalizando mayúsculas/espacios (' Agendado ') -> 200
    const updatedRow = {
      id: 10,
      created_at: '2026-11-09T10:00:00.000Z',
      updated_at: '2026-11-16T14:00:00.000Z',
      nombre_completo: 'Empresa Sur',
      estado: 'agendado',
      fecha_visita: '2026-11-18T14:30:00.000Z',
    };
    mockQuery
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({
        rows: [{
          ...updatedRow,
          estado: 'en_proceso',
          fecha_visita: null,
          updated_at: '2026-11-09T12:00:00.000Z',
        }],
      })
      .mockResolvedValueOnce({}) // UPDATE casos_triage
      .mockResolvedValueOnce({ rows: [updatedRow] }) // SELECT actualizado
      .mockResolvedValueOnce({}); // COMMIT

    const okRes = await db.actualizarEstadoTicket(10, {
      estado: ' Agendado ',
      fecha_visita: '2026-11-18T14:30:00.000Z',
      expected_updated_at: '2026-11-09T12:00:00.000Z',
    });

    expect(okRes.status).toBe(200);
    expect(okRes.ok).toBe(true);
    expect(okRes.data.estado).toBe('agendado');
    expect(okRes.data.fecha_visita).toBe('2026-11-18T14:30:00.000Z');
  });

  test('[INT-HU-23] crearReservaReunion valida entrada (400), bloquea topón FOR UPDATE/23505 (409) y crea reserva (201)', async () => {
    const missNombre = await db.crearReservaReunion({ fecha_reunion: '2026-12-01', hora_reunion: '10:00' });
    expect(missNombre.status).toBe(400);

    const badFecha = await db.crearReservaReunion({
      cliente_nombre: 'Clinica',
      fecha_reunion: '2026-02-30',
      hora_reunion: '10:00',
    });
    expect(badFecha.status).toBe(400);

    const badHora = await db.crearReservaReunion({
      cliente_nombre: 'Clinica',
      fecha_reunion: '2026-12-01',
      hora_reunion: '22:00',
    });
    expect(badHora.status).toBe(400);

    const badMod = await db.crearReservaReunion({
      cliente_nombre: 'Clinica',
      fecha_reunion: '2026-12-01',
      hora_reunion: '10:00',
      modalidad: 'Telepatia',
    });
    expect(badMod.status).toBe(400);

    // 1era llamada ejecuta ensureReunionesSchema + BEGIN + SELECT cliente + FOR UPDATE (ocupado -> 409)
    mockQuery
      .mockResolvedValueOnce({}) // ensureReunionesSchema (corre 1 vez)
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({ rows: [{ id: 8 }] }) // SELECT cliente existente
      .mockResolvedValueOnce({ rows: [{ hora_reunion: '10:00' }] }) // SELECT FOR UPDATE ocupado
      .mockResolvedValueOnce({}); // ROLLBACK

    const topon = await db.crearReservaReunion({
      cliente_nombre: 'Clinica Test',
      telefono: '56912345678',
      fecha_reunion: '2026-12-01',
      hora_reunion: '10',
      modalidad: 'Presencial',
      origen: 'whatsapp',
    });
    expect(topon.status).toBe(409);
    expect(topon.codigo).toBe('HORARIO_OCUPADO');
    expect(topon.sugerencias).toEqual(['09:00', '11:00', '12:00']);

    // Colisión concurrente SQLSTATE 23505
    const err23505 = new Error('duplicate key value violates unique constraint');
    err23505.code = '23505';
    mockQuery
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({ rows: [] }) // SELECT cliente no existe
      .mockResolvedValueOnce({ rows: [{ id: 15 }] }) // INSERT cliente
      .mockResolvedValueOnce({ rows: [] }) // FOR UPDATE vacío en race
      .mockRejectedValueOnce(err23505) // INSERT public.reuniones choca 23505
      .mockResolvedValueOnce({}); // ROLLBACK

    const race409 = await db.crearReservaReunion({
      cliente_nombre: 'Clinica Race',
      telefono: '56999887766',
      fecha_reunion: '2026-12-01',
      hora_reunion: '11:00',
      modalidad: 'Online',
    });
    expect(race409.status).toBe(409);
    expect(race409.codigo).toBe('HORARIO_OCUPADO');

    // Creación exitosa (201)
    mockQuery
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({ rows: [{ hora_reunion: '10:00' }] }) // sin teléfono, directo a FOR UPDATE
      .mockResolvedValueOnce({
        rows: [{
          id: 42,
          cliente_id: null,
          cliente_nombre: 'Hotel Regal',
          telefono: null,
          fecha_reunion: '2026-12-02',
          hora_reunion: '15:00',
          modalidad: 'Online',
          motivo: 'Cotización VRF',
          origen: 'dashboard',
          estado: 'confirmada',
          created_at: '2026-11-23T01:00:00.000Z',
          updated_at: '2026-11-23T01:00:00.000Z',
        }],
      })
      .mockResolvedValueOnce({}); // COMMIT

    const okCrear = await db.crearReservaReunion({
      cliente_nombre: 'Hotel Regal',
      fecha_reunion: '2026-12-02',
      hora_reunion: '15:00',
      modalidad: 'zoom',
      motivo: 'Cotización VRF',
    });
    expect(okCrear.status).toBe(201);
    expect(okCrear.data).toMatchObject({
      id: 42,
      fecha_reunion: '2026-12-02',
      hora_reunion: '15:00',
      modalidad: 'Online',
      origen: 'dashboard',
      estado: 'confirmada',
    });
  });

  test('[INT-HU-23] listarReuniones y actualizarEstadoReunion validan entrada, disponibilidad y transiciones', async () => {
    const badList = await db.listarReuniones({ fecha: 'no-fecha' });
    expect(badList.status).toBe(400);

    mockQuery
      .mockResolvedValueOnce({
        rows: [{
          id: 1,
          cliente_id: 2,
          cliente_nombre: 'Clinica Sur',
          telefono: '56911112222',
          fecha_reunion: new Date('2026-12-01T00:00:00.000Z'),
          hora_reunion: '10:00',
          modalidad: 'Presencial',
          motivo: 'Evaluación Chiller',
          origen: 'whatsapp',
          estado: 'confirmada',
        }],
      })
      .mockResolvedValueOnce({ rows: [{ hora_reunion: '10:00' }] });

    const listado = await db.listarReuniones({ fecha: '2026-12-01', todos: true });
    expect(listado.status).toBe(200);
    expect(listado.data).toHaveLength(1);
    expect(listado.disponibilidad.ocupados).toEqual(['10:00']);
    expect(listado.disponibilidad.disponibles).not.toContain('10:00');

    expect((await db.actualizarEstadoReunion('abc', { estado: 'cancelada' })).status).toBe(400);
    expect((await db.actualizarEstadoReunion(1, { estado: 'inventado' })).status).toBe(400);

    mockQuery.mockResolvedValueOnce({ rows: [] });
    expect((await db.actualizarEstadoReunion(999, { estado: 'cancelada' })).status).toBe(404);

    mockQuery.mockResolvedValueOnce({
      rows: [{
        id: 1,
        fecha_reunion: '2026-12-01',
        hora_reunion: '10:00',
        modalidad: 'Presencial',
        origen: 'whatsapp',
        estado: 'cancelada',
      }],
    });
    const upd = await db.actualizarEstadoReunion(1, { estado: 'Cancelada' });
    expect(upd.status).toBe(200);
    expect(upd.data.estado).toBe('cancelada');
  });
});
