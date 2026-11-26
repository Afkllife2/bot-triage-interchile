/**
 * src/agenda.js
 *
 * Lógica determinista de validación de agenda, bloques horarios y prevención de topones
 * para reuniones comerciales con Benjamín Yáñez ([INT-HU-23] / AAI-102).
 */

const BLOQUES_HORARIOS_BENJAMIN = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
];

const MODALIDADES_VALIDAS = new Set(['Presencial', 'Online']);
const ESTADOS_REUNION_VALIDOS = new Set([
  'ingresada',
  'confirmada',
  'reagendada',
  'cancelada',
  'completada',
]);

/**
 * Obtiene la fecha actual en zona horaria de Chile (`America/Santiago`) en formato `YYYY-MM-DD`.
 */
function fechaHoyChile(now = new Date()) {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Santiago',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);
  } catch (_) {
    return now.toISOString().slice(0, 10);
  }
}

/**
 * Valida estrictamente formato calendario `YYYY-MM-DD`.
 */
function normalizarFechaReunion(valor) {
  if (typeof valor !== 'string') return null;
  const trimmed = valor.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const dt = new Date(Date.UTC(year, month - 1, day));
  if (
    dt.getUTCFullYear() !== year ||
    dt.getUTCMonth() !== month - 1 ||
    dt.getUTCDate() !== day
  ) {
    return null;
  }
  return trimmed;
}

/**
 * Normaliza horas como "9", "9:00", "09:00", "15:30 hrs" a formato 24h `HH:mm`.
 * Acepta horario laboral 08:00–19:00 inclusive.
 */
