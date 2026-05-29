// Configuración de Base de Datos
// Este archivo contiene la configuración para conectarse a la base de datos

const DATABASE_CONFIG = {
  development: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'medex_dev',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password'
  },
  production: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  }
};

export const getConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return DATABASE_CONFIG[env];
};

export default DATABASE_CONFIG;
