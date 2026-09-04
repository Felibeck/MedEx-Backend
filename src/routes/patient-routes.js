  // Rutas de Pacientes
  // Define los endpoints relacionados con pacientes

  import express from 'express';
  import { requirePaciente } from '../middlewares/require-paciente.js';
  import { ensurePatientMatch } from '../middlewares/ensure-patient-match.js';

  export const createPatientRoutes = (patientController, upload) => {
    const router = express.Router();

    // Historial clínico del paciente autenticado (debe ir antes de '/:id')
    router.get('/me/historial', requirePaciente, (req, res) => patientController.getHistorialClinico(req, res));

    // Recetas del paciente autenticado
    router.get('/me/recetas', requirePaciente, (req, res) => patientController.getRecetas(req, res));

    // Obtener estudios del paciente (listado)
    router.get('/:id/estudios', requirePaciente, ensurePatientMatch, (req, res) => patientController.getEstudios(req, res));

    // Obtener detalle de un estudio específico
    router.get('/:id/estudios/:estudioId', requirePaciente, ensurePatientMatch, (req, res) => patientController.getEstudioById(req, res));
    router.post('/:id/estudios', requirePaciente, ensurePatientMatch, (req, res) => patientController.uploadEstudio(req, res));

    // Subir estudio con archivo real (imagen o PDF) al bucket "estudios"
    router.post('/:id/estudios/upload', requirePaciente, ensurePatientMatch, (req, res, next) => {
      upload.single('archivo')(req, res, (err) => {
        if (err) {
          const message = err.code === 'LIMIT_FILE_SIZE'
            ? 'El archivo excede el tamaño máximo permitido de 10MB'
            : err.message;
          return res.status(400).json({ success: false, message });
        }
        next();
      });
    }, (req, res) => patientController.uploadEstudioConArchivo(req, res));

    // Obtener todos los pacientes
    router.get('/', requirePaciente, (req, res) => patientController.getAll(req, res));





    // Registro de nuevo paciente
    router.post('/register', (req, res) => patientController.register(req, res));

    // Login paciente
    router.post('/login', (req, res) => patientController.loginPatient(req, res));

    // Obtener pacientes activos
    router.get('/active', requirePaciente, (req, res) => patientController.getActive(req, res));

    // Buscar pacientes por ciudad
    router.get('/search/city', requirePaciente, (req, res) => patientController.searchByCity(req, res));

    // Obtener perfil de paciente
    router.get('/:id', requirePaciente, ensurePatientMatch, (req, res) => patientController.getProfile(req, res));

    // Actualizar perfil de paciente
    router.put('/:id', requirePaciente, ensurePatientMatch, (req, res) => patientController.updateProfile(req, res));

    // Agregar historial médico
    router.post('/:id/medical-history', requirePaciente, ensurePatientMatch, (req, res) => patientController.addMedicalHistory(req, res));

    // Agregar alergia
    router.post('/:id/allergies', requirePaciente, ensurePatientMatch, (req, res) => patientController.addAllergy(req, res));

    // Verificar edad
    router.get('/:id/verify-age', requirePaciente, ensurePatientMatch, (req, res) => patientController.verifyAge(req, res));

    // Desactivar perfil
    router.delete('/:id', requirePaciente, ensurePatientMatch, (req, res) => patientController.deactivate(req, res));

    return router;
  };
