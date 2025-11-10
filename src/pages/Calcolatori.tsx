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
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 bg-clip-text text-transparent">
            CALCOLATORI TRADING
          </h1>
          <p className={`text-xl max-w-3xl mx-auto ${
            theme === 'light' ? 'text-gray-600' : 'text-gray-300'
          }`}>
            Strumenti essenziali per calcolare rischio, profitto e dimensionamento delle posizioni. 
            Prendi decisioni informate con precisione matematica.
          </p>
        </div>

        {/* Calculators Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {calculators.map((calc, i) => (
            <div key={i} className={`rounded-xl p-6 transition-all duration-300 group ${
              theme === 'light'
                ? 'bg-white border-2 border-gray-200 hover:border-yellow-600 shadow-lg'
                : 'bg-gradient-to-b from-gray-900 to-black border border-red-800/30 hover:border-yellow-500/50'
            }`}>
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-yellow-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
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
                    <div className="w-1 h-1 bg-yellow-500 rounded-full"></div>
                    {field}
                  </div>
                ))}
              </div>
              <button className={`w-full py-3 text-white rounded-lg font-bold transition-all hover:scale-105 border-2 ${
                theme === 'light'
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 border-yellow-700 shadow-md'
                  : 'bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 border-transparent'
              }`}>
                USA CALCOLATORE
              </button>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className={`mt-16 rounded-2xl p-8 ${
          theme === 'light'
            ? 'bg-gradient-to-r from-gray-100 to-gray-50 border-2 border-gray-200'
            : 'bg-gradient-to-r from-red-950/50 via-black/50 to-red-950/50 backdrop-blur-sm border border-red-800/30'
        }`}>
          <h2 className={`text-2xl font-black mb-4 text-center ${
            theme === 'light' ? 'text-gray-800' : 'text-white'
          }`}>Perché Usare i Calcolatori?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Precisione", desc: "Elimina errori di calcolo manuale" },
              { title: "Velocità", desc: "Risultati istantanei per decisioni rapide" },
              { title: "Professionalità", desc: "Strumenti usati dai trader pro" }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <h4 className="text-lg font-bold text-yellow-500 mb-2">{item.title}</h4>
                <p className={`text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
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
