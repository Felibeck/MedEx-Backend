import supabase from '../src/configs/database.js';

async function check() {
  try {
    console.log('Consultando tabla perfiles_paciente...');
    const res = await supabase.from('perfiles_paciente').select('id, identidad_genero').limit(1);
    console.log('Respuesta:', JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('Error al consultar supabase:', err);
  }
}

check();
