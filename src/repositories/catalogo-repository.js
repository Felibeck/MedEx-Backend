// Repositorio de Catálogos
// Gestión de datos de tablas catálogo (referencia) para la conexión con Supabase.

export class CatalogoRepository {
  constructor(database) {
    this.db = database;
  }

  async getTiposEstudio() {
    const { data, error } = await this.db
      .from('tipos_estudio')
      .select('id, nombre')
      .order('nombre', { ascending: true });

    if (error) {
      throw new Error(`Error al obtener tipos de estudio: ${error.message}`);
    }

    return data || [];
  }
}
