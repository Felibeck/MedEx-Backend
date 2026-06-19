import supabase from '../configs/database.js';

export const requireMedico = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No autorizado' });
    }
    const token = auth.split(' ')[1];

    // Intentar obtener el usuario desde Supabase Auth
    const { data: userData, error: userError } = await supabase.auth.getUser(token).catch(e => ({ error: e }));
    if (userError || !userData || !userData.user) {
      return res.status(401).json({ success: false, message: 'Token inválido' });
    }

    const email = userData.user.email;
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (usuarioError || !usuario) {
      return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
    }

    if (!usuario.es_medico) {
      return res.status(403).json({ success: false, message: 'Acceso restringido: requiere rol médico' });
    }

    // Obtener perfiles_profesional asociado (si existe)
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
