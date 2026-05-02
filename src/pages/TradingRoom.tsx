import React from 'react';
import { Users, Headphones, BarChart2, Video, MessageSquare, Clock, TrendingUp, Bell, Shield } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const TradingRoom = () => {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen pt-24 transition-colors duration-500 ${
      theme === 'dark' ? 'bg-black' : 'bg-white'
    }`}>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <span className="font-mono-lab text-xs text-cyan-400 tracking-[0.3em] uppercase">// Trading Room</span>
          <h1 className={`font-display text-5xl md:text-6xl font-bold mt-2 mb-4 tracking-tight ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}>
            La <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">sala operativa</span>
          </h1>
          <p className={`text-lg md:text-xl max-w-3xl mx-auto leading-relaxed ${
            theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Sessioni live, analisi in tempo reale e supporto operativo continuo. Una community
            di trader e analisti che condivide setup, watchlist e decisioni in diretta.
          </p>
        </div>

        {/* Hero Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Membri attivi', value: '2,500+', icon: Users },
            { label: 'Sessioni / settimana', value: '15+', icon: Video },
            { label: 'Segnali / giorno', value: '10-20', icon: Bell },
            { label: 'Lab support', value: '24/7', icon: Clock }
          ].map((stat, i) => (
            <div key={i} className={`rounded-lg p-4 text-center border transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-gradient-to-b from-gray-900 to-black border-blue-800/30'
                : 'bg-white border-blue-200 shadow-md'
            }`}>
              <stat.icon className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
              <div className={`text-2xl font-black ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>{stat.value}</div>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Main Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className={`rounded-lg p-8 border hover:scale-105 transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-gradient-to-b from-gray-900 to-black border-blue-800/30 hover:border-cyan-500/50'
              : 'bg-white border-blue-200 hover:border-cyan-400 shadow-md hover:shadow-xl'
          }`}>
            <Users className="w-10 h-10 text-cyan-400 mb-4" />
            <span className="font-mono-lab text-xs text-cyan-500 tracking-widest uppercase">// 01 Community</span>
            <h3 className={`font-display text-2xl font-semibold mt-1 mb-3 tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>Community Pro</h3>
            <p className={`mb-4 text-sm leading-relaxed ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Canali Discord e Telegram dedicati con moderatori esperti, mentor verificati
              e una community che condivide setup, watchlist e analisi.
            </p>
            <ul className={`space-y-2 text-sm ${
              theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
            }`}>
              <li>· Canali tematici per ogni asset</li>
              <li>· Mentorship 1-on-1 disponibile</li>
              <li>· Network di trader e analisti</li>
            </ul>
          </div>
          <div className={`rounded-lg p-8 border hover:scale-105 transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-gradient-to-b from-gray-900 to-black border-blue-800/30 hover:border-cyan-500/50'
              : 'bg-white border-blue-200 hover:border-cyan-400 shadow-md hover:shadow-xl'
          }`}>
            <Headphones className="w-10 h-10 text-cyan-400 mb-4" />
            <span className="font-mono-lab text-xs text-cyan-500 tracking-widest uppercase">// 02 Live</span>
            <h3 className={`font-display text-2xl font-semibold mt-1 mb-3 tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>Sessioni live</h3>
            <p className={`mb-4 text-sm leading-relaxed ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Streaming video privati ogni giorno: analisi pre-market, operatività in diretta,
              Q&amp;A e review settimanali delle performance.
            </p>
            <ul className={`space-y-2 text-sm ${
              theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
            }`}>
              <li>· Live operativo ogni mattina</li>
              <li>· Analisi tecnica approfondita</li>
              <li>· Replay disponibili 24/7</li>
            </ul>
          </div>
          <div className={`rounded-lg p-8 border hover:scale-105 transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-gradient-to-b from-gray-900 to-black border-blue-800/30 hover:border-cyan-500/50'
              : 'bg-white border-blue-200 hover:border-cyan-400 shadow-md hover:shadow-xl'
          }`}>
            <BarChart2 className="w-10 h-10 text-cyan-400 mb-4" />
            <span className="font-mono-lab text-xs text-cyan-500 tracking-widest uppercase">// 03 Analisi</span>
            <h3 className={`font-display text-2xl font-semibold mt-1 mb-3 tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>Analisi Pro</h3>
            <p className={`mb-4 text-sm leading-relaxed ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Setup giornalieri, livelli chiave, report settimanali e analisi macro.
              Tutto quello che serve per operare con metodo e dati.
            </p>
            <ul className={`space-y-2 text-sm ${
              theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
            }`}>
              <li>· Report pre / post mercato</li>
              <li>· Livelli supporto / resistenza</li>
              <li>· Calendario economico commentato</li>
            </ul>
          </div>
        </div>

        {/* Additional Features */}
        <div className={`rounded-2xl p-8 border mb-12 ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-blue-950/50 via-black/50 to-blue-950/50 backdrop-blur-sm border-blue-800/30'
            : 'bg-gradient-to-r from-blue-50 via-white to-blue-50 border-blue-200 shadow-lg'
        }`}>
          <h2 className={`font-display text-3xl font-semibold mb-6 text-center tracking-tight ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}>Cosa è incluso</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: MessageSquare, title: 'Chat Telegram premium', desc: 'Segnali e discussioni in tempo reale' },
              { icon: Video, title: 'Webinar settimanali', desc: 'Formazione continua con trader e analisti' },
              { icon: TrendingUp, title: 'Watchlist condivise', desc: 'Asset monitorati dal team di analisti' },
              { icon: Shield, title: 'Risk management', desc: 'Tool e calcolatori per gestire il rischio' }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <item.icon className="w-8 h-8 text-cyan-500 flex-shrink-0" />
                <div>
                  <h4 className={`text-lg font-bold mb-1 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>{item.title}</h4>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-10 text-center">
          <span className="font-mono-lab text-xs text-white/70 tracking-[0.3em] uppercase">// Join now</span>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-white mt-2 mb-3 tracking-tight">Entra nella Trading Room</h2>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">Operatività live e community di trader che condividono setup reali.</p>
          <button className="px-7 py-3 bg-white text-blue-600 rounded-lg font-display font-semibold transition-all duration-300 hover:-translate-y-0.5 shadow-lg">
            Accedi alla room →
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradingRoom;

