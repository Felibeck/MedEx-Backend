## 📚 Ejemplos de Solicitudes API - MedEx

### Base URL
```
http://localhost:3000/api
```

---

## 👥 PACIENTES

### 1. Registrar un Nuevo Paciente

**Solicitud:**
```http
POST /patients/register
Content-Type: application/json

{
  "firstName": "Juan",
  "lastName": "Pérez García",
  "email": "juan.perez@example.com",
  "password": "SecurePass123",
  "phoneNumber": "+34612345678",
  "dateOfBirth": "1990-05-15",
  "gender": "M",
  "address": "Calle Principal 123, Apto 4B",
  "city": "Madrid",
  "bloodType": "O+",
  "emergencyContact": "María Pérez - +34612345679"
}
```

**Respuesta (201):**
```json
{
  "success": true,
  "message": "Paciente registrado exitosamente",
  "data": {
    "id": 1,
    "firstName": "Juan",
    "lastName": "Pérez García",
    "email": "juan.perez@example.com",
    "phoneNumber": "+34612345678",
    "dateOfBirth": "1990-05-15",
    "gender": "M",
    "address": "Calle Principal 123, Apto 4B",
    "city": "Madrid",
    "bloodType": "O+",
    "medicalHistory": [],
    "allergies": [],
    "emergencyContact": "María Pérez - +34612345679",
    "isActive": true,
    "createdAt": "2026-05-29T10:30:00Z",
    "updatedAt": "2026-05-29T10:30:00Z"
  }
}
```

---

### 2. Obtener Perfil de Paciente

**Solicitud:**
```http
GET /patients/1
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "firstName": "Juan",
    "lastName": "Pérez García",
    "email": "juan.perez@example.com",
    "phoneNumber": "+34612345678",
    "dateOfBirth": "1990-05-15",
    "gender": "M",
    "address": "Calle Principal 123, Apto 4B",
    "city": "Madrid",
    "bloodType": "O+",
    "medicalHistory": [],
    "allergies": [],
    "emergencyContact": "María Pérez",
    "isActive": true,
    "createdAt": "2026-05-29T10:30:00Z",
    "updatedAt": "2026-05-29T10:30:00Z"
  }
}
```

---

### 3. Obtener Todos los Pacientes

**Solicitud:**
```http
GET /patients
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "firstName": "Juan",
      "lastName": "Pérez García",
      "email": "juan.perez@example.com",
      "city": "Madrid",
      ...
    },
    {
      "id": 2,
      "firstName": "Ana",
      "lastName": "López Martínez",
      "email": "ana.lopez@example.com",
      "city": "Barcelona",
      ...
    }
  ]
}
```

---

### 4. Obtener Pacientes Activos

**Solicitud:**
```http
GET /patients/active
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": [
    { /* paciente activo 1 */ },
    { /* paciente activo 2 */ }
  ]
}
```

---

### 5. Buscar Pacientes por Ciudad

**Solicitud:**
```http
GET /patients/search/city?city=Madrid
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "firstName": "Juan",
      "lastName": "Pérez García",
      "city": "Madrid",
      ...
    }
  ]
}
```

---

### 6. Actualizar Perfil de Paciente

**Solicitud:**
```http
PUT /patients/1
Content-Type: application/json

{
  "phoneNumber": "+34612345680",
  "address": "Nueva Dirección 456",
  "bloodType": "A+"
}
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Perfil actualizado exitosamente",
  "data": {
    "id": 1,
    "firstName": "Juan",
    "phoneNumber": "+34612345680",
    "address": "Nueva Dirección 456",
    "bloodType": "A+",
    "updatedAt": "2026-05-29T10:35:00Z",
    ...
  }
}
```

---

### 7. Agregar Historial Médico

**Solicitud:**
```http
POST /patients/1/medical-history
Content-Type: application/json

{
  "description": "Control periódico",
  "diagnosis": "Presión arterial normal",
  "treatment": "Antiinflamatorio",
  "doctorNotes": "Paciente en buen estado"
}
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Historial médico agregado",
  "data": {
    "id": 1,
    "medicalHistory": [
      {
        "description": "Control periódico",
        "diagnosis": "Presión arterial normal",
        "date": "2026-05-29T10:40:00Z"
      }
    ],
    ...
  }
}
```

---

### 8. Agregar Alergia

