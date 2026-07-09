## Copilot / AI agent quick guide — MedEx Backend

Purpose: give an AI coding agent the minimal, actionable context to contribute code changes safely and consistently.

- **Big picture:** This is a small Express (ESM) backend wired in layers: `src/app.js` composes Repositories → Services → Controllers and registers route factories in `src/modules/` under the `/api` prefix.
- **Runtime & scripts:** Node >= 18, `type: "module"` in `package.json`. Dev commands: `npm install`, `npm run dev` (uses `node --watch index.js`), `npm start`.
- **DB / integration:** Data access uses Supabase client from `src/configs/database.js`. Required env vars: `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` (see `.env-template`). Do not swap that client for raw PG without updating wiring.

- **Response convention:** All controllers return JSON shaped as `{ success: boolean, message?: string, data?: any }` (see `src/controllers/*-controller.js`). Preserve this shape when adding handlers or error responses.
- **Error handling:** Controllers catch errors and map to HTTP status codes; generic errors return `500` and the same JSON envelope. Global error-handling middleware is in `src/app.js` — prefer throwing `Error` with descriptive messages inside services.

- **Where to add new features:**
  - Entity: add model/shape under `src/entities/` (plain JS file).
  - Data access: add a Repository in `src/repositories/` that accepts the Supabase client in its constructor.
  - Business logic: add a Service in `src/services/` that accepts the repository instance.
  - HTTP layer: add Controller in `src/controllers/` with methods matching route handlers.
  - Routes: add a route factory in `src/modules/` (export a `createXRoutes(controller)` function) and register it in `src/app.js` with the `/api` prefix.

- **Wiring example:** see `src/app.js` — repositories are `new Repo(supabase)`, services `new Service(repo)`, controllers `new Controller(service)`, then `app.use('/api/x', createXRoutes(controller))`.

- **Conventions & patterns to follow:**
  - Keep layers thin: controllers only parse/validate request and call service methods.
  - Services implement domain rules and throw Errors for expected failure cases (controllers convert to status codes).
  - Repositories only talk to Supabase and return raw or normalized rows.
  - Routes are created via factory functions in `src/modules/` that accept a controller instance.

- **ENV & secrets:** The app requires `.env` entries from `.env-template`. Don't commit secrets. If adding CI or local dev helpers, read `src/configs/database.js` to respect the Supabase client shape.

- **Tests & scripts:** There are no tests in the repo. Avoid adding large test frameworks without author approval. If you add tests, add a script to `package.json`.

- **Documentation pointers:** For API examples and architecture diagrams consult [EJEMPLOS_API.md](EJEMPLOS_API.md) and [ARQUITECTURA.md](ARQUITECTURA.md).

- **Quick code examples:**
  - Registering routes: see `src/modules/patient-routes.js` and `src/modules/doctor-routes.js` for idiomatic route setup.
  - Controller pattern: `src/controllers/patient-controller.js` — returns envelope and uses `this.patientService` methods.

If anything in this file is unclear or you need more examples (e.g., common SQL shapes, expected repository return types), ask and I will expand with concrete code snippets from the repository.
