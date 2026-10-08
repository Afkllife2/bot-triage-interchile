/**
 * src/arneses.js
 * 
 * 🛡️ ARNESES DE IA — Sistema de Validación y Control de Respuestas
 * 
 * Intercepta las fichas generadas por Gemini ANTES de que se envíen
 * al cliente o se guarden en base de datos, verificando que los datos
 * mencionados existan en el catálogo real de InterChile (Kronos).
 * 
 * HU-21: Arneses de IA — Validación y Control de Respuestas
 * 
 * Criterios de Aceptación:
 * - CA-1: Validación ejecutada ANTES de enviar al cliente
 * - CA-2: Datos no encontrados → reemplazados por [dato por confirmar]
 * - CA-3: Función retorna { valido, motivo } para transparencia en tests
 */

const fs = require('fs');
const path = require('path');
const { validarMarca, validarTipoEquipo, validarRepuesto } = require('./kronos');

// ============================================================
// 📝 Logger de alucinaciones detectadas
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
  console.warn(`⚠️ [HU-21 Arnés] ALUCINACIÓN DETECTADA — ${motivo}: "${valorOriginal}"`);
}

// ============================================================
// 🔍 VALIDADOR PRINCIPAL
// ============================================================

/**
 * Valida una ficha de triage contra el catálogo de Kronos.
 * 
 * @param {Object} ficha - Ficha estructurada generada por Gemini
 * @returns {Promise<{valido: boolean, motivo: string|null, fichaCorregida: Object}>}
 * 
 * Posibles motivos de invalidación:
 * - 'marca_no_encontrada'
 * - 'tipo_equipo_no_encontrado'
 * - 'repuesto_no_encontrado'
 */
async function validarFichaConKronos(ficha) {
  const fichaCorregida = { ...ficha };
  let valido = true;
  let motivo = null;

  // --- CA-1: Validar marca del equipo ---
  if (ficha.equipo_marca && ficha.equipo_marca.trim() !== '') {
    const resultMarca = await validarMarca(ficha.equipo_marca);
    if (!resultMarca.existe) {
      logAlucinacion(ficha, 'marca_no_encontrada', 'equipo_marca', ficha.equipo_marca);
      fichaCorregida.equipo_marca = '[dato por confirmar]'; // CA-2
      valido = false;
      motivo = 'marca_no_encontrada';
    }
  }

  // --- CA-1: Validar tipo de equipo ---
  if (ficha.equipo_tipo && ficha.equipo_tipo.trim() !== '') {
    const resultTipo = await validarTipoEquipo(ficha.equipo_tipo);
    if (!resultTipo.existe) {
      logAlucinacion(ficha, 'tipo_equipo_no_encontrado', 'equipo_tipo', ficha.equipo_tipo);
      fichaCorregida.equipo_tipo = '[dato por confirmar]'; // CA-2
      if (valido) { // Solo sobrescribir motivo si aún era válido
        valido = false;
        motivo = 'tipo_equipo_no_encontrado';
      }
    }
  }

  // --- CA-1: Detectar repuestos alucinados en el síntoma/observación ---
  if (ficha.sintoma_observacion && ficha.sintoma_observacion.trim() !== '') {
    const palabras = ficha.sintoma_observacion.split(/\s+/);
    for (const palabra of palabras) {
      // Solo verificar palabras técnicas (más de 5 caracteres)
      if (palabra.length > 5) {
        const resultRepuesto = await validarRepuesto(palabra);
        // Si la IA menciona algo que suena a repuesto pero NO está en catálogo
        if (!resultRepuesto.existe && /repuesto|pieza|parte|componente/i.test(ficha.sintoma_observacion)) {
          logAlucinacion(ficha, 'repuesto_no_encontrado', 'sintoma_observacion', palabra);
          fichaCorregida.sintoma_observacion = ficha.sintoma_observacion.replace(
            palabra,
            '[repuesto por confirmar]'
          );
          if (valido) {
            valido = false;
            motivo = 'repuesto_no_encontrado';
          }
          break; // Un solo reemplazo por ejecución
        }
      }
    }
  }

  if (valido) {
    console.log('✅ [HU-21 Arnés] Ficha validada contra Kronos. Sin alucinaciones detectadas.');
  }

  // CA-3: Retorna siempre { valido, motivo, fichaCorregida }
  return { valido, motivo, fichaCorregida };
}

/**
 * Aplica el arnés completo: valida y corrige la ficha.
 * Si hay alucinaciones, retorna la ficha corregida para usar en lugar de la original.
 * 
 * @param {Object} ficha - Ficha original de Gemini
 * @param {string} telefono - Para logging
 * @returns {Promise<Object>} fichaCorregida (puede ser idéntica si no hay alucinaciones)
 */
async function aplicarArnes(ficha, telefono) {
  // Agregar teléfono para logging interno
  const fichaConTel = { ...ficha, _telefono: telefono };

  try {
    const { valido, motivo, fichaCorregida } = await validarFichaConKronos(fichaConTel);

    if (!valido) {
      console.warn(`🔧 [HU-21 Arnés] Ficha corregida. Motivo: ${motivo}`);
      // Remover campo interno _telefono antes de retornar
      const { _telefono, ...fichaFinal } = fichaCorregida;
      return fichaFinal;
    }

    const { _telefono, ...fichaFinal } = fichaCorregida;
    return fichaFinal;

  } catch (error) {
    // HU-16: Si Kronos falla, no bloqueamos el flujo — pasamos la ficha original
    console.error('❌ [Arnés] Error al consultar Kronos, pasando ficha sin validar:', error.message);
    return ficha;
  }
}

module.exports = { validarFichaConKronos, aplicarArnes };
