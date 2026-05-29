// Entidad Usuario (abstracta)
// Clase base para Paciente y Doctor

export class Usuario {
  constructor(
    id,
    nombre,
    apellido,
    email,
    password_hash,
    es_medico = false,
    created_at = null,
    deleted_at = null
  ) {
    if (new.target === Usuario) {
      throw new TypeError('Usuario es una clase abstracta y no puede instanciarse directamente');
    }

    this.id = id;
    this.nombre = nombre;
    this.apellido = apellido;
    this.email = email;
    this.password_hash = password_hash;
    this.es_medico = es_medico;
    this.created_at = created_at;
    this.deleted_at = deleted_at;
  }

  getFullName() {
    return `${this.nombre} ${this.apellido}`;
  }

  getPublicData() {
    const { password_hash, ...publicData } = this;
    return publicData;
  }
}
