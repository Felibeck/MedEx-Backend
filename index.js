import 'dotenv/config';
import app from './src/app.js';

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

app.listen(PORT, () => {
  console.log(`MedEx Backend escuchando en http://${HOST}:${PORT}`);
});
