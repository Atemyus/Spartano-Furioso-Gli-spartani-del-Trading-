import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlayCircle, Lock, ArrowRight, Sparkles, TrendingUp, Shield,
  Cpu, Users, Star, Calendar, Loader2, Mail, User as UserIcon,
  Lock as LockIcon, Eye, EyeOff, BookOpen, Trophy, Zap, ChevronRight, CheckCircle,
} from 'lucide-react';
import HologramSphere from '../components/HologramSphere';
import NeonCracks from '../components/NeonCracks';
import CalendlyInline from '../components/CalendlyInline';
import FormattedDescription from '../components/FormattedDescription';
import { API_ENDPOINTS, API_URL } from '../config/api';

// ════════════════════════════════════════════════════════════════
// CONFIG — modifica questi valori
// ════════════════════════════════════════════════════════════════
const COURSE_ID = 'spartan_academy';          // productId del corso Codex
const FOUNDER_IMG = '/founder.png';           // metti la foto (PNG trasparente) in public/
const FOUNDER_NAME = 'Il Fondatore';          // nome del fondatore
const CALENDLY_URL = 'https://calendly.com/nexoralab/discovery-call';
// Quanti video del modulo 2 mostrare (oltre a tutto il modulo 1)
const MODULE2_PREVIEW = 3;
// Se false: i video sono visibili SUBITO senza iscrizione (meno attrito,
// la conversione è la prenotazione della call). Se true: serve iscriversi
// e verificare la mail per sbloccare i video.
const REQUIRE_REGISTRATION = false;
// ════════════════════════════════════════════════════════════════

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  vimeoId?: string;
  videoUrl?: string;
  order: number;
  isTrialContent?: boolean;
}
interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
  isTrialContent?: boolean;
}

// Estrae l'ID numerico Vimeo da id puro o URL completo
const vimeoNumeric = (raw?: string) => {
  if (!raw) return '';
  const m = String(raw).match(/(\d{6,})/);
  return m ? m[1] : '';
};

