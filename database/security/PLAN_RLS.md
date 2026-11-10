# Plan: activar RLS en las 14 tablas de `public`

Estado: **aplicado el 2026-11-10.** Inventario tomado ese mismo día con el conector de Supabase
(solo lectura) sobre el proyecto MedEx.

| Migración (`apply_migration`) | Archivo | Rollback | Verificación |
|---|---|---|---|
| `enable_rls_14_tablas_public` | `enable_rls.sql` | `rollback_rls.sql` | Anon: HTTP 200 con 0 filas. Backend igual que la línea base |
| `revoke_anon_authenticated_public` | `revoke_anon_authenticated.sql` | `rollback_revoke_anon_authenticated.sql` | Anon: HTTP 401 (`42501`). Backend igual que la línea base. Advisor: sin alertas nuevas |

No se pudo verificar el chat del médico hasta la tarjeta de confirmación: Gemini devuelve 429
(cuota diaria agotada) desde antes del cambio. `GET /api/patients/:id` devolvía 404 antes y
después; no lo causó este cambio.

## Hallazgo

El advisor de seguridad marca `rls_disabled_in_public` (nivel ERROR) en 14 tablas. Además,
`anon` y `authenticated` tienen SELECT, INSERT, UPDATE y DELETE sobre **todas** las tablas de
`public`. Resultado: cualquiera con la anon/publishable key (que por diseño es pública) puede
leer y modificar esas tablas por la API REST.

Prueba hecha una sola vez con la publishable key, pidiendo solo la columna `id`:

| Tabla | HTTP | Filas devueltas |
|---|---|---|
| usuarios | 200 | 32 (todas) |
| consultas | 200 | 68 (todas) |
| estudios | 200 | 37 (todos) |

`usuarios` incluye `password_hash`. La columna no se pidió en la prueba, pero cualquiera puede leerla.

## Quién accede a Supabase y cómo

| Cliente | Cómo accede | ¿Le afecta RLS? |
|---|---|---|
| MedEx-Backend (`src/configs/database.js:12`) | `createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)`; la key es un JWT con `role=service_role` | No: `service_role` tiene `BYPASSRLS` |
| Scripts (`scripts/check_supabase.js`, `seed-mock-files.js`, `delete-mock-storage.js`, `seed-mock-data.js`) | Importan `src/configs/database.js` (service_role) o llaman a la API del backend | No |
| MedEx-Frontend | No usa Supabase. Llama a la API del backend (`src/api/client.ts:5`, `VITE_API_URL`). La única mención a Supabase es un comentario en `src/types/historialClinico.ts:74` | No |
| App mobile | No existe ninguna carpeta hermana | — |
| PROMPTOOL, whatsapp-automation | Usan **otros** proyectos de Supabase, no MedEx | No |

- El backend no usa `DATABASE_URL`, `DB_*` ni `pg`; esas variables de `.env-template` están de más.
- `SUPABASE_ANON_KEY` está en `.env`, pero nada en `src/` la usa.
- `auth.users` tiene 0 filas. La auth es propia: JWT firmado por el backend y validado en
  `require-medico.js` / `require-paciente.js`. Por eso ningún request llega a Postgres con el rol
  `authenticated`.

**Conclusión: no hace falta ninguna política.** Ningún cliente legítimo usa `anon` ni
`authenticated`, así que activar RLS sin políticas cierra el acceso sin romper nada. Por eso no se
crea `policies_propuestas.sql`: cualquier política sería permisiva "por las dudas".

## Archivos

| Archivo | Qué hace |
|---|---|
| `enable_rls.sql` | `ENABLE ROW LEVEL SECURITY` en las 14 tablas, en una transacción. Al final, un chequeo aborta y revierte si queda alguna tabla de `public` sin RLS |
| `rollback_rls.sql` | `DISABLE` en las mismas 14 tablas (solo para emergencias: vuelve a exponerlas). No toca las 4 que ya tenían RLS |

## Tabla por tabla

"Backend" = la tabla aparece en `src/` (directa con `.from()` o como join embebido).
Todos los accesos del backend son con service_role, así que el riesgo de rotura es igual para
todas: **ninguno esperado**, salvo que haya un cliente que no se encontró.

| Tabla | ¿La usa el backend? | ¿Otro cliente? | Qué se rompe al activar RLS |
|---|---|---|---|
| usuarios | Sí: login, registro, middlewares | No | Nada. Se cierra la lectura anónima de `password_hash` y la escritura (p. ej. `es_medico=true`) |
| perfiles_paciente | Sí: búsqueda por DNI, ficha, middleware | No | Nada. Cierra DNI, teléfono y fecha de nacimiento |
| perfiles_profesional | Sí: login médico, middleware, registro | No | Nada |
| consultas | Sí: crear/editar consulta, notas, historial, chat | No | Nada |
| estudios | Sí: listar, subir, detalle con URL firmada | No | Nada |
| historial | Sí: historial clínico (médico y paciente) | No | Nada |
| recetas | Sí: recetas del paciente, alta de consulta con PDF | No | Nada |
| organizaciones | Sí: `organizationExists`, join `organizacion:organizacion_id` | No | Nada |
| tipos_estudio | Sí: `GET /api/catalogos/tipos-estudio` | No | Nada (el catálogo se sirve por el backend) |
| tipo_sangre | Sí: join `tipo_sangre:tipo_sangre_id` en la ficha | No | Nada |
| autorizacion | No | No | Nada |
| localidades | No | No | Nada |
| provincias | No | No | Nada |
| perfil_admin | No | No | Nada |

