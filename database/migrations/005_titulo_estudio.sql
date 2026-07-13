-- Título descriptivo del estudio, cargado por el paciente al subir el archivo
alter table estudios add column if not exists titulo text;
