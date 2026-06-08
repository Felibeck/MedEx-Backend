import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const { data, error } = await supabase
  .from('information_schema.columns')
  .select('column_name, is_nullable, data_type')
  .eq('table_name', 'consulta');

if (error) {
  console.error('ERROR', error);
  process.exit(1);
}
console.log(JSON.stringify(data, null, 2));
