# 📋 Arquitectura MedEx Backend

## Descripción General

**MedEx** es una plataforma de gestión de citas médicas que conecta a **Pacientes** y **Doctores**. El backend está construido con una arquitectura de capas (MVC) usando **Node.js** y **Express.js**.

---

## 🏗️ Estructura del Proyecto

```
MedEx-Backend/
│
├── database/
│   └── schema.sql                 # Script SQL para crear tablas
│
├── src/
│   ├── configs/
│   │   └── database.js           # Configuración de base de datos
│   │
│   ├── controllers/
│   │   ├── patient-controller.js # Controlador de pacientes
│   │   └── doctor-controller.js  # Controlador de doctores
│   │
│   ├── entities/
│   │   ├── Patient.js           # Modelo/Entidad de Paciente
│   │   └── Doctor.js            # Modelo/Entidad de Doctor
│   │
│   ├── helpers/
│   │   └── validations-helper.js # Funciones de validación
│   │
│   ├── modules/
│   │   ├── patient-routes.js    # Rutas de pacientes
│   │   └── doctor-routes.js     # Rutas de doctores
│   │
│   ├── repositories/
│   │   ├── patient-repository.js # Acceso a datos de pacientes
│   │   └── doctor-repository.js  # Acceso a datos de doctores
│   │
│   ├── services/
│   │   ├── patient-service.js    # Lógica de negocio de pacientes
│   │   └── doctor-service.js     # Lógica de negocio de doctores
│   │
│   └── app.js                   # Aplicación principal Express
│
├── .env-template                # Plantilla de variables de entorno
├── index.js                     # Punto de entrada del servidor
├── package.json                 # Dependencias del proyecto
└── README.md                    # Documentación del proyecto
```

---

## 📊 Patrones de Arquitectura

### 1. **Arquitectura en Capas (Layered Architecture)**

```
┌─────────────────────────────────────┐
│    Controllers (user_request)       │
├─────────────────────────────────────┤
│    Services (business_logic)        │
├─────────────────────────────────────┤
│    Repositories (data_access)       │
├─────────────────────────────────────┤
│    Database (persistence)           │
└─────────────────────────────────────┘
```

---

## 🔄 Flujo de Solicitud

1. **Cliente** → Realiza solicitud HTTP
2. **Controller** → Recibe la solicitud y la delega al servicio
3. **Service** → Contiene la lógica de negocio y valida datos
4. **Repository** → Accede a la base de datos
5. **Database** → Persiste/obtiene los datos
6. **Respuesta** → Se retorna al cliente en formato JSON

---

## 👥 Entidades Principales

### **Paciente (Patient)**

