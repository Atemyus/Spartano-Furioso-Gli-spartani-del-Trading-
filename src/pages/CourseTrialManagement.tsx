import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import {
  ArrowLeft, Clock, PlayCircle, CheckCircle, BookOpen, Trophy, TrendingUp,
  AlertTriangle, Rocket, MessageCircle, ExternalLink, Send, User, Star,
  ChevronRight, Calendar,
} from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import { getProductById } from '../data/products';

interface CourseModule {
  id: string;
  title: string;
  description: string;
  order: number;
  isTrialContent: boolean;
  duration: string;
  lessons: {
    id: string;
    title: string;
    description: string;
    duration: string;
    isTrialContent: boolean;
    order: number;
  }[];
}

const CourseTrialManagement: React.FC = () => {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [trial, setTrial] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [trialModules, setTrialModules] = useState<CourseModule[]>([]);
  const [courseProgress, setCourseProgress] = useState<any>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  const loadTrialData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    try {
      const courseData = getProductById(courseId || '');
      if (!courseData) { setLoading(false); return; }
      setCourse(courseData);

      try {
        const r = await fetch(`https://api.nexoralab.solutions/api/courses/${courseId}/content`);
        if (r.ok) {
          const d = await r.json();
          if (d.course?.modules) {
            const modules = d.course.modules.filter((m: any) => m.isTrialContent);
            setTrialModules(modules);
          }
        }
      } catch (e) {
        if (courseData.courseModules) {
          const modules = courseData.courseModules.filter((m: any) => m.isTrialContent);
          setTrialModules(modules);
        }
      }

      const response = await fetch(`https://api.nexoralab.solutions/api/trials/check/${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.isActive) {
          setTrial(data.trial);
          if (data.trial.daysRemaining <= 0) setTrial({ ...data.trial, isExpired: true });
        } else {
          navigate(`/course/${courseId}`);
        }
      }
    } catch (e) {
      console.error('Error loading trial data:', e);
    } finally {
      setLoading(false);
    }
  }, [courseId, navigate]);

  const loadCourseProgress = useCallback(async () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (token && user.id) {
      try {
        const r = await fetch(`https://api.nexoralab.solutions/api/courses/${courseId}/progress/${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (r.ok) {
          const d = await r.json();
          setCourseProgress(d);
          setCompletedLessons(new Set(d.completedLessons || []));
        }
      } catch (e) { console.error(e); }
    }
  }, [courseId]);

  useEffect(() => {
    loadTrialData();
    loadCourseProgress();
  }, [loadTrialData, loadCourseProgress]);

  const handleContinueCourse = () => {
    if (courseProgress?.lastLessonId) {
      navigate(`/course/${courseId}/viewer`, {
        state: { lastLessonId: courseProgress.lastLessonId, lastModuleId: courseProgress.lastModuleId }
      });
    } else {
      navigate(`/course/${courseId}/viewer`);
    }
  };

  const handleUpgradeNow = () => navigate(`/course/${courseId}`);

  // ====== shared styling ======
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

  // ====== loading ======
  if (loading) {
    return (
      <AnimatedPage>
        <div className={`min-h-screen flex items-center justify-center ${bg}`}>
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AnimatedPage>
    );
  }

  // ====== trial not found ======
  if (!trial || !course) {
    return (
      <AnimatedPage>
        <div className={`min-h-screen ${bg}`}>
          <div className="container mx-auto px-4 py-20">
            <div className="max-w-md mx-auto text-center">
              <div className={`w-14 h-14 mx-auto mb-5 rounded-2xl flex items-center justify-center ${dark ? 'bg-amber-500/10 ring-1 ring-amber-500/30' : 'bg-amber-50 ring-1 ring-amber-500/30'}`}>
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
              {tag('// errore')}
              <h1 className={`mt-3 font-display text-2xl font-semibold tracking-tight ${textMain}`}>Trial non trovato</h1>
              <p className={`mt-2 mb-6 text-sm ${textMuted}`}>Non hai una prova attiva per questo corso.</p>
              <Link to="/dashboard" className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-display font-semibold ${primaryBtn}`}>
                <ArrowLeft className="w-4 h-4" /> Torna alla dashboard
              </Link>
            </div>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  // ====== trial expired ======
  if (trial?.isExpired || trial?.daysRemaining <= 0) {
    return (
      <AnimatedPage>
        <div className={`min-h-screen ${bg}`}>
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-2xl mx-auto">
              <div className={`rounded-2xl border p-8 mb-6 ${surface}`}>
                <div className={`w-14 h-14 mx-auto mb-5 rounded-2xl flex items-center justify-center ${dark ? 'bg-amber-500/10 ring-1 ring-amber-500/30' : 'bg-amber-50 ring-1 ring-amber-500/30'}`}>
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                </div>
                <div className="text-center">
                  {tag('// trial scaduto')}
                  <h1 className={`mt-3 font-display text-3xl font-semibold tracking-tight ${textMain}`}>Il periodo di prova è terminato</h1>
                  <p className={`mt-3 text-sm ${textMuted}`}>
                    La tua prova gratuita per <span className="text-cyan-500 font-semibold">{course.name}</span> è scaduta.
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
                  <button onClick={() => navigate(`/course/${courseId}`)} className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-display font-semibold ${primaryBtn}`}>
                    <Rocket className="w-4 h-4" /> Acquista il corso completo
                  </button>
                  <button onClick={() => navigate('/dashboard')} className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-display font-semibold ${secondaryBtn}`}>
                    Torna alla dashboard
                  </button>
                </div>
              </div>

              <div className={`rounded-xl border p-6 ${surface}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-3.5 h-3.5 text-cyan-500" />
                  {tag('// cosa include il corso completo')}
                </div>
                <ul className={`space-y-2.5 text-sm ${textMuted}`}>
                  {[
                    'Accesso a tutti i moduli del corso',
                    'Tutte le video lezioni esclusive',
                    'Certificazione Nexora Trader al completamento',
                    'Accesso alla community privata a vita',
                  ].map((b) => (
                    <li key={b} className="flex items-center gap-2.5">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  const progressPercentage = courseProgress?.progress || 0;
  const trialDays = trial.daysRemaining ?? 0;
  const expiring = trialDays <= 7;

  return (
    <AnimatedPage>
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
            <button onClick={() => navigate(-1)} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-display font-semibold transition-all ${secondaryBtn}`}>
              <ArrowLeft className="w-3.5 h-3.5" /> Indietro
            </button>
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
              Prova attiva · {trialDays}g
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 md:px-8 py-8 relative">
          {/* Hero card */}
          <section className={`relative overflow-hidden rounded-2xl border p-6 md:p-8 mb-8 ${surface}`}>
            <div className="absolute -top-px left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
            <div className="grid md:grid-cols-[1fr_auto] gap-8">
              <div>
                {tag('// stai provando')}
                <h1 className={`mt-3 font-display text-3xl md:text-4xl font-semibold tracking-tight ${textMain}`}>{course.name}</h1>
                <p className={`mt-2 text-sm ${textMuted}`}>
                  Hai accesso ai moduli trial. Esplora il corso e, quando vuoi, sblocca tutti i contenuti.
                </p>

                <div className="mt-6">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className={textMuted}>Progresso del trial</span>
                    <span className="text-cyan-500 font-display font-semibold">{progressPercentage}%</span>
                  </div>
                  <div className={`w-full rounded-full h-2 ${dark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-6">
                  {[
                    { Icon: Clock, label: 'Giorni rimanenti', value: trialDays },
                    { Icon: BookOpen, label: 'Moduli trial', value: trialModules.length || course.totalModules || 3 },
                    { Icon: PlayCircle, label: 'Lezioni completate', value: completedLessons.size },
                  ].map(({ Icon, label, value }) => (
                    <div key={label} className={`rounded-lg border p-3 ${surface}`}>
                      <Icon className="w-4 h-4 text-cyan-500 mb-1.5" />
                      <div className={`font-display text-xl font-semibold ${textMain}`}>{value}</div>
                      <div className={`font-mono-lab text-[0.55rem] tracking-[0.2em] uppercase mt-0.5 ${textDim}`}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 md:min-w-[260px]">
                <button onClick={handleContinueCourse} className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-display font-semibold ${primaryBtn}`}>
                  <PlayCircle className="w-4 h-4" />
                  {courseProgress?.progress > 0 ? 'Riprendi corso' : 'Inizia corso'}
                </button>
                <button onClick={handleUpgradeNow} className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-display font-semibold transition-all ${
                  dark ? 'bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/40 hover:bg-cyan-500/20' : 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-500/40 hover:bg-cyan-100'
                }`}>
                  <Rocket className="w-4 h-4" /> Passa al corso completo
                </button>
              </div>
            </div>
          </section>

          {/* Trial modules */}
          {trialModules.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-3.5 h-3.5 text-cyan-500" />
                {tag('// contenuti disponibili nel trial')}
              </div>
              <div className="space-y-3">
                {trialModules.map((module, idx) => (
                  <div key={module.id} className={`rounded-xl border p-5 ${surface} ${surfaceHover} transition-all`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${dark ? 'bg-cyan-500/10 ring-1 ring-cyan-500/30' : 'bg-cyan-50 ring-1 ring-cyan-500/30'}`}>
                        <span className="font-display font-semibold text-cyan-500">{idx + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-display text-lg font-semibold ${textMain}`}>{module.title}</h3>
                        <p className={`text-sm mt-1 ${textMuted}`}>{module.description}</p>

                        <div className="grid md:grid-cols-2 gap-2 mt-4">
                          {module.lessons.map((lesson) => {
                            const completed = completedLessons.has(lesson.id);
                            return (
                              <div key={lesson.id} className={`flex items-center gap-2.5 rounded-lg p-2.5 text-sm ${
                                completed
                                  ? dark ? 'bg-emerald-500/10 ring-1 ring-emerald-500/30' : 'bg-emerald-50 ring-1 ring-emerald-500/30'
                                  : dark ? 'bg-slate-950/40 ring-1 ring-slate-800' : 'bg-slate-50 ring-1 ring-slate-200'
                              }`}>
                                {completed ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> : <PlayCircle className={`w-4 h-4 shrink-0 ${textDim}`} />}
                                <span className={`flex-1 truncate ${completed ? 'text-emerald-500 font-medium' : textMain}`}>{lesson.title}</span>
                                <span className={`font-mono-lab text-[0.6rem] tracking-widest ${textDim}`}>{lesson.duration}</span>
                              </div>
                            );
                          })}
                        </div>

                        <div className={`flex items-center gap-3 mt-3 font-mono-lab text-[0.6rem] tracking-widest uppercase ${textDim}`}>
                          <span>{module.lessons.length} lezioni</span>
                          <span>·</span>
                          <span>{module.duration} totali</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Upgrade CTA */}
          <section className={`relative overflow-hidden rounded-2xl border p-6 md:p-8 mb-8 ${surface}`}>
            <div className="absolute -top-px left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-3.5 h-3.5 text-cyan-500" />
              {tag('// sblocca il corso completo')}
            </div>
            <h2 className={`font-display text-2xl font-semibold mt-3 tracking-tight ${textMain}`}>Accesso completo, una volta sola</h2>
            <p className={`text-sm mt-1 ${textMuted}`}>Tutto incluso: ogni modulo, ogni lezione, certificazione e community.</p>

            <div className="grid grid-cols-3 gap-3 mt-6">
              {[
                { value: 22, label: 'Moduli totali' },
                { value: 139, label: 'Video lezioni' },
                { value: course.totalDuration || '300+', label: 'Ore di contenuto' },
              ].map((s) => (
                <div key={s.label} className={`rounded-lg border p-3 text-center ${surface}`}>
                  <div className={`font-display text-2xl font-semibold ${textMain}`}>{s.value}</div>
                  <div className={`font-mono-lab text-[0.55rem] tracking-[0.2em] uppercase mt-1 ${textDim}`}>{s.label}</div>
                </div>
              ))}
            </div>

            <div className={`grid md:grid-cols-2 gap-2.5 mt-6 text-sm ${textMuted}`}>
              {['Certificazione Nexora Trader', 'Mentoring 1-on-1', 'Community VIP a vita', 'Aggiornamenti gratuiti'].map((b) => (
                <div key={b} className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{b}</span>
                </div>
              ))}
            </div>

            <div className={`mt-6 rounded-xl border p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${dark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div>
                <div className={`font-mono-lab text-[0.6rem] tracking-[0.25em] uppercase ${textDim}`}>// prezzo speciale trial</div>
                <div className="flex items-baseline gap-3 mt-1">
                  {course.price?.originalPrice && (
                    <span className={`text-sm line-through ${textDim}`}>€{course.price.originalPrice}</span>
                  )}
                  <span className="font-display text-3xl font-semibold text-cyan-500">
                    €{course.price?.oneTime || course.price?.monthly || 1500}
                  </span>
                </div>
              </div>
              <button onClick={handleUpgradeNow} className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-display font-semibold ${primaryBtn}`}>
                Ottieni accesso completo <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </section>

          {/* Telegram support */}
          <section className={`rounded-2xl border p-6 ${surface}`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${dark ? 'bg-cyan-500/10 ring-1 ring-cyan-500/30' : 'bg-cyan-50 ring-1 ring-cyan-500/30'}`}>
                  <MessageCircle className="w-5 h-5 text-cyan-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <MessageCircle className="w-3.5 h-3.5 text-cyan-500" />
                    {tag('// supporto dedicato')}
                  </div>
                  <h3 className={`font-display font-semibold ${textMain}`}>Hai bisogno di aiuto? Contattaci su Telegram</h3>
                  <p className={`text-sm mt-0.5 ${textMuted}`}>Supporto rapido per studenti del corso · community esclusiva</p>
                </div>
              </div>
              <a href="https://t.me/codextrading" target="_blank" rel="noopener noreferrer"
                className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-display font-semibold ${primaryBtn}`}>
                <Send className="w-4 h-4" /> Contatta il supporto <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className={`mt-5 pt-5 border-t grid md:grid-cols-3 gap-3 text-xs ${dark ? 'border-slate-800' : 'border-slate-200'}`}>
              {[
                { dot: 'bg-emerald-500', label: 'Online', value: 'Lun-Ven 9:00-18:00' },
                { dot: 'bg-cyan-500', label: 'Username', value: '@codextrading' },
                { dot: 'bg-blue-500', label: 'Risposta', value: 'Entro 2 ore' },
              ].map((c) => (
                <div key={c.label} className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                  <span className={textMain}><strong className="font-display font-semibold">{c.label}:</strong> </span>
                  <span className={textMuted}>{c.value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Learning stats */}
          {course.metrics && (
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {[
                { Icon: User, value: course.metrics?.students?.toLocaleString() || '2.847', label: 'Studenti' },
                { Icon: Star, value: `${course.metrics?.avgRating || 4.9}/5`, label: 'Valutazione' },
                { Icon: TrendingUp, value: `${course.metrics?.successRate || 89}%`, label: 'Successo' },
                { Icon: Trophy, value: `${course.metrics?.completionRate || 94}%`, label: 'Completamento' },
              ].map((s) => (
                <div key={s.label} className={`rounded-xl border p-4 ${surface}`}>
                  <s.Icon className="w-4 h-4 text-cyan-500 mb-2" />
                  <div className={`font-display text-2xl font-semibold ${textMain}`}>{s.value}</div>
                  <div className={`font-mono-lab text-[0.6rem] tracking-[0.2em] uppercase mt-1 ${textDim}`}>{s.label}</div>
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
};

export default CourseTrialManagement;
