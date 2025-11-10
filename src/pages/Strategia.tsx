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
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            <span className="bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 bg-clip-text text-transparent">
              STRATEGIA SPARTANA
            </span>
          </h1>
          <p className={`text-xl max-w-3xl mx-auto ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            La leggendaria disciplina spartana incontra l'innovazione del trading algoritmico. 
            Strategie testate in battaglia, perfezionate per dominare i mercati finanziari.
          </p>
        </div>

        {/* Hero Section */}
        <div className={`rounded-2xl p-8 border mb-12 ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-red-950/50 via-black/50 to-red-950/50 backdrop-blur-sm border-red-800/30'
            : 'bg-gradient-to-r from-red-50 via-white to-red-50 border-red-200 shadow-lg'
        }`}>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h2 className={`text-3xl font-black mb-4 flex items-center gap-3 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                <Swords className="w-8 h-8 text-yellow-500" />
                Il Metodo Spartano
              </h2>
              <p className={`leading-relaxed mb-4 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Come gli spartani dominavano il campo di battaglia con disciplina ferrea e formazione impeccabile, 
                così il nostro metodo ti permette di conquistare i mercati finanziari con strategie precise e testate.
              </p>
              <ul className={`space-y-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <li className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <span>Strategie con win rate superiore al 70%</span>
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-yellow-500" />
                  <span>Gestione del rischio militare: mai più del 2% per trade</span>
                </li>
                <li className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-yellow-500" />
                  <span>Backtesting rigoroso su oltre 10 anni di dati storici</span>
                </li>
              </ul>
            </div>
            <div className={`rounded-xl p-8 border ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-red-900/30 to-yellow-900/30 border-yellow-500/30'
                : 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-400 shadow-md'
            }`}>
              <div className="text-center">
                <div className="text-5xl font-black text-yellow-500 mb-2">95%</div>
                <div className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>Soddisfazione Clienti</div>
              </div>
            </div>
          </div>
        </div>

        {/* Strategie Core */}
        <h2 className={`text-3xl font-black mb-8 text-center ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>Le 6 Colonne della Vittoria</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: Shield,
              title: "Gestione del Rischio",
              description: "Proteggi il tuo capitale come uno scudo spartano protegge il guerriero. Stop loss automatici, position sizing calcolato e diversificazione strategica.",
              stats: "Max 2% rischio per trade"
            },
            {
              icon: TrendingUp,
              title: "Trend Following",
              description: "Segui le tendenze del mercato con la precisione di una falange. Identifichiamo i trend primari e secondari per massimizzare i profitti.",
              stats: "Win rate 72%"
            },
            {
              icon: Target,
              title: "Entry & Exit Precisi",
              description: "Punti di ingresso e uscita calcolati con precisione militare. Utilizziamo algoritmi avanzati per timing perfetto.",
              stats: "Risk/Reward 1:3"
            },
            {
              icon: BarChart,
              title: "Analisi Tecnica Avanzata",
              description: "Lettura dei grafici con l'occhio esperto di un generale spartano. Pattern, supporti, resistenze e indicatori proprietari.",
              stats: "15+ indicatori"
            },
            {
              icon: Brain,
              title: "Psicologia del Trading",
              description: "Forgia una mente di ferro per dominare le emozioni del mercato. Training mentale e disciplina operativa quotidiana.",
              stats: "Mindset da guerriero"
            },
            {
              icon: Zap,
              title: "Esecuzione Fulminea",
              description: "Velocità e precisione nell'esecuzione degli ordini. Automazione intelligente per non perdere mai un'opportunità.",
              stats: "Latenza <50ms"
            }
          ].map((strategy, index) => (
            <div key={index} className={`group rounded-lg p-6 hover:scale-105 transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-gradient-to-b from-gray-900 to-black border border-red-800/30 hover:border-yellow-500/50'
                : 'bg-white border border-red-200 hover:border-yellow-400 shadow-md hover:shadow-xl'
            }`}>
              <strategy.icon className="w-12 h-12 text-yellow-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className={`text-2xl font-bold mb-3 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>{strategy.title}</h3>
              <p className={`mb-4 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>{strategy.description}</p>
              <div className={`inline-block px-3 py-1 border rounded-full text-yellow-500 text-sm font-bold ${
                theme === 'dark'
                  ? 'bg-red-900/30 border-red-700/50'
                  : 'bg-yellow-50 border-yellow-400'
              }`}>
                {strategy.stats}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-black text-white mb-4">Pronto a Combattere?</h2>
          <p className="text-gray-100 mb-6 max-w-2xl mx-auto">
            Unisciti a oltre 10,000 guerrieri che hanno scelto la via spartana per dominare i mercati.
          </p>
          <button className="px-8 py-4 bg-black border-2 border-yellow-500 text-yellow-500 rounded-xl font-bold text-lg hover:bg-gray-900 hover:border-yellow-400 transition-all duration-300 transform hover:scale-105">
            INIZIA ORA
          </button>
        </div>
      </div>
    </div>
  );
};

export default Strategia;
