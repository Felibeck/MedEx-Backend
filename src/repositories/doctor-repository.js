// Repositorio de Doctores
// Gestión de datos de doctores para la conexión con Supabase.

export class DoctorRepository {
  constructor(database) {
    this.db = database;
  }

  async getPacienteByDni(dni) {
    const { data, error } = await this.db
      .from('perfiles_paciente')
      .select('id, dni, fecha_nacimiento, identidad_genero, telefono, usuarios (nombre, apellido, email)')
      .eq('dni', dni)
      .is('usuarios.deleted_at', null)
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
      fecha_nacimiento: data.fecha_nacimiento,
      identidad_genero: data.identidad_genero,
      telefono: data.telefono,
      nombre: data.usuario?.nombre || null,
      apellido: data.usuario?.apellido || null,
      email: data.usuario?.email || null
    };
  }

  // Crear consulta
  async crearConsulta(consultaData) {
    // soporta `notas` anidadas: extract y crear consulta primero
    const { notas, ...consultaPayload } = consultaData || {};

    const { data: created, error } = await this.db
      .from('consultas')
      .insert(consultaPayload)
      .select()
      .maybeSingle();

    if (error) {
      throw error;
    }

    let insertedNotas = [];
    if (notas && Array.isArray(notas) && notas.length) {
      const notesToInsert = notas.map(n => ({
        consulta_id: created.id,
        paciente_id: n.paciente_id ?? consultaPayload.paciente_id,
        nota: n.nota,
        created_at: n.created_at ?? new Date().toISOString()
      }));

      const { data: notesData, error: notesError } = await this.db
        .from('notas')
        .insert(notesToInsert)
        .select();

      if (notesError) {
        throw notesError;
      }

      insertedNotas = notesData || [];
    }

    return { ...created, notas: insertedNotas };
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
