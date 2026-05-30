import { createClient } from '@supabase/supabase-js';

// 1. Configuramos las credenciales usando la Service Key para el backend
const SUPABASE_CONFIG = {
  development: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_SERVICE_KEY, // Clave administradora para desarrollo
  },
  production: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_SERVICE_KEY, // Clave administradora para producción
  }
};

const env = process.env.NODE_ENV || 'development';
const config = SUPABASE_CONFIG[env];

// 2. Control de errores por si te olvidás de configurar el .env
if (!config.url || !config.key) {
  throw new Error(`[Error de Configuración]: Falta configurar SUPABASE_URL o SUPABASE_SERVICE_KEY en el archivo .env para el entorno: ${env}`);
}

// 3. Creamos una única instancia de conexión para todo el proyecto
export const supabase = createClient(config.url, config.key);

export default supabase;