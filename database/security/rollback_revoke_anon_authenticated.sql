-- =============================================================================
-- rollback_revoke_anon_authenticated.sql — Revierte revoke_anon_authenticated.sql.
--
-- Restaura exactamente el estado del 2026-11-10: anon y authenticated con ALL
-- sobre todas las tablas, secuencias y funciones de public, y los default
-- privileges de `postgres` dándoles ALL a los objetos nuevos.
-- (ALL en tablas = arwdDxtm; en secuencias = USAGE, SELECT, UPDATE; en
-- funciones = EXECUTE, que es lo que había.)
--
-- Solo para emergencias: con esto, la única barrera vuelve a ser RLS, y se
-- puede volver a hacer TRUNCATE con la anon key.
-- =============================================================================

BEGIN;

GRANT ALL ON ALL TABLES    IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES    TO anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated;

COMMIT;
