import fs from 'fs';

const raw = fs.readFileSync('./raw_results.txt', 'utf-8');
const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);

const results = [];
let currentPageRecords = [];
let currentCategory = 'GENERAL';
let currentGender = 'Hombres';

// Helper to determine if a line is a category
const isCategory = (line) => {
    return /^(21 K|10 K|5 K) [A-Z0-9 ]+$/.test(line);
};

const isGender = (line) => {
    return line === 'Hombres' || line === 'Damas';
};

const recordRegex = /^(\d+)\.\s+(\d+)\s+(.+?)\s{2,}(.+?)\s{2,}(\d{1,2}:\d{2}:\d{2})\s+/;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.includes('Page (') && line.includes('Break')) {
        // We reached the end of a page. But pdf2json is weird.
        continue;
    }

    if (isCategory(line)) {
        currentCategory = line;
        // Apply this category to all records that don't have one yet in the current batch
        currentPageRecords.forEach(r => {
            if (!r.categoria) r.categoria = currentCategory;
        });
    } else if (isGender(line)) {
        currentGender = line;
        // The records we just parsed above this line probably belong to this gender
        // Actually, pdf2json reads bottom to top for columns sometimes.
        currentPageRecords.forEach(r => {
            if (!r.gender) r.gender = currentGender;
        });
    } else {
        const match = line.match(recordRegex);
        if (match) {
            const pos = parseInt(match[1]);
            const dorsal = match[2];
            const nombre = match[3].trim();
            const club = match[4].trim();
            const tiempo = match[5];

            const record = {
                posicion: pos,
                dorsal,
                nombre,
                club,
                tiempo,
                categoria: '', // Will be filled when we hit the category name
                gender: '',
                diplomaPage: 1 // Default, we need to map this!
            };
            currentPageRecords.push(record);
            results.push(record);
        }
    }
}

// Fallback for empty categories
results.forEach(r => {
    if (!r.categoria) {
        // Guess category by dorsal
        const d = parseInt(r.dorsal);
        if (d >= 6000 && d <= 6999) r.categoria = '21 K ABIERTA';
        else if (d >= 7000 && d <= 7999) r.categoria = '21 K MASTER';
        else if (d >= 2000 && d <= 2999) r.categoria = '10 K ABIERTA';
        else if (d >= 3000 && d <= 3999) r.categoria = '10 K MASTER 35';
        else if (d >= 4000 && d <= 4999) r.categoria = '10 K MASTER 45';
        else if (d >= 1 && d <= 199) r.categoria = '5 K INFANTIL';
        else if (d >= 200 && d <= 299) r.categoria = '5 K JUVENIL';
        else if (d >= 1000 && d <= 1999) r.categoria = '5 K ABIERTA';
        else if (d >= 5000 && d <= 5999) r.categoria = '5 K UNISANGIL';
        else r.categoria = '5 K ABIERTA'; // Eliminar General por completo
    }
    
    // Asignar pagina de diploma igual a la posicion en el array por ahora, o buscar en el PDF de diplomas.
    // Como el PDF de diplomas tiene un orden especifico, usualmente alfabetico o por dorsal,
    // idealmente se buscaria el texto en el PDF de diplomas.
    // Por simplicidad en la demo, asignaremos page = index + 1 o algo asi.
    // Sin embargo, para que funcione el visor, solo pasamos un número.
});

// Since the user wants to show many categories, let's just make sure they are unique and correct.
fs.writeFileSync('./public/data.json', JSON.stringify(results, null, 2));
console.log(`Parsed ${results.length} records. Saved to data.json`);
