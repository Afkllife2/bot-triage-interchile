/**
 * src/cotizador.js
 *
 * 💰 [INT-HU-05] (AAI-25 / AAI-86): Motor Determinista de Estimación Comercial (CLP + IVA 19%)
 *
 * Calcula un borrador de cotización referencial en pesos chilenos (CLP) a partir
 * del motivo principal (`tipo_solicitud` / `motivo_principal`) y el tipo de equipo
 * (`equipo_tipo`) validados en el triage.
 *
 * Reglas de contrato (Sprint 3 UNAB + KRON2-152):
 * - Los montos son estimaciones referenciales del bot (no constituyen presupuesto oficial).
 * - Si el tipo de equipo no está disponible o fue marcado como `[dato por confirmar]`,
 *   y el servicio requiere conocer el equipo, retorna `null` en los importes (nunca inventa 0).
 * - IVA chileno exacto: 19% (`Math.round(subtotal_neto * 0.19)`).
 */

const IVA_RATE = 0.19;
const CONTACTO_COMERCIAL = 'Benjamín Yáñez · Benjamin@interchileclima.cl · +56 9 9440 2632';

/**
 * Formatea un monto numérico en pesos chilenos (ej: 45000 -> "$45.000 CLP").
 * @param {number|null|undefined} monto
 * @returns {string}
 */
function formatearCLP(monto) {
  if (typeof monto !== 'number' || Number.isNaN(monto)) {
    return 'Sin estimacion';
  }
  return '$' + monto.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' CLP';
}

// Tarifario base referencial InterChile Climatización (valores netos en CLP)
const TARIFAS_BASE_POR_EQUIPO = {
  split: {
    'Mantención': { neto: 45000, descripcion: 'Mantención preventiva unidad Split muro (limpieza, sanitización y chequeo presiones)' },
    'Falla Técnica': { neto: 35000, descripcion: 'Visita diagnóstico técnico especializado unidad Split muro' },
    'Instalación': { neto: 120000, descripcion: 'Instalación estándar unidad Split muro (hasta 3 m cañería)' },
    'Cotización': { neto: 380000, descripcion: 'Suministro e instalación referencial equipo Split Inverter' },
    'Arriendo': { neto: 95000, descripcion: 'Arriendo mensual referencial equipo climatización Split/Portátil' },
  },
  cassette: {
    'Mantención': { neto: 65000, descripcion: 'Mantención preventiva unidad Cassette 4 vías (bomba condensado y serpentín)' },
    'Falla Técnica': { neto: 45000, descripcion: 'Diagnóstico técnico correctivo unidad Cassette comercial' },
    'Instalación': { neto: 185000, descripcion: 'Instalación unidad Cassette en cielo falso comercial' },
    'Cotización': { neto: 780000, descripcion: 'Suministro e instalación referencial unidad Cassette Inverter' },
    'Arriendo': { neto: 160000, descripcion: 'Arriendo mensual referencial unidad Cassette comercial' },
  },
  'piso techo': {
    'Mantención': { neto: 65000, descripcion: 'Mantención preventiva unidad Piso-Techo comercial' },
    'Falla Técnica': { neto: 45000, descripcion: 'Diagnóstico técnico correctivo unidad Piso-Techo' },
    'Instalación': { neto: 175000, descripcion: 'Instalación unidad Piso-Techo de alta capacidad' },
    'Cotización': { neto: 750000, descripcion: 'Suministro e instalación referencial unidad Piso-Techo' },
    'Arriendo': { neto: 155000, descripcion: 'Arriendo mensual referencial unidad Piso-Techo' },
  },
  ducto: {
    'Mantención': { neto: 85000, descripcion: 'Mantención preventiva equipo Baja/Alta Silueta por Ducto' },
    'Falla Técnica': { neto: 55000, descripcion: 'Diagnóstico técnico sistema de climatización por Ducto' },
    'Instalación': { neto: 260000, descripcion: 'Montaje y conexión unidad interior/exterior por Ducto' },
    'Cotización': { neto: 980000, descripcion: 'Suministro e instalación referencial sistema por Ducto' },
    'Arriendo': { neto: 210000, descripcion: 'Arriendo mensual referencial equipo por Ducto' },
  },
  chiller: {
    'Mantención': { neto: 180000, descripcion: 'Mantención preventiva Chiller industrial (circuitos e intercambiador)' },
    'Falla Técnica': { neto: 110000, descripcion: 'Diagnóstico especializado en planta Chiller industrial' },
    'Instalación': { neto: 650000, descripcion: 'Habilitación y puesta en marcha unidad Chiller' },
    'Cotización': { neto: 2400000, descripcion: 'Cotización base proyecto Chiller industrial' },
    'Arriendo': { neto: 550000, descripcion: 'Arriendo mensual referencial Chiller enfriador de agua' },
  },
  vrv: {
    'Mantención': { neto: 140000, descripcion: 'Mantención preventiva sistema centralizado VRV/VRF' },
    'Falla Técnica': { neto: 90000, descripcion: 'Diagnóstico electrónico y presiones sistema VRV/VRF' },
    'Instalación': { neto: 420000, descripcion: 'Instalación módulo sistema flujo refrigerante variable VRV/VRF' },
    'Cotización': { neto: 1850000, descripcion: 'Suministro referencial sistema centralizado VRV/VRF' },
    'Arriendo': { neto: 390000, descripcion: 'Arriendo mensual referencial módulo VRV/VRF' },
  },
};

