import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./pdf_data.json'));

let results = [];
let currentCategory = 'GENERAL';
let currentGender = 'Hombres';

const isCategory = (line) => /^(21 K|10 K|5 K) [A-Z0-9 ]+$/.test(line);
const isGender = (line) => line === 'Hombres' || line === 'Damas';

data.Pages.forEach(page => {
    const linesObj = {};
    page.Texts.forEach(t => {
        const y = Math.round(t.y * 10);
        if (!linesObj[y]) linesObj[y] = [];
        linesObj[y].push(t);
    });
    
    const sortedYs = Object.keys(linesObj).sort((a,b) => Number(a) - Number(b));
    sortedYs.forEach(y => {
        const lineTexts = linesObj[y].sort((a,b) => a.x - b.x);
        
        // If there's only 1 or 2 text elements and it starts near x=0.45, it might be Category/Gender
        const fullText = lineTexts.map(t => decodeURIComponent(t.R[0].T)).join(' ').trim();
        
        if (isCategory(fullText)) {
            currentCategory = fullText;
        } else if (isGender(fullText)) {
            currentGender = fullText;
        } else {
            // Check if this looks like a record (has Posicion and Tiempo)
            const posMatch = fullText.match(/^(\d+|DSQ)\.?/);
            const timeMatch = fullText.match(/(\d{1,2}:\d{2}:\d{2}|--)/);
            
            if (posMatch && timeMatch && lineTexts.length > 3) {
                // Extract using X coordinates
                let pos = '', dorsal = '', nombre = '', club = '', tiempo = '';
                
                lineTexts.forEach(t => {
                    const text = decodeURIComponent(t.R[0].T).trim();
                    if (!text) return;
                    
                    if (t.x < 2) {
                        pos = text.replace('.', '');
                    } else if (t.x >= 2 && t.x < 6) {
                        dorsal = text;
                    } else if (t.x >= 6 && t.x < 17.5) {
                        nombre += (nombre ? ' ' : '') + text;
                    } else if (t.x >= 17.5 && t.x < 23) {
                        club += (club ? ' ' : '') + text;
                    } else if (t.x >= 23 && t.x < 27) {
                        if (!tiempo) tiempo = text; // Take the first matching column for time
                    }
                });
                
                if (pos && dorsal && nombre) {
                    results.push({
                        posicion: pos === 'DSQ' ? 999 : parseInt(pos), // 999 for DSQ or however you want
                        dorsal,
                        nombre,
                        club,
                        tiempo,
                        categoria: currentCategory,
                        gender: currentGender,
                        diplomaPage: 1 // We'll map this later
                    });
                }
            }
        }
    });
});

fs.writeFileSync('./public/data.json', JSON.stringify(results, null, 2));
console.log('Parsed ' + results.length + ' records. Saved to data.json');

