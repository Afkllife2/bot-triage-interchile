/**
 * tests/arneses.test.js
 * 
 * Tests unitarios para el módulo de Arneses de IA (HU-21)
 * 
 * CA-3: Dado que se ejecutan las pruebas unitarias del módulo Arnés con Jest,
 *       Cuando se le pasa una respuesta de IA con un repuesto falso inventado,
 *       Entonces la función debe retornar { valido: false, motivo: 'repuesto_no_encontrado' }
 *       y el test debe pasar en verde.
 */

const { validarFichaConKronos } = require('../src/arneses');
const { MARCAS_VALIDAS, TIPOS_EQUIPO_VALIDOS } = require('../src/kronos');

// ============================================================
// 🧪 FIXTURES: Respuestas de IA simuladas (mock data)
// ============================================================

const FICHA_VALIDA = {
  tipo_solicitud: 'Falla Técnica',
  cliente_nombre: 'Juan Pérez',
  sucursal_comuna: 'Providencia',
  equipo_tipo: 'Split',
  equipo_marca: 'Samsung',
  sintoma_observacion: 'El equipo no enfría y hace ruido.',
  prioridad: 'Alta',
  disponibilidad_cliente: 'Mañanas',
  tiene_fotos: false,
  requiere_derivacion: false,
  opciones_botones: [],
  respuesta_cliente: 'Entendido, hemos registrado tu caso.',
};

const FICHA_MARCA_ALUCINADA = {
  ...FICHA_VALIDA,
  equipo_marca: 'CoolBreeze Pro X9000', // Marca inventada
};

const FICHA_TIPO_ALUCINADO = {
  ...FICHA_VALIDA,
  equipo_tipo: 'TurboFlex Ultra Inverter XR', // Tipo inventado
};

const FICHA_REPUESTO_ALUCINADO = {
  ...FICHA_VALIDA,
  sintoma_observacion: 'Necesita cambio de repuesto NanoCore Z47 del compresor.',
};

const FICHA_SIN_EQUIPO = {
  ...FICHA_VALIDA,
  equipo_tipo: '',
  equipo_marca: '',
  sintoma_observacion: 'No enciende.',
};

// ============================================================
// ✅ SUITE 1: Fichas válidas (deben pasar sin correcciones)
// ============================================================

describe('Arnés HU-21 — Fichas válidas', () => {

  test('CA-3: Ficha con marca y tipo válidos retorna { valido: true }', async () => {
    const resultado = await validarFichaConKronos(FICHA_VALIDA);
    expect(resultado.valido).toBe(true);
    expect(resultado.motivo).toBeNull();
  });

  test('CA-3: Ficha sin equipo (campos vacíos) no activa el arnés', async () => {
    const resultado = await validarFichaConKronos(FICHA_SIN_EQUIPO);
    expect(resultado.valido).toBe(true);
    expect(resultado.motivo).toBeNull();
  });

  test('CA-3: Catálogo incluye marcas conocidas de la industria', () => {
    expect(MARCAS_VALIDAS.has('samsung')).toBe(true);
    expect(MARCAS_VALIDAS.has('lg')).toBe(true);
    expect(MARCAS_VALIDAS.has('daikin')).toBe(true);
    expect(MARCAS_VALIDAS.has('carrier')).toBe(true);
  });

  test('CA-3: Catálogo incluye tipos de equipo válidos', () => {
    expect(TIPOS_EQUIPO_VALIDOS.has('split')).toBe(true);
    expect(TIPOS_EQUIPO_VALIDOS.has('cassette')).toBe(true);
    expect(TIPOS_EQUIPO_VALIDOS.has('chiller')).toBe(true);
  });

});

// ============================================================
// ❌ SUITE 2: Fichas con alucinaciones (deben ser detectadas)
// ============================================================

describe('Arnés HU-21 — Detección de alucinaciones', () => {

  test('CA-3: Marca inventada → retorna { valido: false, motivo: "marca_no_encontrada" }', async () => {
    const resultado = await validarFichaConKronos(FICHA_MARCA_ALUCINADA);

    expect(resultado.valido).toBe(false);
    expect(resultado.motivo).toBe('marca_no_encontrada');
  });

  test('CA-2: Marca inventada es reemplazada por "[dato por confirmar]"', async () => {
    const resultado = await validarFichaConKronos(FICHA_MARCA_ALUCINADA);

    expect(resultado.fichaCorregida.equipo_marca).toBe('[dato por confirmar]');
    // La ficha original NO debe ser mutada
    expect(FICHA_MARCA_ALUCINADA.equipo_marca).toBe('CoolBreeze Pro X9000');
  });

  test('CA-3: Tipo de equipo inventado → retorna { valido: false, motivo: "tipo_equipo_no_encontrado" }', async () => {
    const resultado = await validarFichaConKronos(FICHA_TIPO_ALUCINADO);

    expect(resultado.valido).toBe(false);
    expect(resultado.motivo).toBe('tipo_equipo_no_encontrado');
  });

  test('CA-2: Tipo inventado es reemplazado por "[dato por confirmar]"', async () => {
    const resultado = await validarFichaConKronos(FICHA_TIPO_ALUCINADO);

    expect(resultado.fichaCorregida.equipo_tipo).toBe('[dato por confirmar]');
  });

  test('CA-3: Repuesto inventado en síntoma → retorna { valido: false, motivo: "repuesto_no_encontrado" }', async () => {
    const resultado = await validarFichaConKronos(FICHA_REPUESTO_ALUCINADO);

    expect(resultado.valido).toBe(false);
    expect(resultado.motivo).toBe('repuesto_no_encontrado');
  });

  test('CA-2: El síntoma con repuesto falso es corregido', async () => {
    const resultado = await validarFichaConKronos(FICHA_REPUESTO_ALUCINADO);

    expect(resultado.fichaCorregida.sintoma_observacion).toContain('[repuesto por confirmar]');
  });

  test('Marcas claramente inventadas no están en el catálogo', () => {
    expect(MARCAS_VALIDAS.has('coolbreeze pro x9000')).toBe(false);
    expect(MARCAS_VALIDAS.has('turboflex ultra')).toBe(false);
    expect(MARCAS_VALIDAS.has('nanocore')).toBe(false);
  });

});

// ============================================================
// 🔧 SUITE 3: Inmutabilidad (la ficha original no es alterada)
// ============================================================

describe('Arnés HU-21 — Inmutabilidad de la ficha original', () => {

  test('CA-2: La ficha original no es mutada cuando hay alucinación de marca', async () => {
    const fichaOriginal = { ...FICHA_MARCA_ALUCINADA };
    await validarFichaConKronos(FICHA_MARCA_ALUCINADA);

    // La ficha original debe seguir intacta
    expect(FICHA_MARCA_ALUCINADA.equipo_marca).toBe(fichaOriginal.equipo_marca);
  });

  test('CA-3: fichaCorregida es un objeto distinto a la ficha original', async () => {
    const resultado = await validarFichaConKronos(FICHA_MARCA_ALUCINADA);

    expect(resultado.fichaCorregida).not.toBe(FICHA_MARCA_ALUCINADA);
  });

});
