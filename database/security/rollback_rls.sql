-- =============================================================================
-- rollback_rls.sql — Revierte enable_rls.sql.
--
-- ESTADO: PLAN. Usar SOLO si, después de aplicar enable_rls.sql, el backend
-- falla y no hay otra salida rápida.
--
-- ATENCIÓN: correr esto VUELVE A EXPONER las 14 tablas (usuarios con
-- password_hash, consultas, estudios, perfiles_paciente, etc.) a cualquiera
-- que tenga la anon/publishable key, con lectura Y escritura. Es un rollback
-- de emergencia, no un estado aceptable. Si se usa, abrir un pendiente para
-- volver a activar RLS lo antes posible.
--
-- Solo desactiva las 14 tablas que enable_rls.sql activó. NO toca alergias,
-- antecedentes_patologicos, condiciones_cronicas ni prescripciones, que ya
-- tenían RLS antes de este cambio.
-- =============================================================================

BEGIN;

ALTER TABLE public.autorizacion         DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultas            DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.estudios             DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.historial            DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.localidades          DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizaciones       DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfil_admin         DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfiles_paciente    DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfiles_profesional DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.provincias           DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.recetas              DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipo_sangre          DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_estudio        DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios             DISABLE ROW LEVEL SECURITY;

COMMIT;
