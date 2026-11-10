// Generador mínimo de PDFs de una página (A4, texto con Helvetica), sin dependencias.
// Los textos se codifican en Latin-1 (WinAnsi), suficiente para español.

const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN = 56;
const FOOTER_TEXT = 'Documento de prueba - datos ficticios';

const escapePdf = (text) => text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

// Reemplaza lo que no entra en Latin-1 por un equivalente simple
const toLatin1 = (text) => String(text).replace(/[–—]/g, '-').replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/[^\x00-\xFF]/g, '?');

// Corte de línea por cantidad aproximada de caracteres (Helvetica ≈ 0,5 em por carácter)
function wrap(text, fontSize, width) {
  const maxChars = Math.floor(width / (fontSize * 0.5));
  const words = String(text).split(/\s+/);
  const lines = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxChars) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = (current + ' ' + word).trim();
    }
  }
  if (current) lines.push(current);
  return lines;
}

// blocks: [{ text, size?, bold?, gap? , indent? }]  — se escriben de arriba hacia abajo.
export function buildPdf({ blocks }) {
  const ops = [];
  let y = PAGE_H - MARGIN;
  const line = (text, { size = 11, bold = false, indent = 0 } = {}) => {
    ops.push(`BT /${bold ? 'F2' : 'F1'} ${size} Tf ${MARGIN + indent} ${y} Td (${escapePdf(toLatin1(text))}) Tj ET`);
  };

  for (const block of blocks) {
    const size = block.size ?? 11;
    const indent = block.indent ?? 0;
    y -= block.gapBefore ?? 0;
    if (block.rule) {
      ops.push(`0.6 w ${MARGIN} ${y} m ${PAGE_W - MARGIN} ${y} l S`);
      y -= 14;
      continue;
    }
    for (const piece of wrap(block.text, size, PAGE_W - 2 * MARGIN - indent)) {
      line(piece, { size, bold: block.bold, indent });
      y -= size * 1.5;
    }
  }

  // Pie de página fijo
  ops.push(`0.6 w ${MARGIN} 62 m ${PAGE_W - MARGIN} 62 l S`);
  ops.push(`BT /F1 9 Tf ${MARGIN} 46 Td (${escapePdf(FOOTER_TEXT)}) Tj ET`);

  const stream = ops.join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>`,
    `<< /Length ${Buffer.byteLength(stream, 'latin1')} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [];
  objects.forEach((body, index) => {
    offsets.push(Buffer.byteLength(pdf, 'latin1'));
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(pdf, 'latin1');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(pdf, 'latin1');
}

const formatFecha = (iso) => iso.split('-').reverse().join('/');

export function recetaPdf({ medico, paciente, obraSocial, fecha, rp }) {
  const blocks = [
    { text: medico.hospital, size: 16, bold: true },
    { text: `${medico.address}, ${medico.city}`, size: 10 },
    { rule: true, gapBefore: 4 },
    { text: 'RECETA MÉDICA', size: 14, bold: true, gapBefore: 6 },
    { text: `Fecha: ${formatFecha(fecha)}`, gapBefore: 4 },
    { text: `Paciente: ${paciente.firstName} ${paciente.lastName}`, gapBefore: 8 },
    { text: `DNI: ${paciente.dni}     Fecha de nacimiento: ${formatFecha(paciente.dateOfBirth)}` },
    { text: `Obra social: ${obraSocial}` },
    { rule: true, gapBefore: 4 },
    { text: 'Rp/', size: 14, bold: true, gapBefore: 6 }
  ];
  rp.forEach(([medicamento, indicacion], i) => {
    blocks.push({ text: `${i + 1}. ${medicamento}`, bold: true, gapBefore: 8, indent: 8 });
    blocks.push({ text: indicacion, indent: 24 });
  });
  blocks.push({ text: `${medico.titulo} ${medico.firstName} ${medico.lastName}`, bold: true, gapBefore: 60 });
  blocks.push({ text: `${medico.specialty} - Matrícula ${medico.licenseNumber}` });
  return buildPdf({ blocks });
}

export function estudioPdf({ institucion, titulo, paciente, fecha, informe, notas }) {
  const blocks = [
    { text: institucion, size: 16, bold: true },
    { rule: true, gapBefore: 4 },
    { text: 'INFORME DE ESTUDIO', size: 14, bold: true, gapBefore: 6 },
    { text: titulo, size: 12, bold: true, gapBefore: 4 },
    { text: `Fecha del estudio: ${formatFecha(fecha)}`, gapBefore: 4 },
    { text: `Paciente: ${paciente.firstName} ${paciente.lastName}`, gapBefore: 8 },
    { text: `DNI: ${paciente.dni}     Fecha de nacimiento: ${formatFecha(paciente.dateOfBirth)}` },
    { rule: true, gapBefore: 4 }
  ];
  if (notas) blocks.push({ text: `Motivo: ${notas}`, gapBefore: 6 });
  informe.forEach((linea, i) => blocks.push({ text: linea, gapBefore: i === 0 ? 8 : 4 }));
  return buildPdf({ blocks });
}
