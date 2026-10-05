// Controlador del chat de IA para médicos
// Maneja las solicitudes HTTP del endpoint de function calling

// Solo estos status del servicio (límite de uso / alta demanda de Gemini) se propagan al cliente;
// cualquier otro valor se devuelve como 500.
const PROPAGATED_ERROR_STATUS = [429, 503];

const httpStatusFor = (error) => (PROPAGATED_ERROR_STATUS.includes(error?.status) ? error.status : 500);

export class MedicoChatController {
  constructor(medicoChatService) {
    this.medicoChatService = medicoChatService;
  }

  async chat(req, res) {
    try {
      const { conversationId, mensaje } = req.body || {};

      if (!conversationId || !mensaje) {
        return res.status(400).json({
          success: false,
          message: 'conversationId y mensaje son requeridos'
        });
      }

      const resultado = await this.medicoChatService.procesarMensaje(conversationId, mensaje);

      res.status(200).json({ success: true, data: resultado });
    } catch (error) {
      console.error('medico-chat-controller.chat error:', error);
      res.status(httpStatusFor(error)).json({ success: false, message: error.message });
    }
  }

  async confirmar(req, res) {
    try {
      const { conversationId, accion, parametros } = req.body || {};

      if (!conversationId || !accion || !parametros) {
        return res.status(400).json({
          success: false,
          message: 'conversationId, accion y parametros son requeridos'
        });
      }

      const perfilProfesional = req.perfil_profesional;

      if (!perfilProfesional?.id) {
        return res.status(400).json({
          success: false,
          message: 'No se encontró el perfil profesional del médico autenticado'
        });
      }

      const resultado = await this.medicoChatService.confirmarAccion(conversationId, accion, parametros, perfilProfesional);

      res.status(200).json({ success: true, data: resultado });
    } catch (error) {
      console.error('medico-chat-controller.confirmar error:', error);
      res.status(httpStatusFor(error)).json({ success: false, message: error.message });
    }
  }
}
