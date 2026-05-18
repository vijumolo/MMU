const fs = require('fs');
const pdf = require('pdf-parse');

async function extract() {
  try {
    const dataBuffer = fs.readFileSync('../Resultados/LLEGADA POR CATEGORIAS UNISANGIL 2026.pdf');
    const data = await pdf(dataBuffer);
    fs.writeFileSync('./raw_results.txt', data.text);
    console.log('Done!');
  } catch(e) {
    console.error(e);
  }
}
extract();
