import { Book, Search, TrendingUp, TrendingDown, Shield, Target, Zap, BarChart2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Glossario = () => {
  const { theme } = useTheme();
  const terms = [
    { term: "Bull Market", icon: TrendingUp, def: "Mercato rialzista caratterizzato da prezzi in aumento e ottimismo degli investitori. Tipicamente si verifica quando i prezzi salgono del 20% o più dai minimi recenti.", category: "Mercati" },
    { term: "Bear Market", icon: TrendingDown, def: "Mercato ribassista con prezzi in calo e pessimismo diffuso. Si definisce bear market quando i prezzi scendono del 20% o più dai massimi recenti.", category: "Mercati" },
    { term: "Stop Loss", icon: Shield, def: "Ordine automatico che chiude una posizione quando il prezzo raggiunge un livello predefinito, limitando le perdite. Essenziale per la gestione del rischio.", category: "Risk Management" },
    { term: "Take Profit", icon: Target, def: "Ordine che chiude automaticamente una posizione in profitto quando il prezzo raggiunge un obiettivo prestabilito. Permette di cristallizzare i guadagni.", category: "Risk Management" },
    { term: "Leverage (Leva)", icon: Zap, def: "Strumento che permette di controllare posizioni più grandi del capitale disponibile. Una leva 1:100 significa che con €1000 puoi controllare €100,000. Aumenta sia profitti che perdite.", category: "Strumenti" },
    { term: "Pip", icon: BarChart2, def: "Unità minima di variazione del prezzo nel forex. Per la maggior parte delle coppie valutarie, 1 pip = 0.0001. Usato per calcolare profitti e perdite.", category: "Forex" },
    { term: "Spread", icon: BarChart2, def: "Differenza tra prezzo bid (vendita) e ask (acquisto). Rappresenta il costo della transazione e varia in base alla liquidità del mercato.", category: "Costi" },
    { term: "Margin Call", icon: Shield, def: "Richiesta del broker di depositare fondi aggiuntivi quando il capitale scende sotto il margine minimo richiesto. Può portare alla chiusura forzata delle posizioni.", category: "Risk Management" }
  ];

  return (
    <div className={`min-h-screen pt-24 ${
      theme === 'light' ? 'bg-gradient-to-b from-white via-gray-50 to-white' : 'bg-black'
    }`}>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 bg-clip-text text-transparent">
            GLOSSARIO TRADING
          </h1>
          <p className={`text-xl max-w-3xl mx-auto ${
            theme === 'light' ? 'text-gray-600' : 'text-gray-300'
          }`}>
            Dizionario completo dei termini del trading. Impara il linguaggio dei mercati finanziari.
          </p>
        </div>

        {/* Search */}
        <div className="mb-12">
          <div className="relative max-w-2xl mx-auto">
            <Search className={`absolute left-4 top-4 w-5 h-5 ${
              theme === 'light' ? 'text-gray-400' : 'text-gray-400'
            }`} />
            <input 
              type="text" 
              placeholder="Cerca un termine (es. stop loss, leverage, pip...)" 
              className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:outline-none transition-all ${
                theme === 'light'
                  ? 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-yellow-600'
                  : 'bg-gray-900 border-red-800/30 text-white placeholder-gray-500 focus:border-yellow-500'
              }`}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Termini', value: '200+' },
            { label: 'Categorie', value: '15' },
            { label: 'Esempi', value: '500+' },
            { label: 'Aggiornamenti', value: 'Settimanali' }
          ].map((stat, i) => (
            <div key={i} className={`rounded-lg p-4 text-center ${
              theme === 'light'
                ? 'bg-white border-2 border-gray-200 shadow-md'
                : 'bg-gradient-to-b from-gray-900 to-black border border-red-800/30'
            }`}>
              <div className="text-2xl font-black text-yellow-500">{stat.value}</div>
              <div className={`text-sm ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Terms */}
        <div className="space-y-4">
          {terms.map((item, i) => (
            <div key={i} className={`rounded-xl p-6 transition-all duration-300 ${
              theme === 'light'
                ? 'bg-white border-2 border-gray-200 hover:border-yellow-600 shadow-lg'
                : 'bg-gradient-to-b from-gray-900 to-black border border-red-800/30 hover:border-yellow-500/50'
            }`}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-600 to-yellow-600 rounded-lg flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-yellow-500">{item.term}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      theme === 'light'
                        ? 'bg-gray-100 border border-gray-300 text-gray-700'
                        : 'bg-red-900/30 border border-red-700/50 text-gray-300'
                    }`}>
                      {item.category}
                    </span>
                  </div>
                  <p className={`leading-relaxed ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                  }`}>{item.def}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-8 text-center">
          <Book className="w-12 h-12 text-white mx-auto mb-4" />
          <h2 className="text-3xl font-black text-white mb-4">Scarica il Glossario Completo</h2>
          <p className="text-gray-100 mb-6">PDF con oltre 200 termini, esempi pratici e illustrazioni</p>
          <button className={`px-8 py-4 bg-black text-yellow-500 rounded-xl font-bold text-lg hover:bg-gray-900 transition-all hover:scale-105 active:scale-95 border-2 ${theme === 'light' ? 'border-gray-900 shadow-lg' : 'border-transparent'}`}>
            SCARICA GRATIS
          </button>
        </div>
      </div>
    </div>
  );
};

export default Glossario;
