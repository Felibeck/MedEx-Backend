// Seed de datos mock para desarrollo. Usa los endpoints HTTP existentes del backend:
//   POST /api/doctors/register, POST /api/doctors/login
//   POST /api/patients/register
//   POST /api/doctors/pacientes/:pacienteId/historial
//   POST /api/doctors/consultas
//
// Requisitos: backend corriendo (por defecto http://localhost:3000) y haber ejecutado
// database/mock/001_mock_organizaciones.sql. Después de este script, ejecutar
// database/mock/002_mock_enrichment.sql (obra social, alergias, diagnósticos, etc.: datos
// para los que no existe endpoint).
//
// Uso:  node scripts/seed-mock-data.js
//   MOCK_API_BASE   base de la API (default http://localhost:3000)
//   MOCK_ORG_CLINICA / MOCK_ORG_INSTITUTO   ids de las organizaciones mock (uuid)
//
// Las contraseñas se generan al azar y se guardan SOLO en .mock-credentials.local.json
// (ignorado por git). Nunca se imprimen. El progreso queda en .mock-seed-state.local.json,
// así que se puede volver a correr si se corta: no duplica lo ya creado.

import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { MEDICOS, PACIENTES, CONSULTAS } from '../database/mock/mock-data.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CREDENTIALS_FILE = path.join(ROOT, '.mock-credentials.local.json');
const STATE_FILE = path.join(ROOT, '.mock-seed-state.local.json');
const BASE = (process.env.MOCK_API_BASE || 'http://localhost:3000').replace(/\/$/, '');

const orgIds = {
  clinica: process.env.MOCK_ORG_CLINICA,
  instituto: process.env.MOCK_ORG_INSTITUTO
};
if (!orgIds.clinica || !orgIds.instituto) {
  console.error('Faltan MOCK_ORG_CLINICA y/o MOCK_ORG_INSTITUTO (ids de las organizaciones mock).');
  process.exit(1);
}

const readJson = (file, fallback) => (existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : fallback);
const credentials = readJson(CREDENTIALS_FILE, {});
const state = readJson(STATE_FILE, { medicos: {}, pacientes: {}, historial: {}, consultas: {} });
const saveCredentials = () => writeFileSync(CREDENTIALS_FILE, JSON.stringify(credentials, null, 2));
const saveState = () => writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));

// Cumple validatePassword: 8+ caracteres, mayúscula, minúscula y número.
const ALPHABET = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const generatePassword = () => {
  const bytes = randomBytes(12);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('') + 'aZ7';
};

