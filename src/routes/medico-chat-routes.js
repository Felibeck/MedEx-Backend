// Rutas del chat de IA para médicos
// Define los endpoints de function calling sobre acciones del sistema

import express from 'express';
import { requireMedico } from '../middlewares/require-medico.js';

export const createMedicoChatRoutes = (medicoChatController) => {
  const router = express.Router();

  router.post('/chat', requireMedico, (req, res) => medicoChatController.chat(req, res));
  router.post('/chat/confirmar', requireMedico, (req, res) => medicoChatController.confirmar(req, res));

  return router;
};
