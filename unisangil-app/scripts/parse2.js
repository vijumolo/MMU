import fs from 'fs';
import PDFParser from 'pdf2json';

const pdfParser = new PDFParser(this, 1); // 1 = text parsing

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
pdfParser.on("pdfParser_dataReady", pdfData => {
    const rawText = pdfParser.getRawTextContent();
    fs.writeFileSync('./raw_results.txt', rawText);
    console.log("Extracted text saved to raw_results.txt");
});

pdfParser.loadPDF('../Resultados/LLEGADA POR CATEGORIAS UNISANGIL 2026.pdf');
