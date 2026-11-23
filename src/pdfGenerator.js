/**
 * src/pdfGenerator.js
 *
 * 📄 [INT-HU-05] (AAI-25 / AAI-87): Generador de Ficha Técnica de Triage y Borrador de Cotización en PDF
 *
 * Construye un documento PDF estándar (%PDF-1.4) en memoria (Buffer) siguiendo la línea gráfica
 * corporativa oficial de InterChile Clima SpA (membrete limpio, secciones numeradas 01/02/03,
 * grilla gris claro, tabla burdeo #9e1046 y pie institucional interchileclima.cl), sin Chromium.
 */

const fs = require('fs');
const path = require('path');
const { calcularCotizacionBorrador, formatearCLP } = require('./cotizador');

const LOGO_ZLIB_PATH = path.join(__dirname, 'assets', 'logo-interchile.rgb.zlib');
const LOGO_META_PATH = path.join(__dirname, 'assets', 'logo-meta.json');
const LOGO_ZLIB = fs.existsSync(LOGO_ZLIB_PATH) ? fs.readFileSync(LOGO_ZLIB_PATH) : null;
const LOGO_META = fs.existsSync(LOGO_META_PATH)
  ? JSON.parse(fs.readFileSync(LOGO_META_PATH, 'utf8'))
  : null;

/**
 * Normaliza guiones largos, comillas y delimitadores PDF preservando caracteres WinAnsi (tildes y ñ).
 */
function sanitizePdfText(str) {
  if (str === null || str === undefined) return '-';
  return String(str)
    .replace(/[\r\n]+/g, ' ')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, '');
}

/**
 * Estima el ancho tipográfico aproximado de Helvetica para alinear textos a la derecha.
 */
function estimateTextWidth(str, size, bold = false) {
  const txt = sanitizePdfText(str).replace(/\\([()\\])/g, '$1');
  const scale = bold ? 0.56 : 0.52;
  let width = 0;
  for (const ch of txt) {
    if ('iIl1.,:;|! '.includes(ch)) width += size * 0.28;
    else if ('mwMW@'.includes(ch)) width += size * 0.78;
    else if (ch >= 'A' && ch <= 'Z') width += size * (bold ? 0.65 : 0.61);
    else width += size * scale;
  }
  return width;
}

function rectOp(x, y, w, h, fillRgb = null, strokeRgb = null, lineWidth = 0.5) {
  const ops = ['q'];
  if (fillRgb) ops.push(`${fillRgb} rg`);
  if (strokeRgb) ops.push(`${strokeRgb} RG ${lineWidth} w`);
  ops.push(`${x} ${y} ${w} ${h} re`);
  if (fillRgb && strokeRgb) ops.push('B');
  else if (fillRgb) ops.push('f');
  else ops.push('S');
  ops.push('Q');
  return ops.join('\n');
}

function lineOp(x1, y1, x2, y2, strokeRgb, lineWidth = 0.5) {
  return `q\n${strokeRgb} RG ${lineWidth} w\n${x1} ${y1} m\n${x2} ${y2} l\nS\nQ`;
}

function textOp(x, y, text, font = 'F1', size = 10, rgb = '0.133 0.149 0.180') {
  return `BT\n${rgb} rg\n/${font} ${size} Tf\n1 0 0 1 ${x} ${y} Tm\n(${sanitizePdfText(text)}) Tj\nET`;
}

function textRightOp(rightX, y, text, font = 'F1', size = 10, rgb = '0.133 0.149 0.180') {
  const x = Number((rightX - estimateTextWidth(text, size, font === 'F2')).toFixed(2));
  return textOp(x, y, text, font, size, rgb);
}

function clipText(str, maxLen) {
  const txt = String(str || '').trim();
  if (txt.length <= maxLen) return txt;
  return txt.slice(0, Math.max(0, maxLen - 3)) + '...';
}

function formatDateEs(dateInput) {
  const d = dateInput ? new Date(dateInput) : new Date();
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ];
  return `${d.getUTCDate()} de ${meses[d.getUTCMonth()]} de ${d.getUTCFullYear()}`;
}

/**
 * Genera un Buffer PDF (%PDF-1.4) corporativo siguiendo la línea gráfica InterChile Clima SpA.
 *
 * @param {Object} ticket - Ticket normalizado de la base de datos
 * @returns {Buffer} Buffer binario válido con encabezado %PDF-1.4
 */
