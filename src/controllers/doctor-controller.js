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

  // Obtener todas las notas del profesional
  async getNotasByProfesionalId(req, res) {
    try {
      const { profesionalId } = req.params;

      if (!profesionalId) {
        return res.status(400).json({
          success: false,
          message: 'El ID del profesional es requerido'
        });
      }

      const notas = await this.doctorService.getNotasByProfesionalId(profesionalId);

      res.status(200).json({
        success: true,
        data: notas
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async loginDoctor(req, res) {
    try {
      const { email, password } = req.body || {};

      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email y contraseña son requeridos' });
      }

      const result = await this.doctorService.loginDoctor(email, password);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      const status = error.message && error.message.toLowerCase().includes('credenciales') ? 401 : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  // Registrar nuevo doctor
  async register(req, res) {
    try {
      const doctorData = req.body || {};
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

  // Método en español para registrar doctor (alias de register)
  async register(req, res) {
    try {
      const doctorData = req.body || {};
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

  // Otros métodos (comentados) permanecen sin cambios
}
