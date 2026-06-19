import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { API_ENDPOINTS } from '../config/api';
import {
  Shield, Download, CheckCircle, AlertCircle, ArrowLeft, Clock, Key,
  MessageCircle, Users, PlayCircle, Video, ExternalLink, Rocket, Trophy,
  AlertTriangle, Monitor, Settings, Activity, Lock, ChevronRight, Sparkles,
} from 'lucide-react';
import PaymentOptionsModal from '../components/PaymentOptionsModal';
import EAParametersComplete from '../components/EAParametersComplete';

interface Product {
  id: string;
  name: string;
  description: string;
  category?: string;
  type: string;
  features: string[];
  requirements?: string[];
  platforms?: string[];
  trialDays: number;
  downloadUrl?: string;
  version?: string;
  fileSize?: string;
  lastUpdated?: string;
  metrics?: { winRate?: number; avgProfit?: number };
  price?: { monthly?: number; yearly?: number; lifetime?: number } | number;
  currency?: string;
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

const TrialManagement: React.FC = () => {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [trial, setTrial] = useState<Trial | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [showPlanSelection, setShowPlanSelection] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | 'lifetime' | undefined>(undefined);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    license: false, systems: false, lotsize: false, tpsl: false, breakeven: false,
    risk: false, timefilter: false, newsfilter: false, advanced: false,
    htf: false, liquidity: false, volumeprofile: false
  });

  const token = localStorage.getItem('token');

  const TELEGRAM_CHANNEL = 'https://t.me/spartanofurioso_channel';
  const TELEGRAM_CONTACT = 'https://t.me/catiscrazy';

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    if (productId) fetchData();
  }, [productId, token, navigate]);

  const fetchData = async () => {
    try {
      const r = await fetch(`${API_ENDPOINTS.products}?t=${Date.now()}`);
      if (r.ok) {
        const products = await r.json();
        const found = products.find((p: Product) => p.id === productId);
        if (found) setProduct(found);
        else { navigate('/products'); return; }
      }
      const tr = await fetch(API_ENDPOINTS.checkTrial(productId!), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (tr.ok) {
        const data = await tr.json();
        if (data.success && data.trial) setTrial(data.trial);
        else navigate(`/trial/${productId}`);
      }
    } catch (e) {
      console.error('Error fetching data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!product) return;
    setDownloadStarted(true);
    try {
      const t = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'https://api.nexoralab.solutions';
      const response = await fetch(`${apiUrl}/api/products/${product.id}/download`, {
        method: 'GET', headers: { 'Authorization': `Bearer ${t}` }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const cd = response.headers.get('content-disposition');
        const m = cd?.match(/filename="?([^"]+)"?/);
        a.download = m ? m[1] : `${product.name}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const err = await response.json();
        throw new Error(err.error || 'Errore download');
      }
    } catch (e: any) {
      alert(e?.message || 'Errore durante il download.');
      setDownloadStarted(false);
    }
  };

  const handleSelectPlan = (plan: 'monthly' | 'yearly' | 'lifetime') => {
    setSelectedPlan(plan);
    setShowPlanSelection(false);
  };

  const getPlanLabel = (plan: 'monthly' | 'yearly' | 'lifetime') => ({
    monthly: 'Abbonamento Mensile',
    yearly: 'Abbonamento Annuale',
    lifetime: 'Acquisto Lifetime',
  }[plan] || '');

  const isDownloadable = () => {
    if (!product) return false;
    const c = (product.category || '').toLowerCase();
    return c.includes('bot') || c.includes('indicator') || c.includes('indicat');
  };

  const toggleSection = (s: string) => setExpandedSections((p) => ({ ...p, [s]: !p[s] }));

  // ====== styling ======
  const surface = dark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm';
  const surfaceHover = dark ? 'hover:border-cyan-500/50' : 'hover:border-cyan-500/70';
  const textMain = dark ? 'text-white' : 'text-slate-900';
  const textMuted = dark ? 'text-slate-400' : 'text-slate-600';
  const textDim = dark ? 'text-slate-500' : 'text-slate-500';
  const bg = dark ? 'bg-black' : 'bg-slate-50';
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

  if (!product || !trial) {
    return (
      <div className={`min-h-screen ${bg}`}>
        <div className="container mx-auto px-4 py-20 text-center max-w-md">
          <div className={`w-14 h-14 mx-auto mb-5 rounded-2xl flex items-center justify-center ${dark ? 'bg-amber-500/10 ring-1 ring-amber-500/30' : 'bg-amber-50 ring-1 ring-amber-500/30'}`}>
            <AlertTriangle className="w-6 h-6 text-amber-500" />
          </div>
          {tag('// errore')}
          <h1 className={`mt-3 font-display text-2xl font-semibold tracking-tight ${textMain}`}>Prova non trovata</h1>
          <p className={`mt-2 mb-6 text-sm ${textMuted}`}>Non hai una prova attiva per questo prodotto.</p>
          <Link to="/dashboard" className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-display font-semibold ${primaryBtn}`}>
            <ArrowLeft className="w-4 h-4" /> Torna alla dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (trial.daysRemaining <= 0) {
    return (
      <div className={`min-h-screen ${bg}`}>
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <div className={`rounded-2xl border p-8 mb-6 ${surface}`}>
            <div className={`w-14 h-14 mx-auto mb-5 rounded-2xl flex items-center justify-center ${dark ? 'bg-amber-500/10 ring-1 ring-amber-500/30' : 'bg-amber-50 ring-1 ring-amber-500/30'}`}>
              <AlertCircle className="w-6 h-6 text-amber-500" />
            </div>
            <div className="text-center">
              {tag('// prova scaduta')}
              <h1 className={`mt-3 font-display text-3xl font-semibold tracking-tight ${textMain}`}>Il periodo di prova è terminato</h1>
              <p className={`mt-3 text-sm ${textMuted}`}>
                La tua prova per <span className="text-cyan-500 font-semibold">{product.name}</span> è scaduta.
              </p>
            </div>
            <div className={`mt-6 grid grid-cols-2 gap-3 rounded-xl p-4 ${dark ? 'bg-slate-950/60 ring-1 ring-slate-800' : 'bg-slate-50 ring-1 ring-slate-200'}`}>
              <div>
                <div className={`font-mono-lab text-[0.6rem] tracking-[0.25em] uppercase ${textDim}`}>// iniziato</div>
                <div className={`mt-1 text-sm font-display font-semibold ${textMain}`}>{new Date(trial.startDate).toLocaleDateString('it-IT')}</div>
              </div>
              <div>
                <div className={`font-mono-lab text-[0.6rem] tracking-[0.25em] uppercase ${textDim}`}>// terminato</div>
                <div className="mt-1 text-sm font-display font-semibold text-amber-500">{new Date(trial.endDate).toLocaleDateString('it-IT')}</div>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-2">
              <button onClick={() => setShowPlanSelection(true)} className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-display font-semibold ${primaryBtn}`}>
                <Rocket className="w-4 h-4" /> Acquista la versione completa
              </button>
              <button onClick={() => navigate('/dashboard')} className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-display font-semibold ${secondaryBtn}`}>
                Torna alla dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = Math.round(((product.trialDays - trial.daysRemaining) / product.trialDays) * 100);
  const expiring = trial.daysRemaining <= 7;

  return (
    <div className={`min-h-screen ${bg}`}>
      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(${dark ? '#ffffff' : '#0b1e3f'} 1px, transparent 1px), linear-gradient(90deg, ${dark ? '#ffffff' : '#0b1e3f'} 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Topbar */}
      <header className={`sticky top-0 z-30 backdrop-blur-md border-b ${headerBg}`}>
        <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
          <Link to="/dashboard" className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-display font-semibold transition-all ${secondaryBtn}`}>
            <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
          </Link>
          <div className="text-center hidden md:block">
            <div className={`font-mono-lab text-[0.65rem] tracking-[0.3em] uppercase ${textDim}`}>// Nexora Lab</div>
            <div className={`font-display text-sm font-semibold ${textMain}`}>Gestione prova gratuita</div>
          </div>
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-display font-semibold ${
            expiring
              ? dark ? 'bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-500/30'
              : dark ? 'bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/30' : 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-500/30'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${expiring ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            {trial.daysRemaining}g rimanenti
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-8 py-8 relative">
        <div className="max-w-6xl mx-auto">

          {/* Hero card */}
          <section className={`relative overflow-hidden rounded-2xl border p-6 md:p-8 mb-8 ${surface}`}>
            <div className="absolute -top-px left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1 min-w-0">
                {tag('// stai provando')}
                <h1 className={`mt-3 font-display text-3xl md:text-4xl font-semibold tracking-tight ${textMain}`}>{product.name}</h1>
                <p className={`mt-2 text-sm ${textMuted}`}>{product.description}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${dark ? 'bg-cyan-500/10 ring-1 ring-cyan-500/30' : 'bg-cyan-50 ring-1 ring-cyan-500/30'}`}>
                <Shield className="w-5 h-5 text-cyan-500" />
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className={textMuted}>Progresso della prova</span>
                <span className="text-cyan-500 font-display font-semibold">{progressPercentage}%</span>
              </div>
              <div className={`w-full rounded-full h-2 ${dark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
              {[
                { Icon: Clock, value: trial.daysRemaining, label: 'Giorni rimanenti' },
                { Icon: CheckCircle, value: 'Attiva', label: 'Stato' },
                { Icon: Activity, value: 'Full', label: 'Accesso' },
              ].map((s, i) => (
                <div key={i} className={`rounded-lg border p-4 ${surface}`}>
                  <s.Icon className="w-4 h-4 text-cyan-500 mb-2" />
                  <div className={`font-display text-2xl font-semibold ${textMain}`}>{s.value}</div>
                  <div className={`font-mono-lab text-[0.6rem] tracking-[0.2em] uppercase mt-1 ${textDim}`}>{s.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Main Actions */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {/* Download */}
            {isDownloadable() && (
              <section className={`rounded-2xl border p-6 ${surface}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Download className="w-3.5 h-3.5 text-cyan-500" />
                  {tag('// download')}
                </div>
                <h3 className={`font-display text-lg font-semibold ${textMain}`}>Scarica {product.category}</h3>

                <div className={`mt-4 space-y-2.5 text-sm rounded-lg p-4 ${dark ? 'bg-slate-950/40 ring-1 ring-slate-800' : 'bg-slate-50 ring-1 ring-slate-200'}`}>
                  <div className="flex justify-between"><span className={textMuted}>Versione</span><span className={`font-display font-semibold ${textMain}`}>{product.version || 'v3.2.1'}</span></div>
                  <div className="flex justify-between"><span className={textMuted}>Dimensione</span><span className={textMain}>{product.fileSize || '45 MB'}</span></div>
                  <div className="flex justify-between"><span className={textMuted}>Ultimo aggiornamento</span><span className={textMain}>{product.lastUpdated || 'Oggi'}</span></div>
                </div>

                <button onClick={handleDownload} disabled={downloadStarted}
                  className={`mt-5 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-display font-semibold ${downloadStarted ? 'bg-slate-700 text-slate-300 cursor-not-allowed' : primaryBtn}`}>
                  {downloadStarted ? (<><CheckCircle className="w-4 h-4" /> Download avviato</>) : (<><Download className="w-4 h-4" /> Scarica ora</>)}
                </button>
              </section>
            )}

            {/* Support */}
            <section className={`rounded-2xl border p-6 ${surface}`}>
              <div className="flex items-center gap-2 mb-1">
                <MessageCircle className="w-3.5 h-3.5 text-cyan-500" />
                {tag('// supporto & community')}
              </div>
              <h3 className={`font-display text-lg font-semibold ${textMain}`}>Risorse dedicate</h3>

              <div className="mt-4 space-y-2.5">
                <a href={TELEGRAM_CHANNEL} target="_blank" rel="noopener noreferrer"
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${surface} ${surfaceHover}`}>
                  <div className="flex items-center gap-3">
                    <ExternalLink className="w-4 h-4 text-cyan-500" />
                    <span className={`text-sm font-display font-medium ${textMain}`}>Canale Telegram</span>
                  </div>
                  <span className={`text-xs ${textDim}`}>Annunci</span>
                </a>

                <a href={TELEGRAM_CONTACT} target="_blank" rel="noopener noreferrer"
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${surface} ${surfaceHover}`}>
                  <div className="flex items-center gap-3">
                    <Key className="w-4 h-4 text-cyan-500" />
                    <span className={`text-sm font-display font-medium ${textMain}`}>Richiedi licenza</span>
                  </div>
                  <span className={`text-xs ${textDim}`}>@catiscrazy</span>
                </a>

                <div className={`flex items-center justify-between p-3 rounded-lg border opacity-60 ${dark ? 'bg-slate-950/30 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-3">
                    <Users className={`w-4 h-4 ${textDim}`} />
                    <span className={`text-sm font-display font-medium ${textMuted}`}>Gruppo supporto</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-cyan-500" />
                    <span className="text-cyan-500 text-[0.6rem] font-mono-lab tracking-widest uppercase font-bold">Premium</span>
                  </div>
                </div>
                <p className={`text-xs ${textDim} pl-1`}>Disponibile dopo l'acquisto del prodotto</p>
              </div>
            </section>
          </div>

          {/* Tutorial */}
          <section className={`rounded-2xl border p-6 mb-8 ${surface}`}>
            <div className="flex items-center gap-2 mb-1">
              <PlayCircle className="w-3.5 h-3.5 text-cyan-500" />
              {tag('// tutorial & guida')}
            </div>
            <h3 className={`font-display text-lg font-semibold ${textMain}`}>Imparare ad usare {product.name}</h3>
            <p className={`mt-1 text-sm ${textMuted}`}>Video tutorial per installazione e configurazione, parametro per parametro.</p>

            <div className="mt-5 grid md:grid-cols-2 gap-4">
              {[
                { Icon: Video, title: 'Lezione 1 — Installazione', duration: '05:53', src: '/videos/installazione.mp4', desc: 'Guida passo-passo per installare l\'EA su MetaTrader' },
                { Icon: Settings, title: 'Lezione 2 — Parametri EA', duration: '05:53', src: '/videos/parametri.mp4', desc: 'Spiegazione dettagliata di ogni parametro' },
              ].map((v, i) => (
                <div key={i} className={`rounded-xl border p-4 ${surface}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${dark ? 'bg-cyan-500/10 ring-1 ring-cyan-500/30' : 'bg-cyan-50 ring-1 ring-cyan-500/30'}`}>
                      <v.Icon className="w-4 h-4 text-cyan-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-display font-semibold text-sm ${textMain}`}>{v.title}</h4>
                      <div className={`flex items-center gap-1 text-xs ${textDim}`}>
                        <Clock className="w-3 h-3" /> <span>{v.duration}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`rounded-lg overflow-hidden ${dark ? 'bg-slate-950' : 'bg-slate-100'}`}>
                    <video controls className="w-full" preload="metadata">
                      <source src={v.src} type="video/mp4" />
                    </video>
                  </div>
                  <p className={`mt-3 text-xs ${textMuted}`}>{v.desc}</p>
                </div>
              ))}
            </div>

            <div className={`mt-5 rounded-lg p-3 text-xs flex items-start gap-2 ${dark ? 'bg-cyan-500/5 ring-1 ring-cyan-500/20' : 'bg-cyan-50 ring-1 ring-cyan-500/30'}`}>
              <Sparkles className="w-3.5 h-3.5 text-cyan-500 mt-0.5 shrink-0" />
              <p className={textMuted}>
                <strong className={`font-display font-semibold ${textMain}`}>Consiglio:</strong> Guarda prima il video di installazione, poi quello sui parametri per ottenere il massimo.
              </p>
            </div>
          </section>

          {/* EA Parameters (separate component) */}
          <EAParametersComplete theme={theme} expandedSections={expandedSections} toggleSection={toggleSection} />

          {/* Features */}
          {product.features?.length > 0 && (
            <section className={`rounded-2xl border p-6 mb-8 mt-8 ${surface}`}>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                {tag('// caratteristiche incluse nel trial')}
              </div>
              <div className={`grid md:grid-cols-2 gap-2.5 text-sm ${textMuted}`}>
                {product.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Platforms */}
          <section className={`rounded-2xl border p-6 mb-8 ${surface}`}>
            <div className="flex items-center gap-2 mb-3">
              <Monitor className="w-3.5 h-3.5 text-cyan-500" />
              {tag('// piattaforme supportate')}
            </div>
            <div className="flex flex-wrap gap-2">
              {['MetaTrader 4', 'MetaTrader 5'].map((p) => (
                <span key={p} className={`px-3 py-1.5 rounded-lg text-sm font-display font-medium ${dark ? 'bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/30' : 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-500/30'}`}>{p}</span>
              ))}
            </div>
          </section>

          {/* CTA upgrade */}
          <section className={`relative overflow-hidden rounded-2xl border p-6 md:p-8 ${surface}`}>
            <div className="absolute -top-px left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
            {showPlanSelection ? (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-3.5 h-3.5 text-cyan-500" />
                  {tag('// scegli il tuo piano')}
                </div>
                <h2 className={`font-display text-2xl md:text-3xl font-semibold mt-3 tracking-tight ${textMain}`}>Scegli il piano che fa per te</h2>
                <p className={`text-sm mt-1 mb-6 ${textMuted}`}>Sblocca {product.name} con la formula che preferisci.</p>

                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { plan: 'monthly' as const, name: 'Mensile', price: '69,99', original: '124,99', suffix: '/mese', features: ['Accesso completo', 'Aggiornamenti inclusi', 'Supporto tecnico', 'Cancellazione anytime'], highlighted: false },
                    { plan: 'yearly' as const, name: 'Annuale', price: '699,99', original: '999,99', suffix: '/anno', features: ['Tutto del piano mensile', 'Risparmio del 20%', 'Priorità supporto', 'Accesso anticipato'], highlighted: true, badge: 'Più popolare' },
                    { plan: 'lifetime' as const, name: 'Lifetime', price: '1399,99', original: '1899,99', suffix: 'una tantum', features: ['Accesso a vita', 'Tutti gli aggiornamenti', 'Supporto lifetime', 'Nessun rinnovo'], highlighted: false },
                  ].map((p) => (
                    <div key={p.plan} className={`relative rounded-xl border p-5 transition-all ${surface} ${p.highlighted ? 'ring-1 ring-cyan-500/50' : surfaceHover}`}>
                      {p.badge && (
                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[0.6rem] font-mono-lab tracking-widest uppercase font-bold bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
                          {p.badge}
                        </div>
                      )}
                      <h3 className={`font-display text-lg font-semibold ${textMain}`}>{p.name}</h3>
                      <div className="mt-3 mb-4">
                        <div className="flex items-baseline gap-2">
                          <span className="font-display text-3xl font-semibold text-cyan-500">€{p.price}</span>
                          <span className={`text-xs ${textDim}`}>{p.suffix}</span>
                        </div>
                        <div className={`text-xs line-through ${textDim}`}>€{p.original}</div>
                      </div>
                      <ul className={`text-sm space-y-1.5 mb-5 ${textMuted}`}>
                        {p.features.map((f) => (
                          <li key={f} className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <button onClick={() => handleSelectPlan(p.plan)} className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-display font-semibold transition-all ${p.highlighted ? primaryBtn : secondaryBtn}`}>
                        Scegli {p.name} <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <button onClick={() => setShowPlanSelection(false)} className={`mt-6 text-xs font-display ${textMuted} hover:${textMain}`}>
                  ← Torna indietro
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-3.5 h-3.5 text-cyan-500" />
                  {tag('// soddisfatto della prova?')}
                </div>
                <h2 className={`font-display text-2xl md:text-3xl font-semibold mt-3 tracking-tight ${textMain}`}>Sblocca tutto il potenziale di {product.name}</h2>
                <p className={`text-sm mt-2 mb-6 ${textMuted}`}>
                  Accesso completo, aggiornamenti gratuiti, supporto prioritario e community esclusiva inclusi.
                </p>
                <button onClick={() => setShowPlanSelection(true)} className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-display font-semibold ${primaryBtn}`}>
                  <Rocket className="w-4 h-4" /> Acquista ora — sconto trial
                </button>
                {product.price && (
                  <p className={`text-xs mt-3 ${textMuted}`}>
                    Prezzo speciale: <span className="text-cyan-500 font-display font-semibold">
                      {typeof product.price === 'object'
                        ? `€${product.price.lifetime || product.price.yearly || product.price.monthly}`
                        : `€${product.price}`}
                    </span>
                  </p>
                )}
              </>
            )}
          </section>
        </div>
      </div>

      {/* Payment Options Modal */}
      {selectedPlan && product && (
        <PaymentOptionsModal
          isOpen={!!selectedPlan}
          onClose={() => setSelectedPlan(undefined)}
          productId={product.id}
          productName={`${product.name} — ${getPlanLabel(selectedPlan)}`}
          price={selectedPlan === 'monthly' ? 69.99 : selectedPlan === 'yearly' ? 699.99 : 1399.99}
          originalPrice={selectedPlan === 'monthly' ? 124.99 : selectedPlan === 'yearly' ? 999.99 : 1899.99}
          productType={product.category === 'bot' || product.category === 'Bot' ? 'bot' : 'course'}
          plan={selectedPlan}
        />
      )}
    </div>
  );
};

export default TrialManagement;
