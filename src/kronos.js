/**
 * src/kronos.js
 *
 * Cliente del catálogo de inventario de Kronos 2.0 (InterChile) + Respaldo Local.
 *
 * Contrato KRON2-152 + HU-18 / HU-21:
 * - Si está configurado `KRONOS_API_BASE_URL` (o mediante `configurarClienteKronos`),
 *   consulta `GET /api/kronos/catalogo` con Bearer token privado y timeout estricto de 5 s.
 * - Si el catálogo oficial responde `{ available: false, source: "kronos", ... }`,
 *   sufre timeout o el dato no existe en el catálogo oficial:
 *   => retorna `existe: false` y `catalogo_verificado: false` (para que el arnés marque
 *      `[dato por confirmar]` y `catalogo_verificado = false`).
 * - La lista local de respaldo (`MARCAS_VALIDAS`, etc.) puede asistir la conversación en modo
 *   prototipo/local, pero NUNCA se presenta como dato validado oficialmente por Kronos
 *   (`catalogo_verificado: false`, `source: "local_fallback"`).
 */

const DEFAULT_TIMEOUT_MS = 5000;

let runtimeConfig = {
  baseUrl: process.env.KRONOS_API_BASE_URL || '',
  token: process.env.KRONOS_CATALOGO_TOKEN || process.env.KRONOS_CATALOG_TOKEN || '',
  timeoutMs: Number(process.env.KRONOS_CATALOGO_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS,
  fetchImpl: typeof global.fetch === 'function' ? global.fetch.bind(global) : null,
};

/**
 * Permite configurar o inyectar en tests el cliente HTTP hacia Kronos.
 * @param {Object} overrides
 */
function configurarClienteKronos(overrides = {}) {
  runtimeConfig = {
    ...runtimeConfig,
    ...overrides,
  };
}

/**
 * Restaura la configuración por defecto desde variables de entorno.
 */
function resetClienteKronos() {
  runtimeConfig = {
    baseUrl: process.env.KRONOS_API_BASE_URL || '',
    token: process.env.KRONOS_CATALOGO_TOKEN || process.env.KRONOS_CATALOG_TOKEN || '',
    timeoutMs: Number(process.env.KRONOS_CATALOGO_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS,
    fetchImpl: typeof global.fetch === 'function' ? global.fetch.bind(global) : null,
  };
}

// ============================================================
// 📦 LISTA LOCAL DE RESPALDO CONVERSACIONAL (NO OFICIAL KRONOS)
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

/**
 * Simula latencia de red al usar respaldo local (20-50ms)
 */
function simularLatencia() {
  return new Promise(resolve => setTimeout(resolve, 20));
}

/**
 * Evalúa coincidencia en las listas locales de respaldo.
 */
function coincideMarcaEnRespaldoLocal(marcaNorm) {
  if (!marcaNorm) return false;
  if (MARCAS_VALIDAS.has(marcaNorm)) return true;
  const tokens = marcaNorm.split(/\s+/);
  const tieneMarcaValida = tokens.some(t => MARCAS_VALIDAS.has(t));
  const todosTokensValidos = tokens.every(t => MARCAS_VALIDAS.has(t) || MODELOS_VALIDOS.has(t));
  return tieneMarcaValida && todosTokensValidos;
}

/**
 * Consulta el contrato oficial `GET /api/kronos/catalogo` en Kronos 2.0 con timeout de 5 s.
 * Nunca registra tokens ni cabeceras en logs.
 *
 * @returns {Promise<{ok: boolean, available: boolean, source: string, marcas: string[], modelos: string[], tipos: string[], repuestos: string[], error?: string}>}
 */
async function consultarCatalogoRemotoKronos() {
  const baseUrl = (runtimeConfig.baseUrl || '').trim().replace(/\/+$/, '');
  if (!baseUrl || typeof runtimeConfig.fetchImpl !== 'function') {
    return {
      ok: false,
      available: false,
      source: 'local_fallback',
      marcas: [],
      modelos: [],
      tipos: [],
      repuestos: [],
      error: 'not_configured',
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), runtimeConfig.timeoutMs || DEFAULT_TIMEOUT_MS);

  try {
    const headers = { Accept: 'application/json' };
    if (runtimeConfig.token) {
      headers.Authorization = `Bearer ${runtimeConfig.token}`;
    }

    const res = await runtimeConfig.fetchImpl(`${baseUrl}/api/kronos/catalogo`, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });

    if (!res.ok) {
      return {
        ok: false,
        available: false,
        source: 'kronos',
        marcas: [],
        modelos: [],
        tipos: [],
        repuestos: [],
        error: `http_${res.status}`,
      };
    }

    const payload = await res.json();
    const available = Boolean(payload && payload.available === true);
    return {
      ok: true,
      available,
      source: (payload && payload.source) || 'kronos',
      marcas: Array.isArray(payload?.marcas) ? payload.marcas.map(s => String(s).toLowerCase().trim()) : [],
      modelos: Array.isArray(payload?.modelos) ? payload.modelos.map(s => String(s).toLowerCase().trim()) : [],
      tipos: Array.isArray(payload?.tipos) ? payload.tipos.map(s => String(s).toLowerCase().trim()) : [],
      repuestos: Array.isArray(payload?.repuestos) ? payload.repuestos.map(s => String(s).toLowerCase().trim()) : [],
    };
  } catch (err) {
    const isTimeout = err && (err.name === 'AbortError' || /abort|timeout/i.test(err.message || ''));
    return {
      ok: false,
      available: false,
      source: 'kronos',
      marcas: [],
      modelos: [],
      tipos: [],
      repuestos: [],
      error: isTimeout ? 'timeout' : 'network_error',
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Verifica si una marca (y modelo opcional) existe.
 * - Si hay cliente remoto Kronos configurado, exige que el catálogo oficial esté `available: true`
 *   y contenga la marca/modelo; de lo contrario retorna `existe: false, catalogo_verificado: false`.
 * - En modo respaldo local (sin URL remota configurada), usa la lista local pero marca siempre
 *   `catalogo_verificado: false` y `source: 'local_fallback'`.
 *
 * @param {string} marca
 * @returns {Promise<{existe: boolean, marcaNormalizada: string|null, catalogo_verificado: boolean, source: string, coincideRespaldoLocal: boolean}>}
 */
async function validarMarca(marca) {
  const marcaNorm = (marca || '').toLowerCase().trim();
  const coincideLocal = coincideMarcaEnRespaldoLocal(marcaNorm);

  if (!marcaNorm) {
    return {
      existe: false,
      marcaNormalizada: null,
      catalogo_verificado: false,
      source: 'none',
      coincideRespaldoLocal: false,
    };
  }

  if ((runtimeConfig.baseUrl || '').trim()) {
    const remoto = await consultarCatalogoRemotoKronos();
    if (!remoto.ok || !remoto.available) {
      return {
        existe: false,
        marcaNormalizada: null,
        catalogo_verificado: false,
        source: 'kronos_unavailable',
        motivoRemoto: remoto.error || 'catalogo_no_disponible',
        coincideRespaldoLocal: coincideLocal,
      };
    }

    const marcasSet = new Set(remoto.marcas);
    const modelosSet = new Set(remoto.modelos);
    let existeRemoto = marcasSet.has(marcaNorm);
    if (!existeRemoto) {
      const tokens = marcaNorm.split(/\s+/);
      const tieneMarca = tokens.some(t => marcasSet.has(t));
      const todosValidos = tokens.every(t => marcasSet.has(t) || modelosSet.has(t));
      existeRemoto = tieneMarca && todosValidos;
    }

    return {
      existe: existeRemoto,
      marcaNormalizada: existeRemoto ? marcaNorm : null,
      catalogo_verificado: existeRemoto,
      source: 'kronos',
      coincideRespaldoLocal: coincideLocal,
    };
  }

  await simularLatencia();
  return {
    existe: coincideLocal,
    marcaNormalizada: coincideLocal ? marcaNorm : null,
    catalogo_verificado: false,
    source: 'local_fallback',
    coincideRespaldoLocal: coincideLocal,
  };
}

/**
 * Verifica si un tipo de equipo existe.
 * @param {string} tipo
 * @returns {Promise<{existe: boolean, catalogo_verificado: boolean, source: string, coincideRespaldoLocal: boolean}>}
 */
async function validarTipoEquipo(tipo) {
  const tipoNorm = (tipo || '').toLowerCase().trim();
  const coincideLocal = Boolean(
    tipoNorm && [...TIPOS_EQUIPO_VALIDOS].some(t => tipoNorm.includes(t) || t.includes(tipoNorm))
  );

  if (!tipoNorm) {
    return { existe: false, catalogo_verificado: false, source: 'none', coincideRespaldoLocal: false };
  }

  if ((runtimeConfig.baseUrl || '').trim()) {
    const remoto = await consultarCatalogoRemotoKronos();
    if (!remoto.ok || !remoto.available) {
      return {
        existe: false,
        catalogo_verificado: false,
        source: 'kronos_unavailable',
        motivoRemoto: remoto.error || 'catalogo_no_disponible',
        coincideRespaldoLocal: coincideLocal,
      };
    }

    const existeRemoto = remoto.tipos.some(t => tipoNorm.includes(t) || t.includes(tipoNorm));
    return {
      existe: existeRemoto,
      catalogo_verificado: existeRemoto,
      source: 'kronos',
      coincideRespaldoLocal: coincideLocal,
    };
  }

  await simularLatencia();
  return {
    existe: coincideLocal,
    catalogo_verificado: false,
    source: 'local_fallback',
    coincideRespaldoLocal: coincideLocal,
  };
}

/**
 * Verifica si un repuesto o componente existe.
 * @param {string} repuesto
 * @returns {Promise<{existe: boolean, catalogo_verificado: boolean, source: string, coincideRespaldoLocal: boolean}>}
 */
async function validarRepuesto(repuesto) {
  const repNorm = (repuesto || '').toLowerCase().trim();
  const coincideLocal = Boolean(
    repNorm && [...REPUESTOS_VALIDOS].some(r => repNorm.includes(r) || r.includes(repNorm))
  );

  if (!repNorm) {
    return { existe: false, catalogo_verificado: false, source: 'none', coincideRespaldoLocal: false };
  }

  if ((runtimeConfig.baseUrl || '').trim()) {
    const remoto = await consultarCatalogoRemotoKronos();
    if (!remoto.ok || !remoto.available) {
      return {
        existe: false,
        catalogo_verificado: false,
        source: 'kronos_unavailable',
        motivoRemoto: remoto.error || 'catalogo_no_disponible',
        coincideRespaldoLocal: coincideLocal,
      };
    }

    const existeRemoto = remoto.repuestos.some(r => repNorm.includes(r) || r.includes(repNorm));
    return {
      existe: existeRemoto,
      catalogo_verificado: existeRemoto,
      source: 'kronos',
      coincideRespaldoLocal: coincideLocal,
    };
  }

  await simularLatencia();
  return {
    existe: coincideLocal,
    catalogo_verificado: false,
    source: 'local_fallback',
    coincideRespaldoLocal: coincideLocal,
  };
}

/**
 * Obtiene la lista local de respaldo (para debugging y tests unitarios).
 */
function obtenerCatalogo() {
  return {
    available: false,
    source: 'local_fallback',
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
  consultarCatalogoRemotoKronos,
  configurarClienteKronos,
  resetClienteKronos,
  MARCAS_VALIDAS,
  MODELOS_VALIDOS,
  TIPOS_EQUIPO_VALIDOS,
  REPUESTOS_VALIDOS,
};
