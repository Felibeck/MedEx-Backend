# 📐 Diagrama de Arquitectura - MedEx Backend

## 1. Arquitectura General del Sistema

```
┌──────────────────────────────────────────────────────────────────┐
│                    CLIENTE (Frontend)                             │
│              (Web App / Mobile App)                               │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                    HTTP/HTTPS (REST API)
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│              EXPRESS.JS SERVER (index.js)                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              Middlewares                                    │  │
│  │  - express.json()                                          │  │
│  │  - express.urlencoded()                                    │  │
│  │  - CORS                                                    │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌────────────────┐              ┌────────────────┐              │
│  │ PATIENT ROUTES │              │ DOCTOR ROUTES  │              │
│  │ /api/patients  │              │ /api/doctors   │              │
│  └────────┬───────┘              └────────┬───────┘              │
│           │                               │                      │
│           ▼                               ▼                      │
│  ┌────────────────┐              ┌────────────────┐              │
│  │   PatientCtrl  │              │   DoctorCtrl   │              │
│  └────────┬───────┘              └────────┬───────┘              │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
                             │ │
                             ▼ ▼
┌──────────────────────────────────────────────────────────────────┐
│                   CAPA DE SERVICIOS                               │
│                                                                   │
│  ┌────────────────────┐        ┌────────────────────┐            │
│  │  PatientService    │        │   DoctorService    │            │
│  │  - Validaciones    │        │  - Validaciones    │            │
│  │  - Lógica Negocio  │        │  - Lógica Negocio  │            │
│  └────────────┬───────┘        └────────────┬───────┘            │
│               │                             │                    │
└───────────────┼─────────────────────────────┼────────────────────┘
                │                             │
                ▼                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                   CAPA DE REPOSITORIOS                            │
│                                                                   │
│  ┌────────────────────┐        ┌────────────────────┐            │
│  │ PatientRepository  │        │  DoctorRepository  │            │
│  │  - findById()      │        │  - findById()      │            │
│  │  - create()        │        │  - create()        │            │
│  │  - update()        │        │  - update()        │            │
│  │  - delete()        │        │  - delete()        │            │
│  │  - findByEmail()   │        │  - findByEmail()   │            │
│  └────────────┬───────┘        └────────────┬───────┘            │
│               │                             │                    │
└───────────────┼─────────────────────────────┼────────────────────┘
                │                             │
                └─────────────┬───────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                   POSTGRESQL DATABASE                             │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   patients   │  │   doctors    │  │appointments  │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│  ┌──────────────────┐  ┌──────────────────┐                      │
│  │medical_history   │  │doctor_qualif...  │                      │
│  └──────────────────┘  └──────────────────┘                      │
│  ┌──────────────────┐  ┌──────────────────┐                      │
│  │  allergies       │  │available_slots   │                      │
│  └──────────────────┘  └──────────────────┘                      │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. Flujo de una Solicitud Típica

```
PACIENTE QUIERE REGISTRARSE
         │
         ▼
┌─────────────────────────────────────┐
│ Client envía POST /api/patients     │
│ {                                   │
│   firstName, lastName, email,       │
│   password, phoneNumber, ...        │
│ }                                   │
└────────────┬────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ PatientController.register()         │
│ ├─ Recibe req.body                  │
│ └─ Llama patientService.register()   │
└────────────┬───────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ PatientService.register()            │
│ ├─ validatePatientData()             │
│ ├─ findByEmail() [Ya existe?]        │
│ └─ patientRepository.create()        │
└────────────┬───────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ PatientRepository.create()           │
│ ├─ Crea instancia de Patient         │
│ ├─ Asigna ID único                  │
│ ├─ Almacena en Map (en memoria)     │
│ └─ Retorna nuevo paciente            │
└────────────┬───────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ Retorna respuesta JSON:              │
│ {                                    │
│   "success": true,                   │
│   "message": "Registrado",           │
│   "data": { patient }                │
│ }                                    │
└──────────────────────────────────────┘
             │
             ▼
         CLIENTE
