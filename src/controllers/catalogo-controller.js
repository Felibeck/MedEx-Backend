// Controlador de Catálogos
// Maneja las solicitudes HTTP relacionadas con tablas catálogo (referencia)

export class CatalogoController {
  constructor(catalogoService) {
    this.catalogoService = catalogoService;
  }

  // Listar tipos de estudio disponibles
  async getTiposEstudio(req, res) {
    try {
      const tiposEstudio = await this.catalogoService.getTiposEstudio();

      res.status(200).json({
        success: true,
        data: tiposEstudio
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}
