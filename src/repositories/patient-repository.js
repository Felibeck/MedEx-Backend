// Repositorio de Pacientes
// Gestión de datos de pacientes para la conexión con Supabase.
export class PatientRepository {
  constructor(database) {
    this.db = database;
  }

  async getEstudios(patientId) {
    const { data, error } = await this.db
      .from('estudio')
      .select('id, tipo, tipo_estudio, categoria, fecha, institucion')
      .eq('paciente_id', patientId)
      .order('fecha', { ascending: false });

    if (error) {
      console.error('Error completo:', JSON.stringify(error, null, 2));
      throw new Error(`Error al obtener estudios del paciente: ${error.message}`);
    }

    return data || [];
  }

  async getEstudioById(estudioId, patientId) {
    const { data, error } = await this.db
      .from('estudio')
      .select(`
        id,
        tipo,
        tipo_estudio,
        categoria,
        fecha,
        institucion,
        fotos,
        informe,
        paciente_dob,
        metadata_dicom,
        nombre_archivo,
        url_archivo,
        descripcion,
        subido_at,
        medico:medico_id (
          id,
          matricula,
          especialidad_medica,
          profile_picture,
          usuario:usuario_id (
            nombre,
            apellido,
            email
          )
        )
      `)
      .eq('id', estudioId)
      .eq('paciente_id', patientId)
      .maybeSingle();

    if (error) {
      throw new Error(`Error al obtener el estudio: ${error.message}`);
    }

    return data;
  }

  async findByEmail(email) {
    const { data, error } = await this.db
      .from('usuarios')
      .select('id, email, password_hash, nombre, apellido, es_medico, created_at')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      throw new Error(`Error buscando usuario por email: ${error.message}`);
    }

    return data || null;
  }

  async create(patientData) {
    // Insertar en tabla `usuarios` y luego en `perfiles_paciente` (si aplica)
    const { email, password_hash, nombre, apellido, dni, dateOfBirth, phoneNumber, gender } = patientData;

    // Crear usuario
    const { data: userData, error: userError } = await this.db
      .from('usuarios')
      .insert({
        email,
        password_hash,
        nombre,
        apellido,
        es_medico: false
      })
      .select('id, email, nombre, apellido, es_medico, created_at')
      .single();

    if (userError) {
      throw new Error(`Error al crear usuario: ${userError.message}`);
    }

    // Si hay datos de perfil, insertar en perfiles_paciente
    // Nota: la tabla `perfiles_paciente` exige `dni` NOT NULL, por lo que solo
    // intentamos insertar cuando `dni` está presente.
    let perfil = null;
    if (dni) {
      const { data: perfilData, error: perfilError } = await this.db
        .from('perfiles_paciente')
        .insert({
          usuario_id: userData.id,
          dni: dni,
          fecha_nacimiento: dateOfBirth || null,
          telefono: phoneNumber || null,
          identidad_genero: gender || null
        })
        .select('id, usuario_id, dni, fecha_nacimiento, telefono, identidad_genero, created_at')
        .single();

      if (perfilError) {
        throw new Error(`Error al crear perfil de paciente: ${perfilError.message}`);
      }

      perfil = perfilData;
    }

    const result = {
      id: userData.id,
      email: userData.email,
      nombre: userData.nombre,
      apellido: userData.apellido,
      es_medico: userData.es_medico,
      created_at: userData.created_at,
      perfil: perfil,
      password_hash: password_hash,
      getPublicData() {
        const { password_hash, ...rest } = this;
        return rest;
      }
    };

    return result;
  }

  async loginPatient(email) {
    const { data, error } = await this.db
      .from('usuarios')
      .select('id, email, password_hash, es_medico, nombre, apellido')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      throw new Error(`Error al iniciar sesión: ${error.message}`);
    }

    return data || null;
  }

  // Placeholder stubs for future implementation
  async findAll() {
    return [];
  }

  async findById(id) {
    return null;
  }

  async findActive() {
    return [];
  }

  async update(id, updateData) {
    return null;
  }

  async delete(id) {
    return null;
  }

  async findByCity(city) {
    return [];
  }

  async addMedicalHistory(patientId, historyEntry) {
    return null;
  }

  async addAllergy(patientId, allergy) {
    return null;
  }
}
