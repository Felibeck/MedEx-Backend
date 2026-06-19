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
    
    
    async loginPatient(email, password)
    {
        const { data, error } = await this.db
          .from('usuarios')
          .select('id, email, password_hash, es_medico, nombre, apellido')
          .eq('email', email)
          .single();

      if (error) {
          throw new Error(`Error al iniciar sesión: ${error.message}`);
      }

      return data;
    }

  async findAll() {
    //obtener todos los pacientes
  }



  async create(patientData) {
    // TODO: implementar con Supabase
    return null;
  }

  async findById(id) {
    // TODO: implementar con Supabase
    return null;
  }

  async findByEmail(email) {
    // TODO: implementar con Supabase
    return null;
  }



  async findActive() {
    // TODO: implementar con Supabase
    return [];
  }

  async update(id, updateData) {
    // TODO: implementar con Supabase
    return null;
  }

  async delete(id) {
    // TODO: implementar con Supabase
    return null;
  }

  async findByCity(city) {
    // TODO: implementar con Supabase
    return [];
  }

  async addMedicalHistory(patientId, historyEntry) {
    // TODO: implementar con Supabase
    return null;
  }

  async addAllergy(patientId, allergy) {
    // TODO: implementar con Supabase
    return null;
  }



}
