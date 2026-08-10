import React from 'react';
import { Mic, Headphones, Radio } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Podcast = () => {
  const { theme } = useTheme();
  return (
    <div className={`min-h-screen pt-24 ${
      theme === 'light' ? 'bg-gradient-to-b from-white via-gray-50 to-white' : 'bg-black'
    }`}>
      <div className="container mx-auto px-4 py-16">
        <span className="font-mono-lab text-xs text-cyan-400 tracking-[0.3em] uppercase">// Podcast</span>
        <h1 className={`font-display text-5xl md:text-6xl font-bold mt-2 mb-4 tracking-tight ${
          theme === 'light' ? 'text-slate-900' : 'text-white'
        }`}>
          Nexora Lab <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">Podcast</span>
        </h1>
        <p className={`mb-8 text-lg max-w-2xl ${
          theme === 'light' ? 'text-slate-600' : 'text-slate-300'
        }`}>Conversazioni settimanali con trader, creator, fondatori. Storie operative, errori reali e lezioni applicabili.</p>
        <div className="space-y-6">
          {[1,2,3,4].map(i => (
            <div key={i} className={`rounded-lg p-6 flex items-center gap-6 ${
              theme === 'light'
                ? 'bg-white border-2 border-gray-200 shadow-lg'
                : 'bg-gradient-to-b from-gray-900 to-black border border-blue-800/30'
            }`}>
              <Mic className="w-10 h-10 text-cyan-400" />
              <div className="flex-1">
                <span className="font-mono-lab text-xs text-cyan-500 tracking-widest uppercase">// EP {String(i).padStart(2,'0')}</span>
                <h3 className={`font-display text-xl font-semibold mt-1 mb-1 tracking-tight ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}>Inside the Lab — Conversazione {i}</h3>
                <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>Durata 45 min</p>
              </div>
              <button className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-display font-semibold transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-blue-500/20">Ascolta →</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Podcast;
