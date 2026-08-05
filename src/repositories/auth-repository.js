// Repositorio de autenticación
// Consulta la tabla de usuarios y obtiene los datos necesarios para login.

export class AuthRepository {
  constructor(db) {
    this.db = db;
  }

  async loginByEmail(email) {
    const normalized = (email || '').toString().trim().toLowerCase();
    if (!normalized) return null;

    const { data, error } = await this.db
      .from('usuarios')
      .select('id, email, password_hash, es_medico, nombre, apellido, perfiles_profesional (id, organizacion_id, matricula, especialidad_medica)')
      .ilike('email', normalized)
      .maybeSingle();

    if (error) {
      throw new Error(`Error al iniciar sesión: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    const perfilProfesional = Array.isArray(data.perfiles_profesional)
      ? data.perfiles_profesional[0] || null
      : data.perfiles_profesional || null;

    return {
      ...data,
      perfil_profesional: perfilProfesional
    };
  }
}
