## Copilot / AI agent quick guide — MedEx Backend

Purpose: minimal, actionable context so an AI agent can make safe, idiomatic changes.

- **Big picture:** Layered Express (ESM) backend: Controller → Service → Repository → Supabase. Central wiring is in [src/app.js](src/app.js#L1). Routes live under [src/routes/](src/routes/). Entities live under [src/entities/].

- **Runtime & common commands:** Node >= 18, ESM (`type: "module"`). Common commands:

  - `npm install`
  - `npm run dev` (uses `node --watch index.js`)
  - `npm start`

- **Database / integration:** Uses Supabase via [src/configs/database.js](src/configs/database.js#L1). Required env vars are in `.env-template` (`SUPABASE_URL`, `SUPABASE_SERVICE_KEY`). For local development prefer the Supabase MCP connector (see CLAUDE.md) instead of embedding service keys.

- **Response & error conventions:** Controllers return the JSON envelope `{ success: boolean, message?: string, data?: any }` (see [src/controllers](src/controllers/)). Services throw `Error` for expected failures; controllers map errors to HTTP status codes. Global error handling is in [src/app.js](src/app.js#L1). Use [src/helpers/validations-helper.js](src/helpers/validations-helper.js#L1) for input checks.

- **Add a new resource (4-step pattern):**
  1. Add an entity in [src/entities/] (example: [src/entities/Usuario.js](src/entities/Usuario.js#L1)).
  2. Add a repository in [src/repositories/*-repository.js] that accepts the Supabase client.
  3. Add a service in [src/services/*-service.js] that accepts the repository and contains business rules (throw `Error` for expected failures).
  4. Add a controller in [src/controllers/*-controller.js] and a route factory in [src/routes/*-routes.js]; register in [src/app.js](src/app.js#L1) via `app.use('/api/x', createXRoutes(controller))`.

- **Naming & file patterns:** Use suffixes `-repository.js`, `-service.js`, `-controller.js`, `-routes.js`. Routes are factory functions that accept a controller instance. Do not introduce TypeScript; this repo is JS-only.

- **Entities & public data:** Entity classes (e.g., [src/entities/Doctor.js](src/entities/Doctor.js#L1), [src/entities/Patient.js](src/entities/Patient.js#L1)) often expose a `getPublicData()` method to strip sensitive fields like `password_hash` before sending responses.

- **Database schema & migrations:** Schema is in [database/schema.sql](database/schema.sql) and incremental scripts under [database/migrations/](database/migrations/). When changing schema: provide SQL migration/backfill, update repository queries, update entity mappings, add/adjust validations in services, and map errors in controllers.

- **Debugging & checks:** Use `node --watch index.js` for iterative development. Use [scripts/check_supabase.js](scripts/check_supabase.js) to validate DB connectivity. Check middleware in [src/middlewares/require-medico.js](src/middlewares/require-medico.js#L1) and [src/middlewares/require-paciente.js](src/middlewares/require-paciente.js#L1) for auth behavior.

- **Do NOT:**
  - Commit `.env` or embed service keys. Respect `.env-template` and secrets handling.
  - Replace the Supabase client pattern in [src/configs/database.js](src/configs/database.js#L1) with a raw PG client without updating wiring in [src/app.js](src/app.js#L1).

- **Tests & tooling:** There are no tests in this repo. Do not add large test frameworks (Jest, Vitest) without approval; if tests are added, also add npm scripts to `package.json`.

- **Examples / quick references:**
  - Wiring (see [src/app.js](src/app.js#L1)): `new XRepository(supabase)` → `new XService(repo)` → `new XController(service)` → `app.use('/api/x', createXRoutes(controller))`.
  - Controller pattern: see [src/controllers/patient-controller.js](src/controllers/patient-controller.js#L1).

If you want concrete snippets (migration template, example repository SELECT with joins, or an entity mapping), say which resource and I'll add the snippet.
