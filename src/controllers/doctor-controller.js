// Controlador de Doctores
// Maneja las solicitudes HTTP relacionadas con doctores

export class DoctorController {
  constructor(doctorService) {
    this.doctorService = doctorService;
  }

// Buscar paciente por DNI
  async buscarPacientePorDni(req, res) {
    try {
      const dni = req.query.dni;

      if (!dni) {
        return res.status(400).json({
          success: false,
          message: 'El DNI es requerido'
        });
      }

      const paciente = await this.doctorService.buscarPacientePorDni(dni);

      res.status(200).json({
        success: true,
        data: paciente
      });
    } catch (error) {
      const status = error.message === 'Paciente no encontrado' ? 404 : 500;

      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  }

  // Crear nueva consulta desde profesional sobre un paciente buscado por DNI
  async crearConsulta(req, res) {
    try {
      let body = req.body || {};

      // Si el cliente envía los datos por query params en lugar de body (p.ej.
      // POST /consultas?dni=...), aceptar también esa forma para compatibilidad
      // con la UI que usa query params.
      if (!Object.keys(body).length && Object.keys(req.query || {}).length) {
        body = { ...req.query };
      }


      const created = await this.doctorService.createConsulta(body);

      res.status(201).json({
        success: true,
        data: created
      });
    } catch (error) {
      const clientErrors = new Set([
        'Se requiere dni del paciente',
        'El DNI es requerido',
        'Fecha inválida',
        'La fecha no puede ser futura'
      ]);

      const status = error.message === 'Paciente no encontrado'
        ? 404
        : clientErrors.has(error.message)
          ? 400
          : 500;

      if (status === 500) {
        console.error('crearConsulta error:', error);
      }

      res.status(status).json({
        success: false,
        message: status === 500 ? 'Error interno al crear consulta' : error.message,
        ...(status === 500 && {
          error: error?.message || String(error),
          details: error?.details || undefined
        })
      });
    }
  }

}

  // // Registrar nuevo doctor
  // async register(req, res) {
  //   try {
  //     const doctorData = req.body;
  //     const newDoctor = await this.doctorService.registerDoctor(doctorData);

  //     res.status(201).json({
  //       success: true,
  //       message: 'Doctor registrado exitosamente',
  //       data: newDoctor
  //     });
  //   } catch (error) {
  //     res.status(400).json({
  //       success: false,
  //       message: error.message
  //     });
  //   }
  // }

  // // Obtener perfil de doctor
  // async getProfile(req, res) {
  //   try {
  //     const doctorId = req.params.id;
  //     const doctor = await this.doctorService.getDoctorProfile(doctorId);

  //     res.status(200).json({
  //       success: true,
  //       data: doctor
  //     });
  //   } catch (error) {
  //     res.status(404).json({
  //       success: false,
  //       message: error.message
  //     });
  //   }
  // }

  // // Actualizar perfil de doctor
  // async updateProfile(req, res) {
  //   try {
  //     const doctorId = req.params.id;
  //     const updateData = req.body;
  //     const updatedDoctor = await this.doctorService.updateDoctorProfile(doctorId, updateData);

  //     res.status(200).json({
  //       success: true,
  //       message: 'Perfil actualizado exitosamente',
  //       data: updatedDoctor
  //     });
  //   } catch (error) {
  //     res.status(400).json({
  //       success: false,
  //       message: error.message
  //     });
  //   }
  // }

  // // Obtener todos los doctores
  // async getAll(req, res) {
  //   try {
  //     const doctors = await this.doctorService.getAllDoctors();

  //     res.status(200).json({
  //       success: true,
  //       data: doctors
  //     });
  //   } catch (error) {
  //     res.status(500).json({
  //       success: false,
  //       message: error.message
  //     });
  //   }
  // }

  // // Obtener doctores disponibles
  // async getAvailable(req, res) {
  //   try {
  //     const doctors = await this.doctorService.getAvailableDoctors();

  //     res.status(200).json({
  //       success: true,
  //       data: doctors
  //     });
  //   } catch (error) {
  //     res.status(500).json({
  //       success: false,
  //       message: error.message
  //     });
  //   }
  // }

