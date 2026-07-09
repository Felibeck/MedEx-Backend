-- Alergias por paciente
create table if not exists alergias (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references perfiles_paciente(id) on delete cascade,
  nombre text not null,
  created_at timestamp without time zone default now()
);

-- Condiciones crónicas por paciente
create table if not exists condiciones_cronicas (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references perfiles_paciente(id) on delete cascade,
  nombre text not null,
  created_at timestamp without time zone default now()
);

-- Prescripciones por consulta
create table if not exists prescripciones (
  id uuid primary key default gen_random_uuid(),
  consulta_id uuid not null references consultas(id) on delete cascade,
  medicamento text not null,
  indicaciones text,
  activa boolean not null default true,
  created_at timestamp without time zone default now()
);

-- Diagnóstico principal, separado de las notas libres
alter table consultas add column if not exists diagnostico text;
