import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { API_ENDPOINTS } from '../config/api';
import {
  Shield, Clock, CheckCircle, Zap, ArrowLeft, TrendingUp, Star, Gift,
  Rocket, Target, Award, PlayCircle, Sparkles,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  type: string;
  features: string[];
  trialDays: number;
  category?: string;
  badge?: string;
  metrics?: { winRate?: number; avgProfit?: number };
  pricingPlans?: any;
}

interface Trial {
  id: string;
  productId: string;
  productName: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  status: 'active' | 'expired' | 'converted';
}

const Trials: React.FC = () => {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTrials, setActiveTrials] = useState<Trial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchData();
  }, [token, navigate]);

  const fetchData = async () => {
    try {
      const r = await fetch(`${API_ENDPOINTS.products}?t=${Date.now()}`, { cache: 'no-cache' });
      if (r.ok) {
        const data = await r.json();
        setProducts(data.filter((p: Product) => p.trialDays > 0));
      }
    } catch (e) {
      console.error('Error fetching data:', e);
    } finally {
      setLoading(false);
    }
  };

  const startTrial = async (productId: string) => {
    try {
      const r = await fetch(API_ENDPOINTS.startTrialNew, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ productId })
      });
      if (r.ok) {
        alert('Trial attivato con successo!');
        fetchData();
      } else {
        const err = await r.json();
        alert(err.message || 'Errore nell\'attivazione del trial');
      }
    } catch (e) {
      console.error('Error starting trial:', e);
      alert('Errore nell\'attivazione del trial');
    }
  };

  const categories = [
    { id: 'all', name: 'Tutti', icon: Gift },
    { id: 'bot', name: 'Bot Trading', icon: Shield },
    { id: 'indicator', name: 'Indicatori', icon: TrendingUp },
    { id: 'course', name: 'Formazione', icon: Star },
    { id: 'service', name: 'Servizi', icon: Zap },
  ];

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => {
        const c = (p.category || 'bot').toLowerCase();
        if (selectedCategory === 'bot') return c.includes('bot');
        if (selectedCategory === 'indicator') return c.includes('indicator') || c.includes('indicat');
        if (selectedCategory === 'course') return c.includes('formazione') || c.includes('course');
        if (selectedCategory === 'service') return c.includes('service') || c.includes('signal');
        return false;
      });

  const isTrialActive = (productId: string) => activeTrials.some(t => t.productId === productId && t.status === 'active');

  // ====== styling helpers (dashboard-style) ======
  const bg = dark ? 'bg-black' : 'bg-slate-50';
  const surface = dark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm';
  const surfaceHover = dark ? 'hover:border-cyan-500/50' : 'hover:border-cyan-500/70';
  const textMain = dark ? 'text-white' : 'text-slate-900';
  const textMuted = dark ? 'text-slate-400' : 'text-slate-600';
  const textDim = dark ? 'text-slate-500' : 'text-slate-500';
  const headerBg = dark ? 'bg-black/70 border-slate-800/80' : 'bg-white/70 border-slate-200';
  const secondaryBtn = dark
    ? 'bg-slate-900 text-slate-300 ring-1 ring-slate-800 hover:ring-cyan-500/40'
    : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-cyan-500/50';
  const primaryBtn = 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:shadow-md hover:shadow-cyan-500/20';
  const tag = (label: string) => (
    <span className="font-mono-lab text-[0.7rem] tracking-[0.3em] uppercase text-cyan-500">{label}</span>
  );

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bg}`}>
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg}`}>
      {/* Topbar */}
      <header className={`sticky top-0 z-30 backdrop-blur-md border-b ${headerBg}`}>
        <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
          <Link to="/dashboard" className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-display font-semibold transition-all ${secondaryBtn}`}>
            <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
          </Link>
          <div className="text-center hidden md:block">
            <div className={`font-mono-lab text-[0.65rem] tracking-[0.3em] uppercase ${textDim}`}>// Nexora Lab</div>
            <div className={`font-display text-sm font-semibold ${textMain}`}>Prove gratuite</div>
          </div>
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-display font-semibold ${
            dark ? 'bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/30' : 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-500/30'
          }`}>
            <Gift className="w-3.5 h-3.5" /> 60 giorni gratis
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-8 py-8">
        {/* Hero */}
        <section className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-3">{tag('// Prove gratuite')}</div>
          <h1 className={`font-display text-4xl md:text-5xl font-semibold tracking-tight ${textMain}`}>
            <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">60 giorni</span>{' '}
            di accesso completo
          </h1>
          <p className={`mt-3 text-base max-w-2xl mx-auto ${textMuted}`}>
            Testa qualsiasi bot, indicatore o corso senza limiti. <span className={`font-semibold ${textMain}`}>Nessuna carta richiesta.</span>
          </p>
        </section>

        {/* Stats banner */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          {[
            { Icon: Target, value: '100%', label: 'Gratuito' },
            { Icon: Clock, value: '60', label: 'Giorni di prova' },
            { Icon: CheckCircle, value: 'No', label: 'Carta richiesta' },
            { Icon: Award, value: 'Full', label: 'Accesso completo' },
          ].map((s, i) => (
            <div key={i} className={`rounded-xl border p-4 ${surface}`}>
              <s.Icon className="w-4 h-4 text-cyan-500 mb-2" />
              <div className={`font-display text-2xl font-semibold ${textMain}`}>{s.value}</div>
              <div className={`font-mono-lab text-[0.6rem] tracking-[0.2em] uppercase mt-1 ${textDim}`}>{s.label}</div>
            </div>
          ))}
        </section>

        {/* Active trials */}
        {activeTrials.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <PlayCircle className="w-3.5 h-3.5 text-cyan-500" />
              {tag('// I tuoi trial attivi')}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {activeTrials.map((trial) => (
                <div key={trial.id} className={`rounded-xl border p-5 ${surface} ${surfaceHover}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className={`font-display text-lg font-semibold ${textMain}`}>{trial.productName}</h4>
                      <span className="inline-flex items-center gap-1.5 mt-1 text-xs text-emerald-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Attivo
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-2xl font-semibold text-cyan-500">{trial.daysRemaining}</div>
                      <div className={`font-mono-lab text-[0.55rem] tracking-widest uppercase ${textDim}`}>giorni</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => navigate('/dashboard')} className={`flex-1 px-4 py-2 rounded-lg text-sm font-display font-semibold ${primaryBtn}`}>
                      Vai al prodotto
                    </button>
                    <button className={`px-4 py-2 rounded-lg text-sm font-display font-semibold ${secondaryBtn}`}>
                      Converti in abbonamento
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Category filter */}
        <section className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((c) => {
            const Icon = c.icon;
            const active = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-display font-semibold transition-all ${
                  active ? primaryBtn : secondaryBtn
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {c.name}
              </button>
            );
          })}
        </section>

        {/* Products grid */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-3.5 h-3.5 text-cyan-500" />
            {tag('// Prodotti disponibili')}
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => {
                const isTrial = isTrialActive(product.id);
                return (
                  <div key={product.id} className={`rounded-xl border p-5 transition-all ${surface} ${surfaceHover}`}>
                    {product.badge && (
                      <div className="mb-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-md text-[0.6rem] font-mono-lab tracking-widest uppercase font-bold ${
                          dark ? 'bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/30' : 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-500/30'
                        }`}>{product.badge}</span>
                      </div>
                    )}

                    <h4 className={`font-display text-lg font-semibold ${textMain}`}>{product.name}</h4>
                    <p className={`text-sm mt-1 mb-4 line-clamp-3 ${textMuted}`}>{product.description}</p>

                    <div className={`rounded-lg p-3 mb-3 flex items-center justify-between text-sm ${dark ? 'bg-slate-950/50 ring-1 ring-slate-800' : 'bg-slate-50 ring-1 ring-slate-200'}`}>
                      <span className={textMuted}>Durata prova</span>
                      <span className="text-cyan-500 font-display font-semibold">{product.trialDays} giorni</span>
                    </div>

                    {product.metrics && product.category !== 'Formazione' && product.category !== 'course' && (
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {product.metrics.winRate != null && (
                          <div className={`rounded-lg p-2.5 text-center ${dark ? 'bg-slate-950/40 ring-1 ring-slate-800' : 'bg-slate-50 ring-1 ring-slate-200'}`}>
                            <div className={`font-mono-lab text-[0.55rem] tracking-widest uppercase ${textDim}`}>Win Rate</div>
                            <div className={`font-display text-sm font-semibold mt-0.5 ${textMain}`}>{product.metrics.winRate}%</div>
                          </div>
                        )}
                        {product.metrics.avgProfit != null && (
                          <div className={`rounded-lg p-2.5 text-center ${dark ? 'bg-slate-950/40 ring-1 ring-slate-800' : 'bg-slate-50 ring-1 ring-slate-200'}`}>
                            <div className={`font-mono-lab text-[0.55rem] tracking-widest uppercase ${textDim}`}>Profit medio</div>
                            <div className={`font-display text-sm font-semibold mt-0.5 ${textMain}`}>+{product.metrics.avgProfit}%</div>
                          </div>
                        )}
                      </div>
                    )}

                    <ul className="space-y-1.5 mb-5">
                      {product.features.slice(0, 3).map((f, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                          <span className={textMuted}>{f}</span>
                        </li>
                      ))}
                      {product.features.length > 3 && (
                        <li className={`text-xs ml-5 ${textDim}`}>+{product.features.length - 3} altre funzionalità</li>
                      )}
                    </ul>

                    {isTrial ? (
                      <button disabled className={`w-full py-2.5 rounded-lg text-sm font-display font-semibold cursor-not-allowed inline-flex items-center justify-center gap-2 ${
                        dark ? 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30' : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/30'
                      }`}>
                        <CheckCircle className="w-4 h-4" /> Trial già attivo
                      </button>
                    ) : (
                      <button
                        onClick={() => startTrial(product.id)}
                        className={`w-full py-2.5 rounded-lg text-sm font-display font-semibold inline-flex items-center justify-center gap-2 transition-all ${primaryBtn}`}
                      >
                        <Rocket className="w-4 h-4" />
                        Inizia prova gratuita
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`rounded-xl border p-12 text-center ${surface}`}>
              <div className={`w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center ${dark ? 'bg-slate-900' : 'bg-slate-100'}`}>
                <Gift className={`w-6 h-6 ${textDim}`} />
              </div>
              <h3 className={`font-display text-lg font-semibold mb-1 ${textMain}`}>Nessun prodotto disponibile</h3>
              <p className={`text-sm ${textMuted}`}>Non ci sono prodotti con prova gratuita in questa categoria</p>
            </div>
          )}
        </section>

        {/* How it works */}
        <section className={`rounded-2xl border p-6 md:p-8 ${surface} relative overflow-hidden`}>
          <div className="absolute -top-px left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
          <div className="text-center mb-8">
            <div className={`w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center ${dark ? 'bg-cyan-500/10 ring-1 ring-cyan-500/30' : 'bg-cyan-50 ring-1 ring-cyan-500/30'}`}>
              <Shield className="w-5 h-5 text-cyan-500" />
            </div>
            {tag('// come funziona')}
            <h3 className={`mt-3 font-display text-2xl md:text-3xl font-semibold tracking-tight ${textMain}`}>3 step e sei dentro</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { n: 1, title: 'Scegli il prodotto', desc: 'Seleziona il bot, indicatore o corso da provare' },
              { n: 2, title: 'Attiva il trial', desc: '60 giorni di accesso completo, senza carta richiesta' },
              { n: 3, title: 'Decidi senza fretta', desc: 'Converti in abbonamento solo se sei soddisfatto' },
            ].map((s) => (
              <div key={s.n} className={`rounded-xl border p-5 text-center ${surface}`}>
                <div className={`w-10 h-10 mx-auto mb-3 rounded-lg flex items-center justify-center font-display font-semibold text-cyan-500 ${dark ? 'bg-cyan-500/10 ring-1 ring-cyan-500/30' : 'bg-cyan-50 ring-1 ring-cyan-500/30'}`}>
                  {s.n}
                </div>
                <h4 className={`font-display font-semibold ${textMain}`}>{s.title}</h4>
                <p className={`text-sm mt-1 ${textMuted}`}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Trials;
