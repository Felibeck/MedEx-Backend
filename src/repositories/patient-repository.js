// Repositorio de Pacientes
// Gestión de datos de pacientes para la conexión con Supabase.
export class PatientRepository {
  constructor(database) {
    this.db = database;
  }

  async resolvePacienteId(patientId) {
    if (!patientId) return null;

    const { data, error } = await this.db
      .from('perfiles_paciente')
      .select('id')
      .eq('usuario_id', patientId)
      .maybeSingle();

    if (error) {
      throw new Error(`Error al resolver paciente: ${error.message}`);
    }

    return data?.id || patientId;
  }

  async getEstudios(patientId) {
    const resolvedPacienteId = await this.resolvePacienteId(patientId);

    const { data, error } = await this.db
      .from('estudios')
      .select('id, tipo_estudio:tipos_estudio!left(*), fecha, institucion')
      .eq('paciente_id', resolvedPacienteId)
      .order('fecha', { ascending: false });

    if (error) {
      console.error('Error completo:', JSON.stringify(error, null, 2));
      throw new Error(`Error al obtener estudios del paciente: ${error.message}`);
    }

    const normalized = (data || []).map(row => {
      if (row.tipo_estudio) {
        const label = row.tipo_estudio.nombre ?? row.tipo_estudio.tipo ?? row.tipo_estudio.label ?? null;
        return { ...row, tipo_estudio: label };
      }
      return row;
    });

    return normalized;
  }

  async getEstudioById(estudioId, patientId) {
    const resolvedPacienteId = await this.resolvePacienteId(patientId);

    const { data, error } = await this.db
      .from('estudios')
      .select(`
        id,
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
        tipo_estudio:tipos_estudio!left(*),
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
      .eq('paciente_id', resolvedPacienteId)
      .maybeSingle();

    if (error) {
      throw new Error(`Error al obtener el estudio: ${error.message}`);
    }

    // normalizar tipo_estudio a un string si vino como objeto por el JOIN
    if (data && data.tipo_estudio) {
      const label = data.tipo_estudio.nombre ?? data.tipo_estudio.tipo ?? data.tipo_estudio.label ?? null;
      data.tipo_estudio = label;
    }


    return data;
  }

  async createEstudio(patientId, estudioData) {
    const resolvedPacienteId = await this.resolvePacienteId(patientId);
    if (!resolvedPacienteId) {
      throw new Error('Paciente no encontrado');
    }

    const payload = {
      paciente_id: resolvedPacienteId,
      consulta_id: estudioData.consulta_id || null,
      nombre_archivo: estudioData.nombre_archivo,
      url_archivo: estudioData.url_archivo,
      descripcion: estudioData.descripcion || null,
      subido_at: estudioData.subido_at || new Date().toISOString(),
      fecha: estudioData.fecha,
      institucion: estudioData.institucion,
      fotos: Array.isArray(estudioData.fotos) ? estudioData.fotos : [],
      informe: estudioData.informe || null,
      paciente_dob: estudioData.paciente_dob || null,
      metadata_dicom: null,
      medico_id: estudioData.medico_id || null,
      tipo_estudio_id: estudioData.tipo_estudio_id || null
    };

    const { data, error } = await this.db
      .from('estudios')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Error al crear estudio: ${error.message}`);
    }

