import React from 'react';
import { Shield, TrendingUp, Target, BarChart, Brain, Zap, Swords, Award, Lock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Strategia = () => {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen pt-24 transition-colors duration-500 ${
      theme === 'dark' ? 'bg-black' : 'bg-white'
    }`}>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <span className="font-mono-lab text-xs text-cyan-400 tracking-[0.3em] uppercase">// Strategy</span>
          <h1 className={`font-display text-5xl md:text-6xl font-bold mt-2 mb-4 tracking-tight ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}>
            Il <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">metodo</span> Nexora Lab
          </h1>
          <p className={`text-lg md:text-xl max-w-3xl mx-auto leading-relaxed ${
            theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Strategie operative testate, regole esplicite, risk management rigoroso.
            Il framework che usano i nostri trader e creator per costruire risultati ripetibili.
          </p>
        </div>

        {/* Hero Section */}
        <div className={`rounded-2xl p-8 border mb-12 ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-blue-950/50 via-black/50 to-blue-950/50 backdrop-blur-sm border-blue-800/30'
            : 'bg-gradient-to-r from-blue-50 via-white to-blue-50 border-blue-200 shadow-lg'
        }`}>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <span className="font-mono-lab text-xs text-cyan-500 tracking-widest uppercase">// Framework</span>
              <h2 className={`font-display text-2xl md:text-3xl font-semibold mt-1 mb-4 tracking-tight ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>
                Disciplina, dati, ripetibilità
              </h2>
              <p className={`leading-relaxed mb-4 ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Niente formule magiche: regole chiare, validate sui dati e applicate con rigore.
                Una metodologia che combina trading sistematico, analisi macro e gestione del rischio.
              </p>
              <ul className={`space-y-2 text-sm ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <li className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-cyan-400" />
                  <span>Strategie con win rate superiore al 70% in backtest</span>
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-cyan-400" />
                  <span>Risk management: mai più del 2% di capitale per trade</span>
                </li>
                <li className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-cyan-400" />
                  <span>Backtesting rigoroso su oltre 10 anni di dati</span>
                </li>
              </ul>
            </div>
            <div className={`rounded-xl p-8 border ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-cyan-500/30'
                : 'bg-gradient-to-br from-cyan-50 to-sky-50 border-cyan-400 shadow-md'
            }`}>
              <div className="text-center">
                <div className="text-5xl font-black text-cyan-500 mb-2">95%</div>
                <div className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>Soddisfazione Clienti</div>
              </div>
            </div>
          </div>
        </div>

        {/* Strategie Core */}
        <h2 className={`font-display text-3xl md:text-4xl font-semibold mb-8 text-center tracking-tight ${
          theme === 'dark' ? 'text-white' : 'text-slate-900'
        }`}>I 6 pilastri del framework</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {[
            {
              icon: Shield,
              tag: '01',
              title: 'Risk management',
              description: 'Protezione del capitale come priorità assoluta: stop loss automatici, position sizing calcolato, diversificazione strutturata.',
              stats: 'Max 2% rischio / trade',
            },
            {
              icon: TrendingUp,
              tag: '02',
              title: 'Trend following',
              description: 'Identificazione e cavalcamento dei trend primari e secondari con regole esplicite di ingresso e uscita.',
              stats: 'Win rate 72%',
            },
            {
              icon: Target,
              tag: '03',
              title: 'Entry & exit precisi',
              description: 'Punti di ingresso e uscita calcolati su livelli tecnici e validati statisticamente. Niente improvvisazione.',
              stats: 'Risk / reward 1:3',
            },
            {
              icon: BarChart,
              tag: '04',
              title: 'Analisi tecnica',
              description: 'Pattern, supporti, resistenze e indicatori proprietari. Tool standardizzati condivisi con tutto il lab.',
              stats: '15+ indicatori',
            },
            {
              icon: Brain,
              tag: '05',
              title: 'Psicologia operativa',
              description: 'Routine mentali, journaling e protocolli per gestire emozioni e bias cognitivi durante l\'operatività.',
              stats: 'Trader mindset kit',
            },
            {
              icon: Zap,
              tag: '06',
              title: 'Esecuzione veloce',
              description: 'Automazione e infrastruttura ottimizzata per non perdere opportunità. Latenze ridotte, ordini precisi.',
              stats: 'Latency <50ms',
            }
          ].map((strategy, index) => (
            <div key={index} className={`group rounded-lg p-6 hover:scale-105 transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-gradient-to-b from-gray-900 to-black border border-blue-800/30 hover:border-cyan-500/50'
                : 'bg-white border border-blue-200 hover:border-cyan-400 shadow-md hover:shadow-xl'
            }`}>
              <strategy.icon className="w-9 h-9 text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
              <span className="font-mono-lab text-xs text-cyan-500 tracking-widest uppercase">// {strategy.tag}</span>
              <h3 className={`font-display text-xl md:text-2xl font-semibold mt-1 mb-3 tracking-tight ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>{strategy.title}</h3>
              <p className={`mb-4 text-sm leading-relaxed ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
              }`}>{strategy.description}</p>
              <div className={`inline-block px-3 py-1 font-mono-lab tracking-widest border rounded-md text-cyan-400 text-xs ${
                theme === 'dark'
                  ? 'bg-blue-900/30 border-blue-700/50'
                  : 'bg-cyan-50 border-cyan-400'
              }`}>
                {strategy.stats}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-10 text-center">
          <span className="font-mono-lab text-xs text-white/70 tracking-[0.3em] uppercase">// Activate</span>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-white mt-2 mb-3 tracking-tight">Pronto ad applicare il framework?</h2>
          <p className="text-white/80 mb-6 max-w-2xl mx-auto">
            Entra in Nexora Lab e accedi a strategie operative, formazione e community pro.
          </p>
          <button className="px-7 py-3 bg-white text-blue-600 rounded-lg font-display font-semibold transition-all duration-300 hover:-translate-y-0.5 shadow-lg">
            Inizia ora →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Strategia;
