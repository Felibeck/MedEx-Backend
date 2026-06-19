// Repositorio de Doctores
// Gestión de datos de doctores para la conexión con Supabase.

export class DoctorRepository {
  constructor(database) {
    this.db = database;
  }

  async getPacienteByDni(dni) {
    const { data, error } = await this.db
      .from('perfiles_paciente')
      .select('id, dni, fecha_nacimiento, identidad_genero, telefono, usuario (nombre, apellido, email)')
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




async loginDoctor(email, password)
    {
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

  async findByLicenseNumber(licenseNumber) {
    const { data, error } = await this.db
      .from('perfiles_profesional')
      .select('matricula, usuario_id, usuario:usuario_id (id, email, nombre, apellido)')
      .eq('matricula', licenseNumber)
      .maybeSingle();

    if (error) {
      throw new Error(`Error buscando matrícula: ${error.message}`);
    }

    return data || null;
  }

  async create(doctorData) {
    const {
      email,
      password_hash,
      nombre,
      apellido,
      matricula,
      especialidad_medica,
      organizacion_id = null
    } = doctorData;

    const { data: userData, error: userError } = await this.db
      .from('usuarios')
      .insert({
        email,
        password_hash,
        nombre,
        apellido,
        es_medico: true
      })
      .select('id, email, nombre, apellido, es_medico, created_at')
      .single();

    if (userError) {
      throw new Error(`Error al crear usuario doctor: ${userError.message}`);
    }

    const { data: perfilData, error: perfilError } = await this.db
      .from('perfiles_profesional')
      .insert({
        usuario_id: userData.id,
        organizacion_id,
        matricula,
        especialidad_medica
      })
      .select('id, usuario_id, organizacion_id, matricula, especialidad_medica, created_at')
      .single();

    if (perfilError) {
      throw new Error(`Error al crear perfil de doctor: ${perfilError.message}`);
    }

    return {
      id: userData.id,
      email: userData.email,
      nombre: userData.nombre,
      apellido: userData.apellido,
      es_medico: userData.es_medico,
      created_at: userData.created_at,
      perfil: perfilData,
      password_hash: password_hash,
      getPublicData() {
        const { password_hash, ...rest } = this;
        return rest;
      }
    };
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
