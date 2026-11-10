-- Datos mock (desarrollo): completa datos para los que NO existe endpoint
-- (obra social, grupo sanguíneo, cobertura, antecedentes del perfil, alergias,
-- condiciones crónicas y diagnóstico de cada consulta).
--
-- Solo toca filas creadas por scripts/seed-mock-data.js: los pacientes se filtran por
-- email 'mock.%@example.com'. NO modifica ningún dato preexistente.
-- Ejecutar DESPUÉS de scripts/seed-mock-data.js.

-- 1) Perfil del paciente: obra social (texto libre), grupo sanguíneo (catálogo tipo_sangre),
--    estado de cobertura (CHECK existente) y antecedentes.
update perfiles_paciente p set
  obra_social              = v.obra_social,
  tipo_sangre_id           = (select ts.id from tipo_sangre ts where ts.nombre = v.tipo_sangre),
  cobertura_estado         = v.cobertura_estado,
  antecedentes_quirurgicos = v.quirurgicos,
  heredofamiliares         = v.heredo,
  menarca_edad             = v.menarca,
  formula_obstetrica       = v.formula,
  ultimo_pap_fecha         = v.pap_fecha::date,
  ultimo_pap_resultado     = v.pap_resultado
from (values
  ('34218765', 'OSDE 210',            'A_Positivo',  'validada',        'Sin cirugías previas', 'Madre con hipotiroidismo. Padre con hipertensión arterial.', 12,   'G0 P0 A0', '2026-03-10', 'Negativo para lesión intraepitelial'),
  ('25904412', 'Swiss Medical SMG30', 'O_Positivo',  'validada',        'Apendicectomía (1992)', 'Padre fallecido por infarto agudo de miocardio a los 61 años. Madre hipertensa.', null, null, null, null),
  ('38560127', 'Galeno Plata',        'B_Positivo',  'validada',        'Sin cirugías previas', 'Hermano con asma. Madre con rinitis alérgica.', 13,   'G0 P0 A0', null, null),
  ('42133596', 'Medifé Azul',         'O_Positivo',  'pendiente_pago',  'Sin cirugías previas', 'Padre con rinitis alérgica.', null, null, null, null),
  ('12874339', 'PAMI',                'A_Negativo',  'validada',        'Colecistectomía (2005)', 'Madre con diabetes tipo 2 y fractura de cadera. Hermana con cáncer de mama.', 12, 'G3 P3 A0', '2025-09-15', 'Negativo para lesión intraepitelial'),
  ('30476218', 'OMINT Premium',       'AB_Positivo', 'validada',        'Sin cirugías previas', 'Padre con gastritis crónica.', null, null, null, null),
  ('36781904', 'Swiss Medical SMG20', 'O_Negativo',  'validada',        'Sin cirugías previas', 'Madre con diabetes gestacional.', 12, 'G1 P0 A0', '2025-11-18', 'Negativo para lesión intraepitelial'),
  ('20915378', 'IOMA',                'B_Negativo',  'alerta_medica',   'Angioplastia con stent farmacológico en arteria descendente anterior (febrero 2026)', 'Padre con infarto agudo de miocardio a los 58 años. Hermano con diabetes tipo 2.', null, null, null, null),
  ('41208664', 'Sancor Salud 3000',   'A_Positivo',  'sin_informacion', 'Sin cirugías previas', 'Abuela materna con cáncer de mama a los 70 años.', 12, 'G0 P0 A0', '2026-07-21', 'Negativo para lesión intraepitelial')
) as v(dni, obra_social, tipo_sangre, cobertura_estado, quirurgicos, heredo, menarca, formula, pap_fecha, pap_resultado)
where p.dni = v.dni
  and exists (select 1 from usuarios u where u.id = p.usuario_id and u.email like 'mock.%@example.com');

-- 2) Alergias
insert into alergias (paciente_id, nombre)
select p.id, v.nombre
from (values
  ('34218765', 'Penicilina'),
  ('38560127', 'Ibuprofeno'),
  ('38560127', 'Polen de gramíneas'),
  ('42133596', 'Ácaros del polvo'),
  ('42133596', 'Polen de gramíneas'),
  ('12874339', 'Sulfamidas'),
  ('41208664', 'Látex')
) as v(dni, nombre)
join perfiles_paciente p on p.dni = v.dni
join usuarios u on u.id = p.usuario_id and u.email like 'mock.%@example.com'
where not exists (select 1 from alergias a where a.paciente_id = p.id and a.nombre = v.nombre);