    return data;
  }

  async getHistorialClinico(pacienteId) {
    const { data: paciente, error: pacienteError } = await this.db
      .from('perfiles_paciente')
      .select(`
        id,
        dni,
        fecha_nacimiento,
        identidad_genero,
        telefono,
        obra_social,
        cobertura_estado,
        profile_picture,
        tipo_sangre:tipo_sangre_id (nombre),
        antecedentes_quirurgicos,
        heredofamiliares,
        menarca_edad,
        formula_obstetrica,
        ultimo_pap_fecha,
        ultimo_pap_resultado,
        usuario:usuario_id (nombre, apellido, email)
      `)
      .eq('id', pacienteId)
      .maybeSingle();

    if (pacienteError) {
      throw pacienteError;
    }

    const { data: consultas, error: consultasError } = await this.db
      .from('consultas')
      .select(`
        id,
        fecha,
        diagnostico,
        notas,
        solicitud_estudio,
        solicitud_receta,
        solicitud_citaprox,
        presion_arterial,
        peso_kg,
        talla_m,
        profesional:profesional_id (
          id,
          matricula,
          especialidad_medica,
          usuario:usuario_id (
            nombre,
            apellido
          )
        ),
        organizacion:organizacion_id (
          nombre
        )
      `)
      .eq('paciente_id', pacienteId)
      .order('fecha', { ascending: false });

    if (consultasError) {
      throw consultasError;
    }

    const consultaIds = (consultas || []).map(c => c.id);

    const { data: prescripciones, error: prescripcionesError } = consultaIds.length
      ? await this.db
        .from('prescripciones')
        .select('id, consulta_id, medicamento, indicaciones, activa')
        .in('consulta_id', consultaIds)
      : { data: [], error: null };

    if (prescripcionesError) {
      throw prescripcionesError;
    }

    const { data: estudios, error: estudiosError } = await this.db
      .from('estudios')
      .select('id, consulta_id, nombre_archivo, url_archivo, tipo_estudio:tipos_estudio!left(*), fecha, institucion, descripcion')
      .eq('paciente_id', pacienteId)
      .order('fecha', { ascending: false });

    if (estudiosError) {
      throw estudiosError;
    }

    const { data: alergias, error: alergiasError } = await this.db
      .from('alergias')
      .select('id, nombre')
      .eq('paciente_id', pacienteId);

    if (alergiasError) {
      throw alergiasError;
    }

    const { data: condicionesCronicas, error: condicionesError } = await this.db
      .from('condiciones_cronicas')
      .select('id, nombre')
      .eq('paciente_id', pacienteId);

    if (condicionesError) {
      throw condicionesError;
    }

    const { data: antecedentesPatologicos, error: antecedentesError } = await this.db
      .from('antecedentes_patologicos')
      .select('id, nombre, anio, estado')
      .eq('paciente_id', pacienteId);

    if (antecedentesError) {
      throw antecedentesError;
    }

    const consultaConExamen = (consultas || []).find(
      c => c.presion_arterial != null || c.peso_kg != null || c.talla_m != null
    );

    const examenFisico = consultaConExamen
      ? {
        presionArterial: consultaConExamen.presion_arterial ?? null,
        pesoKg: consultaConExamen.peso_kg ?? null,
        tallaM: consultaConExamen.talla_m ?? null,
        imc: (consultaConExamen.peso_kg != null && consultaConExamen.talla_m)
          ? Math.round((consultaConExamen.peso_kg / (consultaConExamen.talla_m ** 2)) * 10) / 10
          : null,
        fecha: consultaConExamen.fecha
      }
      : null;

    const estudiosNormalizados = (estudios || []).map(row => {
      if (row.tipo_estudio) {
        const label = row.tipo_estudio.nombre ?? row.tipo_estudio.tipo ?? row.tipo_estudio.label ?? null;
        return { ...row, tipo_estudio: label };
      }
      return row;
    });

    const consultasConDetalle = (consultas || []).map(consulta => ({
      ...consulta,
      prescripciones: (prescripciones || []).filter(p => p.consulta_id === consulta.id),
      adjuntos: estudiosNormalizados
        .filter(e => e.consulta_id === consulta.id)
        .map(({ id, nombre_archivo, url_archivo }) => ({ id, nombre_archivo, url_archivo }))
    }));

    return {
      paciente: paciente
        ? {
          paciente_id: paciente.id,
          dni: paciente.dni,
          fecha_nacimiento: paciente.fecha_nacimiento,
          identidad_genero: paciente.identidad_genero,
          telefono: paciente.telefono,
          obra_social: paciente.obra_social || null,
          cobertura_estado: paciente.cobertura_estado || 'sin_informacion',
          foto_perfil: paciente.profile_picture || null,
          grupo_sanguineo: paciente.tipo_sangre?.nombre || null,
          antecedentesQuirurgicos: paciente.antecedentes_quirurgicos || null,
          heredofamiliares: paciente.heredofamiliares || null,
          ginecoObstetrico: {
            menarcaEdad: paciente.menarca_edad ?? null,
            formulaObstetrica: paciente.formula_obstetrica || null,
            ultimoPapFecha: paciente.ultimo_pap_fecha || null,
            ultimoPapResultado: paciente.ultimo_pap_resultado || null
          },
          nombre: paciente.usuario?.nombre || null,
          apellido: paciente.usuario?.apellido || null,
          email: paciente.usuario?.email || null
        }
        : null,
      alergias: alergias || [],
      condicionesCronicas: condicionesCronicas || [],
      antecedentesPatologicos: antecedentesPatologicos || [],
      examenFisico,
      consultas: consultasConDetalle,
      estudios: estudiosNormalizados
    };
  }

  async findByEmail(email) {
    const normalized = (email || '').toString().trim().toLowerCase();
    if (!normalized) return null;

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
    const normalized = (email || '').toString().trim().toLowerCase();
    if (!normalized) return null;

    const { data, error } = await this.db
      .from('usuarios')
      .select('id, email, password_hash, es_medico, nombre, apellido')
      .ilike('email', normalized)
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
