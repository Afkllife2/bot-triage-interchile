/**
 * src/pdfGenerator.js
 *
 * 📄 [INT-HU-05] (AAI-25 / AAI-87): Generador de Ficha Técnica de Triage y Borrador de Cotización en PDF
 *
 * Construye un documento PDF estándar (%PDF-1.4) corporativo en memoria (Buffer)
 * con logotipo oficial de InterChile Clima SpA incrustado vía FlateDecode,
 * sin dependencias pesadas (0 Chromium), garantizando < 5 ms en Render.
 */

const fs = require('fs');
const path = require('path');
const { calcularCotizacionBorrador, formatearCLP } = require('./cotizador');

// Cargar logotipo pre-comprimido una sola vez en memoria al iniciar el módulo
const LOGO_ZLIB_PATH = path.join(__dirname, 'assets', 'logo-interchile.rgb.zlib');
const LOGO_META_PATH = path.join(__dirname, 'assets', 'logo-meta.json');
const LOGO_ZLIB = fs.existsSync(LOGO_ZLIB_PATH) ? fs.readFileSync(LOGO_ZLIB_PATH) : null;
const LOGO_META = fs.existsSync(LOGO_META_PATH)
  ? JSON.parse(fs.readFileSync(LOGO_META_PATH, 'utf8'))
  : null;

/**
 * Normaliza guiones largos, caracteres latinos a WinAnsi (ISO-8859-1) y escapa delimitadores PDF.
 * @param {string} str
 * @returns {string}
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
 * Emite comandos PDF para rectángulos de relleno / borde.
 */
