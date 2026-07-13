// Rutas de Doctores
// Define los endpoints relacionados con doctores

import express from 'express';
import { requireMedico } from '../middlewares/require-medico.js';

export const createDoctorRoutes = (doctorController, upload) => {
  const router = express.Router();

  router.get('/pacientes/buscar', requireMedico, (req, res) => doctorController.buscarPacientePorDni(req, res));

  // Todos los pacientes del médico autenticado (al menos una consulta)
  router.get('/mis-pacientes', requireMedico, (req, res) => doctorController.getMisPacientes(req, res));

  // Historial clínico de un paciente (por pacienteId de perfiles_paciente)
  router.get('/pacientes/:pacienteId/historial', requireMedico, (req, res) => doctorController.getHistorialClinico(req, res));

  // Guardar/actualizar historial clínico de un paciente
  router.post('/pacientes/:pacienteId/historial', requireMedico, (req, res) => doctorController.guardarHistorial(req, res));

  // Registrar nueva consulta (acepta multipart/form-data para receta PDF opcional)
  router.post('/consultas', requireMedico, upload.single('receta_pdf'), (req, res) => doctorController.crearConsulta(req, res));

  // Obtener todas las notas del profesional
  router.get('/:profesionalId/notas', requireMedico, (req, res) => doctorController.getNotasByProfesionalId(req, res));

  // Obtener notas de una consulta específica
  router.get('/consultas/:consultaId/notas', requireMedico, (req, res) => doctorController.getNotasByConsultaId(req, res));

  // Editar nota y tipo de consulta de una consulta específica
  router.patch('/consultas/:consultaId', requireMedico, (req, res) => doctorController.updateConsulta(req, res));


  // Los siguientes endpoints están pendientes de implementación
  router.post('/register', (req, res) => doctorController.register(req, res));
  router.post('/login', (req, res) => doctorController.loginDoctor(req, res));
  // router.get('/', (req, res) => doctorController.getAll(req, res));
  // router.get('/available', (req, res) => doctorController.getAvailable(req, res));
  // router.get('/search/specialty', (req, res) => doctorController.searchBySpecialty(req, res));
  // router.get('/search/city', (req, res) => doctorController.searchByCity(req, res));
  // router.get('/search/specialty-city', (req, res) => doctorController.searchBySpecialtyAndCity(req, res));
  // router.get('/:id', (req, res) => doctorController.getProfile(req, res));
  // router.put('/:id', (req, res) => doctorController.updateProfile(req, res));
  // router.post('/:id/available-slots', (req, res) => doctorController.addAvailableSlot(req, res));
  // router.post('/:id/qualifications', (req, res) => doctorController.addQualification(req, res));
  // router.get('/:id/availability', (req, res) => doctorController.getAvailability(req, res));
  // router.patch('/:id/verify', (req, res) => doctorController.verify(req, res));
  // router.delete('/:id', (req, res) => doctorController.deactivate(req, res));

  return router;
};
