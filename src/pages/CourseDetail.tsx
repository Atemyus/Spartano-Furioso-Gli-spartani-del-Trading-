import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Lock, 
  CheckCircle, 
  Clock, 
  Users, 
  Star, 
  Award,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Zap,
  Gift,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import PaymentOptionsModal from '../components/PaymentOptionsModal';

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoId: string;
  isTrialContent: boolean;
  order: number;
  completed?: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  isTrialContent: boolean;
  duration: string;
  lessons: Lesson[];
  progress?: number;
}

interface Course {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  image: string;
  totalModules: number;
  totalLessons: number;
  totalDuration: string;
  trialDays?: number;
  trialModules: number;
  courseModules: Module[];
  metrics: {
    students: number;
    successRate: number;
    avgRating: number;
    completionRate: number;
  };
}

const CourseDetail: React.FC = () => {
  const { theme } = useTheme();
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [userAccess, setUserAccess] = useState<'none' | 'trial' | 'full' | 'expired'>('none');
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    loadCourseData();
    checkUserAccess();
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      // Carica i dettagli del prodotto
      const productResponse = await fetch(`https://api.nexoralab.solutions/api/products/${courseId}`);
      if (productResponse.ok) {
        const productData = await productResponse.json();
        
        // Carica i moduli del corso dal database
        const modulesResponse = await fetch(`https://api.nexoralab.solutions/api/courses/${courseId}/content`);
        if (modulesResponse.ok) {
          const modulesData = await modulesResponse.json();
          
          // Combina i dati del prodotto con i moduli reali del corso
          const courseWithModules = {
            ...productData,
            courseModules: modulesData.course?.modules || []
          };
          
          setCourse(courseWithModules);
          
          // Espandi automaticamente i primi 2 moduli
          if (courseWithModules.courseModules.length > 0) {
            setExpandedModules(courseWithModules.courseModules.slice(0, 2).map((m: Module) => m.id));
          }
        } else {
          // Se non ci sono moduli nel database, usa quelli del prodotto
          setCourse(productData);
          if (productData.courseModules) {
            setExpandedModules(productData.courseModules.slice(0, 2).map((m: Module) => m.id));
          }
        }
      }
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkUserAccess = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`https://api.nexoralab.solutions/api/trials/check/${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Trial check result:', data);
        
        if (data.trial) {
          const daysLeft = data.trial.daysRemaining || 0;
          setTrialDaysLeft(daysLeft);
          
          if (daysLeft <= 0) {
            setUserAccess('expired');
          } else if (data.isActive) {
            setUserAccess('trial');
          }
        }
      }
    } catch (error) {
      console.error('Error checking access:', error);
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleStartTrial = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/register');
      return;
    }
    // Per i corsi di formazione, usa la pagina trial dedicata
    navigate(`/course/${courseId}/trial`);
  };

  // Rimosso handleStartLesson perché i video non devono essere cliccabili

  const handlePurchase = () => {
    if (!course) return;
    
    // Apri il modale per selezionare il metodo di pagamento
    setIsPaymentModalOpen(true);
  };

  const calculateModuleProgress = (_module: Module) => {
    // Nessun progresso mostrato finché non si ha accesso completo
    return 0;
  };

  // ====== styling helpers (dashboard-style) ======
  const dark = theme === 'dark';
  const bg = dark ? 'bg-black' : 'bg-slate-50';
  const surface = dark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm';
  const surfaceHover = dark ? 'hover:border-cyan-500/50' : 'hover:border-cyan-500/70';
  const textMain = dark ? 'text-white' : 'text-slate-900';
  const textBody = dark ? 'text-slate-300' : 'text-slate-700';
  const textMuted = dark ? 'text-slate-400' : 'text-slate-600';
  const textDim = dark ? 'text-slate-500' : 'text-slate-500';
  const headerBg = dark ? 'bg-black/70 border-slate-800/80' : 'bg-white/70 border-slate-200';
  const secondaryBtn = dark
    ? 'bg-slate-900 text-slate-300 ring-1 ring-slate-800 hover:ring-cyan-500/40'
    : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-cyan-500/50';
  const primaryBtn = 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:shadow-md hover:shadow-cyan-500/20';
  const tag = (label) => (
    <span className="font-mono-lab text-[0.7rem] tracking-[0.3em] uppercase text-cyan-500">{label}</span>
  );

  if (loading) {
    return (
      <AnimatedPage>
        <div className={`min-h-screen flex items-center justify-center ${bg}`}>
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AnimatedPage>
    );
  }

  if (!course) {
    return (
      <AnimatedPage>
        <div className={`min-h-screen flex items-center justify-center ${bg}`}>
          <p className={textMain}>Corso non trovato</p>
        </div>
      </AnimatedPage>
    );
  }

  const learnCards = [
    { icon: '📘', title: 'Analisi Algoritmica Avanzata', items: ['Creazione automatizzata di strategie con generatore genetico', 'Filtri logici e condizioni di mercato', 'Analisi di robustezza e stress test', 'Validazione out-of-sample e walk-forward'] },
    { icon: '📈', title: 'Strategie Algoritmiche', items: ['Costruzione di portafogli multi-strategy', 'Ottimizzazione e clustering di strategie', 'Adattamento ai diversi regimi di mercato', 'Approccio quantitativo alla selezione dei sistemi'] },
    { icon: '🛡️', title: 'Risk & Money Management', items: ['Gestione del rischio multi-strategy', 'Position sizing dinamico', 'Equity curve trading & portfolio rebalancing', 'Metriche avanzate (Monte Carlo, Sharpe, SQN)'] },
    { icon: '⚡', title: 'Psicologia e Mentalità Quant', items: ['Gestione emotiva del drawdown', 'Disciplina operativa automatizzata', 'Fiducia nel sistema e statistica applicata', 'Mentalità quantitativa e data-driven'] },
    { icon: '💻', title: 'Trading Quantitativo Professionale', items: ['Analisi dati storici e qualità del tick', 'Workflow completo in StrategyQuant', 'Integrazione con MT4/MT5 e broker', 'Automazione dei test e validazioni batch'] },
    { icon: '🤝', title: 'Community & Support', items: ['Gruppo privato di confronto tra quant', 'Sessioni live di analisi e sviluppo EA', 'Q&A tecniche settimanali su StrategyQuant', 'Mentorship personalizzata sui progetti'] },
  ];

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
              <ChevronUp className="w-3.5 h-3.5 -rotate-90" /> Indietro
            </button>
            <div className="text-center hidden md:block">
              <div className={`font-mono-lab text-[0.65rem] tracking-[0.3em] uppercase ${textDim}`}>// Nexora Lab</div>
              <div className={`font-display text-sm font-semibold ${textMain}`}>Dettagli corso</div>
            </div>
            {userAccess === 'trial' ? (
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-display font-semibold ${dark ? 'bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/30' : 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-500/30'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Trial · {trialDaysLeft}g
              </div>
            ) : <div className="w-20" />}
          </div>
        </header>

        <div className="container mx-auto px-4 md:px-8 py-8 relative">
          {/* Hero card */}
          <section className={`relative overflow-hidden rounded-2xl border p-6 md:p-8 mb-8 ${surface}`}>
            <div className="absolute -top-px left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {tag('// formazione')}
              {userAccess === 'trial' && (
                <span className={`px-2.5 py-0.5 rounded-md text-[0.6rem] font-mono-lab tracking-widest uppercase font-bold ${dark ? 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30' : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/30'}`}>
                  Trial attivo · {trialDaysLeft}g
                </span>
              )}
              {userAccess === 'expired' && (
                <span className={`px-2.5 py-0.5 rounded-md text-[0.6rem] font-mono-lab tracking-widest uppercase font-bold ${dark ? 'bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-500/30'}`}>
                  Trial scaduto
                </span>
              )}
            </div>

            <h1 className={`font-display text-3xl md:text-4xl font-semibold tracking-tight ${textMain}`}>{course.name}</h1>
            <p className={`mt-2 text-sm md:text-base max-w-3xl ${textMuted}`}>{course.description}</p>

            {/* Metrics row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              {[
                { Icon: Users, value: course.metrics?.students ? course.metrics.students.toLocaleString() : '93', label: 'Studenti' },
                { Icon: Star, value: `${course.metrics?.avgRating || 4.8}/5`, label: 'Valutazione' },
                { Icon: TrendingUp, value: `${course.metrics?.successRate || 89}%`, label: 'Tasso successo' },
                { Icon: Clock, value: course.totalDuration || '12h', label: 'Durata' },
              ].map((m, i) => (
                <div key={i} className={`rounded-lg border p-3 ${surface}`}>
                  <m.Icon className="w-4 h-4 text-cyan-500 mb-1.5" />
                  <div className={`font-display text-lg font-semibold ${textMain}`}>{m.value}</div>
                  <div className={`font-mono-lab text-[0.55rem] tracking-[0.2em] uppercase mt-0.5 ${textDim}`}>{m.label}</div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-wrap gap-3 mt-6">
              {userAccess === 'none' && (
                <>
                  <button onClick={handleStartTrial} className={`inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-display font-semibold ${primaryBtn}`}>
                    <Gift className="w-4 h-4" /> Prova gratis {course.trialDays || 11} giorni
                  </button>
                  <button onClick={handlePurchase} className={`inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-display font-semibold ${secondaryBtn}`}>
                    Acquista corso completo · €{course.price}
                  </button>
                </>
              )}
              {userAccess === 'trial' && (
                <button onClick={() => document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' })} className={`inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-display font-semibold ${primaryBtn}`}>
                  <Zap className="w-4 h-4" /> Sblocca corso completo
                </button>
              )}
              {userAccess === 'expired' && (
                <button onClick={handlePurchase} className={`inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-display font-semibold ${primaryBtn}`}>
                  <Zap className="w-4 h-4" /> Acquista corso completo · €{course.price}
                </button>
              )}
              {userAccess === 'full' && (
                <button onClick={() => navigate(`/course/${courseId}/viewer`)} className={`inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-display font-semibold ${primaryBtn}`}>
                  <BookOpen className="w-4 h-4" /> Continua il corso
                </button>
              )}
            </div>
          </section>

          {/* Cosa imparerai */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-3.5 h-3.5 text-cyan-500" />
              {tag('// cosa imparerai')}
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {learnCards.map((c, i) => (
                <div key={i} className={`rounded-xl border p-5 transition-all ${surface} ${surfaceHover}`}>
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="text-2xl">{c.icon}</span>
                    <h3 className={`font-display font-semibold text-sm ${textMain}`}>{c.title}</h3>
                  </div>
                  <ul className="space-y-1.5">
                    {c.items.map((it, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <span className={textMuted}>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Main grid: modules + sidebar */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Modules */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-3.5 h-3.5 text-cyan-500" />
                {tag('// moduli del corso')}
              </div>

              {/* Info box: contenuti su Vimeo */}
              <div className={`rounded-xl border p-5 mb-4 flex items-start gap-3 ${surface}`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${dark ? 'bg-cyan-500/10 ring-1 ring-cyan-500/30' : 'bg-cyan-50 ring-1 ring-cyan-500/30'}`}>
                  <AlertCircle className="w-4 h-4 text-cyan-500" />
                </div>
                <div>
                  <h3 className={`font-display font-semibold text-sm ${textMain}`}>Contenuti del corso</h3>
                  <p className={`text-sm mt-1 ${textMuted}`}>
                    Dopo l'acquisto riceverai via email le credenziali di accesso alla piattaforma video dove seguire tutte le lezioni in ordine.
                  </p>
                </div>
              </div>

              {/* Modules accordion */}
              <div className="space-y-3">
                {(course.courseModules || []).map((module) => {
                  const isAccessible = userAccess === 'full' || (userAccess === 'trial' && module.isTrialContent);
                  const isExpanded = expandedModules.includes(module.id);
                  return (
                    <div key={module.id} className={`rounded-xl border overflow-hidden transition-all ${surface}`}>
                      <button className="w-full p-5 text-left" onClick={() => toggleModule(module.id)}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className={`font-mono-lab text-[0.6rem] tracking-widest uppercase ${textDim}`}>Modulo {module.order}</span>
                              {module.isTrialContent && (
                                <span className={`px-1.5 py-0.5 rounded text-[0.55rem] font-mono-lab tracking-widest uppercase font-bold ${dark ? 'bg-emerald-500/10 text-emerald-300' : 'bg-emerald-50 text-emerald-700'}`}>Trial gratuito</span>
                              )}
                              {!isAccessible && <Lock className={`w-3.5 h-3.5 ${textDim}`} />}
                            </div>
                            <h3 className={`font-display font-semibold ${textMain}`}>{module.title}</h3>
                            <p className={`text-sm mt-1 ${textMuted}`}>{module.description}</p>
                            <div className={`flex items-center gap-4 mt-3 text-xs ${textDim}`}>
                              <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {module.duration}</span>
                              <span className="inline-flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {module.lessons.length} lezioni</span>
                            </div>
                          </div>
                          <span className={textDim}>{isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}</span>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className={`border-t ${dark ? 'border-slate-800' : 'border-slate-200'}`}>
                          {module.lessons.map((lesson, index) => (
                            <div key={lesson.id} className={`p-4 flex items-center justify-between gap-3 ${index < module.lessons.length - 1 ? `border-b ${dark ? 'border-slate-800/60' : 'border-slate-100'}` : ''}`}>
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${dark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                  <BookOpen className={`w-4 h-4 ${textDim}`} />
                                </div>
                                <div className="min-w-0">
                                  <h4 className={`font-display font-medium text-sm truncate ${textMain}`}>{lesson.order}. {lesson.title}</h4>
                                  <p className={`text-xs truncate ${textDim}`}>{lesson.description}</p>
                                </div>
                              </div>
                              <span className={`text-xs shrink-0 ${textDim}`}>{lesson.duration}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Disclaimer */}
              <div className={`rounded-xl border p-5 mt-6 ${dark ? 'bg-amber-500/5 border-amber-500/30' : 'bg-amber-50 border-amber-300'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-mono-lab text-[0.7rem] tracking-[0.3em] uppercase text-amber-500">// disclaimer</span>
                </div>
                <div className={`space-y-2 text-sm ${textMuted}`}>
                  <p><strong className={textMain}>Rischio di investimento:</strong> il trading comporta un alto rischio e può causare la perdita del capitale. Non adatto a tutti.</p>
                  <p><strong className={textMain}>Nessuna garanzia:</strong> i risultati passati non sono indicativi di quelli futuri. Le strategie insegnate non garantiscono profitti.</p>
                  <p><strong className={textMain}>Scopo educativo:</strong> il corso ha esclusivamente scopo formativo e non costituisce consulenza finanziaria.</p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* Stats */}
              <div className={`rounded-xl border p-5 ${surface}`}>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-3.5 h-3.5 text-cyan-500" />
                  {tag('// statistiche')}
                </div>
                <div className="space-y-3 text-sm">
                  {[
                    ['Moduli totali', course.totalModules || 22],
                    ['Lezioni totali', course.totalLessons || 139],
                    ['Durata totale', course.totalDuration || '12 ore'],
                    ['Studenti', course.metrics?.students ? course.metrics.students.toLocaleString() : '93'],
                    ['Valutazione', `${course.metrics?.avgRating || 4.8}/5`],
                  ].map(([k, v], i) => (
                    <div key={i} className="flex justify-between">
                      <span className={textMuted}>{k}</span>
                      <span className={`font-display font-semibold ${textMain}`}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certificate */}
              <div className={`rounded-xl border p-5 ${surface}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-3.5 h-3.5 text-cyan-500" />
                  {tag('// certificazione')}
                </div>
                <p className={`text-sm ${textMuted}`}>
                  Completa il corso e ottieni la certificazione <span className="text-cyan-500 font-display font-semibold">Nexora Trader</span>.
                </p>
                <ul className="space-y-1.5 mt-3 text-sm">
                  {['Certificato verificabile online', 'Badge LinkedIn professionale', 'Accesso alla community VIP'].map((it, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      <span className={textMuted}>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pricing */}
              <div id="pricing-section" className={`relative overflow-hidden rounded-xl border p-5 ${surface}`}>
                <div className="absolute -top-px left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
                {userAccess === 'trial' && (
                  <div className={`mb-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[0.6rem] font-mono-lab tracking-widest uppercase font-bold ${dark ? 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30' : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/30'}`}>
                    <Zap className="w-3 h-3" /> Offerta speciale trial
                  </div>
                )}
                <div className="text-center mb-4">
                  {userAccess === 'trial' ? (
                    <>
                      <div className={`text-sm line-through ${textDim}`}>€{course.originalPrice || 1997}</div>
                      <div className="font-display text-4xl font-semibold text-cyan-500 mt-1">€1500</div>
                      <p className="text-xs text-emerald-500 font-semibold mt-1">Prezzo speciale — risparmi €497</p>
                    </>
                  ) : (
                    <>
                      {course.originalPrice && <div className={`text-sm line-through ${textDim}`}>€{course.originalPrice}</div>}
                      <div className="font-display text-4xl font-semibold text-cyan-500 mt-1">€{course.price}</div>
                      <p className={`text-xs mt-1 ${textDim}`}>Pagamento unico · accesso a vita</p>
                    </>
                  )}
                </div>
                <button onClick={handlePurchase} className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-display font-semibold ${primaryBtn}`}>
                  Acquista ora
                </button>
                <ul className="space-y-2 mt-4 text-sm">
                  {['Accesso immediato a tutti i contenuti', 'Certificato di completamento', 'Supporto dedicato', 'Aggiornamenti gratuiti'].map((it, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className={textMuted}>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Options Modal */}
      {course && (
        <PaymentOptionsModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          productId={courseId || ''}
          productName={course.name}
          price={userAccess === 'trial' ? 1500 : course.price}
          originalPrice={userAccess === 'trial' ? (course.originalPrice || 1997) : course.originalPrice}
          productType="course"
          plan="lifetime"
        />
      )}
    </AnimatedPage>
  );
};

export default CourseDetail;