function rectOp(x, y, w, h, fillRgb = null, strokeRgb = null, lineWidth = 0.6) {
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

/**
 * Emite comando PDF de texto posicionado con color opcional.
 */
function textOp(x, y, text, font = 'F1', size = 10, rgb = '0.118 0.161 0.231') {
  return `BT\n${rgb} rg\n/${font} ${size} Tf\n1 0 0 1 ${x} ${y} Tm\n(${sanitizePdfText(text)}) Tj\nET`;
}

/**
 * Trunca texto limpiamente para evitar desbordes horizontales dentro de cajas.
 */
function clipText(str, maxLen) {
  const txt = String(str || '').trim();
  if (txt.length <= maxLen) return txt;
  return txt.slice(0, Math.max(0, maxLen - 3)) + '...';
}

/**
 * Genera un Buffer PDF (%PDF-1.4) corporativo con los datos del ticket y su estimación referencial.
 *
 * @param {Object} ticket - Ticket normalizado de la base de datos
 * @returns {Buffer} Buffer binario válido con encabezado %PDF-1.4
 */
function generarFichaCotizacionPDF(ticket = {}) {
  const id = ticket.id || 'S/N';
  const fechaCreacion = ticket.created_at
    ? new Date(ticket.created_at).toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
    : new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
  const fechaVisita = ticket.fecha_visita
    ? new Date(ticket.fecha_visita).toISOString().replace('T', ' ').slice(0, 16) + ' UTC'
    : 'No agendada (referencial)';

  const clienteNombre = ticket.cliente_nombre || ticket.nombre_completo || 'Sin nombre registrado';
  const telefono = ticket.telefono || 'Sin telefono';
  const comuna = ticket.sucursal_comuna || ticket.comuna || 'Por confirmar';
  const direccion = ticket.sucursal_direccion || ticket.direccion || 'Por confirmar';

  const motivo = ticket.motivo_principal || ticket.tipo_solicitud || 'Otra Consulta';
  const equipoTipo = ticket.equipo_tipo || 'Por confirmar';
  const equipoMarca = ticket.equipo_marca || 'Por confirmar';
  const sintoma = ticket.sintoma_observacion || 'Sin observaciones adicionales';
  const prioridad = ticket.prioridad_sugerida || ticket.prioridad || 'Normal';
  const estado = ticket.estado || 'en_proceso';
  const requiereHumano = ticket.requiere_humano ? 'SI (Derivado a Ejecutivo)' : 'NO (Atencion Automatizada)';

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

  // Paleta corporativa InterChile Clima SpA (#9e1046)
  const C_BRAND = '0.620 0.063 0.275';
  const C_BRAND_SOFT = '0.992 0.949 0.965';
  const C_DARK = '0.118 0.161 0.231';
  const C_MUTED = '0.392 0.455 0.545';
  const C_BORDER = '0.796 0.835 0.882';
  const C_BG_LIGHT = '0.969 0.980 0.992';
  const C_WHITE = '1 1 1';
  const C_AMBER_BG = '1 0.984 0.922';
  const C_AMBER_BD = '0.851 0.467 0.024';
  const C_AMBER_TX = '0.573 0.251 0.055';

  const ops = [];

  // Bandas superior e inferior institucionales
  ops.push(rectOp(0, 832, 595, 10, C_BRAND));
  ops.push(rectOp(0, 0, 595, 8, C_BRAND));

  // Logo corporativo (arriba a la izquierda)
  if (LOGO_ZLIB && LOGO_META) {
    const logoW = 148;
    const logoH = Number(((logoW * LOGO_META.height) / LOGO_META.width).toFixed(2));
    const logoY = Number((816 - logoH).toFixed(2));
    ops.push(`q\n${logoW} 0 0 ${logoH} 42 ${logoY} cm\n/Im1 Do\nQ`);
  } else {
    ops.push(textOp(42, 788, 'INTERCHILE CLIMA SPA', 'F2', 14, C_BRAND));
    ops.push(textOp(42, 773, 'SOLUCIONES AMBIENTALES', 'F1', 9.5, C_DARK));
  }

  // Encabezado derecho y aviso destacado
  ops.push(textOp(212, 800, 'FICHA DE TRIAGE COMERCIAL', 'F2', 15.5, C_BRAND));
  ops.push(textOp(212, 783, 'InterChile Clima SpA - Soluciones Ambientales', 'F2', 9.5, C_DARK));
  ops.push(rectOp(212, 746, 341, 28, C_AMBER_BG, C_AMBER_BD, 0.7));
  ops.push(textOp(221, 762, 'AVISO IMPORTANTE:', 'F2', 8.5, C_AMBER_TX));
  ops.push(
    textOp(221, 751, 'Ficha de triage / Estimacion del bot - No es presupuesto oficial emitido', 'F1', 8.5, C_AMBER_TX)
  );

  // Barra de metadatos del Ticket
  ops.push(rectOp(42, 704, 511, 26, C_BG_LIGHT, C_BORDER, 0.7));
  ops.push(
    textOp(
      54,
      714,
      `Ticket Folio: #${id}     |     Fecha Emision: ${fechaCreacion}     |     Estado: ${estado.toUpperCase()}`,
      'F2',
      9,
      C_DARK
    )
  );

  // SECCION 1: DATOS DE CONTACTO Y UBICACION
  ops.push(rectOp(42, 608, 511, 82, C_WHITE, C_BORDER, 0.7));
  ops.push(rectOp(42, 668, 511, 22, C_BRAND));
  ops.push(textOp(54, 675, '1. DATOS DE CONTACTO Y UBICACION', 'F2', 10, C_WHITE));

  ops.push(textOp(54, 650, 'Cliente / Empresa:', 'F2', 9.5, C_MUTED));
  ops.push(textOp(152, 650, clipText(clienteNombre, 26), 'F1', 9.5, C_DARK));
  ops.push(textOp(324, 650, 'Telefono WhatsApp:', 'F2', 9.5, C_MUTED));
  ops.push(textOp(424, 650, clipText(telefono, 20), 'F1', 9.5, C_DARK));

  ops.push(textOp(54, 632, 'Comuna / Sucursal:', 'F2', 9.5, C_MUTED));
  ops.push(textOp(152, 632, clipText(comuna, 56), 'F1', 9.5, C_DARK));

  ops.push(textOp(54, 615, 'Direccion:', 'F2', 9.5, C_MUTED));
  ops.push(textOp(152, 615, clipText(direccion, 62), 'F1', 9.5, C_DARK));

  // SECCION 2: DIAGNOSTICO DE TRIAGE Y EQUIPO
  ops.push(rectOp(42, 452, 511, 142, C_WHITE, C_BORDER, 0.7));
  ops.push(rectOp(42, 572, 511, 22, C_DARK));
  ops.push(textOp(54, 579, '2. DIAGNOSTICO DE TRIAGE Y EQUIPO', 'F2', 10, C_WHITE));

  ops.push(textOp(54, 554, 'Motivo Principal:', 'F2', 9.5, C_MUTED));
  ops.push(textOp(156, 554, clipText(motivo, 26), 'F1', 9.5, C_DARK));
  ops.push(textOp(324, 554, 'Prioridad Sugerida:', 'F2', 9.5, C_MUTED));
  ops.push(textOp(426, 554, clipText(prioridad, 18), 'F2', 9.5, C_DARK));

  ops.push(textOp(54, 536, 'Tipo de Equipo:', 'F2', 9.5, C_MUTED));
  ops.push(textOp(156, 536, clipText(equipoTipo, 26), 'F1', 9.5, C_DARK));
  ops.push(textOp(324, 536, 'Marca / Modelo:', 'F2', 9.5, C_MUTED));
  ops.push(textOp(426, 536, clipText(equipoMarca, 22), 'F1', 9.5, C_DARK));

  ops.push(textOp(54, 518, 'Validacion Kronos:', 'F2', 9.5, C_MUTED));
  ops.push(textOp(156, 518, kronosVerifLabel, 'F1', 9.5, C_DARK));

  ops.push(textOp(54, 500, 'Requiere Persona:', 'F2', 9.5, C_MUTED));
  ops.push(textOp(156, 500, requiereHumano, 'F1', 9.5, C_DARK));

  ops.push(textOp(54, 482, 'Visita Referencial:', 'F2', 9.5, C_MUTED));
  ops.push(textOp(156, 482, fechaVisita, 'F1', 9.5, C_DARK));

  ops.push(textOp(54, 464, 'Sintoma / Detalle:', 'F2', 9.5, C_MUTED));
  ops.push(textOp(156, 464, clipText(sintoma, 70), 'F1', 9.5, C_DARK));

  // SECCION 3: ESTIMACION COMERCIAL O FICHA DE LEVANTAMIENTO (CA-1 / CA-3)
  if (sinTarifaCerrada) {
    ops.push(rectOp(42, 278, 511, 158, C_AMBER_BG, C_AMBER_BD, 0.8));
    ops.push(rectOp(42, 414, 511, 22, C_AMBER_BD));
    ops.push(textOp(54, 421, '3. FICHA TECNICA DE LEVANTAMIENTO (SIN PRECIO CERRADO)', 'F2', 10, C_WHITE));

    ops.push(textOp(54, 386, 'Valor sujeto a evaluacion y visita tecnica por ejecutivo comercial', 'F2', 11, C_AMBER_TX));
    ops.push(
      textOp(
        54,
        362,
        'Alcance comercial: Para proyectos complejos o equipos con datos por confirmar,',
        'F1',
        9.5,
        C_DARK
      )
    );
    ops.push(
      textOp(
        54,
        348,
        'InterChile Clima SpA realiza levantamiento tecnico previo antes de emitir presupuesto oficial.',
        'F1',
        9.5,
        C_DARK
      )
    );
    ops.push(rectOp(54, 294, 487, 36, C_WHITE, C_BORDER, 0.6));
    ops.push(textOp(66, 314, 'Contacto Ejecutivo Comercial:', 'F2', 9.5, C_BRAND));
    ops.push(
      textOp(66, 300, 'Benjamin Yanez  |  Correo: Benjamin@interchileclima.cl  |  WhatsApp: +56 9 9440 2632', 'F1', 9.5, C_DARK)
    );
  } else {
    ops.push(rectOp(42, 266, 511, 170, C_WHITE, C_BORDER, 0.7));
    ops.push(rectOp(42, 414, 511, 22, C_BRAND));
    ops.push(textOp(54, 421, '3. ESTIMACION DEL BOT (NO ES PRESUPUESTO OFICIAL)', 'F2', 10, C_WHITE));

    // Cabecera de tabla
    ops.push(rectOp(54, 384, 487, 20, C_BG_LIGHT, C_BORDER, 0.5));
    ops.push(textOp(64, 390, 'Concepto / Servicio Referencial', 'F2', 9, C_MUTED));
    ops.push(textOp(436, 390, 'Valor (CLP)', 'F2', 9, C_MUTED));

    // Fila detalle servicio
    ops.push(textOp(64, 366, clipText(conceptoTarifa, 64), 'F1', 9.5, C_DARK));
    ops.push(textOp(436, 366, formatearCLP(neto), 'F1', 9.5, C_DARK));

    // Subtotal Neto y IVA 19%
    ops.push(textOp(64, 344, 'Subtotal Neto Estimado:', 'F1', 9.5, C_MUTED));
    ops.push(textOp(436, 344, formatearCLP(neto), 'F1', 9.5, C_DARK));

    ops.push(textOp(64, 326, 'IVA (19%):', 'F1', 9.5, C_MUTED));
    ops.push(textOp(436, 326, formatearCLP(iva), 'F1', 9.5, C_DARK));

    // Total destacado
    ops.push(rectOp(54, 292, 487, 24, C_BRAND_SOFT, C_BRAND, 0.8));
    ops.push(textOp(64, 300, 'Total Estimado Referencial:', 'F2', 10.5, C_BRAND));
    ops.push(textOp(436, 300, formatearCLP(total), 'F2', 10.5, C_BRAND));

    ops.push(
      textOp(54, 274, 'Contacto comercial: Benjamin Yanez (Benjamin@interchileclima.cl / +56 9 9440 2632)', 'F1', 8.5, C_MUTED)
    );
  }

  // Pie de página corporativo
  ops.push(rectOp(42, 74, 511, 0.7, C_BORDER));
  ops.push(textOp(42, 58, 'InterChile Clima SpA - Soluciones Ambientales | Bot de Triage Comercial WhatsApp', 'F2', 8, C_BRAND));
  ops.push(
    textOp(
      42,
      45,
      'Nota: Los importes indicados corresponden a una estimacion automatizada de triage.',
      'F1',
      8,
      C_MUTED
    )
  );
  ops.push(
    textOp(
      42,
      34,
      'No constituyen diagnostico validado ni presupuesto oficial de InterChile Climatizacion.',
      'F1',
      8,
      C_MUTED
    )
  );

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
