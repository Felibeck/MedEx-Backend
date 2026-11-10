-- BORRADO de los datos mock de desarrollo. NO se ejecuta automáticamente.
--
-- Cómo se identifican: usuarios con email 'mock.%@example.com'. Ojo: el dominio
-- @example.com por sí solo NO alcanza, porque ya había usuarios @example.com reales de
-- desarrollo que no son mock. El prefijo "mock." es lo que los distingue.
-- Las organizaciones mock se identifican por nombre exacto.
--
-- Revisar el SELECT de vista previa antes de ejecutar el bloque de borrado.
-- Todo corre en una transacción: si algo falla, no se borra nada.
--
-- IMPORTANTE: este SQL NO borra los archivos del Storage (buckets "estudios" y "recetas").
-- Borrar filas de las tablas no elimina los PDFs, y tocar storage.objects por SQL tampoco
-- libera el archivo físico. Orden recomendado:
--
--   1) Borrar los PDFs mock ANTES de borrar las filas:
--        node scripts/delete-mock-storage.js            (simulacro: lista qué borraría)
--        node scripts/delete-mock-storage.js --confirm  (borra)
--      Usa .mock-uploads.local.json (ignorado por git), que registra únicamente las rutas
--      que subió scripts/seed-mock-files.js: 18 en "recetas" (recetas/<consulta_id>/...)
--      y 14 en "estudios" (<paciente_id>/<uuid>-<nombre>.pdf). No toca otros objetos.
--      Alternativa manual: Dashboard de Supabase > Storage, o el SELECT de vista previa
--      de más abajo para listar las rutas de recetas mock.
--   2) Ejecutar el bloque de borrado de filas de este archivo.
--
-- Los PDFs generados en local están en .mock-files.local/ (ignorado por git).

-- ============ 1) VISTA PREVIA (solo lectura) ============
select 'usuarios' as tabla, count(*) from usuarios where email like 'mock.%@example.com'
union all select 'perfiles_paciente', count(*) from perfiles_paciente p join usuarios u on u.id = p.usuario_id where u.email like 'mock.%@example.com'
union all select 'perfiles_profesional', count(*) from perfiles_profesional p join usuarios u on u.id = p.usuario_id where u.email like 'mock.%@example.com'
union all select 'organizaciones', count(*) from organizaciones where nombre in ('Clínica Santa Rita', 'Instituto Médico Belgrano')
union all select 'recetas (filas)', count(*) from recetas r join consultas c on c.id = r.consulta_id join perfiles_paciente p on p.id = c.paciente_id join usuarios u on u.id = p.usuario_id where u.email like 'mock.%@example.com'
union all select 'estudios (filas)', count(*) from estudios e join perfiles_paciente p on p.id = e.paciente_id join usuarios u on u.id = p.usuario_id where u.email like 'mock.%@example.com';

-- Rutas de los PDFs de recetas mock en el bucket "recetas" (para borrarlos a mano si hace falta)
select r."pathFile" as ruta_en_bucket_recetas
from recetas r join consultas c on c.id = r.consulta_id join perfiles_paciente p on p.id = c.paciente_id join usuarios u on u.id = p.usuario_id
where u.email like 'mock.%@example.com' order by 1;

-- ============ 2) BORRADO (ejecutar como bloque) ============
begin;

create temp table _mock_usuarios on commit drop as
  select id from usuarios where email like 'mock.%@example.com';
create temp table _mock_pacientes on commit drop as
  select id from perfiles_paciente where usuario_id in (select id from _mock_usuarios);
create temp table _mock_profesionales on commit drop as
  select id from perfiles_profesional where usuario_id in (select id from _mock_usuarios);
-- Consultas de pacientes o médicos mock
create temp table _mock_consultas on commit drop as
  select id from consultas
  where paciente_id in (select id from _mock_pacientes)
     or profesional_id in (select id from _mock_profesionales);

delete from recetas        where consulta_id in (select id from _mock_consultas);
delete from prescripciones where consulta_id in (select id from _mock_consultas);
delete from estudios       where consulta_id in (select id from _mock_consultas)
                              or paciente_id in (select id from _mock_pacientes)
                              or medico_id   in (select id from _mock_profesionales);
delete from consultas      where id in (select id from _mock_consultas);

delete from alergias                where paciente_id in (select id from _mock_pacientes);
delete from condiciones_cronicas    where paciente_id in (select id from _mock_pacientes);
delete from antecedentes_patologicos where paciente_id in (select id from _mock_pacientes);
delete from historial               where paciente_id in (select id from _mock_pacientes);
delete from autorizacion            where paciente_id in (select id from _mock_pacientes)
                                       or profesional_id in (select id from _mock_profesionales);

delete from perfiles_paciente   where id in (select id from _mock_pacientes);
delete from perfiles_profesional where id in (select id from _mock_profesionales);
delete from usuarios            where id in (select id from _mock_usuarios);

-- Las organizaciones solo se borran si ya nadie las referencia (no toca las de otros médicos)
delete from organizaciones o
where o.nombre in ('Clínica Santa Rita', 'Instituto Médico Belgrano')
  and not exists (select 1 from perfiles_profesional p where p.organizacion_id = o.id)
  and not exists (select 1 from consultas c where c.organizacion_id = o.id);

commit;