```javascript
{
  id: number,
  firstName: string,
  lastName: string,
  email: string (unique),
  password: string (hasheada),
  phoneNumber: string,
  dateOfBirth: date,
  gender: 'M' | 'F' | 'O',
  address: string,
  city: string,
  bloodType: string,
  medicalHistory: array,    // Historiales médicos
  allergies: array,         // Alergias registradas
  emergencyContact: string,
  isActive: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### **Doctor**

```javascript
{
  id: number,
  firstName: string,
  lastName: string,
  email: string (unique),
  password: string (hasheada),
  phoneNumber: string,
  specialty: string,        // Cardiología, Neurología, etc.
  licenseNumber: string (unique),
  yearsOfExperience: number,
  hospital: string,
  address: string,
  city: string,
  bio: string,
  qualifications: array,    // Certificaciones
  consultationFee: decimal,
  availableSlots: array,    // Horarios disponibles
  isVerified: boolean,      // Verificado por admin
  isActive: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

## 🔌 Endpoints de API

### **Pacientes** - Prefijo: `/api/patients`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/register` | Registrar nuevo paciente |
| GET | `/` | Obtener todos los pacientes |
| GET | `/active` | Obtener pacientes activos |
| GET | `/search/city?city=...` | Buscar por ciudad |
| GET | `/:id` | Obtener perfil de paciente |
| PUT | `/:id` | Actualizar perfil |
| POST | `/:id/medical-history` | Agregar historial médico |
| POST | `/:id/allergies` | Agregar alergia |
| GET | `/:id/verify-age` | Verificar edad |
| DELETE | `/:id` | Desactivar perfil |

### **Doctores** - Prefijo: `/api/doctors`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/register` | Registrar nuevo doctor |
| GET | `/` | Obtener todos los doctores |
| GET | `/available` | Obtener doctores disponibles |
| GET | `/search/specialty?specialty=...` | Buscar por especialidad |
| GET | `/search/city?city=...` | Buscar por ciudad |
| GET | `/search/specialty-city?specialty=...&city=...` | Búsqueda combinada |
| GET | `/:id` | Obtener perfil de doctor |
| PUT | `/:id` | Actualizar perfil |
| POST | `/:id/available-slots` | Agregar disponibilidad |
| POST | `/:id/qualifications` | Agregar calificación |
| GET | `/:id/availability` | Obtener disponibilidad |
| PATCH | `/:id/verify` | Verificar doctor (admin) |
| DELETE | `/:id` | Desactivar perfil |

---

## 🔐 Validaciones

### **Pacientes**
- Email válido y único
- Contraseña: mín 8 caracteres, mayúscula, minúscula, número
- Teléfono válido (mín 10 dígitos)
- Campos requeridos: nombre, apellido, email, teléfono, ciudad, dirección
- Género: M, F u O

### **Doctores**
- Email válido y único
- Contraseña: mín 8 caracteres, mayúscula, minúscula, número
- Teléfono válido (mín 10 dígitos)
- Número de licencia único
- Tarifa de consulta > 0
- Campos requeridos: nombre, apellido, especialidad, licencia, hospital, ciudad

---

## 📦 Tabla de Base de Datos

### **patients**
- id (PK)
- first_name, last_name
- email (UNIQUE), password
- phone_number
- date_of_birth, gender
- address, city, blood_type
- emergency_contact
- is_active
- created_at, updated_at

### **doctors**
- id (PK)
- first_name, last_name
- email (UNIQUE), password
- phone_number
- specialty, license_number (UNIQUE)
- years_of_experience
- hospital, address, city
- bio, consultation_fee
- is_verified, is_active
- created_at, updated_at

### **patient_medical_history**
- id (PK)
- patient_id (FK)
- description, diagnosis, treatment
- doctor_notes, date

### **patient_allergies**
- id (PK)
- patient_id (FK)
- name, severity, notes

### **doctor_qualifications**
- id (PK)
- doctor_id (FK)
- name, institution, year_obtained

### **doctor_available_slots**
- id (PK)
- doctor_id (FK)
- date, start_time, end_time
- is_available

### **appointments**
- id (PK)
- patient_id (FK), doctor_id (FK)
- appointment_date, status
- notes, created_at, updated_at

---

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/Felibeck/MedEx-Backend.git
cd MedEx-Backend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env-template .env
# Editar .env con tus valores
```

### 4. Crear base de datos
```bash
# Con PostgreSQL:
psql -U postgres -d medex_db -f database/schema.sql
```

### 5. Iniciar servidor
```bash
npm start          # Producción
npm run dev        # Desarrollo (con watch)
```

El servidor estará disponible en: `http://localhost:3000`

---

## 🧪 Ejemplos de Solicitudes

### Registrar Paciente
```bash
POST /api/patients/register
Content-Type: application/json

{
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@example.com",
  "password": "SecurePass123",
  "phoneNumber": "+1234567890",
  "dateOfBirth": "1990-05-15",
  "gender": "M",
  "address": "Calle Principal 123",
  "city": "Madrid",
  "bloodType": "O+",
  "emergencyContact": "María Pérez"
}
```

### Registrar Doctor
```bash
POST /api/doctors/register
Content-Type: application/json

{
  "firstName": "Carlos",
  "lastName": "López",
  "email": "carlos.doctor@example.com",
  "password": "DoctorPass123",
  "phoneNumber": "+1234567891",
  "specialty": "Cardiología",
  "licenseNumber": "LIC123456",
  "yearsOfExperience": 10,
  "hospital": "Hospital Central",
  "address": "Av. Médica 456",
  "city": "Madrid",
  "bio": "Cardiólogo especializado en arritmias",
  "consultationFee": 150.00
}
```

### Buscar Doctores por Especialidad y Ciudad
```bash
GET /api/doctors/search/specialty-city?specialty=Cardiología&city=Madrid
```

---

## 🔄 Ciclo de Vida de una Cita (Futuro)

1. **Paciente** busca doctores (especializad, ciudad)
2. **Paciente** ve disponibilidad del doctor
3. **Paciente** reserva cita
4. **Doctor** recibe notificación
5. **Doctor** confirma o rechaza
6. **Confirmada**: Ambos reciben detalles
7. **Cita realizada**: Se registra en historial

---

## 📝 Respuestas de API

### Éxito (200/201)
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": { /* objeto */ }
}
```

### Error (400/404/500)
```json
{
  "success": false,
  "message": "Descripción del error"
}
```

---

## 🛡️ Seguridad (Pendiente)

- [ ] Hasheado de contraseñas (bcrypt)
- [ ] Autenticación JWT
- [ ] Rate limiting
- [ ] Validación CORS
- [ ] HTTPS en producción
- [ ] Inyección SQL sanitizad

---

## 🚧 Características Pendientes

- Autenticación y autorización
- Historial de citas
- Sistema de notificaciones
- Ratings y reviews
- Pagos online
- Reportes médicos PDF
- Integración con calendario
- Chat en tiempo real
- Dashboard admin

---

## 👨‍💻 Tecnologías Utilizadas

- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Base de datos
- **ES6 Modules** - Sistema de módulos
- **REST API** - Arquitectura de API

---

## 📖 Convenciones de Código

- **Controllers**: Métodos async que manejan solicitudes HTTP
- **Services**: Métodos async que contienen lógica de negocio
- **Repositories**: Métodos async que acceden a datos
- **Entities**: Clases con métodos útiles para manipular datos
- **Routes**: Definición limpia de endpoints

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la licencia ISC.

---

**Última actualización**: 29 de Mayo de 2026
