// Aplicación Principal - MedEx Backend
// Configuración central de Express y rutas
import 'dotenv/config';
import express from 'express';
import supabase from './configs/database.js';
import { PatientRepository } from './repositories/patient-repository.js';
import { DoctorRepository } from './repositories/doctor-repository.js';
import { CatalogoRepository } from './repositories/catalogo-repository.js';
import { PatientService } from './services/patient-service.js';
import { DoctorService } from './services/doctor-service.js';
import { CatalogoService } from './services/catalogo-service.js';
import { PatientController } from './controllers/patient-controller.js';
import { DoctorController } from './controllers/doctor-controller.js';
import { CatalogoController } from './controllers/catalogo-controller.js';
import { createPatientRoutes } from './routes/patient-routes.js';
import { createDoctorRoutes } from './routes/doctor-routes.js';
import { createCatalogoRoutes } from './routes/catalogo-routes.js';
const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');

  // Responder al preflight OPTIONS inmediatamente
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

// Inicializar repositorios
const patientRepository = new PatientRepository(supabase);
const doctorRepository = new DoctorRepository(supabase);
const catalogoRepository = new CatalogoRepository(supabase);

// Inicializar servicios
const patientService = new PatientService(patientRepository);
const doctorService = new DoctorService(doctorRepository);
const catalogoService = new CatalogoService(catalogoRepository);

// Inicializar controladores
const patientController = new PatientController(patientService);
const doctorController = new DoctorController(doctorService);
const catalogoController = new CatalogoController(catalogoService);

// Registrar rutas
app.use('/api/patients', createPatientRoutes(patientController));
app.use('/api/doctors', createDoctorRoutes(doctorController));
app.use('/api/catalogos', createCatalogoRoutes(catalogoController));

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
