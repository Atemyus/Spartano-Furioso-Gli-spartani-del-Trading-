import React from 'react';
import { DollarSign, Users, Gift } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Affiliazione = () => {
  const { theme } = useTheme();
  return (
    <div className={`min-h-screen pt-24 ${
      theme === 'light' ? 'bg-gradient-to-b from-white via-gray-50 to-white' : 'bg-black'
    }`}>
      <div className="container mx-auto px-4 py-16">
        <span className="font-mono-lab text-xs text-cyan-400 tracking-[0.3em] uppercase">// Affiliate</span>
        <h1 className={`font-display text-5xl md:text-6xl font-bold mt-2 mb-4 tracking-tight ${
          theme === 'light' ? 'text-slate-900' : 'text-white'
        }`}>
          Programma <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">affiliazione</span>
        </h1>
        <p className={`mb-12 text-lg max-w-2xl ${
          theme === 'light' ? 'text-slate-600' : 'text-slate-300'
        }`}>Trasforma la tua audience in entrate ricorrenti: commissioni trasparenti, asset di marketing pronti, dashboard di tracking real-time.</p>
        <div className="grid md:grid-cols-3 gap-8">
          <div className={`rounded-lg p-6 ${
            theme === 'light'
              ? 'bg-white border-2 border-gray-200 shadow-lg'
              : 'bg-gradient-to-b from-gray-900 to-black border border-blue-800/30'
          }`}>
            <DollarSign className="w-9 h-9 text-cyan-400 mb-3" />
            <span className="font-mono-lab text-xs text-cyan-500 tracking-widest uppercase">// 01</span>
            <h3 className={`font-display text-xl font-semibold mt-1 mb-2 tracking-tight ${
              theme === 'light' ? 'text-slate-900' : 'text-white'
            }`}>Commissioni alte</h3>
            <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>Fino al 50% di commissione ricorrente, pagamenti mensili.</p>
          </div>
          <div className={`rounded-lg p-6 ${
            theme === 'light'
              ? 'bg-white border-2 border-gray-200 shadow-lg'
              : 'bg-gradient-to-b from-gray-900 to-black border border-blue-800/30'
          }`}>
            <Users className="w-9 h-9 text-cyan-400 mb-3" />
            <span className="font-mono-lab text-xs text-cyan-500 tracking-widest uppercase">// 02</span>
            <h3 className={`font-display text-xl font-semibold mt-1 mb-2 tracking-tight ${
              theme === 'light' ? 'text-slate-900' : 'text-white'
            }`}>Supporto dedicato</h3>
            <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>Affiliate manager, asset di marketing, deeplink personalizzati.</p>
          </div>
          <div className={`rounded-lg p-6 ${
            theme === 'light'
              ? 'bg-white border-2 border-gray-200 shadow-lg'
              : 'bg-gradient-to-b from-gray-900 to-black border border-blue-800/30'
          }`}>
            <Gift className="w-9 h-9 text-cyan-400 mb-3" />
            <span className="font-mono-lab text-xs text-cyan-500 tracking-widest uppercase">// 03</span>
            <h3 className={`font-display text-xl font-semibold mt-1 mb-2 tracking-tight ${
              theme === 'light' ? 'text-slate-900' : 'text-white'
            }`}>Bonus e premi</h3>
            <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>Incentivi extra e accesso anticipato per i top performer del programma.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Affiliazione;
