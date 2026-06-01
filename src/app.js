// Aplicación Principal - MedEx Backend
// Configuración central de Express y rutas

import express from 'express';
import supabase from './configs/database.js';import { PatientRepository } from './repositories/patient-repository.js';
import { DoctorRepository } from './repositories/doctor-repository.js';
import { PatientService } from './services/patient-service.js';
import { DoctorService } from './services/doctor-service.js';
import { PatientController } from './controllers/patient-controller.js';
import { DoctorController } from './controllers/doctor-controller.js';
import { createPatientRoutes } from './modules/patient-routes.js';
import { createDoctorRoutes } from './modules/doctor-routes.js';
const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware (opcional)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  next();
});

// Inicializar repositorios
const patientRepository = new PatientRepository(supabase);
const doctorRepository = new DoctorRepository(supabase);

// Inicializar servicios
const patientService = new PatientService(patientRepository);
const doctorService = new DoctorService(doctorRepository);

// Inicializar controladores
const patientController = new PatientController(patientService);
const doctorController = new DoctorController(doctorService);

// Registrar rutas
app.use('/api/patients', createPatientRoutes(patientController));
app.use('/api/doctors', createDoctorRoutes(doctorController));

// Ruta de prueba
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'MedEx Backend está funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Manejo de errores general
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app;
