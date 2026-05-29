// Entidad Doctor
// Define la estructura y propiedades de un profesional a partir de las tablas reales de Supabase

import { Usuario } from './Usuario.js';

export class Doctor extends Usuario {
  constructor(
    id,
    nombre,
    apellido,
    email,
    password_hash,
    es_medico,
    created_at,
    deleted_at,
    perfilId,
    usuario_id,
    organizacion_id,
    matricula,
    especialidad_medica,
    perfil_created_at
  ) {
    super(id, nombre, apellido, email, password_hash, es_medico, created_at, deleted_at);
    this.perfilId = perfilId;
    this.usuario_id = usuario_id;
    this.organizacion_id = organizacion_id;
    this.matricula = matricula;
    this.especialidad_medica = especialidad_medica;
    this.perfil_created_at = perfil_created_at;
  }

  getPublicData() {
    const { password_hash, ...publicData } = this;
    return publicData;
  }
}
