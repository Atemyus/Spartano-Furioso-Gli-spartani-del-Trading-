import { HelpCircle, MessageCircle, Book, Video, Mail, Phone, Search, FileText } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const CentroAiuto = () => {
  const { theme } = useTheme();
  const categories = [
    { icon: HelpCircle, title: "Primi Passi", count: "15 articoli", topics: ["Registrazione", "Primo deposito", "Verifica account", "Navigazione piattaforma"] },
    { icon: Book, title: "Guide Trading", count: "32 articoli", topics: ["Come aprire trade", "Gestione posizioni", "Ordini avanzati", "Strategie base"] },
    { icon: Video, title: "Video Tutorial", count: "28 video", topics: ["Setup piattaforma", "Analisi tecnica", "Uso indicatori", "Risk management"] },
    { icon: FileText, title: "FAQ", count: "45 domande", topics: ["Pagamenti", "Prelievi", "Commissioni", "Problemi tecnici"] }
  ];

  return (
    <div className={`min-h-screen pt-24 ${
      theme === 'light' ? 'bg-gradient-to-b from-white via-gray-50 to-white' : 'bg-black'
    }`}>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 bg-clip-text text-transparent">
            CENTRO AIUTO
          </h1>
          <p className={`text-xl max-w-3xl mx-auto ${
            theme === 'light' ? 'text-gray-600' : 'text-gray-300'
          }`}>
            Trova risposte rapide, guide dettagliate e supporto immediato. Siamo qui per aiutarti.
          </p>
        </div>

        {/* Search */}
        <div className="mb-12">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cerca una guida o una domanda..." 
              className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:outline-none transition-all ${
                theme === 'light'
                  ? 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-yellow-600'
                  : 'bg-gray-900 border-red-800/30 text-white placeholder-gray-500 focus:border-yellow-500'
              }`}
            />
          </div>
        </div>

        {/* Categories */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {categories.map((cat, i) => (
            <div key={i} className={`rounded-xl p-8 transition-all duration-300 ${
              theme === 'light'
                ? 'bg-white border-2 border-gray-200 hover:border-yellow-600 shadow-lg'
                : 'bg-gradient-to-b from-gray-900 to-black border border-red-800/30 hover:border-yellow-500/50'
            }`}>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-yellow-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <cat.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className={`text-2xl font-bold mb-1 ${
                    theme === 'light' ? 'text-gray-800' : 'text-white'
                  }`}>{cat.title}</h3>
                  <p className={`text-sm ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>{cat.count}</p>
                </div>
              </div>
              <ul className="space-y-2">
                {cat.topics.map((topic, j) => (
                  <li key={j} className={`cursor-pointer transition-colors flex items-center gap-2 ${
                    theme === 'light'
                      ? 'text-gray-600 hover:text-yellow-600'
                      : 'text-gray-400 hover:text-yellow-500'
                  }`}>
                    <div className="w-1 h-1 bg-yellow-500 rounded-full"></div>
                    {topic}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Options */}
        <div className={`rounded-2xl p-8 ${
          theme === 'light'
            ? 'bg-gradient-to-r from-gray-100 to-gray-50 border-2 border-gray-200'
            : 'bg-gradient-to-r from-red-950/50 via-black/50 to-red-950/50 backdrop-blur-sm border border-red-800/30'
        }`}>
          <h2 className={`text-3xl font-black mb-8 text-center ${
            theme === 'light' ? 'text-gray-800' : 'text-white'
          }`}>Hai Bisogno di Aiuto Diretto?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className={`rounded-xl p-6 text-center ${
              theme === 'light' ? 'bg-white border border-gray-200' : 'bg-black/30'
            }`}>
              <MessageCircle className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
              <h4 className={`text-lg font-bold mb-2 ${
                theme === 'light' ? 'text-gray-800' : 'text-white'
              }`}>Live Chat</h4>
              <p className={`text-sm mb-4 ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>Risposta in 2 minuti</p>
              <button className={`px-4 py-2 text-white rounded-lg font-bold hover:scale-105 transition-transform border-2 ${
                theme === 'light'
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 border-yellow-700 shadow-md'
                  : 'bg-gradient-to-r from-red-600 to-red-800 border-transparent'
              }`}>
                Apri Chat
              </button>
            </div>
            <div className={`rounded-xl p-6 text-center ${
              theme === 'light' ? 'bg-white border border-gray-200' : 'bg-black/30'
            }`}>
              <Mail className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
              <h4 className={`text-lg font-bold mb-2 ${
                theme === 'light' ? 'text-gray-800' : 'text-white'
              }`}>Email</h4>
              <p className={`text-sm mb-4 ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>Risposta in 24h</p>
              <button className={`px-4 py-2 text-white rounded-lg font-bold hover:scale-105 transition-transform border-2 ${
                theme === 'light'
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 border-yellow-700 shadow-md'
                  : 'bg-gradient-to-r from-red-600 to-red-800 border-transparent'
              }`}>
                Invia Email
              </button>
            </div>
            <div className={`rounded-xl p-6 text-center ${
              theme === 'light' ? 'bg-white border border-gray-200' : 'bg-black/30'
            }`}>
              <Phone className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
              <h4 className={`text-lg font-bold mb-2 ${
                theme === 'light' ? 'text-gray-800' : 'text-white'
              }`}>Telefono</h4>
              <p className={`text-sm mb-4 ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>Lun-Ven 9-18</p>
              <button className={`px-4 py-2 text-white rounded-lg font-bold hover:scale-105 transition-transform border-2 ${
                theme === 'light'
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 border-yellow-700 shadow-md'
                  : 'bg-gradient-to-r from-red-600 to-red-800 border-transparent'
              }`}>
                Chiama Ora
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CentroAiuto;
