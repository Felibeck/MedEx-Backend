// Servicio de Doctores
// Contiene la lógica de negocio para doctores

import { validateDoctorData, validateDoctorUpdate } from '../helpers/validations-helper.js';

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

    if (!profesional_id) {
      throw new Error('Se requiere profesional_id del médico');
    }

    if (!organizacion_id) {
      throw new Error('Se requiere organizacion_id');
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
    const dniNormalizado = String(dni).trim();

    if (!dniNormalizado) {
      throw new Error('El DNI es requerido');
    }

    const paciente = await this.doctorRepository.getPacienteByDni(dniNormalizado);

    if (!paciente) {
      throw new Error('Paciente no encontrado');
    }

    return paciente;
  }

}





  
  // // Registrar nuevo doctor
  // async registerDoctor(doctorData) {
  //   // Validar datos
  //   const validation = validateDoctorData(doctorData);
  //   if (!validation.isValid) {
  //     throw new Error(`Errores de validación: ${validation.errors.join(', ')}`);
  //   }

  //   // Verificar si el email ya existe
  //   const existingDoctor = await this.doctorRepository.findByEmail(doctorData.email);
  //   if (existingDoctor) {
  //     throw new Error('El email ya está registrado');
  //   }

  //   // Verificar si el número de licencia ya existe
  //   const doctorWithLicense = await this.doctorRepository.findByLicenseNumber(doctorData.licenseNumber);
  //   if (doctorWithLicense) {
  //     throw new Error('El número de licencia ya está registrado');
  //   }

  //   // Crear doctor
  //   const doctor = await this.doctorRepository.create(doctorData);
  //   return doctor.getPublicData();
  // }

  // // Obtener perfil de doctor
  // async getDoctorProfile(doctorId) {
  //   const doctor = await this.doctorRepository.findById(doctorId);
  //   if (!doctor) {
  //     throw new Error('Doctor no encontrado');
  //   }
  //   return doctor.getPublicData();
  // }

  // // Actualizar perfil de doctor
  // async updateDoctorProfile(doctorId, updateData) {
  //   const validation = validateDoctorUpdate(updateData);
  //   if (!validation.isValid) {
  //     throw new Error(`Errores de validación: ${validation.errors.join(', ')}`);
  //   }

  //   // Verificar si el nuevo email ya existe (si se intenta cambiar)
  //   if (updateData.email) {
  //     const existingDoctor = await this.doctorRepository.findByEmail(updateData.email);
  //     if (existingDoctor && existingDoctor.id !== doctorId) {
  //       throw new Error('El email ya está registrado');
  //     }
  //   }

  //   const updatedDoctor = await this.doctorRepository.update(doctorId, updateData);
  //   if (!updatedDoctor) {
  //     throw new Error('Doctor no encontrado');
  //   }

  //   return updatedDoctor.getPublicData();
  // }

  // // Obtener todos los doctores
  // async getAllDoctors() {
  //   const doctors = await this.doctorRepository.findAll();
  //   return doctors.map(d => d.getPublicData());
  // }

  // // Obtener doctores disponibles (verificados y activos)
  // async getAvailableDoctors() {
  //   const doctors = await this.doctorRepository.findAvailable();
  //   return doctors.map(d => d.getPublicData());
  // }

  // // Buscar doctores por especialidad
  // async searchDoctorsBySpecialty(specialty) {
  //   const doctors = await this.doctorRepository.findBySpecialty(specialty);
  //   return doctors.map(d => d.getPublicData());
  // }

  // // Buscar doctores por ciudad
  // async searchDoctorsByCity(city) {
  //   const doctors = await this.doctorRepository.findByCity(city);
  //   return doctors.map(d => d.getPublicData());
  // }

  // // Buscar doctores por especialidad y ciudad
  // async searchDoctorsBySpecialtyAndCity(specialty, city) {
  //   const doctors = await this.doctorRepository.findBySpecialtyAndCity(specialty, city);
  //   return doctors.map(d => d.getPublicData());
  // }

  // // Agregar disponibilidad
  // async addAvailableSlot(doctorId, slotData) {
  //   if (!slotData.date || !slotData.startTime || !slotData.endTime) {
  //     throw new Error('Fecha, hora de inicio y fin son requeridas');
  //   }

  //   const updatedDoctor = await this.doctorRepository.addAvailableSlot(doctorId, slotData);
  //   if (!updatedDoctor) {
  //     throw new Error('Doctor no encontrado');
  //   }

  //   return updatedDoctor.getPublicData();
  // }

  // // Agregar calificación/certificación
  // async addQualification(doctorId, qualificationData) {
  //   if (!qualificationData.name) {
  //     throw new Error('El nombre de la calificación es requerido');
  //   }

  //   const updatedDoctor = await this.doctorRepository.addQualification(doctorId, qualificationData);
  //   if (!updatedDoctor) {
  //     throw new Error('Doctor no encontrado');
  //   }

  //   return updatedDoctor.getPublicData();
  // }

  // // Verificar doctor (aprobación de admin)
  // async verifyDoctor(doctorId) {
  //   const updatedDoctor = await this.doctorRepository.verify(doctorId);
  //   if (!updatedDoctor) {
  //     throw new Error('Doctor no encontrado');
  //   }

  //   return {
  //     message: 'Doctor verificado correctamente',
  //     doctor: updatedDoctor.getPublicData()
  //   };
  // }

  // // Desactivar perfil de doctor
  // async deactivateDoctor(doctorId) {
  //   const updatedDoctor = await this.doctorRepository.delete(doctorId);
  //   if (!updatedDoctor) {
  //     throw new Error('Doctor no encontrado');
  //   }

  //   return { message: 'Doctor desactivado correctamente' };
  // }

  // // Obtener información de disponibilidad
  // async getDoctorAvailability(doctorId) {
  //   const doctor = await this.doctorRepository.findById(doctorId);
  //   if (!doctor) {
  //     throw new Error('Doctor no encontrado');
  //   }

  //   return {
  //     doctorId: doctor.id,
  //     doctorName: doctor.getFullName(),
  //     availableSlots: doctor.availableSlots
  //   };
  // }

 

