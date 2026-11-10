// Borra del Storage SOLO los PDFs mock que subió scripts/seed-mock-files.js.
// (El SQL de database/mock/delete_mock_data.sql no borra archivos del storage.)
//
// Lee las rutas de .mock-uploads.local.json (ignorado por git), que son las únicas que se
// tocan: nunca lista ni borra otros objetos de los buckets.
//
//   node scripts/delete-mock-storage.js            # simulacro: solo muestra qué borraría
//   node scripts/delete-mock-storage.js --confirm  # borra de verdad
//
// Orden recomendado: 1) este script con --confirm, 2) delete_mock_data.sql (las filas).

import 'dotenv/config';
import { existsSync, readFileSync, renameSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import supabase from '../src/configs/database.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const UPLOADS_FILE = path.join(ROOT, '.mock-uploads.local.json');
const confirm = process.argv.includes('--confirm');

if (!existsSync(UPLOADS_FILE)) {
  console.error('No existe .mock-uploads.local.json: no hay rutas mock registradas, no se borra nada.');
  process.exit(1);
}

const uploads = JSON.parse(readFileSync(UPLOADS_FILE, 'utf8'));
const porBucket = {};
for (const grupo of [uploads.recetas, uploads.estudios]) {
  for (const item of Object.values(grupo || {})) {
    if (!item.bucket || !item.path) continue;
    (porBucket[item.bucket] ??= []).push(item.path);
  }
}

for (const [bucket, paths] of Object.entries(porBucket)) {
  console.log(`${bucket}: ${paths.length} objeto(s) mock`);
  if (!confirm) {
    paths.forEach((p) => console.log(`  (simulacro) ${p}`));
    continue;
  }
  const { data, error } = await supabase.storage.from(bucket).remove(paths);
  if (error) {
    console.error(`  Error borrando en ${bucket}: ${error.message}`);
    process.exit(1);
  }
  console.log(`  borrados: ${data?.length ?? 0}`);
}

if (confirm) {
  renameSync(UPLOADS_FILE, `${UPLOADS_FILE}.borrado`);
  console.log('Listo. El registro local se renombró a .mock-uploads.local.json.borrado');
} else {
  console.log('\nSimulacro: no se borró nada. Agregá --confirm para ejecutar.');
}
