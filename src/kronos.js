/**
 * src/kronos.js
 * 
 * MOCK del cliente del sistema ERP Kronos de InterChile.
 * 
 * En producción, este módulo haría llamadas HTTP al API REST de Kronos.
 * En el prototipo, simula el catálogo de inventario con datos realistas
 * de la industria de climatización chilena.
 * 
 * HU-18 / HU-21: Usado por los Arneses de IA para validar alucinaciones.
 */

// ============================================================
// 📦 CATÁLOGO MOCK DE KRONOS
// Marcas, modelos, tipos de equipo y repuestos reconocidos por InterChile
// ============================================================

const MARCAS_VALIDAS = new Set([
  'samsung', 'lg', 'carrier', 'midea', 'daikin', 'mitsubishi',
  'hitachi', 'fujitsu', 'haier', 'gree', 'anwo', 'inverter',
  'panasonic', 'toshiba', 'york', 'lennox', 'rheem', 'bg',
  'electrolux', 'whirlpool', 'mabe', 'klimapal', 'rowa',
]);

const MODELOS_VALIDOS = new Set([
  'windfree', 'wind-free', 'ar09', 'ar12', 'ar18', 'ar24',
  'dualcool', 'dual', 'cool', 'artcool', 'inverter',
  'vrv', 'vrf', 'eco', 'aurora', 'blanc', 'xpower',
  'sensira', 'kirigamine', 'msz',
]);

const TIPOS_EQUIPO_VALIDOS = new Set([
  'split', 'cassette', 'piso techo', 'ducto', 'chiller',
  'vrv', 'vrf', 'cortina de aire', 'fancoil', 'multisplit',
  'portatil', 'ventana', 'consola', 'split invertido',
]);

const REPUESTOS_VALIDOS = new Set([
  'compresor', 'filtro de aire', 'control remoto', 'placa pcb',
  'condensador', 'evaporador', 'termostato', 'capacitor',
  'motor ventilador', 'valvula de expansion', 'sensor temperatura',
  'gas refrigerante', 'r22', 'r410a', 'r32', 'r134a',
  'ventilador', 'turbina', 'bobina', 'relay', 'contactor',
  'display', 'panel frontal', 'drenaje', 'bomba de agua',
  'intercambiador de calor', 'valvula solenoide',
]);

// ============================================================
// 🔍 FUNCIONES DE CONSULTA AL CATÁLOGO
// ============================================================

/**
 * Simula latencia de red al consultar Kronos (50-150ms)
 */
function simularLatencia() {
  return new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
}

/**
 * Verifica si una marca (y modelo opcional) de equipo existe en el catálogo de Kronos.
 * @param {string} marca - Nombre de la marca y/o modelo (ej: "Samsung", "Samsung WindFree")
 * @returns {Promise<{existe: boolean, marcaNormalizada: string|null}>}
 */
async function validarMarca(marca) {
  await simularLatencia();
  const marcaNorm = marca.toLowerCase().trim();
  if (!marcaNorm) return { existe: false, marcaNormalizada: null };

  if (MARCAS_VALIDAS.has(marcaNorm)) {
    return { existe: true, marcaNormalizada: marcaNorm };
  }

  // Si incluye marca + modelo (ej: "Samsung WindFree" vs "Samsung ModeloInventado")
  const tokens = marcaNorm.split(/\s+/);
  const tieneMarcaValida = tokens.some(t => MARCAS_VALIDAS.has(t));
  const todosTokensValidos = tokens.every(t => MARCAS_VALIDAS.has(t) || MODELOS_VALIDOS.has(t));
  const existe = tieneMarcaValida && todosTokensValidos;

  return {
    existe,
    marcaNormalizada: existe ? marcaNorm : null,
  };
}

/**
 * Verifica si un tipo de equipo existe en el catálogo de Kronos.
 * @param {string} tipo - Tipo de equipo (ej: "Split", "Cassette")
 * @returns {Promise<{existe: boolean}>}
 */
async function validarTipoEquipo(tipo) {
  await simularLatencia();
  const tipoNorm = tipo.toLowerCase().trim();
  // Búsqueda parcial: "split de 24000 BTU" → contiene "split"
  const existe = [...TIPOS_EQUIPO_VALIDOS].some(t => tipoNorm.includes(t) || t.includes(tipoNorm));
  return { existe };
}

/**
 * Verifica si un repuesto o componente existe en el catálogo de Kronos.
 * @param {string} repuesto - Nombre del repuesto (ej: "compresor")
 * @returns {Promise<{existe: boolean}>}
 */
async function validarRepuesto(repuesto) {
  await simularLatencia();
  const repNorm = repuesto.toLowerCase().trim();
  const existe = [...REPUESTOS_VALIDOS].some(r => repNorm.includes(r) || r.includes(repNorm));
  return { existe };
}

/**
 * Obtiene la lista completa del catálogo (para debugging).
 * @returns {{marcas: string[], modelos: string[], tipos: string[], repuestos: string[]}}
 */
function obtenerCatalogo() {
  return {
    marcas: [...MARCAS_VALIDAS],
    modelos: [...MODELOS_VALIDOS],
    tipos: [...TIPOS_EQUIPO_VALIDOS],
    repuestos: [...REPUESTOS_VALIDOS],
  };
}

module.exports = {
  validarMarca,
  validarTipoEquipo,
  validarRepuesto,
  obtenerCatalogo,
  // Exportar sets para tests unitarios
  MARCAS_VALIDAS,
  MODELOS_VALIDOS,
  TIPOS_EQUIPO_VALIDOS,
  REPUESTOS_VALIDOS,
};
