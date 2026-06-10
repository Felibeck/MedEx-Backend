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
