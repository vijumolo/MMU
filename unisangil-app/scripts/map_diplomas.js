import fs from 'fs';
import PDFParser from 'pdf2json';

const pdfParser = new PDFParser(this, 1);

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
pdfParser.on("pdfParser_dataReady", pdfData => {
    const rawText = pdfParser.getRawTextContent();
    const pages = rawText.split(/----------------Page \(\d+\) Break----------------/);
    
    // Create map from dorsal to page number (1-indexed)
    const dorsalToPage = {};

    pages.forEach((pageText, index) => {
        // Regex to match "DORSAL No.DORSAL No. X" or similar
        const match = pageText.match(/DORSAL No\.?DORSAL No\.?\s*(\d+)/);
        if (match) {
            const dorsal = match[1];
            dorsalToPage[dorsal] = index + 1;
        } else {
            // Sometimes pdf2json might jumble it, let's just look for DORSAL No. \d+
            const match2 = pageText.match(/DORSAL No\.\s*(\d+)/);
            if (match2) {
                 dorsalToPage[match2[1]] = index + 1;
            }
        }
    });

    console.log(`Mapped ${Object.keys(dorsalToPage).length} dorsals to pages.`);

    // Update data.json
    const dataPath = './public/data.json';
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    
    data.forEach(r => {
        if (dorsalToPage[r.dorsal]) {
            r.diplomaPage = dorsalToPage[r.dorsal];
        } else {
            r.diplomaPage = 1; // Fallback
        }
    });

    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    console.log('data.json updated with correct diploma pages!');
});

console.log('Loading diplomas PDF...');
pdfParser.loadPDF('../Diplomas/DIPLOMAS UNISANGIL.pdf');
