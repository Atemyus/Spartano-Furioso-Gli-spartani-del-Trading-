import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Target, Crosshair, TrendingUp, CheckCircle, ArrowRight, Calendar,
  Mail, Loader2, Users, Zap, AlertTriangle, MessageCircle, ChevronDown,
  GraduationCap, BarChart3, Headphones, RefreshCw, Award,
} from 'lucide-react';
import HologramSphere from '../components/HologramSphere';
import NeonCracks from '../components/NeonCracks';
import CalendlyInline from '../components/CalendlyInline';
import { API_URL } from '../config/api';

// ════════════════════════════════════════════════════════════════
// CONFIG — modifica questi valori
// ════════════════════════════════════════════════════════════════
// Crea su Calendly un evento dedicato "Ranger Prop Pass" e incolla qui il link.
// Il webhook Telegram già configurato notificherà automaticamente queste call.
const CALENDLY_URL = 'https://calendly.com/nexoralab/ranger-prop-pass';
const TELEGRAM_URL = 'https://t.me/BayekTrader';
// ════════════════════════════════════════════════════════════════

const PROBLEMS = [
  { icon: RefreshCw, t: 'Overtrading dopo le perdite', d: 'Prendi uno stop, vuoi recuperare subito, entri su setup mediocri → bruci l\'account.' },
  { icon: AlertTriangle, t: 'Violazione del daily loss', d: 'Salti la challenge non per il target, ma per aver sforato il limite di perdita giornaliero.' },
  { icon: TrendingUp, t: 'Rischio troppo alto', d: 'Per "passare in fretta" alzi il rischio: basta una serie negativa normale e sei fuori.' },
  { icon: Zap, t: 'Gestione emotiva', d: 'Paura, avidità, FOMO: sposti gli stop, chiudi i trade buoni troppo presto, tieni i perdenti.' },
];

const STEPS = [
  'Acquisti il servizio Ranger Prop Pass',
  'Acquisti la challenge col link partner Ranger',
  'Contatto diretto col team (Telegram)',
  'Verifica info e attivazione del servizio',
  'Il team gestisce la challenge in modo professionale',
  'Aggiornamenti periodici fino al funding',
  'Challenge superata → conclusione del servizio',
];

const FEATURES = [
  { icon: Target, t: 'Challenge + account funded', d: 'Il team opera la challenge e può gestire anche il conto funded.' },
  { icon: Shield, t: 'Controllo del rischio', d: 'Money management rigoroso e disciplina ferrea.' },
  { icon: MessageCircle, t: 'Accesso VIP Ranger Signals', d: 'I segnali premium del team inclusi.' },
  { icon: GraduationCap, t: 'Ranger Learning Hub', d: 'Accesso ai contenuti formativi inclusi.' },
  { icon: BarChart3, t: 'Copy Trading incluso', d: 'Soluzioni di copy trading a disposizione.' },
  { icon: Users, t: 'Supporto prop firm dedicato', d: 'Un team che ti segue passo dopo passo.' },
  { icon: Headphones, t: 'Assistenza via Telegram', d: 'Contatto diretto col team (@BayekTrader).' },
  { icon: RefreshCw, t: 'Aggiornamenti periodici', d: 'Sempre informato durante il percorso.' },
  { icon: Award, t: 'Disciplina · Struttura · Esecuzione', d: 'L\'approccio che fa la differenza.' },
];

const TIERS = [
  { name: 'Bullwaves 100K', badge: 'BULLWAVES', desc: 'Account fino a 100.000$. La prop firm consigliata dal team per processo rapido e regole chiare.', popular: false },
  { name: 'Bullwaves 200K', badge: 'PRO', desc: 'Account 200.000$. Capitale raddoppiato, stesso approccio professionale e stesso team dedicato.', popular: true },
  { name: 'FTMO / FundedNext / +', badge: 'MULTI-FIRM', desc: 'Per FTMO, FundedNext, Funding Pips e altre prop firm internazionali. Preventivo personalizzato.', popular: false },
];

