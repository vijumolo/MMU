import fs from 'fs';
import { PDFExtract } from 'pdf.js-extract';

const extract = new PDFExtract();
extract.extract('../Diplomas/DIPLOMAS UNISANGIL.pdf', {}, (err, data) => {
    if (err) return console.log(err);
    const jsonData = JSON.parse(fs.readFileSync('./public/data.json'));
    let mappedCount = 0;
    
    const nameMap = new Map();
    jsonData.forEach(r => {
        // Normalize name: uppercase, remove accents, trim
        if (r.nombre) {
            const norm = r.nombre.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
            nameMap.set(norm, r);
        }
    });

    data.pages.forEach((page, index) => {
        const pageText = page.content.map(c => c.str).join(' ').toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        // Find which athlete's name is contained in the page text
        let matched = false;
        for (const [normName, athlete] of nameMap.entries()) {
            // Some names might have multiple spaces, let's just do a simple includes
            if (pageText.includes(normName)) {
                athlete.diplomaPage = index + 1;
                mappedCount++;
                matched = true;
                break;
            }
        }
        
        if (!matched) {
            // Try matching parts of the name if full name didn't match
            // Very rarely needed if exact matches work.
        }
    });
    
    fs.writeFileSync('./public/data.json', JSON.stringify(jsonData, null, 2));
    console.log('Mapped ' + mappedCount + ' pages!');
});
