// Servicio de Catálogos
// Contiene la lógica de negocio para datos de catálogo (tablas de referencia)

export class CatalogoService {
  constructor(catalogoRepository) {
    this.catalogoRepository = catalogoRepository;
  }

  async getTiposEstudio() {
    return await this.catalogoRepository.getTiposEstudio();
  }
}
