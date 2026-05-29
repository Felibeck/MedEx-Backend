// Repositorio de Pacientes
// Gestión de datos de pacientes para la conexión con Supabase.

export class PatientRepository {
  constructor(database) {
    this.db = database;
  }

  async getEstudios(patientId) {
    const { data, error } = await this.db
      .from('estudio')
      .select('id, tipo, nombre_archivo, url_archivo, descripcion, subido_at')
      .eq('paciente_id', patientId);

    if (error) {
      throw new Error(`Error al obtener estudios del paciente: ${error.message}`);
    }

    return data || [];
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

  async findAll() {
    // TODO: implementar con Supabase
    return [];
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