```

---

## 3. Estructura de Clases - Paciente

```
ENTITY: Patient
├── Propiedades
│   ├── id
│   ├── firstName
│   ├── lastName
│   ├── email
│   ├── password
│   ├── phoneNumber
│   ├── dateOfBirth
│   ├── gender
│   ├── address
│   ├── city
│   ├── bloodType
│   ├── medicalHistory []
│   ├── allergies []
│   ├── emergencyContact
│   ├── isActive
│   ├── createdAt
│   └── updatedAt
│
└── Métodos
    ├── getFullName()
    ├── isAdult()
    └── getPublicData()


REPOSITORY: PatientRepository
├── Métodos
│   ├── create(patientData)
│   ├── findById(id)
│   ├── findByEmail(email)
│   ├── findAll()
│   ├── findActive()
│   ├── findByCity(city)
│   ├── update(id, data)
│   ├── delete(id)
│   ├── addMedicalHistory(patientId, data)
│   └── addAllergy(patientId, data)
│
└── Propiedades
    ├── db
    ├── patients: Map
    └── nextId

SERVICE: PatientService
├── Métodos
│   ├── registerPatient(data)
│   ├── getPatientProfile(patientId)
│   ├── updatePatientProfile(patientId, data)
│   ├── getAllPatients()
│   ├── getActivePatients()
│   ├── searchPatientsByCity(city)
│   ├── addMedicalHistory(patientId, data)
│   ├── addAllergy(patientId, data)
│   ├── deactivatePatient(patientId)
│   └── verifyPatientAge(patientId)
│
└── Propiedades
    └── patientRepository

CONTROLLER: PatientController
├── Métodos HTTP
│   ├── register(req, res)
│   ├── getProfile(req, res)
│   ├── updateProfile(req, res)
│   ├── getAll(req, res)
│   ├── getActive(req, res)
│   ├── searchByCity(req, res)
│   ├── addMedicalHistory(req, res)
│   ├── addAllergy(req, res)
│   ├── deactivate(req, res)
│   └── verifyAge(req, res)
│
└── Propiedades
    └── patientService
```

---

## 4. Estructura de Clases - Doctor

```
ENTITY: Doctor
├── Propiedades
│   ├── id
│   ├── firstName
│   ├── lastName
│   ├── email
│   ├── password
│   ├── phoneNumber
│   ├── specialty
│   ├── licenseNumber
│   ├── yearsOfExperience
│   ├── hospital
│   ├── address
│   ├── city
│   ├── bio
│   ├── qualifications []
│   ├── consultationFee
│   ├── availableSlots []
│   ├── isVerified
│   ├── isActive
│   ├── createdAt
│   └── updatedAt
│
└── Métodos
    ├── getFullName()
    ├── getSpecialtyTitle()
    ├── isAvailable()
    ├── getPublicData()
    ├── addQualification(qual)
    └── addAvailableSlot(slot)


REPOSITORY: DoctorRepository
├── Métodos
│   ├── create(doctorData)
│   ├── findById(id)
│   ├── findByEmail(email)
│   ├── findByLicenseNumber(license)
│   ├── findAll()
│   ├── findAvailable()
│   ├── findBySpecialty(specialty)
│   ├── findByCity(city)
│   ├── findBySpecialtyAndCity(spec, city)
│   ├── update(id, data)
│   ├── verify(id)
│   ├── delete(id)
│   ├── addAvailableSlot(doctorId, slot)
│   └── addQualification(doctorId, qual)
│
└── Propiedades
    ├── db
    ├── doctors: Map
    └── nextId

SERVICE: DoctorService
├── Métodos
│   ├── registerDoctor(data)
│   ├── getDoctorProfile(doctorId)
│   ├── updateDoctorProfile(doctorId, data)
│   ├── getAllDoctors()
│   ├── getAvailableDoctors()
│   ├── searchDoctorsBySpecialty(spec)
│   ├── searchDoctorsByCity(city)
│   ├── searchDoctorsBySpecialtyAndCity(spec, city)
│   ├── addAvailableSlot(doctorId, data)
│   ├── addQualification(doctorId, data)
│   ├── verifyDoctor(doctorId)
│   ├── deactivateDoctor(doctorId)
│   └── getDoctorAvailability(doctorId)
│
└── Propiedades
    └── doctorRepository

