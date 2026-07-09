import jwt from 'jsonwebtoken';
import { loginPatient } from '../../api/patientAuth'
import supabase from '../configs/database.js';

export const requirePaciente = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No autorizado' });
    }
    const token = auth.split(' ')[1];

    // 1. Validar el token localmente con tu JWT_SECRET
    // (El mismo que usas en PatientService)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 2. Validación de Rol directa desde el contenido del Token
    // Al loguearse guardaste { id: user.id, es_medico: user.es_medico } en el payload
    if (decoded.es_medico) {
      return res.status(403).json({ success: false, message: 'Acceso restringido: requiere rol paciente' });
    }

    // 3. Buscar los datos completos del usuario en la tabla por su ID
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', decoded.id)
      .maybeSingle();

    if (usuarioError || !usuario) {
      return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
    }

    // 4. Obtener el perfil del paciente
    const { data: perfilPaciente } = await supabase
      .from('perfiles_paciente') 
      .select('*')
      .eq('usuario_id', usuario.id)
      .maybeSingle();

    req.user = usuario;
    req.perfil_paciente = perfilPaciente || null;
    
    next();
  } catch (err) {
    console.error(err);
    // Si jwt.verify falla (token expirado o manipulado), saltará aquí
    return res.status(401).json({ success: false, message: 'Token inválido o expirado' });
  }
};