  // // Buscar doctores por especialidad
  // async searchBySpecialty(req, res) {
  //   try {
  //     const specialty = req.query.specialty;

  //     if (!specialty) {
  //       return res.status(400).json({
  //         success: false,
  //         message: 'La especialidad es requerida'
  //       });
  //     }

  //     const doctors = await this.doctorService.searchDoctorsBySpecialty(specialty);

  //     res.status(200).json({
  //       success: true,
  //       data: doctors
  //     });
  //   } catch (error) {
  //     res.status(500).json({
  //       success: false,
  //       message: error.message
  //     });
  //   }
  // }

  // // Buscar doctores por ciudad
  // async searchByCity(req, res) {
  //   try {
  //     const city = req.query.city;

  //     if (!city) {
  //       return res.status(400).json({
  //         success: false,
  //         message: 'La ciudad es requerida'
  //       });
  //     }

  //     const doctors = await this.doctorService.searchDoctorsByCity(city);

  //     res.status(200).json({
  //       success: true,
  //       data: doctors
  //     });
  //   } catch (error) {
  //     res.status(500).json({
  //       success: false,
  //       message: error.message
  //     });
  //   }
  // }

  // // Buscar doctores por especialidad y ciudad
  // async searchBySpecialtyAndCity(req, res) {
  //   try {
  //     const { specialty, city } = req.query;

  //     if (!specialty || !city) {
  //       return res.status(400).json({
  //         success: false,
  //         message: 'La especialidad y la ciudad son requeridas'
  //       });
  //     }

  //     const doctors = await this.doctorService.searchDoctorsBySpecialtyAndCity(specialty, city);

  //     res.status(200).json({
  //       success: true,
  //       data: doctors
  //     });
  //   } catch (error) {
  //     res.status(500).json({
  //       success: false,
  //       message: error.message
  //     });
  //   }
  // }

  // // Agregar disponibilidad
  // async addAvailableSlot(req, res) {
  //   try {
  //     const doctorId = req.params.id;
  //     const slotData = req.body;
  //     const updatedDoctor = await this.doctorService.addAvailableSlot(doctorId, slotData);

  //     res.status(200).json({
  //       success: true,
  //       message: 'Disponibilidad agregada',
  //       data: updatedDoctor
  //     });
  //   } catch (error) {
  //     res.status(400).json({
  //       success: false,
  //       message: error.message
  //     });
  //   }
  // }

  // // Agregar calificación
  // async addQualification(req, res) {
  //   try {
  //     const doctorId = req.params.id;
  //     const qualificationData = req.body;
  //     const updatedDoctor = await this.doctorService.addQualification(doctorId, qualificationData);

  //     res.status(200).json({
  //       success: true,
  //       message: 'Calificación agregada',
  //       data: updatedDoctor
  //     });
  //   } catch (error) {
  //     res.status(400).json({
  //       success: false,
  //       message: error.message
  //     });
  //   }
  // }

  // // Verificar doctor
  // async verify(req, res) {
  //   try {
  //     const doctorId = req.params.id;
  //     const result = await this.doctorService.verifyDoctor(doctorId);

  //     res.status(200).json({
  //       success: true,
  //       message: result.message,
  //       data: result.doctor
  //     });
  //   } catch (error) {
  //     res.status(404).json({
  //       success: false,
  //       message: error.message
  //     });
  //   }
  // }

  // // Desactivar perfil de doctor
  // async deactivate(req, res) {
  //   try {
  //     const doctorId = req.params.id;
  //     const result = await this.doctorService.deactivateDoctor(doctorId);

  //     res.status(200).json({
  //       success: true,
  //       message: result.message
  //     });
  //   } catch (error) {
  //     res.status(404).json({
  //       success: false,
  //       message: error.message
  //     });
  //   }
  // }

  // // Obtener disponibilidad de doctor
  // async getAvailability(req, res) {
  //   try {
  //     const doctorId = req.params.id;
  //     const availability = await this.doctorService.getDoctorAvailability(doctorId);

  //     res.status(200).json({
  //       success: true,
  //       data: availability
  //     });
  //   } catch (error) {
  //     res.status(404).json({
  //       success: false,
  //       message: error.message
  //     });
  //   }
  // }

