import { Radio, TrendingUp, AlertCircle, Bell, Target, Shield, CheckCircle, Zap } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Segnali = () => {
  const { theme } = useTheme();
  return (
    <div className={`min-h-screen pt-24 ${
      theme === 'light' ? 'bg-gradient-to-b from-white via-gray-50 to-white' : 'bg-black'
    }`}>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 bg-clip-text text-transparent">
            SEGNALI PREMIUM
          </h1>
          <p className={`text-xl max-w-3xl mx-auto ${
            theme === 'light' ? 'text-gray-600' : 'text-gray-300'
          }`}>
            Segnali di trading professionali testati e verificati. Entry, target e stop loss precisi 
            direttamente sul tuo Telegram, 24/7.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Win Rate', value: '74%' },
            { label: 'Segnali/Mese', value: '200+' },
            { label: 'Risk/Reward', value: '1:3' },
            { label: 'Utenti Attivi', value: '3,500+' }
          ].map((stat, i) => (
            <div key={i} className={`rounded-lg p-4 text-center ${
              theme === 'light'
                ? 'bg-white border-2 border-gray-200 shadow-md'
                : 'bg-gradient-to-b from-gray-900 to-black border border-red-800/30'
            }`}>
              <div className="text-3xl font-black text-yellow-500">{stat.value}</div>
              <div className={`text-sm ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Main Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className={`rounded-lg p-8 transition-all duration-300 ${
            theme === 'light'
              ? 'bg-white border-2 border-gray-200 hover:border-yellow-600 shadow-lg'
              : 'bg-gradient-to-b from-gray-900 to-black border border-red-800/30 hover:border-yellow-500/50'
          }`}>
            <Radio className="w-12 h-12 text-yellow-500 mb-4" />
            <h3 className={`text-2xl font-bold mb-3 ${
              theme === 'light' ? 'text-gray-800' : 'text-white'
            }`}>Segnali Live</h3>
            <p className={`mb-4 ${
              theme === 'light' ? 'text-gray-700' : 'text-gray-400'
            }`}>
              Notifiche istantanee su Telegram appena si presenta un'opportunità. 
              Analisi completa con grafico, livelli e rationale della trade.
            </p>
            <ul className={`space-y-2 text-sm ${
              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
            }`}>
              <li>• Notifiche push immediate</li>
              <li>• Grafici allegati</li>
              <li>• Spiegazione dettagliata</li>
            </ul>
          </div>
          <div className={`rounded-lg p-8 transition-all duration-300 ${
            theme === 'light'
              ? 'bg-white border-2 border-gray-200 hover:border-yellow-600 shadow-lg'
              : 'bg-gradient-to-b from-gray-900 to-black border border-red-800/30 hover:border-yellow-500/50'
          }`}>
            <TrendingUp className="w-12 h-12 text-yellow-500 mb-4" />
            <h3 className={`text-2xl font-bold mb-3 ${
              theme === 'light' ? 'text-gray-800' : 'text-white'
            }`}>Analisi Complete</h3>
            <p className={`mb-4 ${
              theme === 'light' ? 'text-gray-700' : 'text-gray-400'
            }`}>
              Ogni segnale include entry preciso, multipli target di profitto, 
              stop loss calcolato e gestione della posizione step-by-step.
            </p>
            <ul className={`space-y-2 text-sm ${
              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
            }`}>
              <li>• Entry point ottimale</li>
              <li>• 3 livelli di take profit</li>
              <li>• Stop loss protettivo</li>
            </ul>
          </div>
          <div className={`rounded-lg p-8 transition-all duration-300 ${
            theme === 'light'
              ? 'bg-white border-2 border-gray-200 hover:border-yellow-600 shadow-lg'
              : 'bg-gradient-to-b from-gray-900 to-black border border-red-800/30 hover:border-yellow-500/50'
          }`}>
            <AlertCircle className="w-12 h-12 text-yellow-500 mb-4" />
            <h3 className={`text-2xl font-bold mb-3 ${
              theme === 'light' ? 'text-gray-800' : 'text-white'
            }`}>Alert Personalizzati</h3>
            <p className={`mb-4 ${
              theme === 'light' ? 'text-gray-700' : 'text-gray-400'
            }`}>
              Filtra i segnali in base al tuo profilo di rischio, capitale disponibile 
              e asset preferiti. Solo le opportunità giuste per te.
            </p>
            <ul className={`space-y-2 text-sm ${
              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
            }`}>
              <li>• Filtri personalizzabili</li>
              <li>• Profilo rischio custom</li>
              <li>• Asset selezionabili</li>
            </ul>
          </div>
        </div>

        {/* Signal Types */}
        <div className={`rounded-2xl p-8 mb-12 ${
          theme === 'light'
            ? 'bg-gradient-to-r from-gray-100 to-gray-50 border-2 border-gray-200'
            : 'bg-gradient-to-r from-red-950/50 via-black/50 to-red-950/50 backdrop-blur-sm border border-red-800/30'
        }`}>
          <h2 className={`text-3xl font-black mb-8 text-center ${
            theme === 'light' ? 'text-gray-800' : 'text-white'
          }`}>Tipologie di Segnali</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: Zap, title: 'Scalping', desc: 'Trade rapide intraday, 5-30 minuti' },
              { icon: Target, title: 'Day Trading', desc: 'Operazioni giornaliere, chiuse in giornata' },
              { icon: TrendingUp, title: 'Swing Trading', desc: 'Posizioni multi-day, 2-7 giorni' },
              { icon: Shield, title: 'Position Trading', desc: 'Trend following di lungo periodo' }
            ].map((type, i) => (
              <div key={i} className={`flex items-start gap-4 rounded-xl p-4 ${
                theme === 'light' ? 'bg-gray-100' : 'bg-black/30'
              }`}>
                <type.icon className="w-8 h-8 text-yellow-500 flex-shrink-0" />
                <div>
                  <h4 className={`text-lg font-bold mb-1 ${
                    theme === 'light' ? 'text-gray-800' : 'text-white'
                  }`}>{type.title}</h4>
                  <p className={`text-sm ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>{type.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Tracking */}
        <div className={`rounded-2xl p-8 mb-12 ${
          theme === 'light'
            ? 'bg-white border-2 border-gray-200 shadow-lg'
            : 'bg-gradient-to-b from-gray-900 to-black border border-red-800/30'
        }`}>
          <h2 className={`text-2xl font-black mb-6 flex items-center gap-3 ${
            theme === 'light' ? 'text-gray-800' : 'text-white'
          }`}>
            <CheckCircle className="w-8 h-8 text-green-500" />
            Tracciamento Performance
          </h2>
          <p className={`mb-4 ${
            theme === 'light' ? 'text-gray-700' : 'text-gray-300'
          }`}>
            Ogni segnale viene tracciato pubblicamente. Pubblichiamo risultati reali, 
            win rate aggiornato e statistiche complete per totale trasparenza.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className={`rounded-lg p-4 border border-green-500/30 ${
              theme === 'light' ? 'bg-green-50' : 'bg-black/50'
            }`}>
              <div className="text-2xl font-black text-green-500 mb-1">156</div>
              <div className={`text-sm ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>Trade Vincenti (Ultimo Mese)</div>
            </div>
            <div className={`rounded-lg p-4 border border-red-500/30 ${
              theme === 'light' ? 'bg-red-50' : 'bg-black/50'
            }`}>
              <div className="text-2xl font-black text-red-500 mb-1">55</div>
              <div className={`text-sm ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>Trade Perdenti (Ultimo Mese)</div>
            </div>
            <div className={`rounded-lg p-4 border border-yellow-500/30 ${
              theme === 'light' ? 'bg-yellow-50' : 'bg-black/50'
            }`}>
              <div className="text-2xl font-black text-yellow-500 mb-1">+18.4%</div>
              <div className={`text-sm ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>ROI Medio Mensile</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-black text-white mb-4">Ricevi i Segnali Spartani</h2>
          <p className="text-gray-100 mb-6">Inizia a ricevere segnali professionali sul tuo Telegram oggi stesso</p>
          <button className={`px-8 py-4 bg-black text-yellow-500 rounded-xl font-bold text-lg hover:bg-gray-900 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto border-2 ${theme === 'light' ? 'border-gray-900 shadow-lg' : 'border-transparent'}`}>
            <Bell className="w-5 h-5" />
            ATTIVA I SEGNALI
          </button>
        </div>
      </div>
    </div>
  );
};

export default Segnali;
