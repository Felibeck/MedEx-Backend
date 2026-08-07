import express from 'express';

export const createAuthRoutes = (authController) => {
  const router = express.Router();

  router.post('/login', (req, res) => authController.login(req, res));
  router.post('/logout', (req, res) => authController.logout(req, res));

  return router;
};