**Solicitud:**
```http
POST /patients/1/allergies
Content-Type: application/json

{
  "name": "Penicilina",
  "severity": "Alto",
  "notes": "Causa reacciones anafilácticas"
}
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Alergia agregada",
  "data": {
    "id": 1,
    "allergies": [
      {
        "name": "Penicilina",
        "severity": "Alto",
        "notes": "Causa reacciones anafilácticas"
      }
    ],
    ...
  }
}
```

---

### 9. Verificar Edad del Paciente

**Solicitud:**
```http
GET /patients/1/verify-age
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "isAdult": true,
    "age": 36
  }
}
```

---

### 10. Desactivar Perfil de Paciente

**Solicitud:**
```http
DELETE /patients/1
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Paciente desactivado correctamente"
}
```

---

## 👨‍⚕️ DOCTORES

### 1. Registrar un Nuevo Doctor

**Solicitud:**
```http
POST /doctors/register
Content-Type: application/json

{
  "firstName": "Carlos",
  "lastName": "López Hernández",
  "email": "carlos.doctor@example.com",
  "password": "DoctorPass123",
  "phoneNumber": "+34612345690",
  "specialty": "Cardiología",
  "licenseNumber": "LIC123456789",
  "yearsOfExperience": 15,
  "hospital": "Hospital Central de Madrid",
  "address": "Avenida Médica 456",
  "city": "Madrid",
  "bio": "Especialista en cardiología integradora con experiencia en arritmias cardíacas.",
  "consultationFee": 150.00
}
```

**Respuesta (201):**
```json
{
  "success": true,
  "message": "Doctor registrado exitosamente",
  "data": {
    "id": 1,
    "firstName": "Carlos",
    "lastName": "López Hernández",
    "email": "carlos.doctor@example.com",
    "phoneNumber": "+34612345690",
    "specialty": "Cardiología",
    "licenseNumber": "LIC123456789",
    "yearsOfExperience": 15,
    "hospital": "Hospital Central de Madrid",
    "address": "Avenida Médica 456",
    "city": "Madrid",
    "bio": "Especialista en cardiología integradora...",
    "qualifications": [],
    "consultationFee": 150.00,
    "availableSlots": [],
    "isVerified": false,
    "isActive": true,
    "createdAt": "2026-05-29T10:45:00Z",
    "updatedAt": "2026-05-29T10:45:00Z"
  }
}
```

---

### 2. Obtener Perfil de Doctor

**Solicitud:**
```http
GET /doctors/1
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "firstName": "Carlos",
    "lastName": "López Hernández",
    "specialty": "Cardiología",
    "yearsOfExperience": 15,
    "hospital": "Hospital Central de Madrid",
    "city": "Madrid",
    "consultationFee": 150.00,
    "isVerified": false,
    ...
  }
}
```

---

### 3. Obtener Todos los Doctores

**Solicitud:**
```http
GET /doctors
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "firstName": "Carlos",
      "lastName": "López Hernández",
      "specialty": "Cardiología",
      "city": "Madrid",
      ...
    },
    {
      "id": 2,
      "firstName": "Elena",
      "lastName": "García Rodríguez",
      "specialty": "Neurología",
      "city": "Barcelona",
      ...
    }
  ]
}
```

---

### 4. Obtener Doctores Disponibles (Verificados y Activos)

**Solicitud:**
```http
GET /doctors/available
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "firstName": "Elena",
      "specialty": "Neurología",
      "isVerified": true,
      "isActive": true,
      ...
    }
  ]
}
```

---

### 5. Buscar Doctores por Especialidad

**Solicitud:**
```http
GET /doctors/search/specialty?specialty=Cardiología
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "firstName": "Carlos",
      "lastName": "López Hernández",
      "specialty": "Cardiología",
      "yearsOfExperience": 15,
      "isVerified": true,
      ...
    }
  ]
}
```

---

### 6. Buscar Doctores por Ciudad

**Solicitud:**
```http
GET /doctors/search/city?city=Madrid
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "firstName": "Carlos",
      "city": "Madrid",
      "isVerified": true,
      ...
    }
  ]
}
```

---

### 7. Buscar por Especialidad y Ciudad

**Solicitud:**
```http
GET /doctors/search/specialty-city?specialty=Cardiología&city=Madrid
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "firstName": "Carlos",
      "specialty": "Cardiología",
      "city": "Madrid",
      "isVerified": true,
      ...
    }
  ]
}
```

---

### 8. Actualizar Perfil de Doctor

