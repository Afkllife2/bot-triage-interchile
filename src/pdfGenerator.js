/**
 * src/pdfGenerator.js
 *
 * 📄 [INT-HU-05] (AAI-25 / AAI-87): Generador de Ficha Técnica de Triage y Borrador de Cotización en PDF
 *
 * Construye un documento PDF estándar (%PDF-1.4) en memoria (Buffer) sin dependencias
 * nativas externas, garantizando compatibilidad 100% en Render y ejecución en < 5 ms.
 *
 * Incluye sello explícito:
 * "Ficha de triage · Estimación del bot · No es presupuesto oficial emitido"
 */

const { calcularCotizacionBorrador, formatearCLP } = require('./cotizador');

/**
 * Normaliza caracteres latinos a WinAnsi (ISO-8859-1) y escapa delimitadores PDF.
 * @param {string} str
 * @returns {string}
 */
function sanitizePdfText(str) {
  if (str === null || str === undefined) return '-';
  return String(str)
    .replace(/[\r\n]+/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, '');
}

/**
 * Genera un Buffer PDF (%PDF-1.4) con los datos del ticket de triage y su estimación referencial.
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

  // Obtener montos persistidos o calcular borrador si no vienen precalculados
  let neto = typeof ticket.cotizacion_neto === 'number' ? ticket.cotizacion_neto : null;
  let iva = typeof ticket.cotizacion_iva === 'number' ? ticket.cotizacion_iva : null;
  let total = typeof ticket.cotizacion_total === 'number' ? ticket.cotizacion_total : null;

  if (neto === null || iva === null || total === null) {
    const calculada = calcularCotizacionBorrador({
      motivo_principal: motivo,
      equipo_tipo: equipoTipo,
      equipo_marca: equipoMarca,
      prioridad_sugerida: prioridad,
    });
    if (calculada) {
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
  const kronosVerifLabel = ticket.catalogo_verificado ? 'SI (Equipo verificado en catalogo)' : 'NO (Referencial / Por confirmar)';

  const bloqueEconomico = sinTarifaCerrada
    ? [
        { font: 'F2', size: 11, y: 470, text: '3. FICHA TECNICA DE LEVANTAMIENTO (SIN PRECIO CERRADO)' },
        { font: 'F2', size: 10, y: 450, text: 'Valor sujeto a evaluacion y visita tecnica por ejecutivo comercial' },
        { font: 'F1', size: 9.5, y: 434, text: 'Criterio CA-3: No se emiten montos cerrados para proyectos complejos o campos por confirmar.' },
        { font: 'F1', size: 9.5, y: 416, text: 'Contacto comercial: Benjamin Yanez (Benjamin@interchileclima.cl / +56 9 9440 2632)' },
      ]
    : [
        { font: 'F2', size: 11, y: 470, text: '3. ESTIMACION DEL BOT (NO ES PRESUPUESTO OFICIAL)' },
        { font: 'F1', size: 10, y: 450, text: `Subtotal Neto Estimado: ${formatearCLP(neto)}` },
        { font: 'F1', size: 10, y: 434, text: `IVA (19%): ${formatearCLP(iva)}` },
        { font: 'F2', size: 11, y: 416, text: `Total Estimado Referencial: ${formatearCLP(total)}` },
      ];

  const lineas = [
    { font: 'F2', size: 15, y: 780, text: 'INTERCHILE CLIMATIZACION — FICHA DE TRIAGE COMERCIAL' },
    { font: 'F2', size: 10, y: 762, text: 'AVISO: Ficha de triage / Estimacion del bot - No es presupuesto oficial emitido' },
    { font: 'F1', size: 9, y: 744, text: `Ticket ID: #${id}   |   Fecha Creacion: ${fechaCreacion}   |   Estado: ${estado.toUpperCase()}` },
    { font: 'F1', size: 9, y: 730, text: '--------------------------------------------------------------------------------------------------' },
    { font: 'F2', size: 11, y: 710, text: '1. DATOS DE CONTACTO Y UBICACION' },
    { font: 'F1', size: 10, y: 692, text: `Cliente / Empresa: ${clienteNombre}` },
    { font: 'F1', size: 10, y: 676, text: `Telefono WhatsApp: ${telefono}` },
    { font: 'F1', size: 10, y: 660, text: `Comuna / Sucursal: ${comuna}` },
    { font: 'F1', size: 10, y: 644, text: `Direccion: ${direccion}` },
    { font: 'F1', size: 9, y: 626, text: '--------------------------------------------------------------------------------------------------' },
    { font: 'F2', size: 11, y: 606, text: '2. DIAGNOSTICO DE TRIAGE Y EQUIPO' },
    { font: 'F1', size: 10, y: 588, text: `Motivo Principal: ${motivo}` },
    { font: 'F1', size: 10, y: 572, text: `Tipo de Equipo: ${equipoTipo}   |   Marca: ${equipoMarca}` },
    { font: 'F1', size: 10, y: 556, text: `Validacion Catalogo Kronos: ${kronosVerifLabel}` },
    { font: 'F1', size: 10, y: 540, text: `Sintoma / Observacion: ${sintoma.slice(0, 85)}` },
    { font: 'F1', size: 10, y: 524, text: `Prioridad Sugerida: ${prioridad}   |   Requiere Persona: ${requiereHumano}` },
    { font: 'F1', size: 10, y: 508, text: `Fecha Visita Referencial: ${fechaVisita}` },
    { font: 'F1', size: 9, y: 490, text: '--------------------------------------------------------------------------------------------------' },
    ...bloqueEconomico,
    { font: 'F1', size: 8, y: 384, text: 'Nota: Los importes indicados corresponden a una estimacion automatizada de triage.' },
    { font: 'F1', size: 8, y: 371, text: 'No constituyen diagnostico validado ni presupuesto oficial de InterChile Climatizacion.' },
  ];

  const streamOps = ['BT'];
  for (const linea of lineas) {
    const safeText = sanitizePdfText(linea.text);
    streamOps.push(`/${linea.font} ${linea.size} Tf`);
    streamOps.push(`1 0 0 1 48 ${linea.y} Tm`);
    streamOps.push(`(${safeText}) Tj`);
  }
  streamOps.push('ET');
  const contentStream = streamOps.join('\n');

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n',
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n',
    `6 0 obj\n<< /Length ${Buffer.byteLength(contentStream, 'latin1')} >>\nstream\n${contentStream}\nendstream\nendobj\n`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, 'latin1'));
    pdf += obj;
  }

  const xrefOffset = Buffer.byteLength(pdf, 'latin1');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, 'latin1');
}

module.exports = {
  generarFichaCotizacionPDF,
  formatearCLP,
};
