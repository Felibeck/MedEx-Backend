// Repositorio de Doctores
// Gestión de datos de doctores para la conexión con Supabase.

export class DoctorRepository {
  constructor(database) {
    this.db = database;
  }

  async getPacienteByDni(dni) {
    const { data, error } = await this.db
      .from('perfiles_paciente')
      .select('id, dni, fecha_nacimiento, identidad_genero, telefono, obra_social, cobertura_estado, usuarios (nombre, apellido, email)')
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
      obra_social: data.obra_social || null,
      cobertura_estado: data.cobertura_estado || 'sin_informacion',
      nombre: data.usuarios?.nombre || null,
      apellido: data.usuarios?.apellido || null,
      email: data.usuarios?.email || null
    };
  }

  // Crear consulta
  async crearConsulta(consultaData) {
    const { data: created, error } = await this.db
      .from('consultas')
      .insert(consultaData)
      .select()
      .maybeSingle();

    if (error) {
      throw error;
    }

    return created;
  }

  // Obtener notas de una consulta específica
  async getNotasByConsultaId(consultaId) {
    const { data, error } = await this.db
      .from('consultas')
      .select('id, notas')
      .eq('id', consultaId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data || !data.notas) {
      return [];
    }

    return [{ consulta_id: data.id, nota: data.notas }];
  }

  // Obtener todas las notas del profesional
  async getNotasByProfesionalId(profesionalId) {
    const { data, error } = await this.db
      .from('consultas')
      .select('id, fecha, paciente_id, profesional_id, notas')
      .eq('profesional_id', profesionalId)
      .order('fecha', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || [])
      .filter(row => row.notas != null)
      .map(row => ({
        consulta_id: row.id,
        nota: row.notas,
        fecha: row.fecha,
        paciente_id: row.paciente_id,
        profesional_id: row.profesional_id
      }));
  }

  async getPacientesByProfesional(profesionalId) {
    const { data, error } = await this.db
      .from('consultas')
      .select(`
        paciente_id,
        fecha,
        paciente:paciente_id (
          id,
          dni,
          fecha_nacimiento,
          telefono,
          identidad_genero,
          obra_social,
          cobertura_estado,
          usuario:usuario_id (
            nombre,
            apellido,
            email
          )
        )
      `)
      .eq('profesional_id', profesionalId)
      .order('fecha', { ascending: false });

    if (error) {
      throw error;
    }

    // Deduplicar: un registro por paciente con la consulta más reciente
    const seen = new Set();
    const pacientes = [];
    for (const row of (data || [])) {
      if (!seen.has(row.paciente_id)) {
        seen.add(row.paciente_id);
        const p = row.paciente;
        if (p) {
          pacientes.push({
            paciente_id: p.id,
            dni: p.dni,
            fecha_nacimiento: p.fecha_nacimiento,
            telefono: p.telefono,
            identidad_genero: p.identidad_genero,
            obra_social: p.obra_social || null,
            cobertura_estado: p.cobertura_estado || 'sin_informacion',
            nombre: p.usuario?.nombre || null,
            apellido: p.usuario?.apellido || null,
            email: p.usuario?.email || null,
            ultima_consulta: row.fecha
          });
        }
      }
    }

    return pacientes;
  }

  async guardarHistorial(pacienteId, historialData) {
    const payload = {
      paciente_id: pacienteId,
      ant: historialData.ant ?? null,
      ago: historialData.ago ?? null,
      ahf: historialData.ahf ?? null,
      mx: historialData.mx ?? null,
      eco: historialData.eco ?? null,
      ef: historialData.ef ?? null,
      otros: historialData.otros ?? null
    };

    const { data, error } = await this.db
      .from('historial')
      .upsert(payload, { onConflict: 'paciente_id' })
      .select('id, paciente_id, ant, ago, ahf, mx, eco, ef, otros, created_at')
      .single();

    if (error) throw error;

    return data;
  }

  async getHistorialClinico(pacienteId) {
    // Datos del paciente
    const { data: paciente, error: pacienteError } = await this.db
      .from('perfiles_paciente')
      .select(`
        id,
        dni,
        fecha_nacimiento,
        telefono,
        obra_social,
        cobertura_estado,
        profile_picture,
        tipo_sangre:tipo_sangre_id (nombre),
        usuario:usuario_id (nombre, apellido, email)
      `)
      .eq('id', pacienteId)
      .maybeSingle();

    if (pacienteError) throw pacienteError;

    // Historial clínico
    const { data: historial, error: historialError } = await this.db
      .from('historial')
      .select('id, paciente_id, ant, ago, ahf, mx, eco, ef, otros, created_at')
      .eq('paciente_id', pacienteId)
      .maybeSingle();

    if (historialError) throw historialError;

    // Alergias
    const { data: alergias, error: alergiasError } = await this.db
      .from('alergias')
      .select('id, nombre')
      .eq('paciente_id', pacienteId);

    if (alergiasError) throw alergiasError;

    // Condiciones crónicas
    const { data: condicionesCronicas, error: condicionesError } = await this.db
      .from('condiciones_cronicas')
      .select('id, nombre')
      .eq('paciente_id', pacienteId);

    if (condicionesError) throw condicionesError;

    // Consultas
    const { data: consultas, error: consultasError } = await this.db
      .from('consultas')
      .select(`
        id,
        fecha,
        diagnostico,
        notas,
        tipo_consulta,
        solicitud_estudio,
        solicitud_receta,
        solicitud_citaprox,
        profesional:profesional_id (
          id,
          matricula,
          especialidad_medica,
          usuario:usuario_id (nombre, apellido)
        ),
        organizacion:organizacion_id (nombre)
      `)
      .eq('paciente_id', pacienteId)
      .order('fecha', { ascending: false });

    if (consultasError) throw consultasError;

    // Estudios
    const { data: estudios, error: estudiosError } = await this.db
      .from('estudios')
      .select('id, consulta_id, nombre_archivo, url_archivo, tipo_estudio:tipo_estudio_id(*), fecha, institucion, descripcion')
      .eq('paciente_id', pacienteId)
      .order('fecha', { ascending: false });

    if (estudiosError) throw estudiosError;

    const estudiosNormalizados = (estudios || []).map(row => {
      if (row.tipo_estudio) {
        const label = row.tipo_estudio.nombre ?? row.tipo_estudio.tipo ?? row.tipo_estudio.label ?? null;
        return { ...row, tipo_estudio: label };
      }
      return row;
    });

    return {
      paciente: paciente
        ? {
            paciente_id: paciente.id,
            dni: paciente.dni,
            nombre: paciente.usuario?.nombre || null,
            apellido: paciente.usuario?.apellido || null,
            fecha_nacimiento: paciente.fecha_nacimiento,
            foto_perfil: paciente.profile_picture || null,
            grupo_sanguineo: paciente.tipo_sangre?.nombre || null,
            obra_social: paciente.obra_social || null,
            cobertura_estado: paciente.cobertura_estado || 'sin_informacion'
          }
        : null,
      alergias: alergias || [],
      condicionesCronicas: condicionesCronicas || [],
      consultas: consultas || [],
      estudios: estudiosNormalizados,
      historial: historial || {
        id: null,
        paciente_id: pacienteId,
        ant: null,
        ago: null,
        ahf: null,
        mx: null,
        eco: null,
        ef: null,
        otros: null,
        created_at: null
      }
    };
  }

