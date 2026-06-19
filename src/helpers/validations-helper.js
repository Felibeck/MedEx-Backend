// Helper de Validaciones
// Contiene funciones de validación para pacientes y doctores

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // Contraseña debe tener al menos 8 caracteres, 1 mayúscula, 1 minúscula, 1 número
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

export const validatePhoneNumber = (phoneNumber) => {
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  return phoneRegex.test(phoneNumber);
};

// Validaciones para Paciente
export const validatePatientData = (patientData) => {
  const errors = [];

  if (!patientData.firstName || patientData.firstName.trim() === '') {
    errors.push('El nombre es requerido');
  }

  if (!patientData.lastName || patientData.lastName.trim() === '') {
    errors.push('El apellido es requerido');
  }

  if (!validateEmail(patientData.email)) {
    errors.push('El email no es válido');
  }

  if (!validatePassword(patientData.password)) {
    errors.push('La contraseña debe tener al menos 8 caracteres, incluir mayúscula, minúscula y número');
  }

  if (!validatePhoneNumber(patientData.phoneNumber)) {
    errors.push('El número de teléfono no es válido');
  }

  if (!patientData.dateOfBirth) {
    errors.push('La fecha de nacimiento es requerida');
  }

  const allowedGenders = ['femenino', 'masculino', 'no_binario', 'otro', 'prefiero_no_decir'];
  const genderVal = (patientData.gender || '').toString().toLowerCase();
  if (!allowedGenders.includes(genderVal)) {
    errors.push('El género debe ser uno de: femenino, masculino, no_binario, otro, prefiero_no_decir');
  }

  if (!patientData.address || patientData.address.trim() === '') {
    errors.push('La dirección es requerida');
  }

  if (!patientData.city || patientData.city.trim() === '') {
    errors.push('La ciudad es requerida');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validaciones para Doctor
export const validateDoctorData = (doctorData) => {
  const errors = [];

  if (!doctorData.firstName || doctorData.firstName.trim() === '') {
    errors.push('El nombre es requerido');
  }

  if (!doctorData.lastName || doctorData.lastName.trim() === '') {
    errors.push('El apellido es requerido');
  }

  if (!validateEmail(doctorData.email)) {
    errors.push('El email no es válido');
  }

  if (!validatePassword(doctorData.password)) {
    errors.push('La contraseña debe tener al menos 8 caracteres, incluir mayúscula, minúscula y número');
  }

  if (!validatePhoneNumber(doctorData.phoneNumber)) {
    errors.push('El número de teléfono no es válido');
  }

  if (!doctorData.specialty || doctorData.specialty.trim() === '') {
    errors.push('La especialidad es requerida');
  }

  if (!doctorData.licenseNumber || doctorData.licenseNumber.trim() === '') {
    errors.push('El número de licencia es requerido');
  }

  if (!Number.isInteger(doctorData.yearsOfExperience) || doctorData.yearsOfExperience < 0) {
    errors.push('Los años de experiencia deben ser un número válido');
  }

  if (!doctorData.hospital || doctorData.hospital.trim() === '') {
    errors.push('El hospital es requerido');
  }

  if (!doctorData.organizacion_id) {
    errors.push('La organización (organizacion_id) es requerida');
  }

  if (!doctorData.address || doctorData.address.trim() === '') {
    errors.push('La dirección es requerida');
  }

  if (!doctorData.city || doctorData.city.trim() === '') {
    errors.push('La ciudad es requerida');
  }

  if (!doctorData.consultationFee || doctorData.consultationFee <= 0) {
    errors.push('La tarifa de consulta debe ser un número positivo');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validar actualización de datos
export const validatePatientUpdate = (updateData) => {
  const errors = [];

  if (updateData.email && !validateEmail(updateData.email)) {
    errors.push('El email no es válido');
  }

  if (updateData.phoneNumber && !validatePhoneNumber(updateData.phoneNumber)) {
    errors.push('El número de teléfono no es válido');
  }

  if (updateData.gender) {
    const allowedGenders = ['femenino', 'masculino', 'no_binario', 'otro', 'prefiero_no_decir'];
    const genderVal = updateData.gender.toString().toLowerCase();
    if (!allowedGenders.includes(genderVal)) {
      errors.push('El género debe ser uno de: femenino, masculino, no_binario, otro, prefiero_no_decir');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateDoctorUpdate = (updateData) => {
  const errors = [];

  if (updateData.email && !validateEmail(updateData.email)) {
    errors.push('El email no es válido');
  }

  if (updateData.phoneNumber && !validatePhoneNumber(updateData.phoneNumber)) {
    errors.push('El número de teléfono no es válido');
  }

  if (updateData.consultationFee && updateData.consultationFee <= 0) {
    errors.push('La tarifa de consulta debe ser un número positivo');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
