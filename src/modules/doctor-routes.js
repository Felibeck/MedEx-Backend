// Rutas de Doctores
// Define los endpoints relacionados con doctores

import express from 'express';

export const createDoctorRoutes = (doctorController) => {
  const router = express.Router();
  
  router.get('/pacientes/buscar', (req, res) => doctorController.buscarPacientePorDni(req, res));

  // Registrar nueva consulta
  router.post('/consultas', (req, res) => doctorController.crearConsulta(req, res));





  // Registro de nuevo doctor
  router.post('/register', (req, res) => doctorController.register(req, res));

  // Obtener todos los doctores
  router.get('/', (req, res) => doctorController.getAll(req, res));

  // Obtener doctores disponibles
  router.get('/available', (req, res) => doctorController.getAvailable(req, res));

  // Buscar doctores por especialidad
  router.get('/search/specialty', (req, res) => doctorController.searchBySpecialty(req, res));

  // Buscar doctores por ciudad
  router.get('/search/city', (req, res) => doctorController.searchByCity(req, res));

  // Buscar doctores por especialidad y ciudad
  router.get('/search/specialty-city', (req, res) => doctorController.searchBySpecialtyAndCity(req, res));

  // --- Endpoints del flujo clínico ---
  // Buscar paciente por DNI
 
  // Obtener perfil de doctor
  router.get('/:id', (req, res) => doctorController.getProfile(req, res));

  // Actualizar perfil de doctor
  router.put('/:id', (req, res) => doctorController.updateProfile(req, res));

  // Agregar disponibilidad
  router.post('/:id/available-slots', (req, res) => doctorController.addAvailableSlot(req, res));

  // Agregar calificación
  router.post('/:id/qualifications', (req, res) => doctorController.addQualification(req, res));

  // Obtener disponibilidad
  router.get('/:id/availability', (req, res) => doctorController.getAvailability(req, res));

  // Verificar doctor (admin)
  router.patch('/:id/verify', (req, res) => doctorController.verify(req, res));

  // Desactivar perfil
  router.delete('/:id', (req, res) => doctorController.deactivate(req, res));

  return router;
};