CONTROLLER: DoctorController
├── Métodos HTTP
│   ├── register(req, res)
│   ├── getProfile(req, res)
│   ├── updateProfile(req, res)
│   ├── getAll(req, res)
│   ├── getAvailable(req, res)
│   ├── searchBySpecialty(req, res)
│   ├── searchByCity(req, res)
│   ├── searchBySpecialtyAndCity(req, res)
│   ├── addAvailableSlot(req, res)
│   ├── addQualification(req, res)
│   ├── verify(req, res)
│   ├── deactivate(req, res)
│   └── getAvailability(req, res)
│
└── Propiedades
    └── doctorService
```

---

## 5. Flujo de Base de Datos

```
CREACIÓN DE PACIENTE
                ┌─────────────┐
                │  patients   │
                ├─────────────┤
                │ id          │
                │ first_name  │
                │ last_name   │
                │ email       │◄─┐
                │ password    │  │ Validado
                │ phone       │  │
                │ dob         │  │ Único
                │ gender      │  │
                │ address     │  │
                │ city        │  │
                │ blood_type  │  │
                │ created_at  │  │
                └─────────────┘  │
                                 │
                        PatientService
                                 │

CREACIÓN DE DOCTOR
            ┌──────────────────┐
            │    doctors       │
            ├──────────────────┤
            │ id               │
            │ first_name       │
            │ last_name        │
            │ email            │◄─┐
            │ password         │  │ Validado
            │ phone            │  │
            │ specialty        │  │ Licencia
            │ license_number   │  │ Única
            │ years_exp        │  │
            │ hospital         │  │
            │ address          │  │
            │ city             │  │
            │ consultation_fee │  │
            │ is_verified      │  │
            │ created_at       │  │
            └──────────────────┘  │
                                  │
                         DoctorService
```

---

## 6. Validaciones en Cascada

```
POST /api/patients/register
│
▼
┌─────────────────────────────────────┐
│ 1. Sintaxis JSON válida             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 2. Expresiones regulares:           │
│    - Email válido: ^[^\s@]+@...     │
│    - Password: [a-z][A-Z][\d]{8,}   │
│    - Phone: [\d\s\-\+\(\)]{10,}     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 3. Campos requeridos:               │
│    - firstName ✓                    │
│    - lastName ✓                     │
│    - email ✓                        │
│    - password ✓                     │
│    - phoneNumber ✓                  │
│    - city ✓                         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 4. Unicidad:                        │
│    - Email ya registrado? ✗         │
└──────────────┬──────────────────────┘
               │
               ▼
         ✓ CREADO
```

---

## 7. Integración Completa

```
┌──────────────────────────────────────────────────────────┐
│                   app.js                                  │
│                                                           │
│  const patientRepo = new PatientRepository()             │
│  const patientService = new PatientService(patientRepo)  │
│  const patientCtrl = new PatientController(patientService)│
│                                                           │
│  router.post('/patients/register',                       │
│    (req,res) => patientCtrl.register(req,res))           │
│                                                           │
│  const doctorRepo = new DoctorRepository()               │
│  const doctorService = new DoctorService(doctorRepo)     │
│  const doctorCtrl = new DoctorController(doctorService)  │
│                                                           │
│  router.post('/doctors/register',                        │
│    (req,res) => doctorCtrl.register(req,res))            │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## 8. Matriz de Responsabilidades

| Componente | Responsabilidad | Validación | Persistencia |
|-----------|-----------------|-----------|-------------|
| **Controller** | Recibir solicitud HTTP | ❌ | ❌ |
| **Service** | Lógica de negocio | ✅ | ❌ |
| **Repository** | Acceso a datos | ❌ | ✅ |
| **Database** | Almacenamiento | ❌ | ✅ |

---

## 9. Patrones de Respuesta

### Éxito
```json
{
  "success": true,
  "message": "Operación completada",
  "data": {}
}
```

### Error de Validación
```json
{
  "success": false,
  "message": "Email ya está registrado"
}
```

### Error del Servidor
```json
{
  "success": false,
  "message": "Error interno del servidor"
}
```

---

**Generado**: 29 de Mayo de 2026
