// Entidad Paciente
// Define la estructura y propiedades de un paciente a partir de las tablas reales de Supabase

import { Usuario } from './Usuario.js';

export class Patient extends Usuario {
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
    dni,
    fecha_nacimiento,
    identidad_genero,
    telefono,
    perfil_created_at
  ) {
    super(id, nombre, apellido, email, password_hash, es_medico, created_at, deleted_at);
    this.perfilId = perfilId;
    this.usuario_id = usuario_id;
    this.dni = dni;
    this.fecha_nacimiento = fecha_nacimiento;
    this.identidad_genero = identidad_genero;
    this.telefono = telefono;
    this.perfil_created_at = perfil_created_at;
  }

  // Método para obtener datos públicos del paciente
  getPublicData() {
    const { password_hash, ...publicData } = this;
    return publicData;
  }
}
