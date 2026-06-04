// Controlador de Doctores
// Maneja las solicitudes HTTP relacionadas con doctores

export class DoctorController {
  constructor(doctorService) {
    this.doctorService = doctorService;
  }


  async buscarPacientePorDni(req, res) {
    try {
      const dni = req.query.dni;
      if (!dni) return res.status(400).json({ success: false, message: 'Falta parámetro dni' });

      // Usar servicio/repo si está disponible, pero consultar directamente a DB aquí
      const supabase = (await import('../configs/database.js')).default;

      const { data, error } = await supabase
        .from('perfil_paciente')
        .select('id, dni, edad, identidad_genero, telefono, usuario (nombre, apellido, email)')
        .eq('dni', dni)
        .maybeSingle();

      if (error) throw error;
      if (!data) return res.status(404).json({ success: false, message: 'Paciente no encontrado' });

      return res.status(200).json({ success: true, data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Error interno' });
    }
  }

  // Crear nueva consulta desde profesional sobre un paciente buscado por DNI
  async crearConsulta(req, res) {
    try {
      const body = req.body || {};
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
      } = body;

      if (!Object.keys(body).length) {
        return res.status(400).json({
          success: false,
          message: 'El body de la petición es requerido y debe ser JSON con los campos necesarios'
        });
      }

      if (!dni) return res.status(400).json({ success: false, message: 'Se requiere dni del paciente' });
      if (!profesional_id) return res.status(400).json({ success: false, message: 'Se requiere profesional_id del médico' });
      if (!organizacion_id) return res.status(400).json({ success: false, message: 'Se requiere organizacion_id' });

      const supabase = (await import('../configs/database.js')).default;

      const { data: paciente, error: pacienteError } = await supabase
        .from('perfil_paciente')
        .select('id')
        .eq('dni', dni)
        .maybeSingle();

      if (pacienteError) throw pacienteError;
      if (!paciente) return res.status(404).json({ success: false, message: 'Paciente no encontrado' });

      const pacienteId = paciente.id;

      const now = new Date();
      const fechaObj = fecha ? new Date(fecha) : now;
      if (isNaN(fechaObj.getTime())) return res.status(400).json({ success: false, message: 'Fecha inválida' });
      if (fechaObj > now) return res.status(400).json({ success: false, message: 'La fecha no puede ser futura' });

      const insertPayload = {
        profesional_id,
        organizacion_id,
        paciente_id: pacienteId,
        fecha: fechaObj.toISOString(),
        ant,
        ago,
        ahf,
        mx,
        eco,
        ef,
        otros
      };

      const created = await this.doctorService.createConsulta(insertPayload);
      return res.status(201).json({ success: true, data: created });
    } catch (err) {
      console.error('crearConsulta error:', err);
      return res.status(500).json({
        success: false,
        message: 'Error interno al crear consulta',
        error: err?.message || String(err),
        details: err?.details || undefined
      });
    }
  }



  // Registrar nuevo doctor
  async register(req, res) {
    try {
      const doctorData = req.body;
      const newDoctor = await this.doctorService.registerDoctor(doctorData);

      res.status(201).json({
        success: true,
        message: 'Doctor registrado exitosamente',
        data: newDoctor
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtener perfil de doctor
  async getProfile(req, res) {
    try {
      const doctorId = req.params.id;
      const doctor = await this.doctorService.getDoctorProfile(doctorId);

      res.status(200).json({
        success: true,
        data: doctor
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Actualizar perfil de doctor
  async updateProfile(req, res) {
    try {
      const doctorId = req.params.id;
      const updateData = req.body;
      const updatedDoctor = await this.doctorService.updateDoctorProfile(doctorId, updateData);

      res.status(200).json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: updatedDoctor
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtener todos los doctores
  async getAll(req, res) {
    try {
      const doctors = await this.doctorService.getAllDoctors();

      res.status(200).json({
        success: true,
        data: doctors
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtener doctores disponibles
  async getAvailable(req, res) {
    try {
      const doctors = await this.doctorService.getAvailableDoctors();

      res.status(200).json({
        success: true,
        data: doctors
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Buscar doctores por especialidad
  async searchBySpecialty(req, res) {
    try {
      const specialty = req.query.specialty;

      if (!specialty) {
        return res.status(400).json({
          success: false,
          message: 'La especialidad es requerida'
        });
      }

      const doctors = await this.doctorService.searchDoctorsBySpecialty(specialty);

      res.status(200).json({
        success: true,
        data: doctors
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Buscar doctores por ciudad
  async searchByCity(req, res) {
    try {
      const city = req.query.city;

      if (!city) {
        return res.status(400).json({
          success: false,
          message: 'La ciudad es requerida'
        });
      }

      const doctors = await this.doctorService.searchDoctorsByCity(city);

      res.status(200).json({
        success: true,
        data: doctors
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Buscar doctores por especialidad y ciudad
  async searchBySpecialtyAndCity(req, res) {
    try {
      const { specialty, city } = req.query;

      if (!specialty || !city) {
        return res.status(400).json({
          success: false,
          message: 'La especialidad y la ciudad son requeridas'
        });
      }

      const doctors = await this.doctorService.searchDoctorsBySpecialtyAndCity(specialty, city);

      res.status(200).json({
        success: true,
        data: doctors
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Agregar disponibilidad
  async addAvailableSlot(req, res) {
    try {
      const doctorId = req.params.id;
      const slotData = req.body;
      const updatedDoctor = await this.doctorService.addAvailableSlot(doctorId, slotData);

      res.status(200).json({
        success: true,
        message: 'Disponibilidad agregada',
        data: updatedDoctor
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Agregar calificación
  async addQualification(req, res) {
    try {
      const doctorId = req.params.id;
      const qualificationData = req.body;
      const updatedDoctor = await this.doctorService.addQualification(doctorId, qualificationData);

      res.status(200).json({
        success: true,
        message: 'Calificación agregada',
        data: updatedDoctor
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Verificar doctor
  async verify(req, res) {
    try {
      const doctorId = req.params.id;
      const result = await this.doctorService.verifyDoctor(doctorId);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.doctor
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Desactivar perfil de doctor
  async deactivate(req, res) {
    try {
      const doctorId = req.params.id;
      const result = await this.doctorService.deactivateDoctor(doctorId);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtener disponibilidad de doctor
  async getAvailability(req, res) {
    try {
      const doctorId = req.params.id;
      const availability = await this.doctorService.getDoctorAvailability(doctorId);

      res.status(200).json({
        success: true,
        data: availability
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Buscar paciente por DNI (para uso por profesionales)
}
