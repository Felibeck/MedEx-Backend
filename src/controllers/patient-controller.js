// Controlador de Pacientes
// Maneja las solicitudes HTTP relacionadas con pacientes

export class PatientController {
  constructor(patientService) {
    this.patientService = patientService;
  }

 // Obtener estudios del paciente (listado)
async getEstudios(req, res) {
  try {
    const patientId = req.params.id;
    const estudios = await this.patientService.getPatientEstudios(patientId);
    res.status(200).json({ success: true, data: estudios });
  } catch (error) {
    console.error('Error completo en controller:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

  // Obtener detalle de un estudio específico del paciente
  async getEstudioById(req, res) {
    try {
      const { id: patientId, estudioId } = req.params;
      const estudio = await this.patientService.getPatientEstudioById(estudioId, patientId);
      res.status(200).json({ success: true, data: estudio });
    } catch (error) {
      const status = error.message === 'Estudio no encontrado' ? 404 : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  async uploadEstudio(req, res) {
    try {
      const patientId = req.params.id;
      const estudioData = req.body;
      const createdEstudio = await this.patientService.uploadPatientEstudio(patientId, estudioData);

      res.status(201).json({
        success: true,
        message: 'Estudio cargado correctamente',
        data: createdEstudio
      });
    } catch (error) {
      const status = error.message && error.message.startsWith('Errores de validación') ? 400 : error.message === 'Paciente no encontrado' ? 404 : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  async uploadEstudioConArchivo(req, res) {
    try {
      const patientId = req.params.id;
      const { titulo, tipo_estudio_id, fecha, institucion, notas } = req.body;

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'El archivo es requerido' });
      }

      const createdEstudio = await this.patientService.uploadPatientEstudioConArchivo(patientId, {
        archivo: req.file,
        titulo,
        tipo_estudio_id,
        fecha,
        institucion,
        notas
      });

      res.status(201).json({
        success: true,
        message: 'Estudio cargado correctamente',
        data: createdEstudio
      });
    } catch (error) {
      const status = error.message && error.message.startsWith('Errores de validación') ? 400
        : error.message === 'El archivo es requerido' ? 400
        : error.message === 'El archivo debe ser una imagen o un PDF' ? 400
        : error.message === 'El archivo excede el tamaño máximo permitido de 10MB' ? 400
        : error.message === 'Paciente no encontrado' ? 404
        : 500;

      if (status === 500) {
        console.error('uploadEstudioConArchivo error:', error);
      }

      res.status(status).json({ success: false, message: error.message });
    }
  }

  // Obtener todos los pacientes
  async getAll(req, res) {
    try {
      const patients = await this.patientService.getAllPatients();

      res.status(200).json({
        success: true,
        data: patients
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }


  async loginPatient(req, res) {
    try {
      const { email, password } = req.body || {};

      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email y contraseña son requeridos' });
      }

      const result = await this.patientService.loginPatient(email, password);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      const status = error.message && error.message.toLowerCase().includes('credenciales') ? 401 : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }






















  async getHistorialClinico(req, res) {
    try {
      const perfilPaciente = req.perfil_paciente;

      if (!perfilPaciente?.id) {
        return res.status(404).json({
          success: false,
          message: 'Perfil de paciente no encontrado para este usuario'
        });
      }

      const historial = await this.patientService.getHistorialClinico(perfilPaciente.id);

      res.status(200).json({
        success: true,
        data: historial
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getRecetas(req, res) {
    try {
      const perfilPaciente = req.perfil_paciente;

      if (!perfilPaciente?.id) {
        return res.status(404).json({
          success: false,
          message: 'Perfil de paciente no encontrado para este usuario'
        });
      }

      const recetas = await this.patientService.getRecetas(perfilPaciente.id);

      res.status(200).json({
        success: true,
        data: recetas
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Registrar nuevo paciente
  async register(req, res) {
    try {
      const patientData = req.body;
      const newPatient = await this.patientService.registerPatient(patientData);

      res.status(201).json({
        success: true,
        message: 'Paciente registrado exitosamente',
        data: newPatient
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtener perfil de paciente
  async getProfile(req, res) {
    try {
      const patientId = req.params.id;
      const patient = await this.patientService.getPatientProfile(patientId);

      res.status(200).json({
        success: true,
        data: patient
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Actualizar perfil de paciente
  async updateProfile(req, res) {
    try {
      const patientId = req.params.id;
      const updateData = req.body;
      const updatedPatient = await this.patientService.updatePatientProfile(patientId, updateData);

      res.status(200).json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: updatedPatient
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }



  // Obtener pacientes activos
  async getActive(req, res) {
    try {
      const patients = await this.patientService.getActivePatients();

      res.status(200).json({
        success: true,
        data: patients
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Buscar pacientes por ciudad
  async searchByCity(req, res) {
    try {
      const city = req.query.city;

      if (!city) {
        return res.status(400).json({
          success: false,
          message: 'La ciudad es requerida'
        });
      }

      const patients = await this.patientService.searchPatientsByCity(city);

      res.status(200).json({
        success: true,
        data: patients
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Agregar historial médico
  async addMedicalHistory(req, res) {
    try {
      const patientId = req.params.id;
      const historyData = req.body;
      const updatedPatient = await this.patientService.addMedicalHistory(patientId, historyData);

      res.status(200).json({
        success: true,
        message: 'Historial médico agregado',
        data: updatedPatient
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Agregar alergia
  async addAllergy(req, res) {
    try {
      const patientId = req.params.id;
      const allergyData = req.body;
      const updatedPatient = await this.patientService.addAllergy(patientId, allergyData);

      res.status(200).json({
        success: true,
        message: 'Alergia agregada',
        data: updatedPatient
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Desactivar perfil de paciente
  async deactivate(req, res) {
    try {
      const patientId = req.params.id;
      const result = await this.patientService.deactivatePatient(patientId);

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


  // Verificar edad del paciente
  async verifyAge(req, res) {
    try {
      const patientId = req.params.id;
      const ageInfo = await this.patientService.verifyPatientAge(patientId);

      res.status(200).json({
        success: true,
        data: ageInfo
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }
}