// Alias para normalizar tipos de equipos del catálogo
const ALIAS_EQUIPOS = {
  'split invertido': 'split',
  multisplit: 'split',
  ventana: 'split',
  consola: 'split',
  portatil: 'split',
  'cortina de aire': 'split',
  fancoil: 'ducto',
  vrf: 'vrv',
};

/**
 * Normaliza la clave del equipo a una categoría tarifaria conocida.
 * @param {string|null|undefined} equipoTipo
 * @returns {string|null}
 */
function normalizarCategoriaEquipo(equipoTipo) {
  if (!equipoTipo || typeof equipoTipo !== 'string') return null;
  const limpio = equipoTipo.toLowerCase().trim();
  if (!limpio || limpio.includes('dato por confirmar')) return null;

  for (const key of Object.keys(TARIFAS_BASE_POR_EQUIPO)) {
    if (limpio.includes(key)) return key;
  }
  for (const [alias, destino] of Object.entries(ALIAS_EQUIPOS)) {
    if (limpio.includes(alias)) return destino;
  }
  return null;
}

/**
 * Calcula el borrador de cotización referencial para una ficha o ticket de triage.
 *
 * @param {Object} params
 * @param {string} [params.tipo_solicitud] - Ej: 'Mantención', 'Falla Técnica', 'Instalación', 'Cotización', 'Arriendo', 'Proyecto Comercial'
 * @param {string} [params.motivo_principal] - Alias en BD de tipo_solicitud
 * @param {string} [params.equipo_tipo] - Ej: 'Split', 'Cassette', 'Chiller'
 * @param {string} [params.equipo_marca] - Ej: 'Samsung', 'Midea'
 * @param {string} [params.prioridad] - Ej: 'Alta', 'Normal', 'Baja'
 * @returns {{subtotal_neto: number, iva: number, total_clp: number, items: Array<{descripcion: string, neto: number}>, moneda: string, es_referencial: boolean} | null}
 */
