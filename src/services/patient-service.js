// Servicio de Pacientes
// Contiene la lógica de negocio para pacientes

import { validatePatientData, validatePatientUpdate, validateEstudioData } from '../helpers/validations-helper.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class PatientService {
  constructor(patientRepository) {
    this.patientRepository = patientRepository;
  }

  // Obtener estudios del paciente (listado)
  async getPatientEstudios(patientId) {
    const estudios = await this.patientRepository.getEstudios(patientId);
    return estudios;
  }

  // Obtener detalle de un estudio específico del paciente
  async getPatientEstudioById(estudioId, patientId) {
    const estudio = await this.patientRepository.getEstudioById(estudioId, patientId);
    if (!estudio) {
      throw new Error('Estudio no encontrado');
    }  
    return estudio;
  }

  async uploadPatientEstudio(patientId, estudioData) {
    const validation = validateEstudioData(estudioData);
    if (!validation.isValid) {
      throw new Error(`Errores de validación: ${validation.errors.join(', ')}`);
    }

    const createdEstudio = await this.patientRepository.createEstudio(patientId, estudioData);
    return createdEstudio;
  }

  // Subir estudio con archivo real (imagen o PDF) al bucket "estudios"
  async uploadPatientEstudioConArchivo(patientId, { archivo, titulo, tipo_estudio_id, fecha, institucion, notas }) {
    if (!archivo) {
      throw new Error('El archivo es requerido');
    }

    const allowedMimeTypes = /^image\/|^application\/pdf$/;
    if (!allowedMimeTypes.test(archivo.mimetype)) {
      throw new Error('El archivo debe ser una imagen o un PDF');
    }

    const maxSizeBytes = 10 * 1024 * 1024;
    if (archivo.size > maxSizeBytes) {
      throw new Error('El archivo excede el tamaño máximo permitido de 10MB');
    }

    const urlArchivo = await this.patientRepository.uploadArchivoEstudio(
      patientId,
      archivo.buffer,
      archivo.originalname,
      archivo.mimetype
    );

    const estudioData = {
      titulo,
      tipo_estudio_id,
      fecha,
      institucion,
      nombre_archivo: archivo.originalname,
      url_archivo: urlArchivo,
      descripcion: notas || null
    };

    const validation = validateEstudioData(estudioData);
    if (!validation.isValid) {
      throw new Error(`Errores de validación: ${validation.errors.join(', ')}`);
    }

    const createdEstudio = await this.patientRepository.createEstudio(patientId, estudioData);
    return createdEstudio;
  }

  // Obtener todos los pacientes
  async getAllPatients() {
    const patients = await this.patientRepository.findAll();
    return patients.map(p => ({
      id: p.id,
      email: p.email,
      nombre: p.nombre,
      apellido: p.apellido,
      es_medico: p.es_medico,
      created_at: p.created_at
    }));
  }


  async loginPatient(email, password, esMedico){
    if (!email || !password) {
      throw new Error('Email y contraseña son requeridos');
    }

    const user = await this.patientRepository.loginPatient(email);
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


  // Registrar nuevo paciente
  async registerPatient(patientData) {
    // Validar datos
    const validation = validatePatientData(patientData);
    if (!validation.isValid) {
      throw new Error(`Errores de validación: ${validation.errors.join(', ')}`);
    }

    // Verificar si el email ya existe
    const existingPatient = await this.patientRepository.findByEmail(patientData.email);
    if (existingPatient) {
      throw new Error('El email ya está registrado');
    }

    // Hashear contraseña antes de crear
    const passwordHash = await bcrypt.hash(patientData.password, 10);

    const createPayload = {
      email: patientData.email,
      password_hash: passwordHash,
      nombre: patientData.firstName || patientData.nombre,
      apellido: patientData.lastName || patientData.apellido,
      dni: patientData.dni || null,
      dateOfBirth: patientData.dateOfBirth || patientData.fecha_nacimiento || null,
      phoneNumber: patientData.phoneNumber || patientData.telefono || null,
      gender: patientData.gender || patientData.identidad_genero || null
    };

    // Crear paciente
    const patient = await this.patientRepository.create(createPayload);
    return patient.getPublicData();
  }

  async getHistorialClinico(pacienteId) {
    if (!pacienteId) {
      throw new Error('El ID del paciente es requerido');
    }

    return await this.patientRepository.getHistorialClinico(pacienteId);
  }

  async getRecetas(pacienteId) {
    if (!pacienteId) {
      throw new Error('El ID del paciente es requerido');
    }

    return await this.patientRepository.getRecetas(pacienteId);
  }

  // Obtener perfil de paciente
  async getPatientProfile(patientId) {
    const patient = await this.patientRepository.findById(patientId);
    if (!patient) {
      throw new Error('Paciente no encontrado');
    }
    return patient.getPublicData();
  }

  // Actualizar perfil de paciente
  async updatePatientProfile(patientId, updateData) {
    const validation = validatePatientUpdate(updateData);
    if (!validation.isValid) {
      throw new Error(`Errores de validación: ${validation.errors.join(', ')}`);
    }

    // Verificar si el nuevo email ya existe (si se intenta cambiar)
    if (updateData.email) {
      const existingPatient = await this.patientRepository.findByEmail(updateData.email);
      if (existingPatient && existingPatient.id !== patientId) {
        throw new Error('El email ya está registrado');
      }
    }

    const updatedPatient = await this.patientRepository.update(patientId, updateData);
    if (!updatedPatient) {
      throw new Error('Paciente no encontrado');
    }

    return updatedPatient.getPublicData();
  }



  // Obtener pacientes activos
  async getActivePatients() {
    const patients = await this.patientRepository.findActive();
    return patients.map(p => p.getPublicData());
  }

  // Buscar pacientes por ciudad
  async searchPatientsByCity(city) {
    const patients = await this.patientRepository.findByCity(city);
    return patients.map(p => p.getPublicData());
  }

  // Agregar historial médico
  async addMedicalHistory(patientId, historyData) {
    if (!historyData.description) {
      throw new Error('La descripción del historial es requerida');
    }

    const updatedPatient = await this.patientRepository.addMedicalHistory(patientId, historyData);
    if (!updatedPatient) {
      throw new Error('Paciente no encontrado');
    }

    return updatedPatient.getPublicData();
  }

  // Agregar alergia
  async addAllergy(patientId, allergyData) {
    if (!allergyData.name) {
      throw new Error('El nombre de la alergia es requerido');
    }

    const updatedPatient = await this.patientRepository.addAllergy(patientId, allergyData);
    if (!updatedPatient) {
      throw new Error('Paciente no encontrado');
    }

    return updatedPatient.getPublicData();
  }

  // Desactivar perfil de paciente
  async deactivatePatient(patientId) {
    const updatedPatient = await this.patientRepository.delete(patientId);
    if (!updatedPatient) {
      throw new Error('Paciente no encontrado');
    }

    return { message: 'Paciente desactivado correctamente' };
  }

  // Verificar edad del paciente
  async verifyPatientAge(patientId) {
    const patient = await this.patientRepository.findById(patientId);
    if (!patient) {
      throw new Error('Paciente no encontrado');
    }

    const isAdult = patient.isAdult();
    return {
      isAdult,
      age: new Date().getFullYear() - patient.dateOfBirth.getFullYear()
    };
  }
}