async function api(method, route, { token, body } = {}) {
  const res = await fetch(`${BASE}${route}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, json };
}

// Devuelve el JWT del médico (registrándolo si hace falta).
async function ensureMedico(medico) {
  if (!credentials[medico.email]) {
    credentials[medico.email] = generatePassword();
    saveCredentials(); // guardar antes de registrar: si algo falla no se pierde la contraseña
  }
  const password = credentials[medico.email];

  let login = await api('POST', '/api/doctors/login', { body: { email: medico.email, password } });
  if (!login.ok) {
    const reg = await api('POST', '/api/doctors/register', {
      body: {
        email: medico.email,
        password,
        firstName: medico.firstName,
        lastName: medico.lastName,
        phoneNumber: medico.phoneNumber,
        specialty: medico.specialty,
        licenseNumber: medico.licenseNumber,
        yearsOfExperience: medico.yearsOfExperience,
        hospital: medico.hospital,
        organizacion_id: orgIds[medico.organizacion],
        address: medico.address,
        city: medico.city,
        consultationFee: medico.consultationFee
      }
    });
    if (!reg.ok) throw new Error(`Registro de ${medico.key} falló (${reg.status}): ${reg.json.message}`);
    console.log(`  médico registrado: ${medico.firstName} ${medico.lastName}`);
    login = await api('POST', '/api/doctors/login', { body: { email: medico.email, password } });
    if (!login.ok) throw new Error(`Login de ${medico.key} falló (${login.status}): ${login.json.message}`);
  }
  state.medicos[medico.key] = { usuario_id: login.json.data.user.id, perfil_profesional_id: login.json.data.user.perfil_profesional_id };
  saveState();
  return login.json.data.token;
}

async function ensurePaciente(paciente) {
  if (!credentials[paciente.email]) {
    credentials[paciente.email] = generatePassword();
    saveCredentials();
  }
  const password = credentials[paciente.email];

  let login = await api('POST', '/api/patients/login', { body: { email: paciente.email, password } });
  if (!login.ok) {
    const reg = await api('POST', '/api/patients/register', {
      body: {
        email: paciente.email,
        password,
        firstName: paciente.firstName,
        lastName: paciente.lastName,
        dni: paciente.dni,
        dateOfBirth: paciente.dateOfBirth,
        gender: paciente.gender,
        phoneNumber: paciente.phoneNumber
      }
    });
    if (!reg.ok) throw new Error(`Registro de ${paciente.key} falló (${reg.status}): ${reg.json.message}`);
    console.log(`  paciente registrado: ${paciente.firstName} ${paciente.lastName}`);
  }
  state.pacientes[paciente.key] = { dni: paciente.dni };
  saveState();
}

async function main() {
  const health = await api('GET', '/health').catch(() => null);
  if (!health?.ok) throw new Error(`El backend no responde en ${BASE}/health`);

  console.log('Médicos…');
  const tokens = {};
  for (const medico of MEDICOS) tokens[medico.key] = await ensureMedico(medico);

  console.log('Pacientes…');
  for (const paciente of PACIENTES) await ensurePaciente(paciente);

  // Para el historial y las consultas necesitamos el id de perfiles_paciente: se obtiene
  // con la búsqueda por DNI que ya ofrece el endpoint del médico.
  const pacienteIds = {};
  for (const paciente of PACIENTES) {
    const found = await api('GET', `/api/doctors/pacientes/buscar?dni=${paciente.dni}`, { token: tokens.sosa });
    if (!found.ok) throw new Error(`Búsqueda de ${paciente.key} por DNI falló (${found.status}): ${found.json.message}`);
    pacienteIds[paciente.key] = found.json.data.paciente_id;
    state.pacientes[paciente.key].paciente_id = found.json.data.paciente_id;
  }
  saveState();

  console.log('Historial clínico…');
  for (const paciente of PACIENTES) {
    if (state.historial[paciente.key]) continue;
    const primerMedico = CONSULTAS.find((c) => c.paciente === paciente.key).medico;
    const res = await api('POST', `/api/doctors/pacientes/${pacienteIds[paciente.key]}/historial`, {
      token: tokens[primerMedico],
      body: paciente.historial
    });
    if (!res.ok) throw new Error(`Historial de ${paciente.key} falló (${res.status}): ${res.json.message}`);
    state.historial[paciente.key] = true;
    saveState();
  }

  console.log('Consultas…');
  const ordenadas = [...CONSULTAS].sort((a, b) => a.fecha.localeCompare(b.fecha));
  let creadas = 0;
  for (const consulta of ordenadas) {
    const key = `${consulta.paciente}|${consulta.fecha}|${consulta.medico}`;
    if (state.consultas[key]) continue;
    const dni = PACIENTES.find((p) => p.key === consulta.paciente).dni;
    const res = await api('POST', '/api/doctors/consultas', {
      token: tokens[consulta.medico],
      body: {
        dni,
        fecha: consulta.fecha,
        tipo_consulta: consulta.tipo_consulta,
        notas: consulta.notas,
        solicitud_estudio: !!consulta.solicitud_estudio,
        solicitud_receta: !!consulta.solicitud_receta,
        solicitud_citaprox: !!consulta.solicitud_citaprox
      }
    });
    if (!res.ok) throw new Error(`Consulta ${key} falló (${res.status}): ${res.json.message}`);
    state.consultas[key] = res.json.data.id;
    saveState();
    creadas++;
  }

  console.log(`Listo. Médicos: ${MEDICOS.length}, pacientes: ${PACIENTES.length}, consultas nuevas en esta corrida: ${creadas}.`);
  console.log(`Credenciales en ${path.basename(CREDENTIALS_FILE)} (ignorado por git, no se imprimen).`);
}

main().catch((error) => {
  console.error('Seed interrumpido:', error.message);
  process.exit(1);
});
