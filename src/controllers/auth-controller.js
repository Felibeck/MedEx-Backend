// Controlador de autenticación
// Maneja el login unificado de médicos y pacientes.

export class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  async login(req, res) {
    try {
      const { email, password } = req.body || {};

      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email y contraseña son requeridos' });
      }

      const result = await this.authService.login(email, password);

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      const status = error.message && error.message.toLowerCase().includes('credenciales') ? 401 : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }
}
