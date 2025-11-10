import { LineChart, BarChart2, PieChart, TrendingUp, Activity, Layers, Calendar, FileText, Target, Zap, Globe } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Analisi = () => {
  const { theme } = useTheme();
  const analysisTypes = [
    {
      icon: LineChart,
      title: "Analisi Tecnica",
      description: "Studio approfondito dei grafici con pattern, livelli chiave, indicatori e momentum. Identifichiamo supporti, resistenze e trend per timing perfetto.",
      features: ["Pattern recognition", "Supporti/Resistenze", "Indicatori tecnici", "Volume analysis"],
      color: "from-blue-600 to-cyan-600"
    },
    {
      icon: BarChart2,
      title: "Analisi Quantitativa",
      description: "Backtesting rigoroso, ottimizzazione algoritmica e metriche di performance. Dati statistici per decisioni basate su evidenze concrete.",
      features: ["Backtesting storico", "Sharpe ratio", "Drawdown analysis", "Monte Carlo"],
      color: "from-purple-600 to-pink-600"
    },
    {
      icon: PieChart,
      title: "Asset Allocation",
      description: "Diversificazione strategica del portafoglio, gestione dell'esposizione e bilanciamento del rischio tra diverse asset class.",
      features: ["Diversificazione", "Risk parity", "Rebalancing", "Correlazioni"],
      color: "from-green-600 to-emerald-600"
    }
  ];

  const marketReports = [
    { icon: Calendar, title: "Report Giornaliero", desc: "Analisi pre-market e setup del giorno", time: "Ogni mattina 8:00" },
    { icon: FileText, title: "Report Settimanale", desc: "Riepilogo performance e outlook", time: "Ogni domenica" },
    { icon: TrendingUp, title: "Analisi Macro", desc: "Trend di lungo periodo e scenario", time: "Mensile" },
    { icon: Globe, title: "News & Eventi", desc: "Impatto di notizie ed eventi economici", time: "Real-time" }
  ];

  return (
    <div className={`min-h-screen pt-24 ${
      theme === 'light' ? 'bg-gradient-to-b from-white via-gray-50 to-white' : 'bg-black'
    }`}>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 bg-clip-text text-transparent">
            ANALISI MERCATI
          </h1>
          <p className={`text-xl max-w-3xl mx-auto ${
            theme === 'light' ? 'text-gray-600' : 'text-gray-300'
          }`}>
            Analisi professionali multi-dimensionali per comprendere i mercati e prendere decisioni informate. 
            Tecnica, quantitativa e fondamentale integrate in un unico sistema.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Mercati Analizzati', value: '50+' },
            { label: 'Report/Mese', value: '120+' },
            { label: 'Accuratezza', value: '87%' },
            { label: 'Anni di Dati', value: '15+' }
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

        {/* Main Analysis Types */}
        <h2 className={`text-3xl font-black mb-8 text-center ${
          theme === 'light' ? 'text-gray-800' : 'text-white'
        }`}>Tipologie di Analisi</h2>
        <div className="space-y-8 mb-12">
          {analysisTypes.map((analysis, index) => (
            <div key={index} className={`rounded-2xl p-8 transition-all duration-300 ${
              theme === 'light'
                ? 'bg-white border-2 border-gray-200 hover:border-yellow-600 shadow-lg'
                : 'bg-gradient-to-b from-gray-900 to-black border border-red-800/30 hover:border-yellow-500/50'
            }`}>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-shrink-0">
                  <div className={`w-20 h-20 bg-gradient-to-br ${analysis.color} rounded-xl flex items-center justify-center`}>
                    <analysis.icon className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className={`text-2xl font-black mb-3 ${
                    theme === 'light' ? 'text-gray-800' : 'text-white'
                  }`}>{analysis.title}</h3>
                  <p className={`mb-4 ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                  }`}>{analysis.description}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {analysis.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                        <span className={`text-sm ${
                          theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                        }`}>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Market Reports */}
        <div className={`rounded-2xl p-8 mb-12 ${
          theme === 'light'
            ? 'bg-gradient-to-r from-gray-100 to-gray-50 border-2 border-gray-200'
            : 'bg-gradient-to-r from-red-950/50 via-black/50 to-red-950/50 backdrop-blur-sm border border-red-800/30'
        }`}>
          <h2 className={`text-3xl font-black mb-8 text-center ${
            theme === 'light' ? 'text-gray-800' : 'text-white'
          }`}>Report & Aggiornamenti</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {marketReports.map((report, i) => (
              <div key={i} className={`rounded-xl p-6 border transition-all duration-300 ${
                theme === 'light'
                  ? 'bg-white border-gray-200 hover:border-yellow-600'
                  : 'bg-black/30 border-red-800/20 hover:border-yellow-500/50'
              }`}>
                <div className="flex items-start gap-4">
                  <report.icon className="w-10 h-10 text-yellow-500 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className={`text-xl font-bold mb-2 ${
                      theme === 'light' ? 'text-gray-800' : 'text-white'
                    }`}>{report.title}</h4>
                    <p className={`mb-2 ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>{report.desc}</p>
                    <div className="flex items-center gap-2 text-yellow-500 text-sm">
                      <Zap className="w-4 h-4" />
                      <span>{report.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Markets Covered */}
        <div className={`rounded-2xl p-8 mb-12 ${
          theme === 'light'
            ? 'bg-white border-2 border-gray-200 shadow-lg'
            : 'bg-gradient-to-b from-gray-900 to-black border border-red-800/30'
        }`}>
          <h2 className={`text-2xl font-black mb-6 flex items-center gap-3 ${
            theme === 'light' ? 'text-gray-800' : 'text-white'
          }`}>
            <Activity className="w-8 h-8 text-yellow-500" />
            Mercati Coperti
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: "Forex", pairs: "28 coppie valutarie" },
              { name: "Crypto", pairs: "50+ criptovalute" },
              { name: "Indici", pairs: "15 indici globali" },
              { name: "Commodities", pairs: "Oro, Petrolio, Gas" },
              { name: "Azioni", pairs: "S&P 500, NASDAQ" },
              { name: "ETF", pairs: "100+ ETF tematici" }
            ].map((market, i) => (
              <div key={i} className={`rounded-lg p-4 border transition-all ${
                theme === 'light'
                  ? 'bg-gray-50 border-gray-200 hover:border-yellow-600'
                  : 'bg-black/50 border-gray-800 hover:border-yellow-500/50'
              }`}>
                <div className="flex items-center gap-3">
                  <Layers className="w-6 h-6 text-yellow-500" />
                  <div>
                    <h4 className={`text-lg font-bold ${
                      theme === 'light' ? 'text-gray-800' : 'text-white'
                    }`}>{market.name}</h4>
                    <p className={`text-sm ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>{market.pairs}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tools Section */}
        <div className={`rounded-2xl p-8 mb-12 ${
          theme === 'light'
            ? 'bg-white border-2 border-gray-200 shadow-lg'
            : 'bg-gradient-to-b from-gray-900 to-black border border-red-800/30'
        }`}>
          <h2 className={`text-2xl font-black mb-6 text-center ${
            theme === 'light' ? 'text-gray-800' : 'text-white'
          }`}>Strumenti di Analisi</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Heatmap", desc: "Visualizzazione correlazioni" },
              { title: "Scanner", desc: "Ricerca opportunità" },
              { title: "Screener", desc: "Filtri personalizzati" },
              { title: "Alerts", desc: "Notifiche automatiche" }
            ].map((tool, i) => (
              <div key={i} className={`text-center p-4 rounded-lg border ${
                theme === 'light'
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-black/30 border-gray-800'
              }`}>
                <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-yellow-600 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <h4 className={`text-lg font-bold mb-1 ${
                  theme === 'light' ? 'text-gray-800' : 'text-white'
                }`}>{tool.title}</h4>
                <p className={`text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>{tool.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-black text-white mb-4">Accedi alle Analisi</h2>
          <p className="text-gray-100 mb-6">Report professionali, strumenti avanzati e aggiornamenti in tempo reale</p>
          <button className={`px-8 py-4 bg-black text-yellow-500 rounded-xl font-bold text-lg hover:bg-gray-900 transition-all duration-300 hover:scale-105 active:scale-95 border-2 ${theme === 'light' ? 'border-gray-900 shadow-lg' : 'border-transparent'}`}>
            INIZIA SUBITO
          </button>
        </div>
      </div>
    </div>
  );
};

export default Analisi;