function calcularCotizacionBorrador(params = {}) {
  const motivo = (params.tipo_solicitud || params.motivo_principal || '').trim();
  const categoriaEquipo = normalizarCategoriaEquipo(params.equipo_tipo);

  // CA-3: Proyectos complejos, datos por confirmar o consultas generales nunca inventan precios cerrados
  if (
    !categoriaEquipo ||
    !motivo ||
    motivo === 'Otra Consulta' ||
    motivo === 'Proyecto Comercial' ||
    (typeof params.equipo_marca === 'string' && params.equipo_marca.toLowerCase().includes('dato por confirmar'))
  ) {
    return null;
  }

  const tablaEquipo = TARIFAS_BASE_POR_EQUIPO[categoriaEquipo];
  if (!tablaEquipo || !tablaEquipo[motivo]) {
    return null;
  }

  const base = tablaEquipo[motivo];
  const items = [
    {
      descripcion: base.descripcion,
      neto: base.neto,
    },
  ];

  // Recargo de urgencia técnica cuando prioridad es Alta en Falla Técnica
  const prioridad = (params.prioridad || params.prioridad_sugerida || 'Normal').toLowerCase();
  if (motivo === 'Falla Técnica' && prioridad === 'alta') {
    items.push({
      descripcion: 'Recargo atención de urgencia prioridad Alta (SLA preferente)',
      neto: 15000,
    });
  }

  const subtotal_neto = items.reduce((acc, item) => acc + item.neto, 0);
  const iva = Math.round(subtotal_neto * IVA_RATE);
  const total_clp = subtotal_neto + iva;

  return {
    subtotal_neto,
    iva,
    total_clp,
    items,
    moneda: 'CLP',
    es_referencial: true,
  };
}

/**
 * Inyecta en la respuesta de WhatsApp el valor estimado determinista y contacto comercial
 * cuando el cliente completa datos tarifables o solicita derivación (AAI-25 CA-3 / CA-4).
 *
 * @param {string} respuestaBase
 * @param {Object} ficha
 * @param {number|string|null} [casoId]
 * @returns {string}
 */
function enriquecerRespuestaConCotizacion(respuestaBase, ficha = {}, casoId = null) {
  const textoBase = typeof respuestaBase === 'string' ? respuestaBase.trim() : '';
  if (!textoBase || ficha._noPersistir) return textoBase;

  const tieneOpcionesSinDerivacion =
    !ficha.requiere_derivacion && Array.isArray(ficha.opciones_botones) && ficha.opciones_botones.length > 0;
  if (tieneOpcionesSinDerivacion) return textoBase;

  const cotizacion = calcularCotizacionBorrador(ficha);
  const motivo = (ficha.tipo_solicitud || ficha.motivo_principal || '').trim();
  const datosCompletos = Boolean(ficha.requiere_derivacion || (ficha.cliente_nombre && ficha.sucursal_comuna));

  if (!datosCompletos) return textoBase;

  const contacto = textoBase.includes('Benjamin@interchileclima.cl')
    ? ''
    : `\n📞 Contacto comercial: ${CONTACTO_COMERCIAL}`;

  if (cotizacion) {
    const folioTxt = casoId ? ` (Folio #${casoId})` : '';
    return (
      `${textoBase}\n\n` +
      `💰 Estimación referencial${folioTxt}: Neto ${formatearCLP(cotizacion.subtotal_neto)} + ` +
      `IVA (19%) ${formatearCLP(cotizacion.iva)} = Total estimado ${formatearCLP(cotizacion.total_clp)}.\n` +
      `(Estimación referencial del bot; no es presupuesto oficial)` +
      contacto
    );
  }

  const esProyectoOPorConfirmar =
    motivo === 'Proyecto Comercial' ||
    String(ficha.equipo_tipo || '').includes('dato por confirmar') ||
    String(ficha.equipo_marca || '').includes('dato por confirmar');

  if (esProyectoOPorConfirmar) {
    return (
      `${textoBase}\n\n` +
      `📋 Valor sujeto a evaluación y visita técnica por ejecutivo comercial.` +
      contacto
    );
  }

  return textoBase;
}

module.exports = {
  calcularCotizacionBorrador,
  enriquecerRespuestaConCotizacion,
  normalizarCategoriaEquipo,
  formatearCLP,
  IVA_RATE,
  CONTACTO_COMERCIAL,
  TARIFAS_BASE_POR_EQUIPO,
};
