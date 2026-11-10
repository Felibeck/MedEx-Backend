// Genera PDFs mock (recetas y estudios) y los sube con los métodos existentes del backend.
// Solo toca usuarios/consultas mock: usa los ids que dejó scripts/seed-mock-data.js en
// .mock-seed-state.local.json y las credenciales de .mock-credentials.local.json.
//
//   - Recetas: DoctorRepository.subirReceta(consultaId, buffer, nombre, titulo)
//     -> bucket "recetas" + fila en tabla recetas (la misma ruta que usa crearConsulta).
//   - Estudios: POST /api/patients/:usuarioId/estudios/upload, autenticado como el paciente
//     mock -> bucket "estudios" + fila en tabla estudios.
//
// Uso (backend corriendo en MOCK_API_BASE, default http://localhost:3000):
//   node scripts/seed-mock-files.js --first   # sube UNA receta y UN estudio (prueba)
//   node scripts/seed-mock-files.js           # sube todo lo que falte
//
// Es idempotente: lo ya subido queda registrado en .mock-uploads.local.json (rutas del
// storage, ignorado por git) y no se repite. No sube nada a prescripciones.

import 'dotenv/config';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import supabase from '../src/configs/database.js';
import { DoctorRepository } from '../src/repositories/doctor-repository.js';
import { MEDICOS, PACIENTES } from '../database/mock/mock-data.js';
import { RECETAS, ESTUDIOS, OBRA_SOCIAL } from '../database/mock/mock-files.js';
import { recetaPdf, estudioPdf } from '../database/mock/pdf-simple.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = (process.env.MOCK_API_BASE || 'http://localhost:3000').replace(/\/$/, '');
const FILES_DIR = path.join(ROOT, '.mock-files.local');
const CREDENTIALS_FILE = path.join(ROOT, '.mock-credentials.local.json');
const STATE_FILE = path.join(ROOT, '.mock-seed-state.local.json');
const UPLOADS_FILE = path.join(ROOT, '.mock-uploads.local.json');
const onlyFirst = process.argv.includes('--first');

for (const file of [CREDENTIALS_FILE, STATE_FILE]) {
  if (!existsSync(file)) {
    console.error(`Falta ${path.basename(file)}: correr primero scripts/seed-mock-data.js`);
    process.exit(1);
  }
}
const credentials = JSON.parse(readFileSync(CREDENTIALS_FILE, 'utf8'));
const state = JSON.parse(readFileSync(STATE_FILE, 'utf8'));
const uploads = existsSync(UPLOADS_FILE) ? JSON.parse(readFileSync(UPLOADS_FILE, 'utf8')) : { recetas: {}, estudios: {} };
const saveUploads = () => writeFileSync(UPLOADS_FILE, JSON.stringify(uploads, null, 2));

const medicoByKey = Object.fromEntries(MEDICOS.map((m) => [m.key, m]));
const pacienteByKey = Object.fromEntries(PACIENTES.map((p) => [p.key, p]));
const slug = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const writePdf = (subdir, name, buffer) => {
  const dir = path.join(FILES_DIR, subdir);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, name), buffer);
};

async function subirRecetas(limit) {
  const repo = new DoctorRepository(supabase);
  let hechas = 0;
  for (const receta of RECETAS) {
    if (hechas >= limit) break;
    const key = `${receta.paciente}|${receta.fecha}|${receta.medico}`;
    if (uploads.recetas[key]) continue;

    const consultaId = state.consultas[key];
    if (!consultaId) throw new Error(`No hay consulta mock para la receta ${key}`);

    const paciente = pacienteByKey[receta.paciente];
    const medico = medicoByKey[receta.medico];
    const buffer = recetaPdf({ medico, paciente, obraSocial: OBRA_SOCIAL[receta.paciente], fecha: receta.fecha, rp: receta.rp });
    const nombre = `receta-${slug(paciente.lastName)}-${receta.fecha}.pdf`;
    writePdf('recetas', nombre, buffer);

    const fila = await repo.subirReceta(consultaId, buffer, nombre, receta.titulo);
    uploads.recetas[key] = { receta_id: fila.id, consulta_id: consultaId, bucket: 'recetas', path: fila.pathFile, titulo: receta.titulo };
    saveUploads();
    hechas++;
    console.log(`  receta subida: ${receta.titulo} (${paciente.firstName} ${paciente.lastName}, ${receta.fecha})`);
  }
  return hechas;
}

async function loginPaciente(paciente) {
  const res = await fetch(`${BASE}/api/patients/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: paciente.email, password: credentials[paciente.email] })
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Login de ${paciente.key} falló (${res.status}): ${json.message}`);
  return { token: json.data.token, usuarioId: json.data.user.id };
}

async function subirEstudios(limit) {
  const sesiones = {};
  let hechos = 0;
  for (const estudio of ESTUDIOS) {
    if (hechos >= limit) break;
    const key = `${estudio.paciente}|${estudio.titulo}|${estudio.fecha}`;
    if (uploads.estudios[key]) continue;

    const paciente = pacienteByKey[estudio.paciente];
    sesiones[estudio.paciente] ??= await loginPaciente(paciente);
    const { token, usuarioId } = sesiones[estudio.paciente];

    const buffer = estudioPdf({ institucion: estudio.institucion, titulo: estudio.titulo, paciente, fecha: estudio.fecha, informe: estudio.informe, notas: estudio.notas });
    const nombre = `${slug(estudio.titulo)}-${slug(paciente.lastName)}-${estudio.fecha}.pdf`;
    writePdf('estudios', nombre, buffer);

    const form = new FormData();
    form.append('archivo', new Blob([buffer], { type: 'application/pdf' }), nombre);
    form.append('titulo', estudio.titulo);
    form.append('tipo_estudio_id', String(estudio.tipo_estudio_id));
    form.append('fecha', estudio.fecha);
    form.append('institucion', estudio.institucion);
    form.append('notas', estudio.notas);

    const res = await fetch(`${BASE}/api/patients/${usuarioId}/estudios/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`Estudio ${key} falló (${res.status}): ${json.message}`);

    // Ruta dentro del bucket, sacada de la URL firmada (sin guardar el token)
    const match = /\/object\/sign\/estudios\/([^?]+)/.exec(json.data.url_archivo || '');
    uploads.estudios[key] = {
      estudio_id: json.data.id, paciente_id: json.data.paciente_id, bucket: 'estudios',
      path: match ? decodeURIComponent(match[1]) : null, titulo: estudio.titulo
    };
    saveUploads();
    hechos++;
    console.log(`  estudio subido: ${estudio.titulo} (${paciente.firstName} ${paciente.lastName}, ${estudio.fecha})`);
  }
  return hechos;
}

async function main() {
  const health = await fetch(`${BASE}/health`).catch(() => null);
  if (!health?.ok) throw new Error(`El backend no responde en ${BASE}/health`);

  const limit = onlyFirst ? 1 : Infinity;
  console.log(onlyFirst ? 'Modo prueba: una receta y un estudio…' : 'Subiendo lo que falte…');
  const r = await subirRecetas(limit);
  const e = await subirEstudios(limit);
  console.log(`Listo. Esta corrida: ${r} recetas y ${e} estudios. Acumulado: ${Object.keys(uploads.recetas).length} recetas, ${Object.keys(uploads.estudios).length} estudios.`);
  console.log(`Rutas de storage en ${path.basename(UPLOADS_FILE)}; PDFs locales en ${path.basename(FILES_DIR)}/ (ambos ignorados por git).`);
}

main().catch((error) => {
  console.error('Subida interrumpida:', error.message);
  process.exit(1);
});
