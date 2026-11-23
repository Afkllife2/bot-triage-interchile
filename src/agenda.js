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
const ESTADOS_REUNION_VALIDOS = new Set(['confirmada', 'reagendada', 'cancelada', 'completada']);

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
    const bloqueConfirmacion = [
      `📅 *Reunión agendada con Benjamín Yáñez* (Reserva #R-${r.id})`,
      `• Fecha: ${r.fecha_reunion} a las ${r.hora_reunion} hrs`,
      `• Modalidad: ${r.modalidad}`,
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
      `Indícame cuál prefieres para confirmar tu reserva.`
    );
  }

  return respuestaBase;
}

module.exports = {
  BLOQUES_HORARIOS_BENJAMIN,
  MODALIDADES_VALIDAS,
  ESTADOS_REUNION_VALIDOS,
  fechaHoyChile,
  normalizarFechaReunion,
  normalizarHoraReunion,
  normalizarModalidad,
  calcularDisponibilidadDia,
  sugerirHorariosCercanos,
  construirMensajeReunionWhatsApp,
};
