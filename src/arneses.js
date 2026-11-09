/**
 * src/arneses.js
 *
 * 🛡️ ARNESES DE IA — Sistema de Validación y Control de Respuestas
 *
 * Intercepta las fichas generadas por Gemini ANTES de que se envíen
 * al cliente o se guarden en base de datos, verificando que los datos
 * mencionados existan en el catálogo de InterChile (Kronos).
 *
 * HU-21 + KRON2-152:
 * - CA-1: Validación ejecutada ANTES de enviar al cliente
 * - CA-2: Datos no encontrados, timeout o catálogo oficial no disponible → reemplazados por [dato por confirmar]
 * - CA-3: Función retorna { valido, motivo, fichaCorregida, catalogo_verificado }
 * - Distingue respaldo local (`catalogo_verificado: false`) de validación oficial Kronos (`catalogo_verificado: true`).
 */

const fs = require('fs');
const path = require('path');
const { validarMarca, validarTipoEquipo, validarRepuesto } = require('./kronos');
const { registrarEventoArnes } = require('./metricsStore');

// ============================================================
// 📝 Logger de alucinaciones detectadas (sin exponer secretos)
// ============================================================
const LOG_PATH = path.join(__dirname, '..', 'logs', 'alucinaciones.log');

function logAlucinacion(ficha, motivo, campoAfectado, valorOriginal) {
  const entry = {
    timestamp: new Date().toISOString(),
    alucinacion_detectada: true,
    motivo,
    campo_afectado: campoAfectado,
    valor_original: valorOriginal,
    telefono: ficha._telefono || 'desconocido',
  };
  const line = JSON.stringify(entry) + '\n';
  fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
  fs.appendFile(LOG_PATH, line, () => {});
  console.warn(`⚠️ [HU-21 Arnés] ALUCINACIÓN O DATO NO VERIFICADO — ${motivo}: "${valorOriginal}"`);
}

// ============================================================
// 🔍 VALIDADOR PRINCIPAL
// ============================================================

/**
 * Valida una ficha de triage contra el catálogo de Kronos.
 *
 * @param {Object} ficha - Ficha estructurada generada por Gemini
 * @returns {Promise<{valido: boolean, motivo: string|null, fichaCorregida: Object, catalogo_verificado: boolean}>}
 */
async function validarFichaConKronos(ficha) {
  const fichaCorregida = { ...ficha };
  let valido = true;
  let motivo = null;
  let huboChequeoCatalogo = false;
  let todosVerificadosPorKronosOficial = true;

  // --- CA-1: Validar marca del equipo ---
  if (ficha.equipo_marca && ficha.equipo_marca.trim() !== '') {
    huboChequeoCatalogo = true;
    const resultMarca = await validarMarca(ficha.equipo_marca);
    if (!resultMarca.catalogo_verificado) {
      todosVerificadosPorKronosOficial = false;
    }
    if (!resultMarca.existe) {
      logAlucinacion(ficha, 'marca_no_encontrada', 'equipo_marca', ficha.equipo_marca);
      fichaCorregida.equipo_marca = '[dato por confirmar]'; // CA-2
      valido = false;
      motivo = 'marca_no_encontrada';
    }
  }

  // --- CA-1: Validar tipo de equipo ---
  if (ficha.equipo_tipo && ficha.equipo_tipo.trim() !== '') {
    huboChequeoCatalogo = true;
    const resultTipo = await validarTipoEquipo(ficha.equipo_tipo);
    if (!resultTipo.catalogo_verificado) {
      todosVerificadosPorKronosOficial = false;
    }
    if (!resultTipo.existe) {
      logAlucinacion(ficha, 'tipo_equipo_no_encontrado', 'equipo_tipo', ficha.equipo_tipo);
      fichaCorregida.equipo_tipo = '[dato por confirmar]'; // CA-2
      if (valido) {
        valido = false;
        motivo = 'tipo_equipo_no_encontrado';
      }
    }
  }

  // --- CA-1: Detectar repuestos alucinados en el síntoma/observación ---
  if (ficha.sintoma_observacion && ficha.sintoma_observacion.trim() !== '') {
    const palabras = ficha.sintoma_observacion.split(/\s+/);
    for (const palabra of palabras) {
      if (palabra.length > 5) {
        const resultRepuesto = await validarRepuesto(palabra);
        if (!resultRepuesto.existe && /\b(repuesto|pieza|parte|componente)s?\b/i.test(ficha.sintoma_observacion)) {
          todosVerificadosPorKronosOficial = false;
          logAlucinacion(ficha, 'repuesto_no_encontrado', 'sintoma_observacion', palabra);
          fichaCorregida.sintoma_observacion = ficha.sintoma_observacion.replace(
            palabra,
            '[repuesto por confirmar]'
          );
          if (valido) {
            valido = false;
            motivo = 'repuesto_no_encontrado';
          }
          break;
        }
      }
    }
  }

  const catalogoVerificado = Boolean(huboChequeoCatalogo && valido && todosVerificadosPorKronosOficial);
  fichaCorregida.catalogo_verificado = catalogoVerificado;

  registrarEventoArnes(!valido);

  if (valido) {
    console.log(
      `✅ [HU-21 Arnés] Ficha validada (catalogo_verificado=${catalogoVerificado}). Sin alucinaciones detectadas.`
    );
  }

  // CA-3: Retorna siempre { valido, motivo, fichaCorregida, catalogo_verificado }
  return { valido, motivo, fichaCorregida, catalogo_verificado: catalogoVerificado };
}

/**
 * Aplica el arnés completo: valida y corrige la ficha.
 *
 * @param {Object} ficha - Ficha original de Gemini
 * @param {string} telefono - Para logging
 * @returns {Promise<Object>} fichaCorregida
 */
async function aplicarArnes(ficha, telefono) {
  const fichaConTel = { ...ficha, _telefono: telefono };

  try {
    const { valido, motivo, fichaCorregida } = await validarFichaConKronos(fichaConTel);

    if (!valido) {
      console.warn(`🔧 [HU-21 Arnés] Ficha corregida. Motivo: ${motivo}`);
    }

    const { _telefono, ...fichaFinal } = fichaCorregida;
    return fichaFinal;
  } catch (error) {
    console.error('❌ [Arnés] Error al consultar Kronos, marcando datos por confirmar:', error.message);
    return {
      ...ficha,
      equipo_marca: ficha.equipo_marca ? '[dato por confirmar]' : '',
      equipo_tipo: ficha.equipo_tipo ? '[dato por confirmar]' : '',
      catalogo_verificado: false,
    };
  }
}

module.exports = { validarFichaConKronos, aplicarArnes };