Hay una prueba indirecta de que funciona: `alergias`, `condiciones_cronicas`, `prescripciones` y
`antecedentes_patologicos` ya tienen RLS sin políticas, y el backend las lee y escribe sin problemas.

Riesgos residuales:
- **Un cliente no inventariado** (una herramienta local, un deploy viejo del frontend) que use la
  anon key va a empezar a recibir `[]` en las lecturas y errores `42501` en las escrituras. La
  mitigación es `rollback_rls.sql`.
- Si en algún momento el backend pasa a usar la anon key o Supabase Auth, va a necesitar políticas.
  Hoy no aplica.

## Verificación después de aplicar

Con el backend corriendo (`npm run dev`), usando un médico mock y un paciente mock de
`database/mock/mock-data.js` (sin copiar sus credenciales a ningún lado):

**Médico**
1. `POST /api/doctors/login` (o `POST /api/auth/login`): 200 y token
2. `GET /api/doctors/pacientes/buscar?dni=<dni de un paciente mock>`: 200 y paciente
3. `GET /api/doctors/mis-pacientes`: 200 y lista no vacía
4. `GET /api/doctors/pacientes/:pacienteId/historial`: 200 y ficha (incluye grupo sanguíneo y organización por join)
5. `GET /api/doctors/consultas/:consultaId/notas`: 200
6. `POST /api/medico/chat` seguido de `POST /api/medico/chat/confirmar`: 200; la consulta queda creada
7. `GET /api/catalogos/tipos-estudio`: 200 y catálogo no vacío

**Paciente**
1. `POST /api/patients/login`: 200 y token
2. `GET /api/patients/me/home`: 200
3. `GET /api/patients/me/historial`: 200
4. `GET /api/patients/me/recetas`: 200 y URL firmada que descarga el PDF
5. `GET /api/patients/:id/estudios` y `GET /api/patients/:id/estudios/:estudioId`: 200 y URL firmada que abre el PDF

**Anon key (una sola vez, solo código HTTP y cantidad de filas)**
- `GET /rest/v1/{usuarios,consultas,estudios}?select=id` con la publishable key: se espera
  **HTTP 200 con 0 filas** (con RLS sin políticas PostgREST devuelve vacío, no 401)
- Advisor de seguridad: `rls_disabled_in_public` debería desaparecer. Va a aparecer
  `rls_enabled_no_policy` (INFO) para las 18 tablas; es esperado y correcto en este diseño

## Pendientes que no son RLS (no se corrigen en este paso)

1. **Grants amplios: resuelto** con `revoke_anon_authenticated.sql`, salvo los default privileges
   de `supabase_admin`. Esos todavía les dan ALL a anon y authenticated sobre los objetos que cree
   `supabase_admin` en public, y no se pueden cambiar con el rol `postgres` porque no es miembro.
   Las tablas creadas desde el editor o con migraciones son de `postgres` y ya quedan protegidas.
   Conviene que cada tabla nueva active RLS y que se corra el advisor después de cada cambio de
   esquema.
2. **Exposición de la Data API.** Como ningún cliente usa PostgREST con la anon key, se podría
   sacar `public` de los schemas expuestos o desactivar la Data API en el dashboard.
3. **Exposición pasada.** Las tablas estuvieron legibles y escribibles por anon. Conviene revisar los
   logs de la API (`query_logs`, servicio `api`) para buscar accesos con la anon key, y evaluar
   rotar `JWT_SECRET` y las contraseñas de las cuentas reales, si las hay (hoy son datos mock).
4. **Rotación de la anon key / legacy anon JWT.** No hace falta por RLS, pero si la key se publicó
   en algún lado, el riesgo ya lo cubre el punto 1.
5. **`.env-template`** declara `DATABASE_URL`, `DB_*` y `SUPABASE_ANON_KEY`, que el backend no usa.
   Conviene limpiarlo para que nadie las complete sin necesidad.

Sin hallazgos en estos puntos:
- **Vistas en public:** no hay.
- **Funciones SECURITY DEFINER** en public o en schemas de usuario ejecutables por anon: no hay.
- **Storage:** los buckets `estudios` y `recetas` son privados. `storage.objects` tiene RLS activo y
  0 políticas: solo service_role accede, y el backend entrega URLs firmadas.
