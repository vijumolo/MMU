const fs = require('fs');
const pdf = require('pdf-parse');

async function parseResults() {
  try {
    const dataBuffer = fs.readFileSync('../Resultados/LLEGADA POR CATEGORIAS UNISANGIL 2026.pdf');
    const data = await pdf(dataBuffer);
    console.log(data.text.substring(0, 1500));
  } catch(e) {
    console.error(e);
  }
}

parseResults();