**Solicitud:**
```http
PUT /doctors/1
Content-Type: application/json

{
  "phoneNumber": "+34612345691",
  "bio": "Actualización del perfil profesional",
  "consultationFee": 175.00
}
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Perfil actualizado exitosamente",
  "data": {
    "id": 1,
    "phoneNumber": "+34612345691",
    "bio": "Actualización del perfil profesional",
    "consultationFee": 175.00,
    "updatedAt": "2026-05-29T10:50:00Z",
    ...
  }
}
```

---

### 9. Agregar Disponibilidad

**Solicitud:**
```http
POST /doctors/1/available-slots
Content-Type: application/json

{
  "date": "2026-06-05",
  "startTime": "09:00",
  "endTime": "10:00"
}
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Disponibilidad agregada",
  "data": {
    "id": 1,
    "availableSlots": [
      {
        "date": "2026-06-05",
        "startTime": "09:00",
        "endTime": "10:00"
      }
    ],
    ...
  }
}
```

---

### 10. Agregar Calificación/Certificación

**Solicitud:**
```http
POST /doctors/1/qualifications
Content-Type: application/json

{
  "name": "Diploma en Cardiología Intervencional",
  "institution": "Universidad de Madrid",
  "year_obtained": 2015
}
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Calificación agregada",
  "data": {
    "id": 1,
    "qualifications": [
      {
        "name": "Diploma en Cardiología Intervencional",
        "institution": "Universidad de Madrid",
        "year_obtained": 2015
      }
    ],
    ...
  }
}
```

---

### 11. Obtener Disponibilidad de Doctor

**Solicitud:**
```http
GET /doctors/1/availability
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "doctorId": 1,
    "doctorName": "Carlos López Hernández",
    "availableSlots": [
      {
        "date": "2026-06-05",
        "startTime": "09:00",
        "endTime": "10:00"
      },
      {
        "date": "2026-06-05",
        "startTime": "14:00",
        "endTime": "15:00"
      }
    ]
  }
}
```

---

### 12. Verificar Doctor (Admin)

**Solicitud:**
```http
PATCH /doctors/1/verify
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Doctor verificado correctamente",
  "data": {
    "id": 1,
    "firstName": "Carlos",
    "isVerified": true,
    "updatedAt": "2026-05-29T10:55:00Z",
    ...
  }
}
```

---

### 13. Desactivar Perfil de Doctor

**Solicitud:**
```http
DELETE /doctors/1
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Doctor desactivado correctamente"
}
```

---

## ⚠️ Ejemplos de Errores

### Error de Validación - Email Inválido

**Solicitud:**
```http
POST /patients/register
Content-Type: application/json

{
  "email": "email_invalido",
  "password": "pass123"
}
```

**Respuesta (400):**
```json
{
  "success": false,
  "message": "Errores de validación: El email no es válido, La contraseña debe tener al menos 8 caracteres..."
}
```

---

### Error - Email Ya Registrado

**Solicitud:**
```http
POST /patients/register

{
  "firstName": "Otro",
  "email": "juan.perez@example.com",
  ...
}
```

**Respuesta (400):**
```json
{
  "success": false,
  "message": "El email ya está registrado"
}
```

---

### Error - Paciente No Encontrado

**Solicitud:**
```http
GET /patients/999
```

**Respuesta (404):**
```json
{
  "success": false,
  "message": "Paciente no encontrado"
}
```

---

## 🧪 Probar con cURL

### Registrar Paciente
```bash
curl -X POST http://localhost:3000/api/patients/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@example.com",
    "password": "SecurePass123",
    "phoneNumber": "+34612345678",
    "dateOfBirth": "1990-05-15",
    "gender": "M",
    "address": "Calle Principal 123",
    "city": "Madrid",
    "bloodType": "O+",
    "emergencyContact": "María Pérez"
  }'
```

### Obtener Paciente
```bash
curl -X GET http://localhost:3000/api/patients/1
```

### Registrar Doctor
```bash
curl -X POST http://localhost:3000/api/doctors/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Carlos",
    "lastName": "López",
    "email": "carlos@example.com",
    "password": "DoctorPass123",
    "phoneNumber": "+34612345690",
    "specialty": "Cardiología",
    "licenseNumber": "LIC123456789",
    "yearsOfExperience": 15,
    "hospital": "Hospital Central",
    "address": "Avenida Médica 456",
    "city": "Madrid",
    "bio": "Cardiólogo experimentado",
    "consultationFee": 150.00
  }'
```

---

**Generado**: 29 de Mayo de 2026