async loginDoctor(email, password)
    {
      const { data, error } = await this.db
        .from('usuarios')
        .select('id, email, password_hash, es_medico, nombre, apellido, perfiles_profesional (id, organizacion_id, matricula, especialidad_medica)')
        .eq('email', email)
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

      return { ...data, perfil_profesional: perfilProfesional };
    }

  async findByEmail(email) {
    const normalized = (email || '').toString().trim().toLowerCase();
    if (!normalized) return null;

    // Use case-insensitive match to avoid issues with casing/whitespace.
    const { data, error } = await this.db
      .from('usuarios')
      .select('id, email, password_hash, nombre, apellido, es_medico, created_at')
      .ilike('email', normalized)
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

  async organizationExists(organizacionId) {
    if (!organizacionId) return false;
    const { data, error } = await this.db
      .from('organizaciones')
      .select('id')
      .eq('id', organizacionId)
      .maybeSingle();

    if (error) {
      throw new Error(`Error verificando organización: ${error.message}`);
    }

    return !!data;
  }

  // Sube el PDF al bucket de Supabase Storage y guarda el registro en la tabla recetas
  async subirReceta(consultaId, fileBuffer, originalName, titulo) {
    // Construir path único dentro del bucket: recetas/<consultaId>/<timestamp>_<nombre>
    const timestamp = Date.now();
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `recetas/${consultaId}/${timestamp}_${safeName}`;

    // Subir al bucket "estudios"
    const { error: uploadError } = await this.db.storage
      .from('estudios')
      .upload(filePath, fileBuffer, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Error al subir receta al storage: ${uploadError.message}`);
    }

    // Insertar registro en tabla recetas
    const { data, error: insertError } = await this.db
      .from('recetas')
      .insert({
        consulta_id: consultaId,
        titulo: titulo || safeName,
        pathFile: filePath
      })
      .select('id, consulta_id, titulo, pathFile, created_at')
      .single();

    if (insertError) {
      throw new Error(`Error al guardar registro de receta: ${insertError.message}`);
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
