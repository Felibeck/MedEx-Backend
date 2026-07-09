// Servicio de Pacientes
// Contiene la lógica de negocio para pacientes

import { validatePatientData, validatePatientUpdate } from '../helpers/validations-helper.js';

export class PatientService {
  constructor(patientRepository) {
    this.patientRepository = patientRepository;
  }

  // Obtener estudios / imágenes del paciente
  async getPatientEstudios(patientId) {
    const estudios = await this.patientRepository.getEstudios(patientId);
    return estudios;
  }

  // Obtener todos los pacientes
  async getAllPatients() {
    const patients = await this.patientRepository.findAll();
    return patients.map(p => p.getPublicData());
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

    // Crear paciente
    const patient = await this.patientRepository.create(patientData);
    return patient.getPublicData();
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
