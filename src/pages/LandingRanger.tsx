import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Target, Crosshair, TrendingUp, CheckCircle, ArrowRight, Calendar,
  Mail, Loader2, Users, Zap, AlertTriangle, MessageCircle, ChevronDown,
  GraduationCap, BarChart3, Headphones, RefreshCw, Award, Ban, Brain,
  Building2, Wallet,
} from 'lucide-react';
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
const EMAIL_CONTACT = 'bayektrader@gmail.com';
// ════════════════════════════════════════════════════════════════

// Le prop firm in 3 passaggi (sezione educativa per traffico freddo)
const PROP_EXPLAINER = [
  { icon: Building2, t: 'La prop firm mette il capitale', d: 'Le Proprietary Trading Firm ti permettono di operare con capitali molto superiori ai tuoi — anche 100.000$ o più — senza immobilizzare grandi somme personali.' },
  { icon: Target, t: 'Tu superi la challenge', d: 'Per accedere al capitale devi dimostrare le tue capacità in una challenge di valutazione: obiettivi di profitto da raggiungere e rigorose regole di gestione del rischio da rispettare.' },
  { icon: Wallet, t: 'Ricevi l\'account finanziato', d: 'Superata la challenge ottieni un account finanziato e trattieni una percentuale dei profitti generati. È una delle opportunità più interessanti del trading moderno.' },
];

// I 6 motivi ufficiali per cui i trader falliscono le challenge (dalla brochure)
const PROBLEMS = [
  { icon: RefreshCw, t: 'Overtrading', d: 'Prendi uno stop, vuoi recuperare subito, entri su setup mediocri → bruci l\'account.' },
  { icon: AlertTriangle, t: 'Mancanza di disciplina', d: 'Il piano c\'è, ma sotto pressione non lo segui: entri quando non dovresti, esci quando non dovresti.' },
  { icon: Zap, t: 'Gestione emotiva inadeguata', d: 'Paura, avidità, FOMO: sposti gli stop, chiudi i trade buoni troppo presto, tieni i perdenti.' },
  { icon: Ban, t: 'Violazione delle regole', d: 'Daily loss, drawdown massimo, giorni minimi: ogni prop firm ha regole rigide — basta una svista e sei fuori.' },
  { icon: TrendingUp, t: 'Gestione del rischio inefficace', d: 'Rischi troppo per "passare in fretta": basta una serie negativa statisticamente normale per azzerare tutto.' },
  { icon: Brain, t: 'Pressione psicologica', d: 'Gli obiettivi di profitto con scadenza creano una pressione che sabota anche i trader con strategie valide.' },
];

// Le 6 fasi ufficiali del servizio (dalla brochure)
const STEPS = [
  'Acquisti la challenge tramite il link partner ufficiale Ranger',
  'Contatti il team: Telegram @BayekTrader o email',
  'Verifica delle informazioni necessarie e attivazione del servizio',
  'Il team gestisce la challenge in modo professionale',
  'Ricevi aggiornamenti periodici durante l\'intero percorso',
  'Challenge completata → account finanziato',
];

const FEATURES = [
  { icon: Target, t: 'Challenge + account funded', d: 'Il team opera la challenge e, su richiesta e previa valutazione, gestisce anche il conto funded.' },
  { icon: Shield, t: 'Gestione professionale del rischio', d: 'Controllo del rischio, consistenza operativa e disciplina ferrea su ogni operazione.' },
  { icon: MessageCircle, t: 'Accesso VIP Ranger Signals', d: 'Segnali premium + analisi di mercato quotidiane, inclusi per tutta la durata del servizio.' },
  { icon: GraduationCap, t: 'Ranger Learning Hub', d: 'La formazione completa dell\'ecosistema Ranger inclusa: cresci mentre il team lavora.' },
  { icon: BarChart3, t: 'Copy Trading Solutions', d: 'Le soluzioni di copy trading del team a tua disposizione.' },
  { icon: Users, t: 'Supporto prop firm dedicato', d: 'Un team con esperienza consolidata sulle principali prop firm ti segue passo dopo passo.' },
  { icon: Headphones, t: 'Assistenza diretta', d: 'Contatto diretto col team: Telegram @BayekTrader e email, senza intermediari.' },
  { icon: RefreshCw, t: 'Aggiornamenti periodici', d: 'Sai sempre a che punto è la tua challenge, dall\'attivazione al funding.' },
  { icon: Award, t: 'Disciplina · Struttura · Esecuzione', d: 'Il motto Ranger: l\'approccio che separa chi passa da chi fallisce.' },
];

