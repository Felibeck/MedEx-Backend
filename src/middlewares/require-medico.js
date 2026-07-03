import jwt from 'jsonwebtoken';
import supabase from '../configs/database.js';

export const requireMedico = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No autorizado' });
    }
    const token = auth.split(' ')[1];

    let usuario = null;
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return res.status(500).json({ success: false, message: 'JWT_SECRET no configurado en el servidor' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (verifyError) {
      return res.status(401).json({ success: false, message: 'Token inválido o expirado' });
    }

    if (!decoded || decoded.es_medico !== true) {
      return res.status(403).json({ success: false, message: 'Acceso restringido: requiere rol médico' });
    }

    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', decoded.id)
      .maybeSingle();

    if (error || !data) {
      return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
    }

    usuario = data;

    if (!usuario.es_medico) {
      return res.status(403).json({ success: false, message: 'Acceso restringido: requiere rol médico' });
    }

    const { data: perfilProfesional } = await supabase
      .from('perfiles_profesional')
      .select('*')
      .eq('usuario_id', usuario.id)
      .maybeSingle();

    req.user = usuario;
    req.perfil_profesional = perfilProfesional || null;
    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Error en autenticación' });
  }
};
