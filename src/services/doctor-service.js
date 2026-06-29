// Servicio de Doctores
// Contiene la lógica de negocio para doctores

import { validateDoctorData, validateDoctorUpdate } from '../helpers/validations-helper.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class DoctorService {
  constructor(doctorRepository) {
    this.doctorRepository = doctorRepository;
  }

  async createConsulta(consultaData) {
    const {
      dni,
      profesional_id,
      organizacion_id,
      fecha,
      solicitud_estudio = false,
      solicitud_receta = false,
      solicitud_citaprox = false,
      notas = null,

    } = consultaData || {};

    if (!dni) {
      throw new Error('Se requiere dni del paciente');
    }

    const paciente = await this.buscarPacientePorDni(dni);

    const now = new Date();
    const fechaObj = fecha ? new Date(fecha) : now;

    if (isNaN(fechaObj.getTime())) {
      throw new Error('Fecha inválida');
    }

    if (fechaObj > now) {
      throw new Error('La fecha no puede ser futura');
    }

    const insertPayload = {
      profesional_id,
      organizacion_id,
      paciente_id: paciente.paciente_id,
      fecha: fechaObj.toISOString(),
      solicitud_estudio,
      solicitud_receta,
      solicitud_citaprox
    };

    // Normalizar `notas`: cada consulta ahora tiene un único campo `notas` de tipo string.
    let nota = null;
    if (notas) {
      if (typeof notas === 'string') {
        nota = notas.trim();
      } else if (Array.isArray(notas) && notas.length) {
        const first = notas.find(n => {
          if (typeof n === 'string') return n.trim().length > 0;
          return n && typeof n === 'object' && String(n.nota || '').trim().length > 0;
        });
        if (typeof first === 'string') {
          nota = first.trim();
        } else if (first && typeof first === 'object' && first.nota) {
          nota = String(first.nota).trim();
        }
      } else if (typeof notas === 'object' && notas.nota) {
        nota = String(notas.nota).trim();
      }

      if (nota && nota.length === 0) {
        nota = null;
      }
    }

    const payload = { ...insertPayload };
    if (nota !== null) payload.notas = nota;

    return await this.doctorRepository.crearConsulta(payload);
  }

  async getNotasByConsultaId(consultaId) {
    if (!consultaId) {
      throw new Error('El ID de la consulta es requerido');
    }

    return await this.doctorRepository.getNotasByConsultaId(consultaId);
  }

  async getNotasByProfesionalId(profesionalId) {
    if (!profesionalId) {
      throw new Error('El ID del profesional es requerido');
    }

    return await this.doctorRepository.getNotasByProfesionalId(profesionalId);
  }

  async buscarPacientePorDni(dni) {
    const raw = String(dni || '').trim();
    const dniNormalizado = raw.replace(/\D/g, ''); // conservar solo dígitos

    if (!dniNormalizado) {
      throw new Error('El DNI es requerido');
    }

    let paciente = await this.doctorRepository.getPacienteByDni(dniNormalizado);

    if (!paciente && raw !== dniNormalizado) {
      paciente = await this.doctorRepository.getPacienteByDni(raw);
    }

    if (!paciente) {
      throw new Error('Paciente no encontrado');
    }

    return paciente;
  }

  async loginDoctor(email, password) {
    if (!email || !password) {
      throw new Error('Email y contraseña son requeridos');
    }

    const user = await this.doctorRepository.loginDoctor(email);
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    const match = await bcrypt.compare(password, user.password_hash || '');
    if (!match) {
      throw new Error('Credenciales inválidas');
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET no configurado en el entorno');
    }

    const token = jwt.sign({ id: user.id, es_medico: user.es_medico }, jwtSecret, { expiresIn: process.env.JWT_EXPIRATION || '1h' });

    const publicUser = {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      es_medico: user.es_medico
    };

    return { user: publicUser, token };
  }

  // Registrar nuevo doctor
  async registerDoctor(doctorData) {
    // Validar datos
    const validation = validateDoctorData(doctorData);
    if (!validation.isValid) {
      throw new Error(`Errores de validación: ${validation.errors.join(', ')}`);
    }

    // Verificar si el email ya existe
    const existingDoctor = await this.doctorRepository.findByEmail(doctorData.email);
    if (existingDoctor) {
      throw new Error('El email ya está registrado');
    }

    // Verificar si la matrícula ya existe
    const matricula = doctorData.licenseNumber || doctorData.matricula;
    if (matricula) {
      const existingByMatricula = await this.doctorRepository.findByLicenseNumber(matricula);
      if (existingByMatricula) {
        throw new Error('La matrícula ya está registrada');
      }
    }

    // Verificar existencia de la organización referenciada para evitar violación FK
    const organizacionId = doctorData.organizacion_id;
    if (organizacionId) {
      const exists = await this.doctorRepository.organizationExists(organizacionId);
      if (!exists) {
        throw new Error('Organización no encontrada (organizacion_id inválido)');
      }
    }

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(doctorData.password, 10);

    const createPayload = {
      email: doctorData.email,
      password_hash: passwordHash,
      nombre: doctorData.firstName || doctorData.nombre,
      apellido: doctorData.lastName || doctorData.apellido,
      matricula: doctorData.licenseNumber || doctorData.matricula,
      especialidad_medica: doctorData.specialty || doctorData.especialidad || null,
      organizacion_id: doctorData.organizacion_id
    };

    const doctor = await this.doctorRepository.create(createPayload);
    return doctor.getPublicData();
  }

  // (otros métodos comentados siguen)
}
