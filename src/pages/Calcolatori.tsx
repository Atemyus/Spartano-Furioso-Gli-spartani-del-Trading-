import { Calculator, DollarSign, Percent, TrendingUp, Target, Zap } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Calcolatori = () => {
  const { theme } = useTheme();
  const calculators = [
    {
      icon: Calculator,
      title: "Calcolatore Pip",
      description: "Calcola il valore di ogni pip in base alla coppia valutaria, dimensione del lotto e valuta del conto.",
      fields: ["Coppia valutaria", "Dimensione lotto", "Valuta conto"]
    },
    {
      icon: DollarSign,
      title: "Position Sizing",
      description: "Determina la dimensione ottimale della posizione in base al capitale, rischio percentuale e stop loss.",
      fields: ["Capitale totale", "Rischio %", "Stop loss (pip)"]
    },
    {
      icon: Percent,
      title: "Risk/Reward",
      description: "Calcola il rapporto rischio/rendimento per valutare se una trade vale la pena di essere aperta.",
      fields: ["Entry price", "Stop loss", "Take profit"]
    },
    {
      icon: TrendingUp,
      title: "Profit/Loss",
      description: "Calcola profitti e perdite potenziali in base alla dimensione della posizione e movimento del prezzo.",
      fields: ["Entry price", "Exit price", "Lotti"]
    },
    {
      icon: Target,
      title: "Margin Calculator",
      description: "Calcola il margine richiesto per aprire una posizione con leva finanziaria.",
      fields: ["Dimensione posizione", "Leva", "Prezzo"]
    },
    {
      icon: Zap,
      title: "Compound Interest",
      description: "Simula la crescita del capitale con interesse composto e rendimenti mensili costanti.",
      fields: ["Capitale iniziale", "Rendimento %", "Mesi"]
    }
  ];

  return (
    <div className={`min-h-screen pt-24 ${
      theme === 'light' ? 'bg-gradient-to-b from-white via-gray-50 to-white' : 'bg-black'
    }`}>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <span className="font-mono-lab text-xs text-cyan-400 tracking-[0.3em] uppercase">// Tools</span>
          <h1 className={`font-display text-5xl md:text-6xl font-bold mt-2 mb-4 tracking-tight ${
            theme === 'light' ? 'text-slate-900' : 'text-white'
          }`}>
            Calcolatori <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">trading</span>
          </h1>
          <p className={`text-lg md:text-xl max-w-3xl mx-auto leading-relaxed ${
            theme === 'light' ? 'text-slate-600' : 'text-slate-300'
          }`}>
            Tool essenziali per dimensionamento, rischio e profitti. Calcoli puliti, veloci,
            usati da chi opera ogni giorno.
          </p>
        </div>

        {/* Calculators Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {calculators.map((calc, i) => (
            <div key={i} className={`rounded-xl p-6 transition-all duration-300 group ${
              theme === 'light'
                ? 'bg-white border-2 border-gray-200 hover:border-cyan-600 shadow-lg'
                : 'bg-gradient-to-b from-gray-900 to-black border border-blue-800/30 hover:border-cyan-500/50'
            }`}>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <calc.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className={`text-2xl font-bold mb-3 ${
                theme === 'light' ? 'text-gray-800' : 'text-white'
              }`}>{calc.title}</h3>
              <p className={`mb-4 ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>{calc.description}</p>
              <div className="space-y-2 mb-4">
                {calc.fields.map((field, j) => (
                  <div key={j} className={`text-sm flex items-center gap-2 ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-500'
                  }`}>
                    <div className="w-1 h-1 bg-cyan-500 rounded-full"></div>
                    {field}
                  </div>
                ))}
              </div>
              <button className="w-full py-3 text-white rounded-lg font-display font-semibold tracking-wide transition-all duration-300 hover:-translate-y-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/20 hover:shadow-cyan-500/40">
                Apri il calcolatore →
              </button>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className={`mt-16 rounded-2xl p-8 ${
          theme === 'light'
            ? 'bg-gradient-to-r from-gray-100 to-gray-50 border-2 border-gray-200'
            : 'bg-gradient-to-r from-blue-950/50 via-black/50 to-blue-950/50 backdrop-blur-sm border border-blue-800/30'
        }`}>
          <h2 className={`font-display text-2xl md:text-3xl font-semibold mb-6 text-center tracking-tight ${
            theme === 'light' ? 'text-slate-900' : 'text-white'
          }`}>Perché usare questi tool</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Precisione', desc: 'Elimina errori di calcolo manuale' },
              { title: 'Velocità', desc: 'Risultati istantanei per decisioni rapide' },
              { title: 'Standard pro', desc: 'Tool usati da trader e fund manager' }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <span className="font-mono-lab text-xs text-cyan-500 tracking-widest uppercase">// 0{i + 1}</span>
                <h4 className={`font-display text-lg font-semibold mt-1 mb-1 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{item.title}</h4>
                <p className={`text-sm ${
                  theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                }`}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calcolatori;
