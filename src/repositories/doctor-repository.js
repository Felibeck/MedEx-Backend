// Repositorio de Doctores
// Gestión de datos de doctores para la conexión con Supabase.

export class DoctorRepository {
  constructor(database) {
    this.db = database;
  }

  async create(doctorData) {
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

  async findByLicenseNumber(licenseNumber) {
    // TODO: implementar con Supabase
    return null;
  }

  async findAll() {
    // TODO: implementar con Supabase
    return [];
  }

  async findAvailable() {
    // TODO: implementar con Supabase
    return [];
  }

  async findBySpecialty(specialty) {
    // TODO: implementar con Supabase
    return [];
  }

  async findByCity(city) {
    // TODO: implementar con Supabase
    return [];
  }

  async update(id, updateData) {
    // TODO: implementar con Supabase
    return null;
  }

  async verify(id) {
    // TODO: implementar con Supabase
    return null;
  }

  async delete(id) {
    // TODO: implementar con Supabase
    return null;
  }

  async addAvailableSlot(doctorId, slot) {
    // TODO: implementar con Supabase
    return null;
  }

  async addQualification(doctorId, qualification) {
    // TODO: implementar con Supabase
    return null;
  }

  async findBySpecialtyAndCity(specialty, city) {
    // TODO: implementar con Supabase
    return [];
  }
}
