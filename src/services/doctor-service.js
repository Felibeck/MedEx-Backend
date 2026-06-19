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
      ant = null,
      ago = null,
      ahf = null,
      mx = null,
      eco = null,
      ef = null,
      otros = null
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
      ant,
      ago,
      ahf,
      mx,
      eco,
      ef,
      otros
    };

    return await this.doctorRepository.crearConsulta(insertPayload);
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

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(doctorData.password, 10);

    const createPayload = {
      email: doctorData.email,
      password_hash: passwordHash,
      nombre: doctorData.firstName || doctorData.nombre,
      apellido: doctorData.lastName || doctorData.apellido,
      matricula: doctorData.licenseNumber || doctorData.matricula,
      especialidad_medica: doctorData.specialty || doctorData.especialidad || null,
      organizacion_id: doctorData.organizacion_id || null
    };

    const doctor = await this.doctorRepository.create(createPayload);
    return doctor.getPublicData();
  }

  // (otros métodos comentados siguen)
}
