-- Schema de Base de Datos para MedEx (referencia de tus tablas en Supabase)
-- No es obligatorio ejecutarlo si ya trabajas directamente con la DB de Supabase.

-- Tabla de usuarios
CREATE TABLE usuario (
    id uuid PRIMARY KEY,
    nombre varchar,
    apellido varchar,
    email varchar UNIQUE,
    password_hash text,
    es_medico boolean DEFAULT false,
    created_at timestamp,
    deleted_at timestamp
);

-- Perfil de paciente
CREATE TABLE perfil_paciente (
    id uuid PRIMARY KEY,
    usuario_id uuid NOT NULL REFERENCES usuario(id),
    dni varchar,
    edad int4,
    identidad_genero varchar,
    telefono varchar,
    created_at timestamp
);

-- Perfil de profesional
CREATE TABLE perfil_profesional (
    id uuid PRIMARY KEY,
    usuario_id uuid NOT NULL REFERENCES usuario(id),
    organizacion_id uuid,
    matricula varchar,
    especialidad_medica varchar,
    created_at timestamp
);

-- Tabla de organizaciones
CREATE TABLE organizacion (
    id uuid PRIMARY KEY,
    nombre varchar,
    tipo varchar,
    localidad_id int4,
    calle_numero varchar,
    telefono varchar
);

-- Tabla de localidades
CREATE TABLE localidad (
    id int4 PRIMARY KEY,
    nombre varchar,
    provincia_id int4,
    codigo_postal varchar
);

-- Tabla de provincias
CREATE TABLE provincia (
    id int4 PRIMARY KEY,
    nombre varchar
);

-- Tabla de consultas
CREATE TABLE consulta (
    id uuid PRIMARY KEY,
    paciente_id uuid NOT NULL REFERENCES usuario(id),
    profesional_id uuid NOT NULL REFERENCES usuario(id),
    organizacion_id uuid,
    fecha date,
    ant text,
    ago text,
    ahf text,
    mx text,
    eco text,
    ef text,
    otros text,
    created_at timestamp
);

-- Tabla de documentos
CREATE TABLE documento (
    id uuid PRIMARY KEY,
    paciente_id uuid NOT NULL REFERENCES usuario(id),
    consulta_id uuid,
    tipo varchar,
    nombre_archivo varchar,
    url_archivo varchar,
    descripcion text,
    subido_at timestamp
);

-- Tabla de autorizaciones
CREATE TABLE autorizacion (
    id uuid PRIMARY KEY,
    paciente_id uuid NOT NULL REFERENCES usuario(id),
    profesional_id uuid NOT NULL REFERENCES usuario(id),
    fecha_inicio timestamp,
    fecha_vencimiento timestamp,
    estado_autorizacion varchar
);

-- Índices de ejemplo
CREATE INDEX idx_usuario_email ON usuario(email);
CREATE INDEX idx_perfil_paciente_usuario ON perfil_paciente(usuario_id);
CREATE INDEX idx_perfil_profesional_usuario ON perfil_profesional(usuario_id);
CREATE INDEX idx_consulta_paciente ON consulta(paciente_id);
CREATE INDEX idx_consulta_profesional ON consulta(profesional_id);
