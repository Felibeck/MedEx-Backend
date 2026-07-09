# CLAUDE.md — MedEx Backend

Este archivo le da contexto a Claude Code cada vez que trabaja en este repositorio.
Se carga automáticamente al iniciar una sesión acá. Mantenerlo actualizado a medida
que el proyecto cambia.

## Qué es MedEx

Plataforma de gestión de citas/consultas médicas que conecta Pacientes y Doctores.
Este repo es el backend.

## Stack

- Node.js >= 18, Express (ESM — `"type": "module"` en package.json, usar `import`/`export`)
- JavaScript (no TypeScript en este repo — los tipos van solo en el frontend)
- Supabase (PostgreSQL) como base de datos
- Acceso a la base vía Supabase MCP connector (preferido durante desarrollo) o el
  cliente de Supabase en `src/configs/database.js`

## Estructura real de carpetas

```
MedEx-Backend/
├── database/
│   └── schema.sql              # Script SQL de creación de tablas
├── src/
│   ├── configs/
│   │   └── database.js         # Cliente Supabase
│   ├── controllers/
│   │   └── *-controller.js
│   ├── entities/
│   │   └── *.js                # Clases (no interfaces) — ver sección Entities
│   ├── helpers/
│   │   └── validations-helper.js
│   ├── middlewares/
│   ├── routes/                 # Antes se llamaba "modules" — YA RENOMBRADA a routes
│   │   └── *-routes.js         # export createXRoutes(controller)
│   ├── repositories/
│   │   └── *-repository.js
│   ├── services/
│   │   └── *-service.js
│   └── app.js                  # Wiring central
├── index.js                    # Entry point del servidor
├── .env-template
└── package.json
```

Nota: si en el código o en documentación vieja aparece `src/modules/`, es el nombre
anterior de `src/routes/`. Usar siempre `routes` de acá en adelante.

## Arquitectura

Arquitectura en capas (MVC). Todo cambio debe respetar esta separación:

Cliente HTTP → Controller → Service → Repository → Database (Supabase)

- **Controller**: recibe la request, parsea/valida el shape básico del input,
  llama al Service correspondiente, mapea el resultado o el error a una respuesta
  HTTP. No contiene lógica de negocio ni queries.
- **Service**: contiene la lógica de negocio y las reglas de dominio. Recibe una
  instancia del Repository (inyectada por constructor). Lanza `Error` con mensajes
  descriptivos ante fallos esperados; el Controller los traduce a status codes.
- **Repository**: única capa que habla con Supabase. Recibe el cliente Supabase por
  constructor. Devuelve filas crudas o normalizadas.
- **Routes** (`src/routes/`): factories que exportan `createXRoutes(controller)` y
  se registran en `app.js` bajo el prefijo `/api` (ej: `/api/patients`).
- **Entities** (`src/entities/`): clases JS planas que representan la forma de un
  recurso a partir de las tablas reales de Supabase. Ejemplo: `Doctor` y `Patient`
  extienden de una clase base `Usuario`. Suelen incluir un método `getPublicData()`
  que excluye campos sensibles (ej: `password_hash`) antes de devolver el objeto.

No saltar capas (ej: un Controller no debe llamar directo al Repository).

### Wiring (patrón de app.js)

Cada recurso se instancia en cadena dentro de `app.js`:

```js
const patientRepository = new PatientRepository(supabase);
const patientService = new PatientService(patientRepository);
const patientController = new PatientController(patientService);
app.use('/api/patients', createPatientRoutes(patientController));
```

Un recurso nuevo sigue el mismo patrón de 4 pasos.

### Convención de respuesta HTTP

Todos los controllers devuelven JSON con este envelope:

```json
// Éxito
{ "success": true, "message": "...", "data": { /* ... */ } }

// Error
{ "success": false, "message": "Descripción del error" }
```

Mantener esta forma al agregar handlers nuevos o respuestas de error.

## Patrón de catálogos (importante)

Para datos de referencia (campos que representan un conjunto fijo de opciones),
MedEx usa **tablas catálogo** en vez de ENUMs nativos de PostgreSQL.