const FAQS = [
  { q: 'Gestite anche l\'account funded dopo la challenge?', a: 'Sì. Oltre a farti superare la challenge, possiamo gestire anche il tuo account funded, così continui a operare con lo stesso approccio professionale sul capitale reale. Il modello e le condizioni si definiscono insieme in base alla tua situazione di partenza — ne parliamo in call o in chat.' },
  { q: 'È legale farsi gestire la challenge?', a: 'Il servizio consiste in una gestione operativa professionale del tuo account challenge. Ti consigliamo sempre di verificare i termini specifici della prop firm scelta. Il team opera con un approccio disciplinato e trasparente.' },
  { q: 'E se la challenge non viene superata?', a: 'Non promettiamo né garantiamo il funding: nessun servizio serio può farlo. Quello che offriamo è la gestione professionale, disciplinata e strutturata che massimizza le probabilità di successo, eliminando gli errori di esecuzione che fanno fallire la maggior parte dei trader.' },
  { q: 'Come gestite il mio account in sicurezza?', a: 'Le credenziali vengono fornite in modo sicuro e il team le usa esclusivamente per operare la challenge. Tutti i dettagli vengono concordati al momento dell\'attivazione, nel contatto diretto col team.' },
  { q: 'Il prezzo include la challenge?', a: 'No. Il prezzo del servizio Ranger Prop Pass è separato dal costo della challenge prop firm, che paghi direttamente alla prop firm tramite il link partner ufficiale Ranger.' },
  { q: 'Quanto costa il servizio?', a: 'Il prezzo dipende dal tier e dalla prop firm scelta. Lo vediamo insieme in call o in chat: prenota una call gratuita o scrivi al team su Telegram, senza impegno.' },
];

