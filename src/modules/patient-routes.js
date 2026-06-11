// Rutas de Pacientes
// Define los endpoints relacionados con pacientes

import express from 'express';

export const createPatientRoutes = (patientController) => {
  const router = express.Router();

  // Obtener estudios del paciente (listado)
  router.get('/:id/estudios', (req, res) => patientController.getEstudios(req, res));

  // Obtener detalle de un estudio específico
  router.get('/:id/estudios/:estudioId', (req, res) => patientController.getEstudioById(req, res));

  // Obtener todos los pacientes
  router.get('/', (req, res) => patientController.getAll(req, res));





  // Registro de nuevo paciente
  router.post('/register', (req, res) => patientController.register(req, res));

  // Obtener pacientes activos
  router.get('/active', (req, res) => patientController.getActive(req, res));

  // Buscar pacientes por ciudad
  router.get('/search/city', (req, res) => patientController.searchByCity(req, res));

  // Obtener perfil de paciente
  router.get('/:id', (req, res) => patientController.getProfile(req, res));

  // Actualizar perfil de paciente
  router.put('/:id', (req, res) => patientController.updateProfile(req, res));

  // Agregar historial médico
  router.post('/:id/medical-history', (req, res) => patientController.addMedicalHistory(req, res));

  // Agregar alergia
  router.post('/:id/allergies', (req, res) => patientController.addAllergy(req, res));

  // Verificar edad
  router.get('/:id/verify-age', (req, res) => patientController.verifyAge(req, res));

  // Desactivar perfil
  router.delete('/:id', (req, res) => patientController.deactivate(req, res));

  return router;
};
