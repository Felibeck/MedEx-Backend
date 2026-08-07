import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class AuthService {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  async login(email, password) {
    if (!email || !password) {
      throw new Error('Email y contraseña son requeridos');
    }

    const user = await this.authRepository.loginByEmail(email);
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    const match = await bcrypt.compare(password, user.password_hash || '');
    if (!match) {
      throw new Error('Credenciales inválidas');
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET no configurado en el entorno');
    }

    const token = jwt.sign(
      { id: user.id, es_medico: user.es_medico },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRATION || '1h' }
    );

    const publicUser = {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      es_medico: user.es_medico,
      role: user.es_medico ? 'medico' : 'paciente',
      perfil_profesional_id: user.perfil_profesional?.id || null,
      organizacion_id: user.perfil_profesional?.organizacion_id || null,
      matricula: user.perfil_profesional?.matricula || null,
      especialidad_medica: user.perfil_profesional?.especialidad_medica || null
    };

    return { user: publicUser, token };
  }

  async logout(token) {
    if (!token) {
      throw new Error('Token de autorización requerido');
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET no configurado en el entorno');
    }

    try {
      jwt.verify(token, jwtSecret);
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }

    return { message: 'Logout exitoso' };
  }
}
