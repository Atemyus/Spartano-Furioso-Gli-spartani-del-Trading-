import React from 'react';
import { Handshake, Users, TrendingUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Partnership = () => {
  const { theme } = useTheme();
  return (
    <div className={`min-h-screen pt-24 ${
      theme === 'light' ? 'bg-gradient-to-b from-white via-gray-50 to-white' : 'bg-black'
    }`}>
      <div className="container mx-auto px-4 py-16">
        <span className="font-mono-lab text-xs text-cyan-400 tracking-[0.3em] uppercase">// Partnership</span>
        <h1 className={`font-display text-5xl md:text-6xl font-bold mt-2 mb-4 tracking-tight ${
          theme === 'light' ? 'text-slate-900' : 'text-white'
        }`}>
          Costruiamo qualcosa <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">insieme</span>
        </h1>
        <p className={`mb-12 text-lg max-w-2xl ${
          theme === 'light' ? 'text-slate-600' : 'text-slate-300'
        }`}>Cerchiamo partner strategici nel mondo trading, fintech, education e creator. Co-marketing, integrazioni tecniche, prodotti congiunti.</p>
        <div className="grid md:grid-cols-3 gap-8">
          <div className={`rounded-lg p-6 ${
            theme === 'light'
              ? 'bg-white border-2 border-gray-200 shadow-lg'
              : 'bg-gradient-to-b from-gray-900 to-black border border-blue-800/30'
          }`}>
            <Handshake className="w-9 h-9 text-cyan-400 mb-3" />
            <span className="font-mono-lab text-xs text-cyan-500 tracking-widest uppercase">// 01 Tech</span>
            <h3 className={`font-display text-xl font-semibold mt-1 mb-2 tracking-tight ${
              theme === 'light' ? 'text-slate-900' : 'text-white'
            }`}>Partner tecnologici</h3>
            <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>Integrazioni con broker, piattaforme di trading e tool creator.</p>
          </div>
          <div className={`rounded-lg p-6 ${
            theme === 'light'
              ? 'bg-white border-2 border-gray-200 shadow-lg'
              : 'bg-gradient-to-b from-gray-900 to-black border border-blue-800/30'
          }`}>
            <Users className="w-9 h-9 text-cyan-400 mb-3" />
            <span className="font-mono-lab text-xs text-cyan-500 tracking-widest uppercase">// 02 Education</span>
            <h3 className={`font-display text-xl font-semibold mt-1 mb-2 tracking-tight ${
              theme === 'light' ? 'text-slate-900' : 'text-white'
            }`}>Partner educativi</h3>
            <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>Co-creazione di percorsi formativi, certificazioni, masterclass.</p>
          </div>
          <div className={`rounded-lg p-6 ${
            theme === 'light'
              ? 'bg-white border-2 border-gray-200 shadow-lg'
              : 'bg-gradient-to-b from-gray-900 to-black border border-blue-800/30'
          }`}>
            <TrendingUp className="w-9 h-9 text-cyan-400 mb-3" />
            <span className="font-mono-lab text-xs text-cyan-500 tracking-widest uppercase">// 03 Business</span>
            <h3 className={`text-xl font-bold mb-2 ${
              theme === 'light' ? 'text-gray-800' : 'text-white'
            }`}>Partner commerciali</h3>
            <p className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>OpportunitÃ  di business e crescita</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Partnership;
