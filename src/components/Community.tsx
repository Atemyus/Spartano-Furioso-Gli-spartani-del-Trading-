import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, TrendingUp, Users, Mail, ArrowRight, Star } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Community = () => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('https://api.spartanofurioso.com/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          source: 'community_page'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: '🎉 Benvenuto nella Falange! Controlla la tua email per confermare l\'iscrizione.' 
        });
        setEmail('');
      } else {
        setMessage({ 
          type: 'error', 
          text: data.error || 'Errore durante l\'iscrizione. Riprova.' 
        });
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setMessage({ 
        type: 'error', 
        text: 'Errore di connessione. Riprova più tardi.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="community" className={`py-20 transition-colors duration-500 ${
      theme === 'dark'
        ? 'bg-gradient-to-b from-red-950/20 to-black'
        : 'bg-gradient-to-b from-red-50/40 to-white'
    }`}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-600/20 to-red-600/20 px-4 py-2 rounded-full border border-yellow-600/30 mb-6">
            <Users className="w-4 h-4 text-yellow-500" />
            <span className="text-yellow-400 text-sm font-medium">UNISCITI ALLA FRATELLANZA</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>LA </span>
            <span className="bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent">COMMUNITY</span>
            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}> SPARTANA</span>
          </h2>
          <p className={`text-xl max-w-3xl mx-auto leading-relaxed ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Entra a far parte della più disciplinata community di trader. 
            Condividiamo strategie, risultati e l'inarrestabile spirito spartano.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Community Features */}
          <div className="space-y-8">
            <h3 className={`text-2xl font-bold mb-8 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Benefici della Fratellanza</h3>
            
            {[
              {
                icon: MessageCircle,
                title: "Canale Telegram Esclusivo",
                description: "Accesso al canale privato con segnali in tempo reale, analisi di mercato e supporto 24/7 da parte degli spartani veterani."
              },
              {
                icon: TrendingUp,
                title: "Strategie Condivise",
                description: "Scopri le tattiche più efficaci dalla community. Ogni spartano condivide le proprie configurazioni vincenti."
              },
              {
                icon: Users,
                title: "Supporto Fraterno",
                description: "Non combatti da solo. La fratellanza spartana ti supporta in ogni battaglia contro i mercati volatili."
              }
            ].map((feature, index) => (
              <div key={index} className={`flex items-start space-x-4 p-6 border border-yellow-600/30 rounded-xl hover:border-yellow-500/50 transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-gray-900 to-black'
                  : 'bg-gradient-to-br from-white to-gray-50'
              }`}>
                <div className="w-12 h-12 bg-gradient-to-br from-red-800 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h4 className={`text-lg font-bold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>{feature.title}</h4>
                  <p className={`leading-relaxed ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Newsletter Signup */}
          <div className={`border border-yellow-600/30 rounded-xl p-8 ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-gray-900 to-black'
              : 'bg-gradient-to-br from-white to-gray-50'
          }`}>
            <div className="text-center mb-8">
              <h3 className={`text-2xl font-bold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Ricevi il Bollettino di Guerra</h3>
              <p className={`leading-relaxed ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Aggiornamenti settimanali sui risultati, nuove strategie e wisdom spartana 
                applicata ai mercati finanziari.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  La tua email da guerriero
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="spartano@esempio.com"
                  className={`w-full px-4 py-3 border border-yellow-600/50 rounded-lg placeholder-gray-500 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all duration-300 ${
                    theme === 'dark'
                      ? 'bg-black text-white'
                      : 'bg-white text-gray-900'
                  }`}
                  required
                />
              </div>
              
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-800 to-red-600 px-6 py-4 rounded-lg font-bold hover:from-red-700 hover:to-red-500 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>ARRUOLAMENTO IN CORSO...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    <span>ARRUOLATI NELLA FALANGE</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Success/Error Message */}
              {message && (
                <div className={`p-4 rounded-lg border ${
                  message.type === 'success' 
                    ? 'bg-green-900/20 border-green-700 text-green-300' 
                    : 'bg-red-900/20 border-red-700 text-red-300'
                }`}>
                  <p className="text-sm font-medium">{message.text}</p>
                </div>
              )}
            </form>

            {/* Disclaimer */}
            <div className="mt-6 p-4 bg-yellow-600/10 border border-yellow-600/30 rounded-lg">
              <p className="text-xs text-gray-400 leading-relaxed">
                <strong className="text-yellow-500">⚠️ AVVERTENZA SPARTANA:</strong> Come ogni battaglia, il trading comporta rischi. 
                Fury Of Sparta è uno strumento potente, ma la vittoria finale dipende dalla tua disciplina e gestione del rischio. 
                I risultati passati non garantiscono performance future. Combatti responsabilmente.
              </p>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-16 text-center">
          <p className={`mb-6 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>Unisciti a oltre 300 spartani che stanno già dominando i mercati</p>
          <div className="flex justify-center space-x-4">
            {[...Array(5)].map((_, index) => (
              <Star key={index} className="w-6 h-6 text-yellow-500 fill-current" />
            ))}
          </div>
          <p className="text-yellow-500 font-medium mt-2">4.9/5 stelle da 150+ recensioni</p>
        </div>
      </div>
    </section>
  );
};

export default Community;