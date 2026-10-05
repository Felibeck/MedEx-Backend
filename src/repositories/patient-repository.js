// Repositorio de Pacientes
// Gestión de datos de pacientes para la conexión con Supabase.
import { randomUUID } from 'crypto';

const ESTUDIOS_SIGNED_URL_EXPIRATION = 60 * 60 * 24 * 365; // 1 año
const JFIF_EXTENSION = /\.jfif$/i;
const GENERIC_MIME_TYPES = new Set(['', 'application/octet-stream']);

export class PatientRepository {
  constructor(database) {
    this.db = database;
  }

  // Sube un archivo de estudio al bucket "estudios" y devuelve la URL de acceso
  async uploadArchivoEstudio(pacienteId, fileBuffer, fileName, mimeType) {
    const resolvedPacienteId = await this.resolvePacienteId(pacienteId);
    if (!resolvedPacienteId) {
      throw new Error('Paciente no encontrado');
    }

    const filePath = `${resolvedPacienteId}/${randomUUID()}-${fileName}`;

    // Los .jfif son JPEGs por especificación, pero suelen llegar con mimetype vacío o genérico
    // (application/octet-stream) desde el navegador — forzamos el content-type real del formato
    const resolvedContentType = (JFIF_EXTENSION.test(fileName) && GENERIC_MIME_TYPES.has(mimeType))
      ? 'image/jpeg'
      : mimeType;

    const { error: uploadError } = await this.db.storage
      .from('estudios')
      .upload(filePath, fileBuffer, {
        contentType: resolvedContentType,
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Error al subir el archivo al storage: ${uploadError.message}`);
    }

    // El bucket "estudios" es privado, así que se genera una URL firmada de larga duración
    const { data: signedData, error: signedError } = await this.db.storage
      .from('estudios')
      .createSignedUrl(filePath, ESTUDIOS_SIGNED_URL_EXPIRATION);

    if (signedError) {
      throw new Error(`Error al generar la URL del archivo: ${signedError.message}`);
    }

    return signedData.signedUrl;
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
      .select('id, titulo, tipo_estudio:tipos_estudio!left(*), fecha, institucion, fotos')
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
        titulo,
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
      titulo: estudioData.titulo || null,
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

  // `limit` es opcional: sin él devuelve todas las recetas del paciente
  async getRecetas(pacienteId, limit = null) {
    const resolvedPacienteId = await this.resolvePacienteId(pacienteId);

    if (!resolvedPacienteId) {
      return [];
    }

    // El join debe ser !inner: sin él, el filtro por paciente no descarta filas
    // y se devuelven las recetas de todos los pacientes
    let recetasQuery = this.db
      .from('recetas')
      .select(`
        id,
        consulta_id,
        titulo,
        pathFile,
        created_at,
        consulta:consulta_id!inner (
          paciente_id
        )
      `)
      .eq('consulta.paciente_id', resolvedPacienteId)
      .order('created_at', { ascending: false });

    if (limit) {
      recetasQuery = recetasQuery.limit(limit);
    }

    const { data: recetas, error: recetasError } = await recetasQuery;

    if (recetasError) {
      throw new Error(`Error al obtener recetas del paciente: ${recetasError.message}`);
    }

    const recetasConUrl = await Promise.all((recetas || []).map(async (receta) => {
      let url = null;

      if (receta.pathFile) {
        const { data: signedData, error: signedError } = await this.db.storage
          .from('recetas')
          .createSignedUrl(receta.pathFile, 60 * 60);

        if (!signedError && signedData?.signedUrl) {
          url = signedData.signedUrl;
        }
      }

      return {
        id: receta.id,
        consulta_id: receta.consulta_id,
        titulo: receta.titulo || null,
        pathFile: receta.pathFile || null,
        created_at: receta.created_at || null,
        url
      };
    }));

    return recetasConUrl;
  }

  // Últimas consultas del paciente (más reciente primero) — usadas por la Home
  async getConsultasRecientes(pacienteId, limit) {
    const { data, error } = await this.db
      .from('consultas')
      .select(`
        id,
        fecha,
        tipo_consulta,
        diagnostico,
        solicitud_estudio,
        solicitud_citaprox,
        profesional_id,
        profesional:profesional_id (
          especialidad_medica,
          usuario:usuario_id (nombre, apellido)
        ),
        organizacion:organizacion_id (nombre)
      `)
      .eq('paciente_id', pacienteId)
      .order('fecha', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Error al obtener consultas del paciente: ${error.message}`);
    }

    return data || [];
  }

