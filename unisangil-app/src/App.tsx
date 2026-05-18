import { useState, useEffect } from 'react';
import { Search, Trophy, Users, FileText, Medal, ChevronDown } from 'lucide-react';
import './index.css';

type Result = {
  posicion: number;
  dorsal: string;
  nombre: string;
  club: string;
  tiempo: string;
  categoria: string;
  gender: string;
  diplomaPage?: number;
};

export default function App() {
  const [results, setResults] = useState<Result[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState('ALL');
  const [filterGender, setFilterGender] = useState('ALL');

  useEffect(() => {
    fetch('/data.json')
      .then(res => res.json())
      .then(data => setResults(data))
      .catch(err => console.error('Error loading data:', err));
  }, []);

  const categories = ['ALL', ...new Set(results.map(r => r.categoria))].sort();

  const filteredResults = results.filter(r => {
    const matchesSearch = 
      r.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.dorsal.includes(searchTerm) || 
      r.club.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = filterCat === 'ALL' || r.categoria === filterCat;
    const matchesGender = filterGender === 'ALL' || r.gender === filterGender;
    return matchesSearch && matchesCat && matchesGender;
  });

  // Agrupar por Categoría -> Género
  const groupedData: Record<string, Record<string, Result[]>> = {};
  
  filteredResults.forEach(r => {
    if (!groupedData[r.categoria]) groupedData[r.categoria] = {};
    if (!groupedData[r.categoria][r.gender]) groupedData[r.categoria][r.gender] = [];
    groupedData[r.categoria][r.gender].push(r);
  });

  const handleDownloadDiploma = (page: number | undefined) => {
    const targetPage = page || 1;
    window.open(`/diplomas.pdf#page=${targetPage}`, '_blank');
  };

  const renderPositionBadge = (pos: number) => {
    if (pos === 1) return <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 text-black font-bold shadow-[0_0_10px_rgba(250,204,21,0.5)]">{pos}</span>;
    if (pos === 2) return <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 text-black font-bold shadow-[0_0_10px_rgba(148,163,184,0.5)]">{pos}</span>;
    if (pos === 3) return <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-white font-bold shadow-[0_0_10px_rgba(180,83,9,0.5)]">{pos}</span>;
    return <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-black/50 border border-white/10 text-white font-medium">{pos}</span>;
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-transparent">
      {/* Premium Header */}
      <header className="glass-panel sticky top-0 z-50 rounded-none border-t-0 border-l-0 border-r-0 shadow-md">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[hsl(var(--accent-cyan))] to-transparent opacity-80"></div>
        <div className="container p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/60 border border-blue-500/30 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <Trophy className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl m-0 text-gradient font-bold drop-shadow-sm">UNISANGIL 2026</h1>
              <p className="text-xs text-slate-500 m-0 tracking-widest uppercase">Llegada por Categorías</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container p-4 lg:p-8 animate-fade-in z-10 max-w-7xl">
        
        {/* Search & Filters */}
        <section className="glass-panel p-4 mb-8 animate-slide-up flex flex-col md:flex-row gap-4 items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-blue-100/50 to-transparent pointer-events-none"></div>
          
          <div className="form-group flex-1 mb-0 w-full relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600" />
            <input 
              type="text" 
              placeholder="Buscar por placa, nombre o ciudad..." 
              className="form-control pl-12 text-lg py-3 bg-white/60 border-blue-500/30 focus:border-blue-600 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] text-slate-800"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="form-group mb-0 w-full md:w-48 relative">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <select 
              className="form-control pl-12 py-3 bg-white/60 border-black/10 text-slate-800"
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
            >
              <option value="ALL">Ambos Géneros</option>
              <option value="Hombres">Hombres</option>
              <option value="Damas">Damas</option>
            </select>
          </div>

          <div className="form-group mb-0 w-full md:w-64 relative">
            <Trophy className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <select 
              className="form-control pl-12 py-3 bg-white/60 border-black/10 text-slate-800"
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === 'ALL' ? 'Todas las Categorías' : cat}</option>
              ))}
            </select>
          </div>
        </section>

        {/* Results Tables */}
        <section className="animate-slide-up delay-100 pb-12">
          {Object.keys(groupedData).length > 0 ? (
            <div className="space-y-10">
              {Object.keys(groupedData).sort().map((categoria) => (
                <div key={categoria} className="glass-panel overflow-hidden border border-black/5 shadow-xl">
                  {/* Category Header */}
                  <div className="bg-gradient-to-r from-blue-100/80 to-transparent p-4 border-b border-blue-200 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-800 tracking-wide uppercase flex items-center gap-3">
                      <ChevronDown className="w-5 h-5 text-blue-600" />
                      {categoria}
                    </h2>
                  </div>

                  {Object.keys(groupedData[categoria]).sort().map((gender) => (
                    <div key={gender} className="mb-4">
                      {/* Gender Header */}
                      <div className="bg-white/80 px-6 py-3 border-b border-black/5">
                        <h3 className="text-lg font-semibold text-blue-600 uppercase tracking-widest">{gender}</h3>
                      </div>
                      
                      {/* Premium Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                          <thead>
                            <tr className="bg-black/5 border-b border-black/10 text-xs uppercase tracking-wider text-slate-500">
                              <th className="p-4 font-medium">Puesto</th>
                              <th className="p-4 font-medium">Placa</th>
                              <th className="p-4 font-medium w-full">Nombre</th>
                              <th className="p-4 font-medium">Ciudad</th>
                              <th className="p-4 font-medium">Tiempo Chip</th>
                              <th className="p-4 font-medium text-center">Diploma</th>
                            </tr>
                          </thead>
                          <tbody>
                            {groupedData[categoria][gender].sort((a,b) => a.posicion - b.posicion).map((r, i) => (
                              <tr 
                                key={r.dorsal + i} 
                                className="border-b border-black/5 hover:bg-blue-50/50 transition-colors group"
                              >
                                <td className="p-4">{renderPositionBadge(r.posicion)}</td>
                                <td className="p-4 font-mono text-blue-600 font-medium">{r.dorsal}</td>
                                <td className="p-4 text-slate-800 font-medium group-hover:text-blue-700 transition-colors">{r.nombre}</td>
                                <td className="p-4 text-slate-500">{r.club}</td>
                                <td className="p-4 text-amber-600 font-mono font-bold">{r.tiempo}</td>
                                <td className="p-4 text-center">
                                  <button 
                                    onClick={() => handleDownloadDiploma(r.diplomaPage)}
                                    className="p-2 rounded bg-black/5 hover:bg-blue-100 text-blue-600 hover:text-blue-800 border border-transparent hover:border-blue-300 transition-all"
                                    title="Ver Diploma"
                                  >
                                    <FileText className="w-5 h-5 mx-auto" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel p-10 text-center border-dashed border-black/10">
              <Medal className="w-12 h-12 text-slate-400 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl text-slate-800 mb-2">No se encontraron resultados</h3>
              <p className="text-slate-500">Intenta ajustando los filtros o escribiendo de otra forma.</p>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="glass-panel mt-auto rounded-none border-b-0 border-l-0 border-r-0 relative z-10 text-center p-6">
         <p className="text-slate-500 text-sm">© 2026 UNISANGIL. Todos los derechos reservados.</p>
         <p className="text-xs text-slate-400 mt-1">Plataforma Oficial de Resultados | Diseño Avanzado</p>
      </footer>
    </div>
  );
}