-- 3) Condiciones crónicas
insert into condiciones_cronicas (paciente_id, nombre)
select p.id, v.nombre
from (values
  ('34218765', 'Hipotiroidismo'),
  ('25904412', 'Hipertensión arterial'),
  ('25904412', 'Dislipemia'),
  ('38560127', 'Asma bronquial'),
  ('42133596', 'Rinitis alérgica'),
  ('12874339', 'Diabetes mellitus tipo 2'),
  ('12874339', 'Hipertensión arterial'),
  ('12874339', 'Osteopenia'),
  ('30476218', 'Enfermedad por reflujo gastroesofágico'),
  ('20915378', 'Cardiopatía isquémica'),
  ('20915378', 'Hipertensión arterial'),
  ('20915378', 'Dislipemia')
) as v(dni, nombre)
join perfiles_paciente p on p.dni = v.dni
join usuarios u on u.id = p.usuario_id and u.email like 'mock.%@example.com'
where not exists (select 1 from condiciones_cronicas c where c.paciente_id = p.id and c.nombre = v.nombre);

-- 4) Diagnóstico de cada consulta (cruce por dni + fecha; el endpoint de alta no lo acepta)
update consultas c set diagnostico = v.diagnostico
from (values
  ('34218765', '2026-03-10', 'Control ginecológico de rutina'),
  ('34218765', '2026-04-22', 'Control ginecológico normal'),
  ('34218765', '2026-07-08', 'Hipotiroidismo en control'),
  ('34218765', '2026-09-02', 'Hipotiroidismo, ajuste de dosis'),
  ('25904412', '2026-02-17', 'Hipertensión arterial, a confirmar'),
  ('25904412', '2026-03-12', 'Hipertensión arterial esencial'),
  ('25904412', '2026-05-14', 'Hipertensión arterial con dislipemia'),
  ('25904412', '2026-10-15', 'Hipertensión arterial controlada'),
  ('38560127', '2026-04-07', 'Crisis asmática leve a moderada'),
  ('38560127', '2026-04-21', 'Asma bronquial persistente leve'),
  ('38560127', '2026-08-26', 'Asma controlada'),
  ('42133596', '2026-06-03', 'Rinitis alérgica estacional'),
  ('42133596', '2026-10-20', 'Rinitis alérgica'),
  ('12874339', '2026-01-27', 'Diabetes mellitus tipo 2 con control sub-óptimo'),
  ('12874339', '2026-03-19', 'Hipertensión arterial, riesgo cardiovascular alto'),
  ('12874339', '2026-06-11', 'Control ginecológico posmenopáusico'),
  ('12874339', '2026-08-05', 'Diabetes tipo 2 controlada, osteopenia'),
  ('12874339', '2026-10-28', 'Diabetes tipo 2 controlada'),
  ('30476218', '2026-05-06', 'Enfermedad por reflujo gastroesofágico'),
  ('30476218', '2026-07-14', 'Reflujo gastroesofágico en estudio'),
  ('30476218', '2026-09-30', 'Esofagitis por reflujo grado A'),
  ('36781904', '2026-03-24', 'Embarazo de 6 semanas, primer control'),
  ('36781904', '2026-05-12', 'Embarazo de curso normal, Rh negativo'),
  ('36781904', '2026-07-28', 'Embarazo de curso normal'),
  ('36781904', '2026-09-22', 'Embarazo de 32 semanas, evolución favorable'),
  ('20915378', '2026-02-10', 'Síndrome coronario agudo sin elevación del ST'),
  ('20915378', '2026-03-03', 'Cardiopatía isquémica, post angioplastia'),
  ('20915378', '2026-06-16', 'Cardiopatía isquémica estable'),
  ('20915378', '2026-10-27', 'Control clínico, cardiopatía isquémica estable'),
  ('41208664', '2026-04-14', 'Anticoncepción'),
  ('41208664', '2026-07-21', 'Control de anticoncepción'),
  ('41208664', '2026-10-13', 'Candidiasis vulvovaginal')
) as v(dni, fecha, diagnostico)
join perfiles_paciente p on p.dni = v.dni
join usuarios u on u.id = p.usuario_id and u.email like 'mock.%@example.com'
where c.paciente_id = p.id and c.fecha = v.fecha::date;