const LandingRanger: React.FC = () => {
  const [showCalendly, setShowCalendly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const callRef = useRef<HTMLDivElement>(null);
  const leadRef = useRef<HTMLDivElement>(null);

  const openCalendly = () => {
    setShowCalendly(true);
    setTimeout(() => callRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* top bar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-black/70 border-b border-emerald-900/40">
        <div className="container mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="Nexora Lab" className="h-9 w-auto" />
          </Link>
          <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer"
            className="text-sm font-display font-semibold text-slate-300 hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4" /> Contatta il team
          </a>
        </div>
      </header>

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/40 via-black to-black" />
        <NeonCracks className="absolute inset-0" density="medium" intensity={0.6} interactive />
        <HologramSphere className="absolute top-0 right-0 w-[40rem] h-[40rem] opacity-50 hidden lg:block"
          detail="high" variant="globe" interactive intensity={0.5} />

        <div className="container mx-auto px-4 md:px-8 relative z-10 pt-8 pb-14 lg:pt-14 lg:pb-20">
          <div className="max-w-3xl mx-auto text-center lg:text-left lg:mx-0">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 mb-5">
              <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono-lab text-[0.65rem] tracking-[0.25em] uppercase text-emerald-300">// Ranger Prop Pass</span>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.08]">
              Continui a bruciare le challenge?{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-amber-300 bg-clip-text text-transparent">La superiamo noi per te.</span>
            </h1>
            <p className="mt-5 text-base md:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Un team professionale gestisce la tua challenge prop firm con disciplina ferrea, controllo del rischio
              ed esecuzione strutturata — <strong className="text-white">dalla challenge al conto funded</strong>.
              Perché il problema non è la strategia: è l'esecuzione.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <button onClick={openCalendly}
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-display font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 transition-all">
                <Calendar className="w-5 h-5" /> Prenota una call gratuita
              </button>
              <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 rounded-lg bg-slate-900/60 text-slate-200 ring-1 ring-slate-700 hover:ring-emerald-500/40 font-display font-semibold transition-all">
                <MessageCircle className="w-5 h-5" /> Parla su Telegram
              </a>
            </div>
            <div className="mt-9 grid grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto lg:mx-0">
              {[
                { icon: Shield, l: 'Rischio controllato' },
                { icon: Target, l: 'Team dedicato' },
                { icon: Award, l: 'Fino al funding' },
              ].map((s, i) => (
                <div key={i} className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-3 text-center">
                  <s.icon className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
                  <div className="font-mono-lab text-[0.55rem] tracking-[0.15em] uppercase text-slate-400">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ IL PROBLEMA ═══════════ */}
      <section className="relative py-12 lg:py-20 border-t border-emerald-900/30">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center gap-2 mb-3 justify-center">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono-lab text-[0.7rem] tracking-[0.3em] uppercase text-amber-400">// il vero problema</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-center tracking-tight mb-3">
            Non è la strategia. È l'<span className="text-emerald-400">esecuzione</span>.
          </h2>
          <p className="text-center text-sm md:text-base text-slate-400 max-w-2xl mx-auto mb-10">
            Il 90% dei trader fallisce la challenge per questi 4 motivi — tutti di esecuzione, non di analisi:
          </p>
          <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {PROBLEMS.map((p, i) => (
              <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 ring-1 ring-amber-500/30 flex items-center justify-center shrink-0">
                  <p.icon className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-display font-semibold">{p.t}</h3>
                  <p className="text-sm text-slate-400 mt-1">{p.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ LA SOLUZIONE (come funziona) ═══════════ */}
      <section className="relative py-12 lg:py-20 border-t border-emerald-900/30 bg-gradient-to-b from-emerald-950/10 to-black">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center gap-2 mb-3 justify-center">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono-lab text-[0.7rem] tracking-[0.3em] uppercase text-emerald-400">// come funziona</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-center tracking-tight mb-10">
            Affidi l'esecuzione a chi lo fa di mestiere
          </h2>
          <div className="max-w-2xl mx-auto space-y-3">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-500 flex items-center justify-center shrink-0 font-display font-bold text-sm">
                  {i + 1}
                </div>
                <p className="text-sm md:text-base text-slate-200">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ OLTRE LA CHALLENGE (funded) ═══════════ */}
      <section className="relative py-12 lg:py-20 border-t border-emerald-900/30">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/20 to-slate-900/50 p-6 md:p-10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 mb-4">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono-lab text-[0.65rem] tracking-[0.25em] uppercase text-amber-300">// oltre la challenge</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight mb-3">
              Non ci fermiamo al funding.
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm md:text-base mb-6">
              Superata la challenge, possiamo gestire <strong className="text-white">anche il tuo account funded</strong>:
              continui a operare con la stessa disciplina ed esecuzione professionale, questa volta sul capitale reale
              della prop firm. Il modello si definisce insieme, in base alla tua situazione di partenza.
            </p>
            <button onClick={openCalendly}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900 font-display font-bold hover:shadow-md hover:shadow-amber-500/30 transition-all">
              <Calendar className="w-4 h-4" /> Parlane in una call gratuita
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════ COSA INCLUDE ═══════════ */}
      <section className="relative py-12 lg:py-20 border-t border-emerald-900/30">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center gap-2 mb-3 justify-center">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono-lab text-[0.7rem] tracking-[0.3em] uppercase text-emerald-400">// cosa include</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-center tracking-tight mb-10">
            Molto più di una semplice gestione
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {FEATURES.map((f, i) => (
              <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 hover:border-emerald-500/40 transition-all">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/30 flex items-center justify-center mb-3">
                  <f.icon className="w-4 h-4 text-emerald-400" />
                </div>
                <h3 className="font-display font-semibold text-sm">{f.t}</h3>
                <p className="text-sm text-slate-400 mt-1">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ I TIER (prezzo riservato) ═══════════ */}
      <section className="relative py-12 lg:py-20 border-t border-emerald-900/30 bg-gradient-to-b from-emerald-950/10 to-black">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center gap-2 mb-3 justify-center">
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono-lab text-[0.7rem] tracking-[0.3em] uppercase text-emerald-400">// i pacchetti</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-center tracking-tight mb-3">
            Scegli il tuo livello
          </h2>
          <p className="text-center text-sm md:text-base text-slate-400 max-w-2xl mx-auto mb-10">
            Il prezzo lo vediamo insieme in call o in chat, in base alla prop firm e alla challenge scelta.
          </p>
          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {TIERS.map((t, i) => (
              <div key={i} className={`relative rounded-2xl border p-6 flex flex-col ${
                t.popular ? 'border-emerald-500/60 bg-emerald-950/30 ring-1 ring-emerald-500/30' : 'border-slate-800 bg-slate-900/40'
              }`}>
                {t.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-[0.6rem] font-mono-lab uppercase tracking-widest font-bold">
                    Più scelto
                  </span>
                )}
                <span className="font-mono-lab text-[0.6rem] tracking-[0.2em] uppercase text-emerald-400 mb-2">{t.badge}</span>
                <h3 className="font-display text-xl font-bold mb-2">{t.name}</h3>
                <p className="text-sm text-slate-400 flex-1">{t.desc}</p>
                <div className="mt-5 pt-5 border-t border-slate-800">
                  <div className="font-mono-lab text-[0.55rem] tracking-widest uppercase text-slate-500 mb-0.5">Prezzo</div>
                  <div className="font-display text-xl font-semibold text-emerald-300 mb-4">Riservato</div>
                  <button onClick={openCalendly}
                    className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg font-display font-semibold transition-all ${
                      t.popular ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:shadow-md hover:shadow-emerald-500/30'
                                : 'bg-slate-800/60 text-slate-200 ring-1 ring-slate-700 hover:ring-emerald-500/40'
                    }`}>
                    Scopri in call <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-slate-500 mt-6 max-w-2xl mx-auto">
            Il prezzo del servizio è separato dal costo della challenge prop firm (pagato direttamente alla prop firm tramite link partner Ranger).
          </p>
        </div>
      </section>

      {/* ═══════════ PERCHÉ FUNZIONA ═══════════ */}
      <section className="relative py-12 lg:py-20 border-t border-emerald-900/30">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-center tracking-tight mb-10">
            Tre pilastri. <span className="text-emerald-400">Zero improvvisazione.</span>
          </h2>
          <div className="grid sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              { icon: Shield, t: 'Disciplina', d: 'Regole ferree, nessuna decisione emotiva sotto pressione.' },
              { icon: Crosshair, t: 'Struttura', d: 'Un sistema operativo definito, non scelte improvvisate.' },
              { icon: Target, t: 'Esecuzione', d: 'L\'abilità che separa chi passa da chi fallisce.' },
            ].map((p, i) => (
              <div key={i} className="rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                  <p.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="font-display text-lg font-bold mb-1">{p.t}</h3>
                <p className="text-sm text-slate-400">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ LEAD MAGNET (guida gratis) ═══════════ */}
      <section ref={leadRef} className="relative py-12 lg:py-20 border-t border-emerald-900/30 bg-gradient-to-b from-emerald-950/10 to-black">
        <div className="container mx-auto px-4 md:px-8 max-w-2xl">
          <RangerLeadForm />
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section className="relative py-12 lg:py-20 border-t border-emerald-900/30">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-center tracking-tight mb-10">
            Domande frequenti
          </h2>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-4 text-left">
                  <span className="font-display font-semibold text-sm md:text-base">{f.q}</span>
                  <ChevronDown className={`w-5 h-5 text-emerald-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <p className="px-4 pb-4 text-sm text-slate-400 leading-relaxed">{f.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA + CALENDLY ═══════════ */}
      <section ref={callRef} className="relative py-12 lg:py-20 border-t border-emerald-900/30">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl">
          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 to-slate-900/40 p-6 md:p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
            <Crosshair className="w-6 h-6 text-emerald-400 mx-auto mb-3" />
            <h3 className="font-display text-2xl md:text-3xl font-semibold tracking-tight mb-2">
              Pronto a far gestire la tua prossima challenge?
            </h3>
            <p className="text-slate-400 max-w-xl mx-auto mb-6 text-sm md:text-base">
              Prenota una call gratuita: capiamo la tua situazione e ti spieghiamo come funziona, senza impegno.
              Oppure scrivi subito al team su Telegram.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={openCalendly}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-display font-semibold hover:shadow-md hover:shadow-emerald-500/30 transition-all">
                <Calendar className="w-4 h-4" /> Prenota una call
              </button>
              <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-slate-900/60 text-slate-200 ring-1 ring-slate-700 hover:ring-emerald-500/40 font-display font-semibold transition-all">
                <MessageCircle className="w-4 h-4" /> Telegram @BayekTrader
              </a>
            </div>
          </div>

          {showCalendly && (
            <div className="mt-8">
              <p className="text-slate-400 text-center mb-4 text-sm">
                Scegli data e ora — riceverai la conferma via email con il link della call.
              </p>
              <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
                <CalendlyInline url={CALENDLY_URL} />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-emerald-900/30 py-8">
        <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-3">
          <img src="/logo.png" alt="Nexora Lab" className="h-7 w-auto opacity-80" />
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} Nexora Lab · Ranger Signals Hub</p>
          <div className="flex gap-4 text-xs text-slate-500">
            <Link to="/legal/privacy" className="hover:text-emerald-400">Privacy</Link>
            <Link to="/legal/termini" className="hover:text-emerald-400">Termini</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

// ════════════════════ LEAD MAGNET FORM (solo email) ════════════════════
const RangerLeadForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.includes('@') || email.length < 5) { setError('Inserisci un\'email valida.'); return; }
    setLoading(true);
    try {
      const r = await fetch(`${API_URL}/api/newsletter/lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'lp-ranger' }),
      });
      if (r.ok) setDone(true);
      else { const d = await r.json().catch(() => ({})); setError(d.error || 'Riprova.'); }
    } catch { setError('Errore di connessione. Riprova.'); }
    finally { setLoading(false); }
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center">
        <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
        <h3 className="font-display text-xl font-semibold mb-1">Guida in arrivo! 📩</h3>
        <p className="text-sm text-slate-400">Controlla la tua email (anche lo spam) — ti abbiamo inviato la guida gratuita.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-950/50 to-slate-900/50 p-6 sm:p-7 ring-1 ring-emerald-500/20 shadow-xl shadow-emerald-500/10 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500" />
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/40 mb-3">
        <Mail className="w-3.5 h-3.5 text-emerald-300" />
        <span className="font-mono-lab text-[0.65rem] tracking-[0.25em] uppercase text-emerald-200">Guida gratuita</span>
      </div>
      <h3 className="font-display text-2xl font-bold mb-2 leading-tight">
        🎯 I 5 errori che ti fanno <span className="text-emerald-400">fallire le challenge</span>
      </h3>
      <p className="text-sm sm:text-base text-slate-300 mb-4">
        Scarica gratis la guida e scopri perché il problema non è la tua strategia. Te la inviamo subito via email.
      </p>
      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1 min-w-0">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="La tua email"
            className="w-full pl-10 pr-3 py-3 rounded-lg bg-slate-950/60 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
        </div>
        <button type="submit" disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-display font-semibold whitespace-nowrap hover:shadow-md hover:shadow-emerald-500/30 transition-all disabled:opacity-60">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Invio…</> : <>Ricevi la guida <ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>
      {error && <p className="text-sm text-rose-400 mt-2">{error}</p>}
      <p className="text-[0.7rem] text-slate-500 mt-3">Niente spam, cancellazione in un click.</p>
    </div>
  );
};

export default LandingRanger;
