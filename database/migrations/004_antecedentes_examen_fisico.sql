-- Antecedentes patológicos (historial, pueden estar resueltos, distinto de condiciones_cronicas)
create table if not exists antecedentes_patologicos (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references perfiles_paciente(id) on delete cascade,
  nombre text not null,
  anio integer,
  estado text, -- ej: 'en_tratamiento', 'resuelto', o texto libre
  created_at timestamp without time zone default now()
);

-- Campos de antecedentes generales / gineco-obstétricos del paciente (valor único por paciente)
alter table perfiles_paciente add column if not exists antecedentes_quirurgicos text;
alter table perfiles_paciente add column if not exists heredofamiliares text;
alter table perfiles_paciente add column if not exists menarca_edad integer;
alter table perfiles_paciente add column if not exists formula_obstetrica text;
alter table perfiles_paciente add column if not exists ultimo_pap_fecha date;
alter table perfiles_paciente add column if not exists ultimo_pap_resultado text;

-- Examen físico cargado en cada consulta (el IMC se calcula en la capa de aplicación)
alter table consultas add column if not exists presion_arterial text;
alter table consultas add column if not exists peso_kg numeric(5,2);
alter table consultas add column if not exists talla_m numeric(3,2);
