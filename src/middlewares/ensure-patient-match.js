// Valida que el id del parámetro de ruta coincida con el paciente autenticado
export const ensurePatientMatch = (req, res, next) => {
  const paramId = req.params && req.params.id;
  const userId = req.user && req.user.id;

  if (!paramId) {
    return res.status(400).json({ success: false, message: 'Falta id en la ruta' });
  }

  if (!userId) {
    return res.status(401).json({ success: false, message: 'No autorizado' });
  }

  if (paramId !== userId) {
    return res.status(403).json({ success: false, message: 'Acceso denegado: id de paciente no coincide' });
  }

  next();
};
