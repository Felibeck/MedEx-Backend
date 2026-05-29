// Configuración de Supabase
// Conecta con la base de datos de Supabase usando el Service Role Key.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('Falta configurar SUPABASE_URL o SUPABASE_SERVICE_KEY en las variables de entorno.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
export default supabase;
