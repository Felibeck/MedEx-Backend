-- =============================================================================
-- revoke_anon_authenticated.sql — Quita a anon y authenticated todos los
-- permisos sobre tablas, secuencias y funciones del schema public, y evita que
-- los objetos nuevos se los den de nuevo (default privileges).
--
-- Va después de enable_rls.sql. RLS sin políticas ya bloquea las FILAS, pero no
-- frena TRUNCATE ni REFERENCES/TRIGGER, que estos roles tenían en las 18 tablas.
--
-- Contexto (inventario del 2026-11-10):
--   - Las 18 tablas y las 4 secuencias de public son de `postgres`. anon y
--     authenticated tienen ALL sobre todas. No hay funciones en public.
--   - Ningún cliente usa anon ni authenticated: el backend usa service_role,
--     el frontend llama al backend y auth.users está vacía.
--
-- Alcance: SOLO schema public y SOLO anon/authenticated. No toca storage, auth,
-- extensions, ni los permisos de service_role o postgres. No toca el USAGE
-- sobre el schema public.
--
-- Default privileges: solo se ajustan los de `postgres` (dueño de todo lo que
-- hay en public y rol que usan el SQL editor, el Table editor y
-- apply_migration). Los de `supabase_admin` no se pueden cambiar desde
-- `postgres`, porque no es miembro de ese rol; ver PLAN_RLS.md.
-- =============================================================================

BEGIN;

REVOKE ALL ON ALL TABLES    IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON TABLES    FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon, authenticated;

-- Chequeo: anon/authenticated sin permisos directos en public y service_role
-- intacto. Si algo no da, aborta y revierte todo.
DO $$
DECLARE
  con_grants text;
  sin_service text;
BEGIN
  SELECT string_agg(DISTINCT c.relname || ':' || a.grantee::regrole::text, ', ')
    INTO con_grants
    FROM pg_class c
    CROSS JOIN LATERAL aclexplode(c.relacl) a
   WHERE c.relnamespace = 'public'::regnamespace
     AND c.relkind IN ('r', 'p', 'v', 'm', 'f', 'S')
     AND a.grantee IN ('anon'::regrole, 'authenticated'::regrole);

  IF con_grants IS NOT NULL THEN
    RAISE EXCEPTION 'Quedan permisos para anon/authenticated en: %', con_grants;
  END IF;

  SELECT string_agg(c.relname, ', ')
    INTO sin_service
    FROM pg_class c
   WHERE c.relnamespace = 'public'::regnamespace
     AND c.relkind IN ('r', 'p')
     AND NOT has_table_privilege('service_role', c.oid, 'SELECT,INSERT,UPDATE,DELETE');

  IF sin_service IS NOT NULL THEN
    RAISE EXCEPTION 'service_role perdió permisos en: %', sin_service;
  END IF;
END
$$;

COMMIT;
