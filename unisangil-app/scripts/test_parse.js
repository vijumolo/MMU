import fs from 'fs';
import pdf from 'pdf-parse';

async function parseResults() {
  const dataBuffer = fs.readFileSync('../Resultados/LLEGADA POR CATEGORIAS UNISANGIL 2026.pdf');
  const data = await pdf(dataBuffer);
  console.log(data.text.substring(0, 1000));
}

parseResults().catch(console.error);
