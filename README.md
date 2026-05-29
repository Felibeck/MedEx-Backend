"# 🏥 MedEx Backend

> Plataforma de gestión de citas médicas que conecta **Pacientes** y **Doctores**

## 🚀 Características Principales

- ✅ **Gestión de Pacientes**: Registro, perfil, historial médico, alergias
- ✅ **Gestión de Doctores**: Registro, especialidades, disponibilidad, calificaciones
- ✅ **Búsqueda Avanzada**: Por especialidad, ciudad, disponibilidad
- ✅ **Validaciones Robustas**: Email, contraseña, datos médicos
- ✅ **Arquitectura en Capas**: Controllers → Services → Repositories
- ✅ **Base de Datos Relacional**: PostgreSQL con esquema completo
- ✅ **API REST**: Endpoints bien documentados

---

## 📋 Tabla de Contenidos

- [Instalación](#instalación)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Arquitectura](#arquitectura)
- [Documentación](#documentación)
- [API Endpoints](#api-endpoints)
- [Configuración](#configuración)
- [Requisitos](#requisitos)

---

## 📦 Requisitos

- **Node.js** >= 18.0.0
- **npm** o **yarn**
- **PostgreSQL** >= 12.0
- **Git**

---

## 🚀 Instalación

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
# Copiar plantilla
cp .env-template .env

# Editar .env con tus valores
nano .env
```

Ejemplo de `.env`:
```env
PORT=3000
HOST=localhost
NODE_ENV=development

# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=medex_db
DB_USER=postgres
DB_PASSWORD=tu_contraseña
```

### 4. Crear la base de datos

```bash
# Con PostgreSQL cliente
createdb medex_db

# Ejecutar script SQL
psql -U postgres -d medex_db -f database/schema.sql
```

### 5. Iniciar el servidor

```bash
# Modo producción
npm start

# Modo desarrollo (con reload automático)
npm run dev
```

El servidor estará disponible en: **http://localhost:3000**

---

## 📁 Estructura del Proyecto

```
MedEx-Backend/
│
├── 📂 database/
│   └── schema.sql                 # Script SQL
│
├── 📂 src/
│   ├── 📂 configs/
│   │   └── database.js
│   ├── 📂 controllers/
│   │   ├── patient-controller.js
│   │   └── doctor-controller.js
│   ├── 📂 entities/
│   │   ├── Patient.js
│   │   └── Doctor.js
│   ├── 📂 helpers/
│   │   └── validations-helper.js
│   ├── 📂 modules/
│   │   ├── patient-routes.js
│   │   └── doctor-routes.js
│   ├── 📂 repositories/
│   │   ├── patient-repository.js
│   │   └── doctor-repository.js
│   ├── 📂 services/
│   │   ├── patient-service.js
│   │   └── doctor-service.js
│   └── app.js
│
├── 📄 index.js
├── 📄 package.json
├── 📄 .env-template
├── 📄 ARQUITECTURA.md
├── 📄 DIAGRAMA_ARQUITECTURA.md
├── 📄 EJEMPLOS_API.md
└── 📄 README.md
```

---

## 🏗️ Arquitectura

### Patrón MVC en Capas

```
CLIENT (HTTP)
    ↓
CONTROLLERS (Handlers)
    ↓
SERVICES (Business Logic)
    ↓
REPOSITORIES (Data Access)
    ↓
DATABASE (Persistence)
```

### Flujo de Solicitud

1. Cliente envía solicitud HTTP
2. Controller recibe y valida
3. Service procesa la lógica
4. Repository accede a datos
5. Base de datos procesa
6. Respuesta retorna en JSON

---

## 👥 Entidades

### Paciente
- Información personal (nombre, email, teléfono)
- Datos médicos (fecha nacimiento, grupo sanguíneo, alergias)
- Historial médico
- Perfil activo/inactivo

### Doctor
- Información personal
- Especialidad y licencia
- Experiencia profesional
- Calificaciones y certificaciones
- Disponibilidad de horarios
- Tarifa de consulta
- Verificación por administrador

---

## 🔌 API Endpoints

### Pacientes `/api/patients`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/register` | Registrar paciente |
| GET | `/` | Listar todos |
| GET | `/active` | Listar activos |
| GET | `/search/city` | Buscar por ciudad |
| GET | `/:id` | Obtener perfil |
| PUT | `/:id` | Actualizar perfil |
| POST | `/:id/medical-history` | Agregar historial |
| POST | `/:id/allergies` | Agregar alergia |
| GET | `/:id/verify-age` | Verificar edad |
| DELETE | `/:id` | Desactivar |

### Doctores `/api/doctors`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/register` | Registrar doctor |
| GET | `/` | Listar todos |
| GET | `/available` | Listar disponibles |
| GET | `/search/specialty` | Buscar por especialidad |
| GET | `/search/city` | Buscar por ciudad |
| GET | `/search/specialty-city` | Búsqueda combinada |
| GET | `/:id` | Obtener perfil |
| PUT | `/:id` | Actualizar perfil |
| POST | `/:id/available-slots` | Agregar disponibilidad |
| POST | `/:id/qualifications` | Agregar calificación |
| GET | `/:id/availability` | Ver disponibilidad |
| PATCH | `/:id/verify` | Verificar (admin) |
| DELETE | `/:id` | Desactivar |

---

## 💾 Base de Datos

### Tablas Principales

- **patients**: Información de pacientes
- **doctors**: Información de doctores
- **patient_medical_history**: Historiales médicos
- **patient_allergies**: Alergias registradas
- **doctor_qualifications**: Certificaciones
- **doctor_available_slots**: Horarios disponibles
- **appointments**: Citas (futuro)

---

## 🔐 Validaciones

### Pacientes
✅ Email válido y único
✅ Contraseña fuerte (8+ caracteres, mayús, minús, números)
✅ Teléfono válido (10+ dígitos)
✅ Campos obligatorios validados

### Doctores
✅ Email válido y único
✅ Licencia única
✅ Datos médicos completos
✅ Tarifa positiva

---

## 📚 Documentación

La documentación completa está disponible en:

- **[ARQUITECTURA.md](ARQUITECTURA.md)** - Descripción completa de la arquitectura
- **[DIAGRAMA_ARQUITECTURA.md](DIAGRAMA_ARQUITECTURA.md)** - Diagramas visuales
- **[EJEMPLOS_API.md](EJEMPLOS_API.md)** - Ejemplos de solicitudes y respuestas

---

## 🧪 Ejemplos de Uso

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
    "bloodType": "O+"
  }'
```

### Buscar Doctores por Especialidad

```bash
curl "http://localhost:3000/api/doctors/search/specialty?specialty=Cardiología"
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

## 🛣️ Rutas de Configuración

Todas las rutas se definen en `src/modules/`:
- `patient-routes.js` - Rutas de pacientes
- `doctor-routes.js` - Rutas de doctores

Las rutas se registran en `src/app.js` con el prefijo `/api`

---

## 📊 Respuestas de API

### Éxito
```json
{
  "success": true,
  "message": "Operación completada",
  "data": { /* objeto */ }
}
```

### Error
```json
{
  "success": false,
  "message": "Descripción del error"
}
```

---

## 🔧 Configuración

Todas las configuraciones se encuentran en:
- `.env` - Variables de entorno
- `src/configs/database.js` - Configuración de DB

---

## 🚧 Próximas Características

- [ ] Autenticación JWT
- [ ] Historial de citas
- [ ] Sistema de notificaciones
- [ ] Ratings y reviews
- [ ] Pagos online
- [ ] Chat en tiempo real
- [ ] Dashboard administrativo
- [ ] Reportes médicos PDF

---

## 🐛 Reporte de Errores

Si encuentras un error:
1. Verifica que tengas instalada la versión correcta de Node.js
2. Revisa el archivo `.env`
3. Consulta los logs del servidor
4. Abre un issue en GitHub

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas:

```bash
# 1. Fork el repositorio
# 2. Crea una rama
git checkout -b feature/nueva-caracteristica

# 3. Realiza cambios y commit
git commit -am 'Agregar nueva característica'

# 4. Push a la rama
git push origin feature/nueva-caracteristica

# 5. Abre un Pull Request
```

---

## 📄 Licencia

Este proyecto está bajo la licencia **ISC**.

---

## 👨‍💻 Autor

**Felibeck** - [GitHub](https://github.com/Felibeck)

---

## 📞 Soporte

Para soporte, abre un issue en el repositorio:
[MedEx-Backend Issues](https://github.com/Felibeck/MedEx-Backend/issues)

---

## 🙏 Agradecimientos

Gracias por usar MedEx Backend. ¡Ayuda a mejorar la salud digital!

---

**Última actualización**: 29 de Mayo de 2026" 