const LandingCodex: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  // Sblocco = ha completato la verifica email (il token JWT viene rilasciato solo
  // dopo /verify-email, mai prima). Il token viene poi RI-VERIFICato col backend
  // all'apertura, così un account cancellato/non valido non vede più i video.
  const [unlocked, setUnlocked] = useState<boolean>(() => !!localStorage.getItem('token'));
  const [activeVideo, setActiveVideo] = useState<string>(''); // lessonId in riproduzione
  // Gate email: il 1° video è libero; lasciando l'email si sbloccano tutti gli altri.
  // leadDone = ha già lasciato l'email (o è un utente con token).
  const [leadDone, setLeadDone] = useState<boolean>(() => !!localStorage.getItem('lp_lead') || !!localStorage.getItem('token'));
  // Flusso call: idle → survey (5 domande) → calendly
  const [callStep, setCallStep] = useState<'idle' | 'survey' | 'calendly'>('idle');
  const [surveyAnswers, setSurveyAnswers] = useState<Record<string, string>>({});
  const [founderImgOk, setFounderImgOk] = useState(true);
  const [guideSent, setGuideSent] = useState(false);
  const videosRef = useRef<HTMLDivElement>(null);
  const calendlyRef = useRef<HTMLDivElement>(null);
  const leadRef = useRef<HTMLDivElement>(null);

  const handleLeadDone = () => {
    setLeadDone(true);
    setGuideSent(true);
  };

  // ====== fetch course content ======
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(API_ENDPOINTS.courseContent(COURSE_ID));
        if (r.ok) {
          const d = await r.json();
          setModules(d.course?.modules || []);
        }
      } catch (e) {
        console.error('LP: errore caricamento corso', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ====== verifica validità token col backend ======
  // Se l'account è stato cancellato (o il token è scaduto/non valido), il token
  // resterebbe comunque nel localStorage del dispositivo e mostrerebbe i video.
  // Qui lo controlliamo col server: se non è valido, puliamo e rimostriamo il form.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    (async () => {
      try {
        const r = await fetch(`${API_URL}/api/auth/verify-token`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!r.ok) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUnlocked(false);
          setCallStep('idle');
          setActiveVideo('');
        }
      } catch {
        /* offline / rete: non tocchiamo lo stato attuale */
      }
    })();
  }, []);

  // ====== lezioni visibili: TUTTI i video del trial (isTrialContent) ======
  // Mostra tutte le lezioni marcate come contenuto trial dal pannello admin.
  // Fallback (se nessuna lezione è marcata): tutto il Modulo 1 + primi N del Modulo 2.
  const previewLessons = useMemo(() => {
    const out: { module: Module; lesson: Lesson }[] = [];
    const sorted = [...modules].sort((a, b) => a.order - b.order);
    sorted.forEach((m) => {
      [...(m.lessons || [])]
        .sort((a, b) => a.order - b.order)
        .forEach((l) => {
          if (l.isTrialContent) out.push({ module: m, lesson: l });
        });
    });
    if (out.length === 0) {
      const m1 = sorted[0];
      const m2 = sorted[1];
      if (m1) m1.lessons.forEach((l) => out.push({ module: m1, lesson: l }));
      if (m2) m2.lessons.slice(0, MODULE2_PREVIEW).forEach((l) => out.push({ module: m2, lesson: l }));
    }
    return out;
  }, [modules]);

  // Imposta il primo video come attivo quando i video diventano visibili
  useEffect(() => {
    if ((!REQUIRE_REGISTRATION || unlocked) && !activeVideo && previewLessons.length) {
      setActiveVideo(previewLessons[0].lesson.id);
    }
  }, [unlocked, previewLessons, activeVideo]);

  const current = previewLessons.find((p) => p.lesson.id === activeVideo)?.lesson;

  // Video visibili se: iscrizione non richiesta, oppure utente sbloccato.
  const videosVisible = !REQUIRE_REGISTRATION || unlocked;

  const scrollToVideos = () => videosRef.current?.scrollIntoView({ behavior: 'smooth' });

  const openCalendly = () => {
    if (REQUIRE_REGISTRATION && !unlocked) {
      document.getElementById('register-box')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    // Avvia il sondaggio; al termine si passa al calendario.
    if (callStep === 'idle') setCallStep('survey');
    setTimeout(() => calendlyRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
  };

  // ════════ RENDER ════════
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* ───── Mini top bar ───── */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-black/70 border-b border-slate-800/80">
        <div className="container mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="Nexora Lab" className="h-9 w-auto" />
          </Link>
          <Link
            to="/login"
            className="text-sm font-display font-semibold text-slate-300 hover:text-cyan-400 transition-colors"
          >
            Accedi
          </Link>
        </div>
      </header>

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative overflow-hidden">
        {/* sfondi animati algo */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/40 via-black to-black" />
        <NeonCracks className="absolute inset-0" density="medium" intensity={0.7} interactive />
        <HologramSphere
          className="absolute top-0 right-0 w-[40rem] h-[40rem] opacity-60 hidden lg:block"
          detail="high" variant="chart" interactive intensity={0.6}
        />

        <div className="container mx-auto px-4 md:px-8 relative z-10 pt-6 pb-12 lg:pt-12 lg:pb-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
            {/* testo */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/40 bg-cyan-500/10 mb-4 lg:mb-6">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-mono-lab text-[0.65rem] tracking-[0.25em] uppercase text-cyan-300">
                  // Codex Algo Academy
                </span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight leading-[1.08] lg:leading-[1.05]">
                Diventa un <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">trader algoritmico</span> professionale
              </h1>
              <p className="mt-4 lg:mt-5 text-base md:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Impara a costruire, testare e automatizzare strategie di trading con un metodo
                strutturato e data-driven. Guarda <strong className="text-white">gratis i primi moduli</strong> e
                prenota una call con il nostro team.
              </p>
              <div className="mt-6 lg:mt-8 flex flex-col sm:flex-row flex-wrap gap-3 justify-center lg:justify-start">
                <button
                  onClick={videosVisible ? scrollToVideos : () => document.getElementById('register-box')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-display font-semibold shadow-lg shadow-blue-500/30 hover:shadow-cyan-500/40 transition-all"
                >
                  {videosVisible ? <><PlayCircle className="w-5 h-5" /> Guarda i video gratis</> : <>Inizia gratis ora <ArrowRight className="w-5 h-5" /></>}
                </button>
                <button onClick={() => document.getElementById('cosa-imparerai')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 rounded-lg bg-slate-900/60 text-slate-200 ring-1 ring-slate-700 hover:ring-cyan-500/40 font-display font-semibold transition-all">
                  Scopri il percorso
                </button>
              </div>
              {/* mini stats */}
              <div className="mt-8 lg:mt-10 grid grid-cols-3 gap-3 sm:gap-4 max-w-md mx-auto lg:mx-0">
                {[
                  { icon: BookOpen, v: '22', l: 'Moduli' },
                  { icon: Users, v: '500+', l: 'Studenti' },
                  { icon: Star, v: '4.9/5', l: 'Rating' },
                ].map((s, i) => (
                  <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/40 p-3 text-center">
                    <s.icon className="w-4 h-4 text-cyan-500 mx-auto mb-1.5" />
                    <div className="font-display text-xl font-semibold">{s.v}</div>
                    <div className="font-mono-lab text-[0.55rem] tracking-[0.2em] uppercase text-slate-500">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* fondatore con effetti algo */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-[13rem] h-[16rem] sm:w-[18rem] sm:h-[22rem] md:w-[24rem] md:h-[30rem]">
                {/* alone radiale dietro */}
                <div className="absolute inset-0 bg-cyan-500/20 blur-[80px] rounded-full" />
                {/* anello/halo */}
                <div className="absolute inset-4 rounded-[2rem] ring-1 ring-cyan-500/30" />
                {/* griglia tech */}
                <div
                  className="absolute inset-0 opacity-[0.12] rounded-[2rem]"
                  style={{
                    backgroundImage: 'linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                  }}
                />
                {/* foto fondatore */}
                {founderImgOk ? (
                  <img
                    src={FOUNDER_IMG}
                    alt={FOUNDER_NAME}
                    className="relative z-10 w-full h-full object-cover object-top rounded-[2rem] [mask-image:linear-gradient(to_bottom,black_75%,transparent)]"
                    style={{ filter: 'drop-shadow(0 0 40px rgba(56,189,248,0.35)) contrast(1.05) saturate(1.1)' }}
                    onError={() => setFounderImgOk(false)}
                  />
                ) : (
                  <div className="relative z-10 w-full h-full rounded-[2rem] flex flex-col items-center justify-center bg-gradient-to-b from-slate-900/80 to-slate-950/90 ring-1 ring-slate-800 [mask-image:linear-gradient(to_bottom,black_80%,transparent)]">
                    <div className="w-24 h-24 rounded-full bg-cyan-500/10 ring-1 ring-cyan-500/30 flex items-center justify-center mb-4">
                      <UserIcon className="w-12 h-12 text-cyan-500/60" />
                    </div>
                    <p className="font-mono-lab text-[0.6rem] tracking-[0.25em] uppercase text-slate-500 text-center px-6">
                      carica la foto in<br/>public/founder.png
                    </p>
                  </div>
                )}
                {/* scanlines sopra la persona */}
                <div
                  className="absolute inset-0 z-20 rounded-[2rem] pointer-events-none mix-blend-overlay opacity-30"
                  style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(56,189,248,0.25) 0px, rgba(56,189,248,0.25) 1px, transparent 1px, transparent 4px)' }}
                />
                {/* badge fondatore */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl bg-slate-900/80 backdrop-blur-md ring-1 ring-cyan-500/30 text-center">
                  <div className="font-display font-semibold text-sm">{FOUNDER_NAME}</div>
                  <div className="font-mono-lab text-[0.55rem] tracking-[0.2em] uppercase text-cyan-400">// founder · codex</div>
                </div>
                {/* candele decorative */}
                <HologramSphere className="absolute -bottom-10 -left-10 w-40 h-40 opacity-70" detail="low" variant="candles" intensity={0.7} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ COSA IMPARERAI ═══════════════════ */}
      <section id="cosa-imparerai" className="relative py-12 lg:py-20 border-t border-slate-900">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center gap-2 mb-4 justify-center">
            <Cpu className="w-3.5 h-3.5 text-cyan-500" />
            <span className="font-mono-lab text-[0.7rem] tracking-[0.3em] uppercase text-cyan-500">// cosa imparerai</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-center tracking-tight mb-12">
            Dal backtest alla strategia in produzione
          </h2>
          <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {[
              { icon: Cpu, t: 'Generazione automatica', d: 'Crea strategie con il generatore genetico e filtri logici di mercato.' },
              { icon: Shield, t: 'Risk management', d: 'Position sizing dinamico, Monte Carlo, gestione multi-strategy.' },
              { icon: TrendingUp, t: 'Validazione robusta', d: 'Out-of-sample, walk-forward, stress test per strategie solide.' },
              { icon: Zap, t: 'Automazione', d: 'Workflow completo in StrategyQuant e integrazione MT4/MT5.' },
              { icon: Trophy, t: 'Mentalità quant', d: 'Disciplina operativa, approccio data-driven, gestione del drawdown.' },
              { icon: Users, t: 'Community & support', d: 'Gruppo privato, sessioni live e mentorship sui tuoi progetti.' },
            ].map((c, i) => (
              <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 hover:border-cyan-500/40 transition-all">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/10 ring-1 ring-cyan-500/30 flex items-center justify-center mb-3">
                  <c.icon className="w-4 h-4 text-cyan-500" />
                </div>
                <h3 className="font-display font-semibold">{c.t}</h3>
                <p className="text-sm text-slate-400 mt-1">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ VIDEO + GATING ═══════════════════ */}
      <section ref={videosRef} className="relative py-12 lg:py-20 border-t border-slate-900 bg-gradient-to-b from-blue-950/10 to-black">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center gap-2 mb-3 justify-center">
            <PlayCircle className="w-3.5 h-3.5 text-cyan-500" />
            <span className="font-mono-lab text-[0.7rem] tracking-[0.3em] uppercase text-cyan-500">// video gratuiti</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-center tracking-tight mb-2 lg:mb-3">
            Guarda i primi moduli, gratis
          </h2>
          <p className="text-center text-sm md:text-base text-slate-400 max-w-2xl mx-auto mb-6 lg:mb-12">
            {videosVisible
              ? <>Guarda <strong className="text-white">gratis</strong> i video, poi prenota una call col fondatore.</>
              : <>Iscriviti al portale per sbloccare <strong className="text-white">tutti i video gratuiti del trial</strong>. Dopo averli visti, prenota la tua call.</>}
          </p>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-7 h-7 text-cyan-500 animate-spin" />
            </div>
          ) : !videosVisible ? (
            /* ───── stato BLOCCATO: teaser + form ───── */
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto items-start">
              {/* teaser video bloccati */}
              <div className="space-y-3 order-2 lg:order-1 min-w-0">
                {previewLessons.slice(0, 5).map(({ lesson }, idx) => (
                  <div key={lesson.id} className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                      {idx === 0 ? <PlayCircle className="w-5 h-5 text-cyan-500" /> : <Lock className="w-4 h-4 text-slate-500" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-display font-medium text-sm truncate">{lesson.title}</div>
                      <div className="text-xs text-slate-500">{lesson.duration || 'video'}</div>
                    </div>
                    {idx === 0 && <span className="font-mono-lab text-[0.55rem] tracking-widest uppercase text-emerald-400">anteprima</span>}
                  </div>
                ))}
                <p className="text-xs text-slate-500 text-center pt-2">
                  + tutti gli altri video gratuiti del trial dopo l'iscrizione
                </p>
              </div>

              {/* form iscrizione inline — primo su mobile per massimizzare conversione */}
              <div id="register-box" className="order-1 lg:order-2 scroll-mt-24 min-w-0">
                <RegisterInline />
              </div>
            </div>
          ) : (
            /* ───── stato SBLOCCATO: player + playlist ───── */
            <div className="max-w-6xl mx-auto scroll-mt-24">
              {guideSent && (
                <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                  <p className="text-sm text-emerald-100">
                    <strong>Tutti i video sbloccati!</strong> Ti abbiamo inviato la guida PDF gratuita via email (controlla anche lo spam).
                  </p>
                </div>
              )}
              <div className="grid lg:grid-cols-[1fr_22rem] gap-6">
                {/* player */}
                <div>
                  <div className="aspect-video rounded-xl overflow-hidden bg-slate-950 ring-1 ring-slate-800">
                    {current && vimeoNumeric(current.vimeoId) ? (
                      <iframe
                        key={current.id}
                        src={`https://player.vimeo.com/video/${vimeoNumeric(current.vimeoId)}`}
                        className="w-full h-full" style={{ border: 0 }}
                        allow="autoplay; fullscreen; picture-in-picture" allowFullScreen
                        title={current.title}
                      />
                    ) : current && current.videoUrl ? (
                      <video controls className="w-full h-full bg-black">
                        <source src={`${API_URL}${current.videoUrl}`} type="video/mp4" />
                      </video>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
                        Video non disponibile
                      </div>
                    )}
                  </div>
                  {/* Gate email SUBITO sotto il video — 1° video libero, gli altri con l'email */}
                  {!leadDone && (
                    <div ref={leadRef} className="mt-4 scroll-mt-24">
                      <LeadGate onDone={handleLeadDone} />
                    </div>
                  )}

                  {current && (
                    <div className="mt-4">
                      <h3 className="font-display text-lg sm:text-xl font-semibold mb-3">{current.title}</h3>
                      {current.description && (
                        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 sm:p-5">
                          <FormattedDescription text={current.description} dark={true} />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* playlist */}
                <div className="space-y-2 max-h-[18rem] overflow-y-auto lg:max-h-[34rem] pr-1">
                  {previewLessons.map(({ module, lesson }, idx) => {
                    const active = lesson.id === activeVideo;
                    const locked = !leadDone && idx > 0; // 1° libero, gli altri richiedono email
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => {
                          if (locked) {
                            leadRef.current?.scrollIntoView({ behavior: 'smooth' });
                            return;
                          }
                          setActiveVideo(lesson.id);
                        }}
                        className={`w-full text-left flex items-center gap-3 rounded-lg border p-3 transition-all ${
                          active ? 'border-cyan-500/50 bg-cyan-500/10' : 'border-slate-800 bg-slate-900/40 hover:border-cyan-500/30'
                        } ${locked ? 'opacity-70' : ''}`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${active ? 'bg-cyan-500/20' : 'bg-slate-800'}`}>
                          {locked
                            ? <Lock className="w-3.5 h-3.5 text-slate-500" />
                            : <PlayCircle className={`w-4 h-4 ${active ? 'text-cyan-400' : 'text-slate-500'}`} />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={`text-sm font-display font-medium truncate ${active ? 'text-cyan-300' : 'text-white'}`}>{lesson.title}</div>
                          <div className="text-[0.65rem] font-mono-lab tracking-widest uppercase text-slate-500">M{module.order} · {lesson.duration || '—'}</div>
                        </div>
                        {idx === 0 && <span className="text-[0.55rem] font-mono-lab uppercase tracking-widest text-emerald-400">gratis</span>}
                        {locked && <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════ CTA + CALENDLY INLINE ═══════════════════ */}
      <section id="call-box" ref={calendlyRef} className="relative py-12 lg:py-20 border-t border-slate-900">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl">
          {/* Riquadro CTA "Prenota una call col fondatore" */}
          <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-blue-950/40 to-slate-900/40 p-6 md:p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
            <Sparkles className="w-6 h-6 text-cyan-400 mx-auto mb-3" />
            <h3 className="font-display text-2xl md:text-3xl font-semibold tracking-tight mb-2">
              Vuoi accedere a tutto il percorso?
            </h3>
            <p className="text-slate-400 max-w-xl mx-auto mb-6 text-sm md:text-base">
              Niente checkout online: il corso completo si sblocca direttamente in call col fondatore.
              Una chiacchierata gratuita per capire se l'academy fa per te.
            </p>
            <button
              onClick={openCalendly}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-display font-semibold hover:shadow-md hover:shadow-cyan-500/30 transition-all"
            >
              <Calendar className="w-4 h-4" />
              {videosVisible ? 'Prenota una call col fondatore' : 'Iscriviti e prenota una call'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Sondaggio (5 domande) prima del calendario */}
          {videosVisible && callStep === 'survey' && (
            <div className="mt-8">
              <Survey
                answers={surveyAnswers}
                setAnswers={setSurveyAnswers}
                onComplete={() => {
                  setCallStep('calendly');
                  setTimeout(() => calendlyRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
                }}
              />
            </div>
          )}

          {/* Widget Calendly inline (dopo il sondaggio) */}
          {videosVisible && callStep === 'calendly' && (
            <div className="mt-8">
              <p className="text-slate-400 text-center mb-4 text-sm">
                Scegli data e ora — riceverai la conferma via email con il link Google Meet.
              </p>
              <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
                <CalendlyInline
                  url={CALENDLY_URL}
                  prefill={(() => {
                    try { const u = JSON.parse(localStorage.getItem('user') || '{}'); return { name: u.name, email: u.email }; } catch { return {}; }
                  })()}
                  answers={Object.values(surveyAnswers)}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ───── footer minimal ───── */}
      <footer className="border-t border-slate-900 py-8">
        <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-3">
          <img src="/logo.png" alt="Nexora Lab" className="h-7 w-auto opacity-80" />
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} Nexora Lab · Codex Algo Academy</p>
          <div className="flex gap-4 text-xs text-slate-500">
            <Link to="/legal/privacy" className="hover:text-cyan-400">Privacy</Link>
            <Link to="/legal/termini" className="hover:text-cyan-400">Termini</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

// ════════════════════ FORM ISCRIZIONE INLINE ════════════════════
// L'utente viene creato nel DB e riceve la mail di verifica.
// Lo sblocco dei video avviene SOLO dopo aver cliccato il link di verifica
// (che riporta su questa LP grazie al postVerifyRedirect salvato qui sotto).
const RegisterInline: React.FC = () => {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.firstName || !form.email || form.password.length < 8) {
      setError('Compila tutti i campi (password almeno 8 caratteri).');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        // Salva email/nome per il prefill Calendly post-verifica
        localStorage.setItem('user', JSON.stringify({
          name: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
        }));
        // Dopo la verifica email, la pagina /verify-email rimanda qui
        localStorage.setItem('postVerifyRedirect', '/lp/codex-algo-academy');
        setSubmittedEmail(form.email);
      } else {
        const msg = (data.error || data.message || '').toString();
        if (msg.toLowerCase().includes('email') && (msg.toLowerCase().includes('esiste') || msg.toLowerCase().includes('already') || msg.toLowerCase().includes('duplicat'))) {
          setError('Questa email è già registrata. Accedi per continuare.');
        } else {
          setError(msg || 'Errore durante l\'iscrizione.');
        }
      }
    } catch {
      setError('Errore di connessione. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (!submittedEmail) return;
    setResending(true);
    setResendMsg('');
    try {
      const r = await fetch(API_ENDPOINTS.resendVerification, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: submittedEmail }),
      });
      const d = await r.json().catch(() => ({}));
      setResendMsg(r.ok ? 'Email reinviata! Controlla la casella.' : (d.error || 'Impossibile reinviare ora.'));
    } catch {
      setResendMsg('Errore di connessione.');
    } finally {
      setResending(false);
    }
  };

  // ── stato "controlla la mail" dopo iscrizione riuscita ──
  if (submittedEmail) {
    return (
      <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/60 p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
        <div className="w-16 h-16 rounded-full bg-cyan-500/10 ring-1 ring-cyan-500/30 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-7 h-7 text-cyan-400" />
        </div>
        <h3 className="font-display text-2xl font-semibold mb-2">Controlla la tua email</h3>
        <p className="text-slate-300 text-sm mb-1">
          Ti abbiamo inviato un link di verifica a:
        </p>
        <p className="text-cyan-300 font-mono-lab text-sm mb-5 break-all">{submittedEmail}</p>
        <p className="text-slate-400 text-sm mb-6">
          Clicca sul link nella mail per <strong className="text-white">attivare il tuo account</strong> e
          sbloccare automaticamente i video del trial. Verrai riportato qui in pochi secondi.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <button
            onClick={resend}
            disabled={resending}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800/60 ring-1 ring-slate-700 hover:ring-cyan-500/40 text-sm font-display font-medium text-slate-200 transition-all disabled:opacity-60"
          >
            {resending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            Non l'ho ricevuta — reinvia
          </button>
        </div>
        {resendMsg && <p className="mt-3 text-xs text-slate-400">{resendMsg}</p>}
        <p className="mt-5 text-[0.7rem] text-slate-500">
          Controlla anche la cartella <strong className="text-slate-300">spam</strong> / promozioni.
        </p>
      </div>
    );
  }

  const input = 'w-full pl-10 pr-3 py-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20';

  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/60 p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      <div className="flex items-center gap-2 mb-1">
        <Lock className="w-3.5 h-3.5 text-cyan-500" />
        <span className="font-mono-lab text-[0.7rem] tracking-[0.3em] uppercase text-cyan-500">// sblocca i video</span>
      </div>
      <h3 className="font-display text-xl font-semibold mb-1">Crea il tuo account gratuito</h3>
      <p className="text-sm text-slate-400 mb-5">
        Iscriviti, verifica l'email e i video del trial si sbloccano in automatico. Nessuna carta richiesta.
      </p>

      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="relative min-w-0">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input className={input} placeholder="Nome" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          </div>
          <div className="relative min-w-0">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input className={input} placeholder="Cognome" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </div>
        </div>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="email" className={input} placeholder="La tua email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="relative">
          <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type={showPw ? 'text' : 'password'} className={input + ' pr-10'} placeholder="Password (min 8 caratteri)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-500">
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-display font-semibold hover:shadow-md hover:shadow-cyan-500/30 transition-all disabled:opacity-60">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Iscrizione…</> : <>Iscriviti e ricevi la mail <ArrowRight className="w-4 h-4" /></>}
        </button>
        <p className="text-center text-xs text-slate-500">
          Hai già un account? <Link to="/login" className="text-cyan-500 hover:text-cyan-400">Accedi</Link>
        </p>
      </form>
    </div>
  );
};

// ════════════════════ GATE EMAIL (lead magnet) ════════════════════
// Cattura la sola email: sblocca tutti i video e fa inviare la guida PDF.
// Salva il lead nel pannello admin (endpoint /api/newsletter/lead, no account).
const LeadGate: React.FC<{ onDone: (email: string) => void }> = ({ onDone }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.includes('@') || email.length < 5) {
      setError('Inserisci un\'email valida.');
      return;
    }
    setLoading(true);
    try {
      const r = await fetch(`${API_URL}/api/newsletter/lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'lp-codex' }),
      });
      if (r.ok) {
        localStorage.setItem('lp_lead', email.trim());
        // salva l'email per il prefill del Calendly
        try {
          const u = JSON.parse(localStorage.getItem('user') || '{}');
          localStorage.setItem('user', JSON.stringify({ ...u, email: email.trim() }));
        } catch { localStorage.setItem('user', JSON.stringify({ email: email.trim() })); }
        onDone(email.trim());
      } else {
        const d = await r.json().catch(() => ({}));
        setError(d.error || 'Qualcosa è andato storto. Riprova.');
      }
    } catch {
      setError('Errore di connessione. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border-2 border-cyan-500/60 bg-gradient-to-br from-blue-950/70 to-slate-900/60 p-6 sm:p-7 relative overflow-hidden ring-2 ring-cyan-500/30 shadow-xl shadow-cyan-500/20">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500" />
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 ring-1 ring-cyan-500/40 mb-3">
        <Lock className="w-3.5 h-3.5 text-cyan-300" />
        <span className="font-mono-lab text-[0.65rem] tracking-[0.25em] uppercase text-cyan-200">Hai visto l'anteprima</span>
      </div>
      <h3 className="font-display text-2xl sm:text-3xl font-bold mb-2 leading-tight">
        🔓 Sblocca <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">tutti i video</span> gratis
      </h3>
      <p className="text-sm sm:text-base text-slate-300 mb-4">
        Lascia la tua email e accedi <strong className="text-white">subito</strong> a tutti i video del percorso
        + ricevi la <strong className="text-white">guida PDF gratuita</strong>. Niente password, niente carta.
      </p>
      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1 min-w-0">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="La tua email"
            className="w-full pl-10 pr-3 py-3 rounded-lg bg-slate-950/60 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-display font-semibold whitespace-nowrap hover:shadow-md hover:shadow-cyan-500/30 transition-all disabled:opacity-60"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sblocco…</> : <>Sblocca + guida gratis <ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>
      {error && <p className="text-sm text-rose-400 mt-2">{error}</p>}
      <p className="text-[0.7rem] text-slate-500 mt-3">
        Ti invieremo solo contenuti utili. Niente spam, cancellazione in un click.
      </p>
    </div>
  );
};

// ════════════════════ SONDAGGIO ════════════════════
const QUESTIONS = [
  { id: 'esperienza', q: 'Qual è il tuo livello nel trading?', opts: ['Principiante', 'Intermedio', 'Avanzato'] },
  { id: 'algo', q: 'Hai già provato il trading algoritmico?', opts: ['No, mai', 'Un po\'', 'Sì, attivamente'] },
  { id: 'capitale', q: 'Capitale che vuoi dedicare?', opts: ['< 5k', '5k–20k', '20k–50k', '> 50k'] },
  { id: 'tempo', q: 'Quanto tempo puoi dedicarci?', opts: ['< 1h/giorno', '1–3h/giorno', '3h+/giorno'] },
  { id: 'obiettivo', q: 'Cosa vuoi ottenere dalla call?', opts: ['Capire il metodo', 'Valutare l\'academy', 'Supporto su un progetto'] },
];

const Survey: React.FC<{ answers: Record<string, string>; setAnswers: (a: Record<string, string>) => void; onComplete: () => void }> = ({ answers, setAnswers, onComplete }) => {
  const [idx, setIdx] = useState(0);
  const q = QUESTIONS[idx];
  const total = QUESTIONS.length;
  const choose = (opt: string) => {
    const next = { ...answers, [q.id]: opt };
    setAnswers(next);
    if (idx < total - 1) setTimeout(() => setIdx(idx + 1), 200);
    else setTimeout(onComplete, 300);
  };
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 md:p-8">
      <div className="flex items-center justify-between mb-5">
        <span className="font-mono-lab text-[0.65rem] tracking-[0.25em] uppercase text-slate-500">Domanda {idx + 1} / {total}</span>
        <div className="flex gap-1">
          {QUESTIONS.map((_, i) => (
            <span key={i} className={`h-1.5 w-6 rounded-full ${i <= idx ? 'bg-cyan-500' : 'bg-slate-700'}`} />
          ))}
        </div>
      </div>
      <h3 className="font-display text-xl sm:text-2xl font-semibold tracking-tight mb-6">{q.q}</h3>
      <div className="grid gap-2.5">
        {q.opts.map((opt) => {
          const sel = answers[q.id] === opt;
          return (
            <button
              key={opt}
              onClick={() => choose(opt)}
              className={`w-full text-left px-4 py-3.5 rounded-lg border font-display font-medium transition-all flex items-center justify-between ${
                sel ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-200' : 'border-slate-800 bg-slate-950/40 text-slate-200 hover:border-cyan-500/40'
              }`}
            >
              {opt}
              <ChevronRight className={`w-4 h-4 ${sel ? 'text-cyan-400' : 'text-slate-600'}`} />
            </button>
          );
        })}
      </div>
      {idx > 0 && (
        <button onClick={() => setIdx(idx - 1)} className="mt-5 text-xs text-slate-500 hover:text-slate-300 font-display">← Indietro</button>
      )}
    </div>
  );
};

export default LandingCodex;
