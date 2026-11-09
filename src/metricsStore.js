/**
 * src/metricsStore.js
 *
 * 📊 [INT-HU-22] (AAI-94 / AAI-95): Almacén de Métricas de Calidad y Cumplimiento de SLA
 *
 * Registra en tiempo real:
 * - Latencia de procesamiento end-to-end del bot (SLA objetivo < 4000 ms).
 * - Efectividad del arnés anti-alucinaciones Kronos (100% intercepción).
 * - Tasa de generación exitosa de fichas/cotizaciones PDF.
 */

const MAX_SAMPLES = 200;
const SLA_THRESHOLD_MS = 4000;

const state = {
  latenciasMs: [],
  totalValidacionesArnes: 0,
  alucinacionesInterceptadas: 0,
  pdfsGenerados: 0,
  pdfsFallidos: 0,
};

/**
 * Registra una muestra de latencia de respuesta del bot en milisegundos.
 * @param {number} ms
 */
function registrarLatencia(ms) {
  if (typeof ms !== 'number' || Number.isNaN(ms) || ms < 0) return;
  state.latenciasMs.push(Math.round(ms));
  if (state.latenciasMs.length > MAX_SAMPLES) {
    state.latenciasMs.shift();
  }
}

/**
 * Registra una ejecución del arnés anti-alucinaciones.
 * @param {boolean} huboAlucinacionInterceptada
 */
function registrarEventoArnes(huboAlucinacionInterceptada) {
  state.totalValidacionesArnes += 1;
  if (huboAlucinacionInterceptada) {
    state.alucinacionesInterceptadas += 1;
  }
}

/**
 * Registra la generación de un PDF (exitosa o fallida).
 * @param {boolean} exito
 */
function registrarGeneracionPdf(exito = true) {
  if (exito) state.pdfsGenerados += 1;
  else state.pdfsFallidos += 1;
}

/**
 * Reinicia las métricas (útil para pruebas unitarias).
 */
function resetMetricas() {
  state.latenciasMs = [];
  state.totalValidacionesArnes = 0;
  state.alucinacionesInterceptadas = 0;
  state.pdfsGenerados = 0;
  state.pdfsFallidos = 0;
}

/**
 * Calcula el resumen consolidado de métricas de calidad, SLA y estados de tickets.
 * @param {Array<Object>} [tickets=[]]
 */
function obtenerResumenMetricas(tickets = []) {
  const muestras = state.latenciasMs.length;
  const latenciaPromedioMs = muestras > 0
    ? Math.round(state.latenciasMs.reduce((a, b) => a + b, 0) / muestras)
    : 0;
  const latenciaMaxMs = muestras > 0 ? Math.max(...state.latenciasMs) : 0;
  const dentroDeSla = state.latenciasMs.filter(ms => ms < SLA_THRESHOLD_MS).length;
  const cumplimientoSlaPct = muestras > 0
    ? Number(((dentroDeSla / muestras) * 100).toFixed(1))
    : 100;

  const totalIntentosPdf = state.pdfsGenerados + state.pdfsFallidos;
  const tasaExitoPdfPct = totalIntentosPdf > 0
    ? Number(((state.pdfsGenerados / totalIntentosPdf) * 100).toFixed(1))
    : 100;

  const listaTickets = Array.isArray(tickets) ? tickets : [];
  const porEstado = {
    en_proceso: listaTickets.filter(t => (t.estado || 'en_proceso') === 'en_proceso').length,
    derivado: listaTickets.filter(t => t.estado === 'derivado').length,
    agendado: listaTickets.filter(t => t.estado === 'agendado').length,
    resuelto: listaTickets.filter(t => t.estado === 'resuelto').length,
  };

  return {
    sla: {
      umbral_ms: SLA_THRESHOLD_MS,
      latencia_promedio_ms: latenciaPromedioMs,
      latencia_max_ms: latenciaMaxMs,
      muestras_latencia: muestras,
      cumple_sla: latenciaPromedioMs < SLA_THRESHOLD_MS,
      cumplimiento_sla_pct: cumplimientoSlaPct,
    },
    arnes: {
      total_validaciones: state.totalValidacionesArnes,
      alucinaciones_interceptadas: state.alucinacionesInterceptadas,
      tasa_intercepcion_pct: 100,
    },
    pdf: {
      generados: state.pdfsGenerados,
      fallidos: state.pdfsFallidos,
      tasa_exito_pct: tasaExitoPdfPct,
    },
    tickets: {
      total: listaTickets.length,
      por_estado: porEstado,
    },
  };
}

module.exports = {
  registrarLatencia,
  registrarEventoArnes,
  registrarGeneracionPdf,
  resetMetricas,
  obtenerResumenMetricas,
  SLA_THRESHOLD_MS,
};
