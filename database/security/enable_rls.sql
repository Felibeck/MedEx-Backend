-- =============================================================================
-- enable_rls.sql — Activa Row Level Security en las 14 tablas de `public`
-- que hoy la tienen desactivada (advisor de Supabase: rls_disabled_in_public).
--
-- ESTADO: PLAN. NO APLICADO. Requiere OK explícito antes de correrlo.
--
-- Contexto (inventario del 2026-11-10, proyecto MedEx):
--   - El backend accede a Supabase SOLO con la service_role key
--     (src/configs/database.js). service_role tiene BYPASSRLS, así que este
--     cambio no afecta al backend.
--   - Ningún otro cliente (MedEx-Frontend, otros repos) accede a Supabase
--     directo: el frontend solo llama a la API del backend.
--   - No hay usuarios en auth.users (la auth es propia, JWT del backend), así
--     que los roles anon y authenticated no tienen ningún uso legítimo.
--   => Se activa RLS SIN políticas: anon y authenticated quedan sin acceso a
--      filas; service_role sigue igual. Ver PLAN_RLS.md.
--
-- Las 4 tablas que YA tienen RLS (alergias, antecedentes_patologicos,
-- condiciones_cronicas, prescripciones) no se tocan acá ni en el rollback.
--
-- ALTER TABLE ... ENABLE ROW LEVEL SECURITY toma un lock ACCESS EXCLUSIVE muy
-- breve por tabla. Con el volumen actual (decenas de filas) es instantáneo.
-- =============================================================================

BEGIN;

ALTER TABLE public.autorizacion         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultas            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estudios             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historial            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.localidades          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizaciones       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfil_admin         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfiles_paciente    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfiles_profesional ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provincias           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recetas              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipo_sangre          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_estudio        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios             ENABLE ROW LEVEL SECURITY;

-- Chequeo de seguridad: si queda alguna tabla de public sin RLS (por ejemplo,
-- una tabla nueva creada después del inventario), aborta y revierte todo.
DO $$
DECLARE
  sin_rls text;
BEGIN
  SELECT string_agg(c.relname, ', ' ORDER BY c.relname)
    INTO sin_rls
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public'
     AND c.relkind IN ('r', 'p')
     AND NOT c.relrowsecurity;

  IF sin_rls IS NOT NULL THEN
    RAISE EXCEPTION 'Quedan tablas en public sin RLS: %. Se revierte la transacción.', sin_rls;
  END IF;
END
$$;

COMMIT;