Ejemplo: `tipos_estudio` es una tabla catálogo, y `consultas.tipo_estudio_id` es una
FK que apunta a ella.

**Regla:** cuando se agregue un nuevo campo de referencia, por defecto usar o crear
una tabla catálogo y resolverla vía FK + join, siguiendo el patrón ya existente en
el repositorio (ej: `tipo_estudio:tipo_estudio_id(*)`).

La excepción es `consultas.tipo_consulta`, que se implementó como ENUM nativo de
PostgreSQL (`primera_vez`, `seguimiento`, `control`, `urgencia`, `telemedicina`) por
una decisión deliberada tomada en esa feature. Si se agrega un campo similar, no
asumir que debe ser ENUM — preguntar o replicar el patrón de catálogo salvo que haya
una razón explícita para desviarse.

## Tablas / entidades clave

- **Usuarios** (jerarquía en `src/entities/`, `Usuario` como base):
  - `Usuario` — base con `id`, `nombre`, `apellido`, `email`, `password_hash`,
    `es_medico`, `created_at`, `deleted_at`
  - `Doctor` extiende `Usuario` — agrega `perfilId`, `usuario_id`,
    `organizacion_id`, `matricula`, `especialidad_medica`, `perfil_created_at`
  - `Patient` extiende `Usuario` — agrega `usuario_id`, `dni`, `fecha_nacimiento`,
    `identidad_genero`, `telefono`, `perfil_created_at`
  - Ambas entidades exponen `getPublicData()` para excluir `password_hash` de las
    respuestas.
- **Negocio** (se relacionan con paciente/doctor):
  - `consultas` — referencia a paciente y doctor; tiene `tipo_consulta` (ENUM) y
    `tipo_estudio_id` (FK nullable, condicional a `solicitud_estudio`)
  - `perfiles_paciente`
  - `estudios`
  - `prescripciones`
  - `tipos_estudio` (catálogo, referenciada por `consultas.tipo_estudio_id`)

Al pedir un cambio de esquema, aclarar si el campo nuevo vive en la parte de
usuarios/perfiles o en la parte de negocio — el patrón de entidad (clase con
herencia vs. tabla catálogo simple) puede diferir.

## Convenciones al pedir cambios de esquema

Cuando se pide una migración o nuevo campo, un prompt completo para Claude Code en
este repo típicamente debe cubrir:

1. Migración SQL (incluyendo backfill si aplica a filas existentes)
2. Validación (helpers de validación en la capa correspondiente)
3. Manejo de errores en el Service
4. Mapeo de errores de cliente en el Controller
5. Actualización de SELECTs/joins en el Repository

## Seguridad

- Variables requeridas (ver `.env-template`): `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`,
  además de `PORT`, `HOST`, `NODE_ENV`.
- **Nunca** compartir `SUPABASE_SERVICE_KEY` ni ninguna otra credencial en texto
  plano dentro del chat, prompts, commits o código. No commitear `.env`.
- Para acceso a la base de datos durante el desarrollo, usar el Supabase MCP
  connector en vez de pegar credenciales.
- No reemplazar el cliente de Supabase (`src/configs/database.js`) por un cliente
  PG crudo sin actualizar todo el wiring en `app.js`.

## Comandos

- Instalar dependencias: `npm install`
- Dev (con reload automático): `npm run dev` (usa `node --watch index.js`)
- Producción: `npm start`
- Migraciones: no hay herramienta de migraciones formal todavía — los cambios de
  esquema se aplican directo en Supabase o vía `database/schema.sql`
- Lint: no configurado todavía
- Test: **no hay tests en el repo actualmente.** No agregar un framework de testing
  grande (Jest, Vitest, etc.) sin aprobación explícita — evitar que Claude Code lo
  agregue por iniciativa propia.

## Fuera de alcance para este repo

Cambios de UI, formularios React o tipos TypeScript del frontend van en el repo
frontend, no acá. Backend y frontend se tratan como tareas secuenciales y
desacopladas.