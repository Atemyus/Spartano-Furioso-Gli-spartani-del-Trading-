import React, { useState } from 'react';
import { MessageCircle, BookOpen, Users, Mail, ArrowRight, Star } from 'lucide-react';
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'community_page' }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Iscrizione confermata. Controlla l\'email per validare l\'indirizzo.',
        });
        setEmail('');
      } else {
        setMessage({ type: 'error', text: data.error || 'Errore durante l\'iscrizione. Riprova.' });
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setMessage({ type: 'error', text: 'Errore di connessione. Riprova più tardi.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="community" className={`py-24 transition-colors duration-500 ${
      theme === 'dark'
        ? 'bg-gradient-to-b from-blue-950/20 to-black'
        : 'bg-gradient-to-b from-blue-50/40 to-white'
    }`}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 px-4 py-1.5 rounded-full border border-cyan-500/30 mb-6 backdrop-blur-sm">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono-lab text-xs text-cyan-300 tracking-[0.25em] uppercase">// Community</span>
          </div>
          <h2 className={`font-display text-4xl md:text-6xl font-bold mb-6 tracking-tight ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}>
            Una <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">community</span> di builder
          </h2>
          <p className={`text-lg md:text-xl max-w-3xl mx-auto leading-relaxed ${
            theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Trader, creator e operatori digitali che condividono setup, contenuti e numeri
            reali. Niente promesse facili: discussioni concrete e strumenti che funzionano.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
          {/* Community Features */}
          <div className="space-y-5">
            <h3 className={`font-display text-2xl font-semibold mb-6 tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>Cosa trovi nel canale</h3>

            {[
              {
                icon: MessageCircle,
                tag: '01',
                title: 'Canale privato',
                description: 'Telegram e Discord dedicati: aggiornamenti operativi, segnali, drop di contenuti e Q&A settimanali con i mentor.',
              },
              {
                icon: BookOpen,
                tag: '02',
                title: 'Setup e playbook condivisi',
                description: 'Configurazioni di bot, template per creator, script di ricerca, framework di posizionamento. Riutilizzabili e versionati.',
              },
              {
                icon: Users,
                tag: '03',
                title: 'Peer support reale',
                description: 'Niente toxic positivity. Membri che si confrontano sui numeri, fanno review reciproche e condividono cosa non ha funzionato.',
              },
            ].map((feature, index) => (
              <div key={index} className={`flex items-start gap-4 p-5 border rounded-xl transition-all duration-300 hover:-translate-y-0.5 ${
                theme === 'dark'
                  ? 'bg-slate-900/60 border-slate-700/60 backdrop-blur-sm hover:border-cyan-400'
                  : 'bg-white border-slate-200 hover:border-cyan-400 shadow-sm'
              }`}>
                <div className="w-11 h-11 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-cyan-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono-lab text-xs text-cyan-500 tracking-widest">{feature.tag}</span>
                    <h4 className={`font-display text-base font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-slate-900'
                    }`}>{feature.title}</h4>
                  </div>
                  <p className={`text-sm leading-relaxed ${
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                  }`}>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Newsletter Signup */}
          <div className={`border rounded-xl p-8 ${
            theme === 'dark'
              ? 'bg-slate-900/60 border-slate-700/60 backdrop-blur-sm'
              : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="mb-6">
              <span className="font-mono-lab text-xs text-cyan-400 tracking-[0.25em] uppercase">// Lab Brief</span>
              <h3 className={`font-display text-2xl md:text-3xl font-semibold mt-2 mb-3 tracking-tight ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>
                Insight settimanali, zero spam
              </h3>
              <p className={`text-sm leading-relaxed ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Una mail a settimana con: 1 setup operativo, 1 framework creator, 1 cosa che ha
                funzionato (o no) sui mercati. Niente fuffa motivazionale.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className={`block text-xs font-mono-lab tracking-widest uppercase mb-2 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@dominio.com"
                  className={`w-full px-4 py-3 border rounded-lg transition-all duration-300 ${
                    theme === 'dark'
                      ? 'bg-slate-950/50 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20'
                  }`}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3.5 rounded-lg font-display font-semibold transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-blue-500/30 hover:shadow-cyan-500/40 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                    <span>Invio in corso...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>Iscriviti al Lab Brief</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {message && (
                <div className={`p-3 rounded-lg border text-sm ${
                  message.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                }`}>
                  {message.text}
                </div>
              )}
            </form>

            <div className="mt-6 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
              <p className={`font-mono-lab text-xs leading-relaxed ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
              }`}>
                <span className="text-cyan-400">// disclaimer:</span> il trading e gli investimenti
                comportano rischi. I risultati passati non garantiscono performance future. I
                contenuti di Nexora Lab sono educativi, non costituiscono consulenza finanziaria.
              </p>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-16 text-center">
          <p className={`font-mono-lab text-xs tracking-widest uppercase mb-4 ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
          }`}>// 500+ membri attivi · 150+ recensioni</p>
          <div className="flex justify-center gap-1">
            {[...Array(5)].map((_, index) => (
              <Star key={index} className="w-5 h-5 text-cyan-400 fill-current" />
            ))}
          </div>
          <p className="font-display text-cyan-400 font-semibold mt-2">4.9 / 5 · feedback verificati</p>
        </div>
      </div>
    </section>
  );
};

export default Community;