function normalizarHoraReunion(valor) {
  if (typeof valor !== 'string') return null;
  const clean = valor.trim().toLowerCase().replace(/\s*(hrs?|horas?|h)\s*$/i, '').trim();
  const match = /^(\d{1,2})(?::(\d{2}))?$/.exec(clean);
  if (!match) return null;

  const hh = Number(match[1]);
  const mm = match[2] !== undefined ? Number(match[2]) : 0;
  if (!Number.isInteger(hh) || !Number.isInteger(mm)) return null;
  if (hh < 8 || hh > 19 || mm < 0 || mm > 59) return null;
  if (hh === 19 && mm > 0) return null;

  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

/**
 * Normaliza la modalidad a `Presencial` o `Online`.
 * Si `estricto` es true, retorna null frente a valores vacíos o desconocidos.
 */
function normalizarModalidad(valor, { estricto = false, defecto = 'Online' } = {}) {
  if (!valor || typeof valor !== 'string' || !valor.trim()) {
    return estricto ? null : defecto;
  }
  const low = valor.trim().toLowerCase();
  if (low.includes('presencial') || low.includes('oficina') || low.includes('terreno')) {
    return 'Presencial';
  }
  if (low.includes('online') || low.includes('virtual') || low.includes('meet') || low.includes('zoom') || low.includes('videollamada')) {
    return 'Online';
  }
  return estricto ? null : defecto;
}

function horaAMinutos(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

const DETALLE_ONLINE_DEFECTO = 'Google Meet (enlace se envía al confirmar)';
const DETALLE_PRESENCIAL_OFICINA = 'Oficina InterChile Clima SpA (Santiago)';
const DETALLE_PRESENCIAL_DEFECTO = 'Por confirmar dirección en terreno / Oficina InterChile';

/**
 * Construye el detalle operativo según la modalidad (`Online` -> enlace/plataforma; `Presencial` -> dirección o sede).
 */
function construirDetalleModalidad({
  modalidad,
  detalle_modalidad,
  direccion,
  comuna,
  usarDefectoPresencial = true,
} = {}) {
  const mod = normalizarModalidad(modalidad, { defecto: 'Online' });
  const rawDetalle = typeof detalle_modalidad === 'string' ? detalle_modalidad.trim() : '';
  if (rawDetalle) return rawDetalle;

  if (mod === 'Presencial') {
    const ubicacionCliente = [direccion, comuna]
      .map((v) => (typeof v === 'string' ? v.trim() : ''))
      .filter(Boolean)
      .join(', ');
    if (ubicacionCliente) return ubicacionCliente;
    return usarDefectoPresencial ? DETALLE_PRESENCIAL_DEFECTO : '';
  }

  return DETALLE_ONLINE_DEFECTO;
}

/**
 * Valida reglas específicas según modalidad: una reserva `Presencial` creada desde
 * Dashboard exige dirección en terreno o confirmación de Oficina InterChile.
 */
function validarDetalleModalidad({
  modalidad,
  detalle_modalidad,
  origen = 'dashboard',
  requerirDetallePresencial = false,
} = {}) {
  const mod = normalizarModalidad(modalidad, { defecto: 'Online' });
  const detalleTrim = typeof detalle_modalidad === 'string' ? detalle_modalidad.trim() : '';

  if (mod === 'Presencial' && (origen === 'dashboard' || requerirDetallePresencial)) {
    if (!detalleTrim || detalleTrim.length < 4 || detalleTrim === DETALLE_PRESENCIAL_DEFECTO) {
      return {
        ok: false,
        status: 400,
        error: 'missing_detalle_presencial',
        codigo: 'LUGAR_PRESENCIAL_REQUERIDO',
        message: 'Para una reunión Presencial debes indicar la dirección exacta en terreno o seleccionar Oficina InterChile.',
      };
    }
  }

  return {
    ok: true,
    detalle_modalidad: construirDetalleModalidad({
      modalidad: mod,
      detalle_modalidad: detalleTrim,
      usarDefectoPresencial: true,
    }),
  };
}

/**
 * Determina si una fecha `YYYY-MM-DD` cae en día hábil laboral (lunes=1 a viernes=5).
 */
function esDiaHabilReunion(fechaStr) {
  const norm = normalizarFechaReunion(fechaStr);
  if (!norm) return false;
  const [y, m, d] = norm.split('-').map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return dow >= 1 && dow <= 5;
}

/**
 * Retorna el próximo día hábil (`YYYY-MM-DD`) posterior a la fecha indicada.
 */
function siguienteDiaHabil(fechaStr) {
  const norm = normalizarFechaReunion(fechaStr) || fechaHoyChile();
  const [y, m, d] = norm.split('-').map(Number);
  const cursor = new Date(Date.UTC(y, m - 1, d));
  do {
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  } while (cursor.getUTCDay() === 0 || cursor.getUTCDay() === 6);
  return cursor.toISOString().slice(0, 10);
}

/**
 * Valida reglas operativas reales de la agenda de Benjamín Yáñez:
 * - Solo días hábiles (lunes a viernes).
 * - Sin fechas pasadas respecto a `hoy` (zona Chile).
 * - Exclusivamente dentro de `BLOQUES_HORARIOS_BENJAMIN` (09:00–12:00 y 14:00–18:00; 13:00 colación).
 */
function validarReglaHorarioBenjamin({ fecha, hora, hoy = null } = {}) {
  const fechaNorm = normalizarFechaReunion(String(fecha || ''));
  if (!fechaNorm) {
    return {
      ok: false,
      status: 400,
      error: 'invalid_fecha_reunion',
      codigo: 'FECHA_INVALIDA',
      message: 'El campo fecha_reunion debe tener formato YYYY-MM-DD válido',
    };
  }

  const hoyRef = hoy ? normalizarFechaReunion(String(hoy)) : fechaHoyChile();
  if (hoyRef && fechaNorm < hoyRef) {
    const proximo = esDiaHabilReunion(hoyRef) ? hoyRef : siguienteDiaHabil(hoyRef);
    return {
      ok: false,
      status: 400,
      error: 'fecha_pasada',
      codigo: 'FECHA_PASADA',
      proximo_dia_habil: proximo,
      sugerencias: ['09:00', '10:00', '11:00'],
      message: `No es posible agendar reuniones en fechas pasadas (${fechaNorm}). Próximo día hábil disponible: ${proximo}.`,
    };
  }

  if (!esDiaHabilReunion(fechaNorm)) {
    const proximo = siguienteDiaHabil(fechaNorm);
    return {
      ok: false,
      status: 400,
      error: 'dia_inhabil',
      codigo: 'DIA_INHABIL',
      proximo_dia_habil: proximo,
      sugerencias: ['09:00', '10:00', '11:00'],
      message: `Benjamín Yáñez atiende reuniones exclusivamente de lunes a viernes (09:00–12:00 y 14:00–18:00 hrs). El ${fechaNorm} es fin de semana; próximo día hábil: ${proximo}.`,
    };
  }

  const horaNorm = normalizarHoraReunion(String(hora || ''));
  if (!horaNorm || !BLOQUES_HORARIOS_BENJAMIN.includes(horaNorm)) {
    const rawMatch = /^(\d{1,2})(?::(\d{2}))?/.exec(String(hora || '').trim());
    const minSolicitado = rawMatch
      ? Math.min(Number(rawMatch[1]), 23) * 60 + Math.min(Number(rawMatch[2] || 0), 59)
      : 9 * 60;
    const sugs = [...BLOQUES_HORARIOS_BENJAMIN]
      .sort((a, b) => Math.abs(horaAMinutos(a) - minSolicitado) - Math.abs(horaAMinutos(b) - minSolicitado))
      .slice(0, 3);
    return {
      ok: false,
      status: 400,
      error: 'fuera_de_horario',
      codigo: 'FUERA_DE_HORARIO',
      sugerencias: sugs,
      message: `El horario solicitado (${String(hora || '').trim() || 'inválido'}) está fuera de los bloques de atención de Benjamín Yáñez (lunes a viernes de 09:00 a 12:00 y 14:00 a 18:00 hrs; 13:00 colación).`,
    };
  }

  return { ok: true, fecha: fechaNorm, hora: horaNorm };
}

/**
 * Calcula bloques disponibles y ocupados para una fecha determinada.
 */
function calcularDisponibilidadDia(fecha, horasOcupadas = []) {
  const ocupadosSet = new Set(
    (horasOcupadas || []).map((h) => normalizarHoraReunion(String(h)) || String(h))
  );
  const disponibles = BLOQUES_HORARIOS_BENJAMIN.filter((b) => !ocupadosSet.has(b));
  const ocupados = [...ocupadosSet].sort();

  return {
    fecha,
    bloques_totales: [...BLOQUES_HORARIOS_BENJAMIN],
    ocupados,
    disponibles,
  };
}

/**
 * Sugiere los bloques libres más cercanos en minutos a la hora solicitada (CA-3).
 */
function sugerirHorariosCercanos(horaSolicitada, horasOcupadas = [], max = 3) {
  const ocupadosSet = new Set(horasOcupadas || []);
  const normHora = normalizarHoraReunion(horaSolicitada) || '10:00';
  const targetMin = horaAMinutos(normHora);

  return BLOQUES_HORARIOS_BENJAMIN
    .filter((b) => !ocupadosSet.has(b) && b !== normHora)
    .sort((a, b) => Math.abs(horaAMinutos(a) - targetMin) - Math.abs(horaAMinutos(b) - targetMin))
    .slice(0, max);
}

/**
 * Redacta la confirmación o el aviso de horario ocupado para WhatsApp (CA-1 / CA-3).
 */
function construirMensajeReunionWhatsApp(respuestaBase, resultadoReserva, { fecha, hora, modalidad } = {}) {
  if (!resultadoReserva) return respuestaBase;

  if (resultadoReserva.ok && resultadoReserva.data) {
    const r = resultadoReserva.data;
    const estadoLegible = r.estado === 'confirmada'
      ? 'Confirmada'
      : 'Ingresada (pendiente de confirmación comercial)';
    const modNorm = normalizarModalidad(r.modalidad, { defecto: 'Online' });
    const detalleMod = construirDetalleModalidad({
      modalidad: modNorm,
      detalle_modalidad: r.detalle_modalidad,
      usarDefectoPresencial: true,
    });
    const lineasModalidad = modNorm === 'Presencial'
      ? [
          `• Modalidad: 📍 Presencial (Terreno / Oficina)`,
          `• Lugar / Dirección: ${detalleMod}`,
          `• Logística: Visita o reunión física (requiere confirmar traslado)`,
        ]
      : [
          `• Modalidad: 💻 Online (Videollamada)`,
          `• Acceso: ${detalleMod}`,
          `• Logística: Sesión remota sin traslado (30–45 min)`,
        ];
    const bloqueConfirmacion = [
      `📅 *Solicitud de reunión registrada con Benjamín Yáñez* (Reserva #R-${r.id})`,
      `• Estado: ${estadoLegible}`,
      `• Fecha: ${r.fecha_reunion} a las ${r.hora_reunion} hrs`,
      ...lineasModalidad,
      `• Contacto directo: Benjamin@interchileclima.cl / +56 9 9440 2632`,
    ].join('\n');

    const base = (respuestaBase || '').trim();
    return base ? `${base}\n\n${bloqueConfirmacion}` : bloqueConfirmacion;
  }

  if (resultadoReserva.status === 409) {
    const sugerencias = Array.isArray(resultadoReserva.sugerencias) ? resultadoReserva.sugerencias : [];
    const opcionesTxt = sugerencias.length > 0
      ? `Horarios disponibles más cercanos para el ${fecha}: ${sugerencias.map((h) => `${h} hrs`).join(', ')}.`
      : `No quedan bloques libres para el ${fecha}; por favor indícame otro día hábil.`;

    return (
      `⚠️ El horario ${fecha} a las ${hora} hrs (${modalidad || 'Online'}) con Benjamín Yáñez ya se encuentra ocupado.\n` +
      `${opcionesTxt}\n` +
      `Indícame cuál prefieres para registrar tu solicitud.`
    );
  }

  if (resultadoReserva.status === 400) {
    const detalle = resultadoReserva.message || 'El horario indicado está fuera de la jornada hábil de atención.';
    const sugerencias = Array.isArray(resultadoReserva.sugerencias) ? resultadoReserva.sugerencias : [];
    const diaSug = resultadoReserva.proximo_dia_habil || fecha || 'un día hábil';
    const sugTxt = sugerencias.length > 0
      ? `\nBloques disponibles sugeridos (${diaSug}): ${sugerencias.map((h) => `${h} hrs`).join(', ')}.`
      : '';

    return (
      `⚠️ No fue posible agendar la reunión para ${fecha || 'la fecha indicada'} a las ${hora || 'la hora indicada'}.\n` +
      `${detalle}${sugTxt}\n` +
      `Indícame qué día hábil (lunes a viernes) y bloque horario prefieres para dejar ingresada tu reunión.`
    );
  }

  return respuestaBase;
}

module.exports = {
  BLOQUES_HORARIOS_BENJAMIN,
  MODALIDADES_VALIDAS,
  ESTADOS_REUNION_VALIDOS,
  DETALLE_ONLINE_DEFECTO,
  DETALLE_PRESENCIAL_OFICINA,
  DETALLE_PRESENCIAL_DEFECTO,
  fechaHoyChile,
  normalizarFechaReunion,
  normalizarHoraReunion,
  normalizarModalidad,
  construirDetalleModalidad,
  validarDetalleModalidad,
  esDiaHabilReunion,
  siguienteDiaHabil,
  validarReglaHorarioBenjamin,
  calcularDisponibilidadDia,
  sugerirHorariosCercanos,
  construirMensajeReunionWhatsApp,
};
