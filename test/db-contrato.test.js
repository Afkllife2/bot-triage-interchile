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
});