  // Últimos estudios del paciente (más reciente primero) — usados por la Home
  async getEstudiosRecientes(pacienteId, limit) {
    const { data, error } = await this.db
      .from('estudios')
      .select('id, titulo, tipo_estudio:tipos_estudio!left(*), fecha, institucion')
      .eq('paciente_id', pacienteId)
      .order('fecha', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Error al obtener estudios del paciente: ${error.message}`);
    }

    return (data || []).map(row => {
      if (row.tipo_estudio) {
        const label = row.tipo_estudio.nombre ?? row.tipo_estudio.tipo ?? row.tipo_estudio.label ?? null;
        return { ...row, tipo_estudio: label };
      }
      return row;
    });
  }

  // Cantidad total de consultas, estudios y recetas del paciente — usada por la Home
  async getTotalesPaciente(pacienteId) {
    const [consultas, estudios, recetas] = await Promise.all([
      this.db.from('consultas').select('id', { count: 'exact', head: true }).eq('paciente_id', pacienteId),
      this.db.from('estudios').select('id', { count: 'exact', head: true }).eq('paciente_id', pacienteId),
      this.db
        .from('recetas')
        .select('id, consulta:consulta_id!inner (paciente_id)', { count: 'exact', head: true })
        .eq('consulta.paciente_id', pacienteId)
    ]);

    const error = consultas.error || estudios.error || recetas.error;
    if (error) {
      throw new Error(`Error al obtener totales del paciente: ${error.message}`);
    }

    return {
      consultas: consultas.count ?? 0,
      estudios: estudios.count ?? 0,
      recetas: recetas.count ?? 0
    };
  }

  // Fecha de la última subida de un estudio del paciente (null si no tiene ninguno)
  async getUltimaSubidaEstudio(pacienteId) {
    const { data, error } = await this.db
      .from('estudios')
      .select('subido_at')
      .eq('paciente_id', pacienteId)
      .order('subido_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`Error al obtener estudios del paciente: ${error.message}`);
    }

    return data?.subido_at || null;
  }

  async getHistorialClinico(pacienteId) {
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

    if (pacienteError) {
      throw pacienteError;
    }

    const { data: historial, error: historialError } = await this.db
      .from('historial')
      .select('id, paciente_id, ant, ago, ahf, mx, eco, ef, otros, created_at')
      .eq('paciente_id', pacienteId)
      .maybeSingle();

    if (historialError) {
      throw historialError;
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

    if (consultasError) {
      throw consultasError;
    }

    const { data: estudios, error: estudiosError } = await this.db
      .from('estudios')
      .select('id, consulta_id, nombre_archivo, url_archivo, tipo_estudio:tipos_estudio!left(*), fecha, institucion, descripcion')
      .eq('paciente_id', pacienteId)
      .order('fecha', { ascending: false });

    if (estudiosError) {
      throw estudiosError;
    }

    const estudiosNormalizados = (estudios || []).map(row => {
      if (row.tipo_estudio) {
        const label = row.tipo_estudio.nombre ?? row.tipo_estudio.tipo ?? row.tipo_estudio.label ?? null;
        return { ...row, tipo_estudio: label };
      }
      return row;
    });

    const historialBase = {
      id: null,
      paciente_id: pacienteId,
      ant: '',
      ago: '',
      ahf: '',
      mx: '',
      eco: '',
      ef: '',
      otros: '',
      created_at: null
    };

    const historialNormalizado = historial
      ? {
          ...historialBase,
          ...historial,
          ant: historial.ant ?? '',
          ago: historial.ago ?? '',
          ahf: historial.ahf ?? '',
          mx: historial.mx ?? '',
          eco: historial.eco ?? '',
          ef: historial.ef ?? '',
          otros: historial.otros ?? ''
        }
      : historialBase;

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
      historial: historialNormalizado
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
