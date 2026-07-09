-- Tipo de estudio solicitado en una consulta (opcional).
-- Reutiliza la tabla catálogo `tipos_estudio` ya existente (usada por
-- estudios.tipo_estudio_id). Es nullable a nivel de base: la regla de que
-- sea obligatorio cuando consultas.solicitud_estudio = true se valida en la
-- capa de aplicación (src/helpers/validations-helper.js), no con un CHECK,
-- para poder devolver un mensaje de error claro en vez de una violación de
-- constraint en Postgres.
alter table consultas add column if not exists tipo_estudio_id smallint references tipos_estudio(id);
