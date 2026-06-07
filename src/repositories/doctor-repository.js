// Repositorio de Doctores
// Gestión de datos de doctores para la conexión con Supabase.

export class DoctorRepository {
  constructor(database) {
    this.db = database;
  }

  async getPacienteByDni(dni) {
    const { data, error } = await this.db
      .from('perfil_paciente')
      .select('id, dni, edad, identidad_genero, telefono, usuario (nombre, apellido, email)')
      .eq('dni', dni)
      .is('usuario.deleted_at', null)
      .maybeSingle();
  
    if (error) {
      throw error;
    }
  
    if (!data) {
      return null;
    }
  
    return {
      paciente_id: data.id,
      dni: data.dni,
      edad: data.edad,
      identidad_genero: data.identidad_genero,
      telefono: data.telefono,
      nombre: data.usuario?.nombre || null,
      apellido: data.usuario?.apellido || null,
      email: data.usuario?.email || null
    };
  }

  // Crear consulta
  async crearConsulta(consultaData) {
    const { data, error } = await this.db
      .from('consulta')
      .insert(consultaData)
      .select()
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  }
}

  
//   async create(doctorData) {
//     // TODO: implementar con Supabase
//     return null;
//   }

//   async findById(id) {
//     // TODO: implementar con Supabase
//     return null;
//   }

//   async findByEmail(email) {
//     // TODO: implementar con Supabase
//     return null;
//   }

//   async findByLicenseNumber(licenseNumber) {
//     // TODO: implementar con Supabase
//     return null;
//   }


//   async findAll() {
//     // TODO: implementar con Supabase
//     return [];
//   }

//   async findAvailable() {
//     // TODO: implementar con Supabase
//     return [];
//   }

//   async findBySpecialty(specialty) {
//     // TODO: implementar con Supabase
//     return [];
//   }

//   async findByCity(city) {
//     // TODO: implementar con Supabase
//     return [];
//   }

//   async update(id, updateData) {
//     // TODO: implementar con Supabase
//     return null;
//   }

//   async verify(id) {
//     // TODO: implementar con Supabase
//     return null;
//   }

//   async delete(id) {
//     // TODO: implementar con Supabase
//     return null;
//   }

//   async addAvailableSlot(doctorId, slot) {
//     // TODO: implementar con Supabase
//     return null;
//   }

//   async addQualification(doctorId, qualification) {
//     // TODO: implementar con Supabase
//     return null;
//   }

//   async findBySpecialtyAndCity(specialty, city) {
//     // TODO: implementar con Supabase
//     return [];
//   }