// Perché il team consiglia Bullwaves (dalla brochure)
const BULLWAVES_PERKS = ['Processo rapido', 'Regole chiare', 'Ottima esperienza utente', 'Gestione consolidata dal team Ranger'];

const TIERS = [
  { name: 'Bullwaves fino a 100K', badge: 'BULLWAVES', desc: 'Account fino a 100.000$. La prop firm consigliata dal team: processo rapido, regole chiare e gestione consolidata. La via più diretta verso il funding.', popular: false },
  { name: 'Bullwaves 200K', badge: 'PRO', desc: 'Account da 200.000$. Capitale operativo raddoppiato, stesso approccio professionale e stesso team Ranger dedicato.', popular: true },
  { name: 'FTMO / FundedNext / +', badge: 'MULTI-FIRM', desc: 'Per FTMO, FundedNext, Funding Pips e altre prop firm internazionali. Condizioni definite in base alla prop firm e alla challenge scelta.', popular: false },
];

// FAQ: quelle ufficiali della brochure + le più richieste
const FAQS = [
  { q: 'Devo acquistare la challenge tramite Ranger?', a: 'Sì: la challenge va acquistata tramite il link partner ufficiale Ranger. È il requisito per attivare il servizio di gestione. Il pagamento del servizio avviene integralmente al momento dell\'attivazione.' },
  { q: 'L\'accesso VIP è incluso?', a: 'Sì. Per tutta la durata del servizio hai incluso l\'accesso VIP Ranger Signals, il Ranger Learning Hub, le soluzioni Copy Trading, le analisi di mercato quotidiane e il supporto prop firm dedicato.' },
  { q: 'Posso continuare a operare autonomamente dopo il funding?', a: 'Assolutamente sì. Una volta ottenuto l\'account finanziato sei libero di gestirlo in autonomia — con in più tutto quello che avrai imparato dal Learning Hub e dai segnali del team.' },
  { q: 'Offrite anche la gestione dell\'account funded?', a: 'Sì, su richiesta e previa valutazione della situazione di partenza. Oltre a farti superare la challenge, il team può continuare a gestire il conto finanziato con lo stesso approccio professionale. Se ne parla in call o in chat.' },
  { q: 'Quanto dura il processo?', a: 'Dipende dalle condizioni di mercato e dalla prop firm selezionata. Il team non forza i tempi: la priorità è superare la challenge rispettando le regole, non bruciarla per fretta. Ricevi aggiornamenti periodici per tutto il percorso.' },
  { q: 'E se la challenge non viene superata?', a: 'Non promettiamo né garantiamo il funding: nessun servizio serio può farlo. Quello che offriamo è una gestione professionale, disciplinata e strutturata che massimizza le probabilità di successo, eliminando gli errori di esecuzione che fanno fallire la maggior parte dei trader.' },
  { q: 'Come gestite il mio account in sicurezza?', a: 'Le credenziali vengono fornite in modo sicuro e il team le usa esclusivamente per operare la challenge. Tutti i dettagli vengono concordati al momento dell\'attivazione, nel contatto diretto col team.' },
  { q: 'È legale farsi gestire la challenge?', a: 'Il servizio consiste in una gestione operativa professionale del tuo account challenge. Ti consigliamo sempre di verificare i termini specifici della prop firm scelta. Il team opera con un approccio disciplinato e trasparente.' },
  { q: 'Quanto costa il servizio?', a: 'Il prezzo dipende dal tier (Bullwaves 100K, 200K o multi-firm) e dalla challenge scelta, ed è separato dal costo della challenge stessa. Lo vediamo insieme in call o in chat: prenota una call gratuita o scrivi al team, senza impegno.' },
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
        <div className="container mx-auto px-4 md:px-8 relative z-10 pt-5 pb-10 lg:pt-12 lg:pb-16">
          <div className="grid lg:grid-cols-[1fr_minmax(0,24rem)] gap-8 lg:gap-12 items-center">
            {/* testo + contatti: SEMPRE per primi (lead-first) */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 mb-3">
                <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono-lab text-[0.6rem] tracking-[0.25em] uppercase text-emerald-300">// Ranger Prop Pass</span>
              </div>
              <h1 className="font-display text-[1.7rem] leading-[1.12] sm:text-4xl md:text-5xl font-bold tracking-tight sm:leading-[1.08]">
                Continui a bruciare le challenge?{' '}
                <span className="bg-gradient-to-r from-emerald-400 to-amber-300 bg-clip-text text-transparent">La superiamo noi per te.</span>
              </h1>
              <p className="mt-2.5 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Team professionale, disciplina ferrea, rischio controllato — <strong className="text-white">dalla
                challenge al conto funded</strong>. Il problema non è la strategia: è l'esecuzione.
              </p>

              {/* ── CARD CONTATTI: subito visibile, zero scroll ── */}
              <div className="mt-4 rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-950/70 to-slate-900/70 p-4 sm:p-5 ring-1 ring-emerald-500/25 shadow-xl shadow-emerald-500/10 relative overflow-hidden text-left">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500" />
                <div className="flex items-center gap-2 mb-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="font-mono-lab text-[0.6rem] tracking-[0.25em] uppercase text-emerald-200">Guida gratuita via email</span>
                </div>
                <p className="font-display font-bold text-base sm:text-lg leading-snug mb-3">
                  🎯 "I 5 errori che ti fanno fallire le challenge" — ricevila subito
                </p>
                <LeadEmailForm />
                <div className="mt-3 pt-3 border-t border-emerald-900/60 flex flex-col sm:flex-row gap-2">
                  <button onClick={openCalendly}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-display font-semibold hover:shadow-md hover:shadow-emerald-500/30 transition-all">
                    <Calendar className="w-4 h-4" /> Prenota una call gratuita
                  </button>
                  <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-slate-900/70 text-slate-200 ring-1 ring-slate-700 hover:ring-emerald-500/40 text-sm font-display font-semibold transition-all">
                    <MessageCircle className="w-4 h-4" /> Telegram diretto
                  </a>
                </div>
              </div>

              {/* trust chips compatte */}
              <div className="mt-3.5 flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-1.5 font-mono-lab text-[0.6rem] tracking-[0.15em] uppercase text-slate-400">
                <span className="inline-flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-emerald-400" /> Rischio controllato</span>
                <span className="inline-flex items-center gap-1.5"><Target className="w-3.5 h-3.5 text-emerald-400" /> Team dedicato</span>
                <span className="inline-flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-emerald-400" /> Fino al funded</span>
              </div>
            </div>

            {/* Emblema Ranger animato — solo desktop, per non spingere giù i contatti su mobile */}
            <div className="hidden lg:flex justify-center">
              <RangerEmblem />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ COSA SONO LE PROP FIRM (educazione traffico freddo) ═══════════ */}
      <section className="relative py-12 lg:py-20 border-t border-emerald-900/30">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center gap-2 mb-3 justify-center">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono-lab text-[0.7rem] tracking-[0.3em] uppercase text-emerald-400">// prop firm in 60 secondi</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-center tracking-tight mb-3">
            Operare con <span className="text-emerald-400">100.000$</span> senza averli sul conto
          </h2>
          <p className="text-center text-sm md:text-base text-slate-400 max-w-2xl mx-auto mb-10">
            Se non conosci le prop firm, ecco come funzionano in tre passaggi:
          </p>
          <div className="grid sm:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {PROP_EXPLAINER.map((p, i) => (
              <div key={i} className="relative rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-center sm:text-left">
                <span className="absolute top-4 right-4 font-display text-3xl font-bold text-emerald-900/80">{i + 1}</span>
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/30 flex items-center justify-center mb-3 mx-auto sm:mx-0">
                  <p.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="font-display font-semibold">{p.t}</h3>
                <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">{p.d}</p>
              </div>
            ))}
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
            Molti trader hanno strategie valide, eppure falliscono le challenge. I 6 motivi sono sempre gli stessi
            — e sono tutti di <strong className="text-white">esecuzione</strong>, non di analisi:
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
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
          <p className="text-center text-sm md:text-base text-slate-400 max-w-2xl mx-auto -mt-6 mb-10">
            Le 6 fasi ufficiali del servizio — dal primo contatto all'account finanziato.
            Pensato sia per chi è alle prime esperienze con le prop firm, sia per i trader esperti.
          </p>
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
          <p className="text-center text-xs text-slate-500 mt-6 max-w-xl mx-auto">
            Il pagamento del servizio avviene integralmente al momento dell'attivazione.
            La challenge si acquista tramite il link partner ufficiale Ranger (costo separato).
          </p>
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

      {/* ═══════════ PROVE DAL CAMPO (polaroid al muro) ═══════════ */}
      <RangerWall />

      {/* ═══════════ COSA INCLUDE ═══════════ */}
      <section className="relative py-12 lg:py-20 border-t border-emerald-900/30">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center gap-2 mb-3 justify-center">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono-lab text-[0.7rem] tracking-[0.3em] uppercase text-emerald-400">// cosa include</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-center tracking-tight mb-3">
            Molto più di una semplice gestione
          </h2>
          <p className="text-center text-sm md:text-base text-slate-400 max-w-2xl mx-auto mb-10">
            Ranger Signals Hub è un ecosistema completo dedicato alla crescita del trader: col Prop Pass
            entri in tutto — segnali, formazione, copy trading e supporto.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {FEATURES.map((f, i) => (
              <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 hover:border-emerald-500/40 transition-all text-center sm:text-left">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/30 flex items-center justify-center mb-3 mx-auto sm:mx-0">
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
          <p className="text-center text-sm md:text-base text-slate-400 max-w-2xl mx-auto mb-6">
            Il prezzo lo vediamo insieme in call o in chat, in base alla prop firm e alla challenge scelta.
          </p>

          {/* perché Bullwaves (dalla brochure ufficiale) */}
          <div className="max-w-3xl mx-auto mb-10 rounded-xl border border-emerald-500/25 bg-emerald-950/20 px-5 py-4">
            <p className="text-center font-mono-lab text-[0.6rem] tracking-[0.25em] uppercase text-emerald-300 mb-2.5">
              Perché il team consiglia Bullwaves
            </p>
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5">
              {BULLWAVES_PERKS.map((b) => (
                <span key={b} className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-300">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> {b}
                </span>
              ))}
            </div>
          </div>

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
            <p className="mt-4 text-xs text-slate-500">
              Preferisci l'email? Scrivi a{' '}
              <a href={`mailto:${EMAIL_CONTACT}`} className="text-emerald-400 hover:text-emerald-300">{EMAIL_CONTACT}</a>
            </p>
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

      {/* footer (padding extra in basso su mobile per la barra fissa) */}
      <footer className="border-t border-emerald-900/30 pt-8 pb-24 lg:pb-8">
        <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-3">
          <img src="/logo.png" alt="Nexora Lab" className="h-7 w-auto opacity-80" />
          <p className="text-xs text-slate-500 text-center">
            © {new Date().getFullYear()} Nexora Lab · Ranger Signals Hub
            <span className="block font-mono-lab text-[0.6rem] tracking-[0.2em] uppercase text-emerald-500/70 mt-1">Trade · Learn · Scale — Discipline · Structure · Execution</span>
          </p>
          <div className="flex gap-4 text-xs text-slate-500">
            <Link to="/legal/privacy" className="hover:text-emerald-400">Privacy</Link>
            <Link to="/legal/termini" className="hover:text-emerald-400">Termini</Link>
          </div>
        </div>
      </footer>

      {/* ── barra contatti FISSA su mobile: lead sempre a un tap ── */}
      <div className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-black/90 backdrop-blur-md border-t border-emerald-900/50 px-3 py-2.5">
        <div className="flex gap-2">
          <button
            onClick={() => leadRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-slate-900 ring-1 ring-emerald-700/60 text-emerald-200 text-sm font-display font-semibold">
            <Mail className="w-4 h-4" /> Guida gratis
          </button>
          <button
            onClick={openCalendly}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-display font-semibold shadow-lg shadow-emerald-500/20">
            <Calendar className="w-4 h-4" /> Call gratuita
          </button>
        </div>
      </div>
    </div>
  );
};

// ════════════════════ EMBLEMA RANGER ANIMATO (SVG/CSS) ════════════════════
// Ricostruzione animata del logo Ranger Signals Hub: mirino che ruota,
// glow pulsante, candele al centro. Nitido a ogni risoluzione.
const Candle: React.FC<{ color: string; body: string; wickTop: string; wickBot: string }> = ({ color, body, wickTop, wickBot }) => (
  <div className="flex flex-col items-center">
    <div className={`w-[3px] ${wickTop} ${color}`} />
    <div className={`w-3 sm:w-3.5 ${body} rounded-sm ${color}`} />
    <div className={`w-[3px] ${wickBot} ${color}`} />
  </div>
);

const RangerEmblem: React.FC = () => (
  <div className="relative w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80 select-none">
    {/* glow pulsante dietro */}
    <div className="absolute inset-0 rounded-[2rem] bg-emerald-500/25 blur-3xl animate-pulse" />
    {/* card */}
    <div className="relative w-full h-full rounded-[2rem] overflow-hidden ring-1 ring-emerald-500/30 bg-gradient-to-br from-slate-900 via-emerald-950/50 to-slate-950 flex flex-col shadow-2xl shadow-emerald-500/10">
      {/* griglia tech */}
      <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)', backgroundSize: '26px 26px' }} />
      {/* area mirino + candele */}
      <div className="relative flex-1">
        {/* mirino rotante */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-[78%] h-[78%] animate-[spin_22s_linear_infinite]" style={{ filter: 'drop-shadow(0 0 6px rgba(16,185,129,0.4))' }}>
            <circle cx="100" cy="100" r="66" fill="none" stroke="#e7ece5" strokeWidth="5" />
            <line x1="100" y1="6" x2="100" y2="42" stroke="#e7ece5" strokeWidth="5" strokeLinecap="round" />
            <line x1="100" y1="158" x2="100" y2="194" stroke="#e7ece5" strokeWidth="5" strokeLinecap="round" />
            <line x1="6" y1="100" x2="42" y2="100" stroke="#e7ece5" strokeWidth="5" strokeLinecap="round" />
            <line x1="158" y1="100" x2="194" y2="100" stroke="#e7ece5" strokeWidth="5" strokeLinecap="round" />
          </svg>
        </div>
        {/* candele statiche, centrate dentro il mirino */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-end gap-1.5">
            <Candle color="bg-emerald-400" body="h-7" wickTop="h-3" wickBot="h-2" />
            <Candle color="bg-rose-500" body="h-11" wickTop="h-2" wickBot="h-3" />
            <Candle color="bg-emerald-400" body="h-14" wickTop="h-2" wickBot="h-2" />
          </div>
        </div>
      </div>
      {/* testo */}
      <div className="relative pb-6 text-center">
        <div className="font-display font-extrabold tracking-wide text-white text-base sm:text-xl leading-none">RANGER SIGNALS</div>
        <div className="font-display font-extrabold tracking-[0.2em] text-amber-400 text-base sm:text-xl leading-none mt-1.5">HUB</div>
      </div>
    </div>
  </div>
);

// ════════════════════ FORM EMAIL RIUTILIZZABILE (solo email) ════════════════════
// Usato sia nella card contatti dell'hero sia nella sezione lead magnet.
// Salva il lead (source lp-ranger) e fa partire l'invio della guida PDF.
const LeadEmailForm: React.FC = () => {
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
      <div className="flex items-center gap-2.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3">
        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
        <p className="text-sm text-emerald-100"><strong>Guida in arrivo!</strong> Controlla la tua email (anche lo spam).</p>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 min-w-0">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="La tua email"
            className="w-full pl-10 pr-3 py-3 rounded-lg bg-slate-950/70 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
        </div>
        <button type="submit" disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-display font-semibold whitespace-nowrap hover:shadow-md hover:shadow-emerald-500/30 transition-all disabled:opacity-60">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Invio…</> : <>Ricevi la guida <ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>
      {error && <p className="text-sm text-rose-400 mt-2">{error}</p>}
    </>
  );
};

// ════════════════════ PROVE DAL CAMPO — polaroid "attaccate al muro" ════════════════════
// Screenshot in public/testimonials/recensione_ranger1..9.jpg. Ogni polaroid
// sparisce se il file manca; se mancano tutte, l'intera sezione si nasconde.
const RANGER_TESTIMONIALS: { src: string; caption: string; rot: string; off: string; wide?: boolean }[] = [
  { src: '/testimonials/recensione_ranger1.jpg', caption: 'FTMO Challenge superata ✔', rot: '-rotate-2', off: 'lg:translate-y-3' },
  { src: '/testimonials/recensione_ranger4.jpg', caption: 'FundingPips: reward da 3.023$ · 32.597$ totali 💸', rot: 'rotate-2', off: 'lg:-translate-y-2' },
  { src: '/testimonials/recensione_ranger7.jpg', caption: 'Lucid Trading: payout da 6.206$ 🏆', rot: '-rotate-1', off: 'lg:translate-y-2', wide: true },
  { src: '/testimonials/recensione_ranger2.jpg', caption: 'FTMO Verification completata: si va al funding', rot: 'rotate-1', off: 'lg:translate-y-4' },
  { src: '/testimonials/recensione_ranger5.jpg', caption: 'Conto FundingPips a 103.575$ · profit split 80%', rot: '-rotate-2', off: 'lg:-translate-y-1', wide: true },
  { src: '/testimonials/recensione_ranger8.jpg', caption: 'Nuovo account FundingPips attivato', rot: 'rotate-2', off: 'lg:translate-y-1' },
  { src: '/testimonials/recensione_ranger3.jpg', caption: 'Un\'altra FTMO Challenge passata (2026)', rot: '-rotate-3', off: 'lg:-translate-y-2' },
  { src: '/testimonials/recensione_ranger9.jpg', caption: 'GOAT Funded: payout certificato', rot: 'rotate-1', off: 'lg:translate-y-3' },
  { src: '/testimonials/recensione_ranger6.jpg', caption: 'FTMO Verification: un altro conto al funding', rot: '-rotate-1', off: 'lg:-translate-y-3' },
];

const RangerPolaroid: React.FC<{ src: string; caption: string; rot: string; off: string; wide?: boolean; onFail: () => void; onZoom: (s: string) => void }> =
  ({ src, caption, rot, off, wide, onFail, onZoom }) => {
    const [ok, setOk] = useState(true);
    if (!ok) return null;
    return (
      <button
        onClick={() => onZoom(src)}
        className={`relative shrink-0 snap-center bg-[#f7f3ea] rounded-[3px] p-2 pb-2.5 shadow-[0_14px_34px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:rotate-0 hover:scale-[1.04] hover:z-10 ${
          wide ? 'w-72 sm:w-80' : 'w-52 sm:w-56'
        } ${rot} ${off}`}
        aria-label="Ingrandisci"
      >
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 -rotate-6 w-16 h-5 bg-amber-50/70 border border-white/50 shadow-sm rounded-[1px] z-10" />
        <img
          src={src}
          alt={caption}
          loading="lazy"
          onError={() => { setOk(false); onFail(); }}
          className="w-full h-auto rounded-[2px] bg-slate-200"
        />
        <p className="mt-2 text-center font-display italic text-[0.72rem] leading-snug text-slate-700">{caption}</p>
      </button>
    );
  };

const RangerWall: React.FC = () => {
  const [failed, setFailed] = useState(0);
  const [zoom, setZoom] = useState<string | null>(null);
  if (failed >= RANGER_TESTIMONIALS.length) return null;

  return (
    <section className="relative py-12 lg:py-20 border-t border-emerald-900/30 bg-gradient-to-b from-emerald-950/10 to-black overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)', backgroundSize: '30px 30px' }}
      />
      <div className="container mx-auto px-4 md:px-8 relative">
        <div className="flex items-center gap-2 mb-3 justify-center">
          <Award className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-mono-lab text-[0.7rem] tracking-[0.3em] uppercase text-emerald-400">// prove dal campo</span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-center tracking-tight mb-2">
          Challenge superate, <span className="text-emerald-400">payout reali</span>
        </h2>
        <p className="text-center text-sm md:text-base text-slate-400 max-w-2xl mx-auto mb-8 lg:mb-12">
          FTMO, FundingPips, Lucid, GOAT: certificati e ricompense direttamente dal campo. Tocca una foto per ingrandirla.
        </p>

        <div className="flex gap-5 lg:gap-7 overflow-x-auto lg:overflow-visible lg:flex-wrap lg:justify-center items-start pb-6 lg:pb-2 px-2 snap-x">
          {RANGER_TESTIMONIALS.map((t) => (
            <RangerPolaroid key={t.src} {...t} onFail={() => setFailed((f) => f + 1)} onZoom={setZoom} />
          ))}
        </div>

        <p className="text-center text-[0.65rem] text-slate-600 mt-5 max-w-xl mx-auto">
          Risultati reali. Le performance passate non costituiscono garanzia di risultati futuri.
        </p>
      </div>

      {zoom && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setZoom(null)}
        >
          <img src={zoom} alt="Prova" className="max-h-[92vh] max-w-full rounded-xl ring-1 ring-slate-700 shadow-2xl" />
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-900/80 ring-1 ring-slate-700 text-white text-xl leading-none" aria-label="Chiudi">×</button>
        </div>
      )}
    </section>
  );
};

// ════════════════════ LEAD MAGNET (sezione di metà pagina) ════════════════════
const RangerLeadForm: React.FC = () => (
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
    <LeadEmailForm />
    <p className="text-[0.7rem] text-slate-500 mt-3">Niente spam, cancellazione in un click.</p>
  </div>
);

export default LandingRanger;