function generarFichaCotizacionPDF(ticket = {}) {
  const id = ticket.id || 'S/N';
  const fechaCreacion = ticket.created_at
    ? new Date(ticket.created_at).toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
    : new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
  const fechaTexto = formatDateEs(ticket.created_at);
  const fechaVisita = ticket.fecha_visita
    ? new Date(ticket.fecha_visita).toISOString().replace('T', ' ').slice(0, 16) + ' UTC'
    : 'No agendada (referencial)';

  const clienteNombre = ticket.cliente_nombre || ticket.nombre_completo || 'Sin nombre registrado';
  const telefono = ticket.telefono || 'Sin teléfono';
  const comuna = ticket.sucursal_comuna || ticket.comuna || 'Por confirmar';
  const direccion = ticket.sucursal_direccion || ticket.direccion || 'Por confirmar';

  const motivo = ticket.motivo_principal || ticket.tipo_solicitud || 'Otra Consulta';
  const equipoTipo = ticket.equipo_tipo || 'Por confirmar';
  const equipoMarca = ticket.equipo_marca || 'Por confirmar';
  const sintoma = ticket.sintoma_observacion || 'Sin observaciones adicionales';
  const prioridad = ticket.prioridad_sugerida || ticket.prioridad || 'Normal';
  const estado = (ticket.estado || 'en_proceso').toUpperCase();
  const requiereHumano = ticket.requiere_humano ? 'SÍ (Derivado a ejecutivo)' : 'Bot automatizado';

  let neto = typeof ticket.cotizacion_neto === 'number' ? ticket.cotizacion_neto : null;
  let iva = typeof ticket.cotizacion_iva === 'number' ? ticket.cotizacion_iva : null;
  let total = typeof ticket.cotizacion_total === 'number' ? ticket.cotizacion_total : null;
  let conceptoTarifa = `Servicio referencial: ${motivo} (${equipoTipo})`;

  const calculada = calcularCotizacionBorrador({
    motivo_principal: motivo,
    equipo_tipo: equipoTipo,
    equipo_marca: equipoMarca,
    prioridad_sugerida: prioridad,
  });
  if (calculada) {
    if (calculada.items && calculada.items[0] && calculada.items[0].descripcion) {
      conceptoTarifa = calculada.items[0].descripcion;
    }
    if (neto === null || iva === null || total === null) {
      neto = calculada.subtotal_neto;
      iva = calculada.iva;
      total = calculada.total_clp;
    }
  }

  const esProyectoComplejo = /proyecto\s+comercial/i.test(motivo);
  const tieneDatoPorConfirmar =
    /dato por confirmar/i.test(equipoTipo) ||
    /dato por confirmar/i.test(equipoMarca) ||
    /repuesto por confirmar/i.test(sintoma);
  const sinTarifaCerrada =
    esProyectoComplejo || tieneDatoPorConfirmar || neto === null || iva === null || total === null;
  const kronosVerifLabel = ticket.catalogo_verificado
    ? 'SI (Equipo verificado en catalogo)'
    : 'NO (Referencial / Por confirmar)';

  // Paleta oficial extraída de los documentos de InterChile Clima SpA
  const C_BRAND = '0.620 0.063 0.275';      // #9e1046 burdeo institucional
  const C_BRAND_SOFT = '0.992 0.949 0.965'; // #fdf2f6 resaltado total
  const C_DARK = '0.133 0.149 0.180';       // #22262e carbón elegante
  const C_TEXT = '0.239 0.275 0.325';       // #3d4653 cuerpo legible
  const C_MUTED = '0.420 0.459 0.514';      // #6b7583 subtítulos y pie
  const C_BG_CARD = '0.953 0.961 0.969';    // #f3f5f7 tarjeta resumen gris suave
  const C_ROW_ALT = '0.980 0.984 0.988';    // #fafbfc fila alternada
  const C_LINE = '0.847 0.867 0.894';       // #d8dde4 divisores sutiles
  const C_WHITE = '1 1 1';
  const C_AMBER_BG = '1 0.984 0.929';
  const C_AMBER_BD = '0.835 0.510 0.090';
  const C_AMBER_TX = '0.573 0.251 0.055';

  const ops = [];

  // 1. MEMBRETE EDITORIAL LIMPIO (Logo izquierda + Clasificación derecha + Hairline)
  if (LOGO_ZLIB && LOGO_META) {
    const logoW = 128;
    const logoH = Number(((logoW * LOGO_META.height) / LOGO_META.width).toFixed(2));
    const logoY = Number((806 - logoH).toFixed(2));
    ops.push(`q\n${logoW} 0 0 ${logoH} 42 ${logoY} cm\n/Im1 Do\nQ`);
  } else {
    ops.push(textOp(42, 782, 'INTERCHILE CLIMA SPA', 'F2', 13, C_BRAND));
    ops.push(textOp(42, 768, 'SOLUCIONES AMBIENTALES', 'F1', 8.5, C_DARK));
  }

  const docEyebrow = sinTarifaCerrada ? 'SERVICIO TÉCNICO Y COMERCIAL' : 'PROPUESTA REFERENCIAL';
  ops.push(textRightOp(553, 792, docEyebrow, 'F2', 8.5, C_BRAND));
  ops.push(textRightOp(553, 779, 'CLIMATIZACIÓN Y VENTILACIÓN', 'F1', 8.5, C_TEXT));
  ops.push(textRightOp(553, 761, fechaTexto, 'F1', 8.5, C_MUTED));
  ops.push(lineOp(42, 734, 553, 734, C_LINE, 0.6));

  // 2. TITULO HERO + SUBRAYADO BURDEO + SUBTITULO
  const heroTitle = sinTarifaCerrada ? 'FICHA TÉCNICA DE LEVANTAMIENTO' : 'FICHA DE TRIAGE COMERCIAL';
  ops.push(textOp(42, 694, heroTitle, 'F2', 20, C_DARK));
  ops.push(rectOp(42, 681, 34, 3, C_BRAND));
  ops.push(
    textOp(
      42,
      663,
      `Ticket Folio #${id}  ·  Estimación del bot - No es presupuesto oficial emitido`,
      'F1',
      10,
      C_MUTED
    )
  );

  // 3. TARJETA RESUMEN EJECUTIVO (Estilo Carta Oferta / Informe Técnico)
  ops.push(rectOp(42, 588, 511, 62, C_BG_CARD));
  ops.push(lineOp(298, 597, 298, 641, C_LINE, 0.6));

  ops.push(textOp(54, 633, 'DESTINATARIO / CLIENTE', 'F2', 7.5, C_BRAND));
  ops.push(textOp(54, 619, clipText(clienteNombre, 34), 'F2', 10, C_DARK));
  ops.push(textOp(54, 603, `WhatsApp: ${clipText(telefono, 22)}  ·  ${clipText(comuna, 22)}`, 'F1', 8.5, C_TEXT));

  ops.push(textOp(312, 633, 'FOLIO Y ESTADO OPERATIVO', 'F2', 7.5, C_BRAND));
  ops.push(textOp(312, 619, `Folio #${id}  ·  Estado: ${estado}`, 'F2', 10, C_DARK));
  ops.push(textOp(312, 603, `Registro: ${fechaCreacion}`, 'F1', 8.5, C_TEXT));

  // 4. SECCION 01 — DATOS DE CONTACTO Y UBICACIÓN
  ops.push(textOp(42, 560, '01', 'F2', 11.5, C_BRAND));
  ops.push(textOp(62, 560, 'DATOS DEL SOLICITANTE Y UBICACIÓN', 'F2', 11.5, C_DARK));
  ops.push(rectOp(42, 512, 511, 40, C_ROW_ALT, C_LINE, 0.5));
  ops.push(lineOp(42, 532, 553, 532, C_LINE, 0.5));

  ops.push(textOp(52, 539, 'COMUNA / SUCURSAL', 'F2', 7.5, C_BRAND));
  ops.push(textOp(158, 539, clipText(comuna, 24), 'F1', 9, C_DARK));
  ops.push(textOp(310, 539, 'DIRECCIÓN REFERENCIAL', 'F2', 7.5, C_BRAND));
  ops.push(textOp(426, 539, clipText(direccion, 24), 'F1', 9, C_DARK));

  ops.push(textOp(52, 519, 'VISITA PROGRAMADA', 'F2', 7.5, C_BRAND));
  ops.push(textOp(158, 519, clipText(fechaVisita, 28), 'F1', 9, C_DARK));
  ops.push(textOp(310, 519, 'ATENCIÓN', 'F2', 7.5, C_BRAND));
  ops.push(textOp(426, 519, clipText(requiereHumano, 26), 'F1', 9, C_DARK));

  // 5. SECCION 02 — DIAGNÓSTICO DE TRIAGE Y VERIFICACIÓN KRONOS
  ops.push(textOp(42, 484, '02', 'F2', 11.5, C_BRAND));
  ops.push(textOp(62, 484, 'DIAGNÓSTICO TÉCNICO DE TRIAGE Y EQUIPO', 'F2', 11.5, C_DARK));

  ops.push(rectOp(42, 400, 511, 76, C_WHITE, C_LINE, 0.5));
  ops.push(rectOp(42, 456, 511, 20, C_BG_CARD));
  ops.push(lineOp(42, 456, 553, 456, C_LINE, 0.5));
  ops.push(lineOp(42, 437, 553, 437, C_LINE, 0.5));
  ops.push(lineOp(42, 418, 553, 418, C_LINE, 0.5));

  ops.push(textOp(52, 463, 'MOTIVO PRINCIPAL', 'F2', 7.5, C_BRAND));
  ops.push(textOp(158, 463, clipText(motivo, 22), 'F2', 9, C_DARK));
  ops.push(textOp(310, 463, 'PRIORIDAD', 'F2', 7.5, C_BRAND));
  ops.push(textOp(392, 463, clipText(prioridad, 20), 'F2', 9, C_DARK));

  ops.push(textOp(52, 444, 'TIPO DE EQUIPO', 'F2', 7.5, C_BRAND));
  ops.push(textOp(158, 444, clipText(equipoTipo, 24), 'F1', 9, C_DARK));
  ops.push(textOp(310, 444, 'MARCA / MODELO', 'F2', 7.5, C_BRAND));
  ops.push(textOp(392, 444, clipText(equipoMarca, 26), 'F1', 9, C_DARK));

  ops.push(textOp(52, 425, 'VALIDACIÓN KRONOS', 'F2', 7.5, C_BRAND));
  ops.push(textOp(158, 425, kronosVerifLabel, 'F1', 9, C_DARK));

  ops.push(textOp(52, 406, 'SÍNTOMA / DETALLE', 'F2', 7.5, C_BRAND));
  ops.push(textOp(158, 406, clipText(sintoma, 70), 'F1', 9, C_TEXT));

  // 6. SECCION 03 — TABLA BURDEO DE COTIZACIÓN O FICHA TÉCNICA DE LEVANTAMIENTO (CA-1 / CA-3)
  ops.push(textOp(42, 370, '03', 'F2', 11.5, C_BRAND));
  if (sinTarifaCerrada) {
    ops.push(textOp(62, 370, 'FICHA TECNICA DE LEVANTAMIENTO (SIN PRECIO CERRADO)', 'F2', 11.5, C_DARK));

    ops.push(rectOp(42, 244, 511, 116, C_AMBER_BG, C_AMBER_BD, 0.7));
    ops.push(rectOp(42, 338, 511, 22, C_AMBER_BD));
    ops.push(textOp(54, 345, 'EVALUACIÓN TÉCNICA REQUERIDA ANTES DE COTIZAR', 'F2', 9, C_WHITE));

    ops.push(textOp(54, 314, 'Valor sujeto a evaluacion y visita tecnica por ejecutivo comercial', 'F2', 11, C_AMBER_TX));
    ops.push(
      textOp(
        54,
        294,
        'Alcance comercial: Para proyectos complejos o equipos con campos por confirmar,',
        'F1',
        9,
        C_TEXT
      )
    );
    ops.push(
      textOp(
        54,
        280,
        'InterChile Clima SpA realiza levantamiento técnico en terreno previo al presupuesto oficial.',
        'F1',
        9,
        C_TEXT
      )
    );
    ops.push(textOp(54, 256, 'Estado tarifario: Sin monto cerrado inventado (regla anti-alucinaciones activa).', 'F2', 8.5, C_BRAND));
  } else {
    ops.push(textOp(62, 370, 'ESTIMACIÓN REFERENCIAL DEL BOT (NO ES PRESUPUESTO OFICIAL)', 'F2', 11.5, C_DARK));

    ops.push(rectOp(42, 246, 511, 114, C_WHITE, C_LINE, 0.6));
    // Encabezado burdeo estilo Informe Técnico InterChile
    ops.push(rectOp(42, 336, 511, 24, C_BRAND));
    ops.push(textOp(54, 344, 'CONCEPTO / SERVICIO REFERENCIAL', 'F2', 8.5, C_WHITE));
    ops.push(textRightOp(541, 344, 'MONTO (CLP)', 'F2', 8.5, C_WHITE));

    ops.push(textOp(54, 317, clipText(conceptoTarifa, 78), 'F1', 9.2, C_DARK));
    ops.push(textRightOp(541, 317, formatearCLP(neto), 'F1', 9.5, C_DARK));
    ops.push(lineOp(42, 308, 553, 308, C_LINE, 0.5));

    ops.push(textOp(54, 293, 'Subtotal Neto Estimado', 'F1', 9, C_MUTED));
    ops.push(textRightOp(541, 293, formatearCLP(neto), 'F1', 9, C_DARK));
    ops.push(lineOp(42, 285, 553, 285, C_LINE, 0.5));

    ops.push(textOp(54, 271, 'IVA (19%)', 'F1', 9, C_MUTED));
    ops.push(textRightOp(541, 271, formatearCLP(iva), 'F1', 9, C_DARK));

    // Fila Total destacada en burdeo suave
    ops.push(rectOp(42, 246, 511, 21, C_BRAND_SOFT, C_BRAND, 0.6));
    ops.push(textOp(54, 253, 'TOTAL ESTIMADO REFERENCIAL', 'F2', 9.5, C_BRAND));
    ops.push(textRightOp(541, 253, formatearCLP(total), 'F2', 10, C_BRAND));
  }

  // 7. BLOQUE DE FIRMA / CONTACTO COMERCIAL (Estilo Carta Oferta InterChile)
  ops.push(textOp(42, 206, 'Atentamente,', 'F1', 9.5, C_TEXT));
  ops.push(textOp(42, 184, 'Benjamín Yáñez Lasalvia', 'F2', 10.5, C_DARK));
  ops.push(lineOp(42, 178, 236, 178, C_DARK, 0.6));
  ops.push(textOp(42, 165, 'INTERCHILE CLIMA SpA  ·  Contacto Comercial', 'F2', 9, C_BRAND));
  ops.push(textOp(42, 152, 'Correo: Benjamin@interchileclima.cl  |  WhatsApp: +56 9 9440 2632', 'F1', 9, C_MUTED));

  // Nota legal sutil encima del footer
  ops.push(
    textOp(
      42,
      78,
      'Nota: Los valores y datos mostrados corresponden a una estimación automatizada de triage.',
      'F1',
      8,
      C_MUTED
    )
  );
  ops.push(
    textOp(
      42,
      67,
      'No constituyen diagnóstico técnico definitivo ni presupuesto oficial de InterChile Clima SpA.',
      'F1',
      8,
      C_MUTED
    )
  );

  // 8. FOOTER INSTITUCIONAL DE 3 COLUMNAS (Exacto al estándar de Benjamín)
  ops.push(lineOp(42, 52, 553, 52, C_LINE, 0.6));
  ops.push(textOp(42, 36, 'INTERCHILE CLIMA SpA', 'F1', 8, C_MUTED));
  ops.push(textOp(268, 36, 'interchileclima.cl', 'F1', 8, C_MUTED));
  ops.push(textRightOp(553, 36, `FOLIO #${id} · TRIAGE COMERCIAL`, 'F1', 8, C_MUTED));

  const contentStream = ops.join('\n');
  const xobjResource = LOGO_ZLIB && LOGO_META ? '/XObject << /Im1 7 0 R >> ' : '';

  const objBuffers = [
    Buffer.from('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n', 'latin1'),
    Buffer.from('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n', 'latin1'),
    Buffer.from(
      `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> ${xobjResource}>> /Contents 6 0 R >>\nendobj\n`,
      'latin1'
    ),
    Buffer.from('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n', 'latin1'),
    Buffer.from('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n', 'latin1'),
    Buffer.from(
      `6 0 obj\n<< /Length ${Buffer.byteLength(contentStream, 'latin1')} >>\nstream\n${contentStream}\nendstream\nendobj\n`,
      'latin1'
    ),
  ];

  if (LOGO_ZLIB && LOGO_META) {
    const imgHeader = Buffer.from(
      `7 0 obj\n<< /Type /XObject /Subtype /Image /Width ${LOGO_META.width} /Height ${LOGO_META.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /Length ${LOGO_ZLIB.length} >>\nstream\n`,
      'latin1'
    );
    const imgFooter = Buffer.from('\nendstream\nendobj\n', 'latin1');
    objBuffers.push(Buffer.concat([imgHeader, LOGO_ZLIB, imgFooter]));
  }

  const headerBuf = Buffer.from('%PDF-1.4\n', 'latin1');
  const chunks = [headerBuf];
  const offsets = [0];
  let byteOffset = headerBuf.length;

  for (const buf of objBuffers) {
    offsets.push(byteOffset);
    chunks.push(buf);
    byteOffset += buf.length;
  }

  const xrefOffset = byteOffset;
  let xrefStr = `xref\n0 ${objBuffers.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objBuffers.length; i++) {
    xrefStr += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  xrefStr += `trailer\n<< /Size ${objBuffers.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  chunks.push(Buffer.from(xrefStr, 'latin1'));

  return Buffer.concat(chunks);
}

module.exports = {
  generarFichaCotizacionPDF,
  formatearCLP,
};
