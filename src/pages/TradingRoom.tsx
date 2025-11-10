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
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 bg-clip-text text-transparent">
            TRADING ROOM
          </h1>
          <p className={`text-xl max-w-3xl mx-auto ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Entra nella sala operativa dove i guerrieri spartani combattono insieme. 
            Sessioni live, analisi in tempo reale e supporto continuo dalla community.
          </p>
        </div>

        {/* Hero Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Membri Attivi', value: '2,500+', icon: Users },
            { label: 'Sessioni/Settimana', value: '15+', icon: Video },
            { label: 'Segnali/Giorno', value: '10-20', icon: Bell },
            { label: 'Supporto', value: '24/7', icon: Clock }
          ].map((stat, i) => (
            <div key={i} className={`rounded-lg p-4 text-center border transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-gradient-to-b from-gray-900 to-black border-red-800/30'
                : 'bg-white border-red-200 shadow-md'
            }`}>
              <stat.icon className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
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
              ? 'bg-gradient-to-b from-gray-900 to-black border-red-800/30 hover:border-yellow-500/50'
              : 'bg-white border-red-200 hover:border-yellow-400 shadow-md hover:shadow-xl'
          }`}>
            <Users className="w-12 h-12 text-yellow-500 mb-4" />
            <h3 className={`text-2xl font-bold mb-3 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Community Elite</h3>
            <p className={`mb-4 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Unisciti a migliaia di trader spartani. Canali Discord dedicati con moderatori esperti, 
              mentori professionisti e una community che condivide strategie vincenti.
            </p>
            <ul className={`space-y-2 text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <li>• Canali tematici per ogni asset</li>
              <li>• Mentorship 1-on-1 disponibile</li>
              <li>• Network di trader professionisti</li>
            </ul>
          </div>
          <div className={`rounded-lg p-8 border hover:scale-105 transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-gradient-to-b from-gray-900 to-black border-red-800/30 hover:border-yellow-500/50'
              : 'bg-white border-red-200 hover:border-yellow-400 shadow-md hover:shadow-xl'
          }`}>
            <Headphones className="w-12 h-12 text-yellow-500 mb-4" />
            <h3 className={`text-2xl font-bold mb-3 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Sessioni Live</h3>
            <p className={`mb-4 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Streaming video privati ogni giorno. Analisi pre-market, operatività in diretta, 
              Q&A interattive e revisione delle performance settimanali.
            </p>
            <ul className={`space-y-2 text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <li>• Live trading ogni mattina</li>
              <li>• Analisi tecnica approfondita</li>
              <li>• Replay disponibili 24/7</li>
            </ul>
          </div>
          <div className={`rounded-lg p-8 border hover:scale-105 transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-gradient-to-b from-gray-900 to-black border-red-800/30 hover:border-yellow-500/50'
              : 'bg-white border-red-200 hover:border-yellow-400 shadow-md hover:shadow-xl'
          }`}>
            <BarChart2 className="w-12 h-12 text-yellow-500 mb-4" />
            <h3 className={`text-2xl font-bold mb-3 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Analisi Pro</h3>
            <p className={`mb-4 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Setup giornalieri, livelli chiave, report settimanali e analisi macro. 
              Tutto quello che serve per operare con consapevolezza e precisione.
            </p>
            <ul className={`space-y-2 text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <li>• Report pre/post mercato</li>
              <li>• Livelli supporto/resistenza</li>
              <li>• Calendario economico commentato</li>
            </ul>
          </div>
        </div>

        {/* Additional Features */}
        <div className={`rounded-2xl p-8 border mb-12 ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-red-950/50 via-black/50 to-red-950/50 backdrop-blur-sm border-red-800/30'
            : 'bg-gradient-to-r from-red-50 via-white to-red-50 border-red-200 shadow-lg'
        }`}>
          <h2 className={`text-3xl font-black mb-6 text-center ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Cosa Include</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: MessageSquare, title: 'Chat Telegram Premium', desc: 'Segnali istantanei e discussioni in tempo reale' },
              { icon: Video, title: 'Webinar Settimanali', desc: 'Formazione continua con trader professionisti' },
              { icon: TrendingUp, title: 'Watchlist Condivise', desc: 'Asset monitorati dal team di analisti' },
              { icon: Shield, title: 'Risk Management', desc: 'Tools e calcolatori per gestire il rischio' }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <item.icon className="w-8 h-8 text-yellow-500 flex-shrink-0" />
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
        <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-black text-white mb-4">Entra nella Trading Room</h2>
          <p className="text-gray-100 mb-6">Inizia a fare trading con il supporto di una community di guerrieri</p>
          <button className="px-8 py-4 bg-black border-2 border-yellow-500 text-yellow-500 rounded-xl font-bold text-lg hover:bg-gray-900 hover:border-yellow-400 transition-all duration-300 transform hover:scale-105">
            ACCEDI ALLA ROOM
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradingRoom;

