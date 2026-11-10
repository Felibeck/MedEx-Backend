-- Datos mock (desarrollo): organizaciones para los médicos mock.
-- No existe endpoint para crear organizaciones, por eso se insertan por SQL.
-- Solo inserta filas nuevas. Usa localidades que ya existen (ids 14 y 16).
-- Se borran con database/mock/delete_mock_data.sql (por nombre).

insert into organizaciones (nombre, tipo, localidad_id, calle_numero, telefono)
select v.nombre, v.tipo, v.localidad_id, v.calle_numero, v.telefono
from (values
  ('Clínica Santa Rita',        'clinica', 14, 'Av. Cabildo 2150', '011 4786-2200'),
  ('Instituto Médico Belgrano', 'clinica', 16, 'Juramento 1840',   '011 4781-5500')
) as v(nombre, tipo, localidad_id, calle_numero, telefono)
where not exists (select 1 from organizaciones o where o.nombre = v.nombre);
