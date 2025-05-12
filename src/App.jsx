// src/App.jsx
import React from 'react';

// Importe os componentes de gráfico
import GraficoNivelAtual from './components/GraficoNivelAtual';
import GraficoHistorico from './components/GraficoHistorico';

import './App.css'; // CSS global, se houver

// URL base da API
export const API_BASE_URL = "https://projeto-caixa-dagua-api.onrender.com";

// Configurações para os gráficos históricos
const graficosHistoricosConfig = [
  {
    key: "24h",
    titulo: "Nível (Últimas 24h)",
    endpoint: `${API_BASE_URL}/leituras/d/1`,
    alturaGrafico: 280,
  },
  
  {
    key: "7d",
    titulo: "Nível (Últimos 7 Dias)",
    endpoint: `${API_BASE_URL}/leituras/d/7`,
    alturaGrafico: 280,
  },
  
  {
    key: "30d",
    titulo: "Nível (Últimos 30 Dias)",
    endpoint: `${API_BASE_URL}/leituras/d/30`,
    alturaGrafico: 280,
  },
];

function App() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 sm:p-6 text-slate-200 font-sans bg-slate-900">
      <div className="w-full max-w-7xl">
        <header className="mb-8 sm:mb-12 text-center"> 
          
          {/* Bloco do Título e Subtítulo */}
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-md">
              Monitoramento da Caixa d'Água
            </h1>
            <p dir="rtl" className="text-lg sm:text-xl mt-2 text-slate-400">
              مراقبة خزان المياه
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 mt-6 "> 
            <img 
              src="/jvsv.jpg"
              alt="Foto de João Vitor" 
              className="w-16 h-16 rounded-full object-cover border-2"
            />
            <div className="text-left">
              <p className="text-xs text-slate-400">Desenvolvido por:</p>
              <p className="text-sm font-semibold text-slate-100">João Vítor Sgotti Veiga</p>
            </div>
          </div>
        </header>

        {/* Layout dos Gráficos em Grade 2x2 */}
        <main className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          <GraficoNivelAtual />
          {graficosHistoricosConfig.map((config) => (
            <GraficoHistorico
              key={config.key}
              titulo={config.titulo}
              endpoint={config.endpoint}
              alturaGrafico={config.alturaGrafico}
            />
          ))}
        </main>
        
        {/* Rodapé */}
        <footer className="mt-12 sm:mt-16 text-center">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} João Vítor Sgotti Veiga. Todos os direitos reservados.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;