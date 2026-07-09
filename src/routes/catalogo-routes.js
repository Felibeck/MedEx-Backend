// Rutas de Catálogos
// Define los endpoints de tablas catálogo (referencia) para poblar selects del frontend

import express from 'express';

export const createCatalogoRoutes = (catalogoController) => {
  const router = express.Router();

  // Listar tipos de estudio disponibles
  router.get('/tipos-estudio', (req, res) => catalogoController.getTiposEstudio(req, res));

  return router;
};
