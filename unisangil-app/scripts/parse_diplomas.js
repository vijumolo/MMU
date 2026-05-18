import fs from 'fs';
import PDFParser from 'pdf2json';

const pdfParser = new PDFParser(this, 1); // 1 = text parsing

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
pdfParser.on("pdfParser_dataReady", pdfData => {
    // Only get the text for the first 10 pages to understand structure
    const rawText = pdfParser.getRawTextContent();
    const firstPages = rawText.split('----------------Page (').slice(0, 5).join('----------------Page (');
    fs.writeFileSync('./diplomas_sample.txt', firstPages);
    console.log("Extracted text saved to diplomas_sample.txt");
});

pdfParser.loadPDF('../Diplomas/DIPLOMAS UNISANGIL.pdf');
