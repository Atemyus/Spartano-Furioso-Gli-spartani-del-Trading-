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
      const productResponse = await fetch(`https://api.spartanofurioso.com/api/products/${courseId}`);
      if (productResponse.ok) {
        const productData = await productResponse.json();
        
        // Carica i moduli del corso dal database
        const modulesResponse = await fetch(`https://api.spartanofurioso.com/api/courses/${courseId}/content`);
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
      const response = await fetch(`https://api.spartanofurioso.com/api/trials/check/${courseId}`, {
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

  if (loading) {
    return (
      <AnimatedPage>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AnimatedPage>
    );
  }

  if (!course) {
    return (
      <AnimatedPage>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <p className="text-white">Corso non trovato</p>
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className={`min-h-screen transition-colors duration-500 ${
        theme === 'dark' ? 'bg-gradient-to-b from-black via-gray-950 to-black' : 'bg-white'
      }`}>
        {/* Hero Section */}
        <div className={`relative h-[60vh] overflow-hidden ${ 
          theme === 'dark' ? '' : 'bg-gradient-to-b from-gray-50 to-white'
        }`}>
          {theme === 'dark' && (
            <div className="absolute inset-0">
              <img 
                src={course.image} 
                alt={course.name}
                className="w-full h-full object-cover opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
            </div>
          )}
          
          <div className="relative container mx-auto px-4 h-full flex items-center">
            <div className="max-w-4xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-purple-600 text-white text-sm font-bold rounded">
                  FORMAZIONE
                </span>
                {userAccess === 'trial' && (
                  <span className="px-3 py-1 bg-yellow-600 text-white text-sm font-bold rounded animate-pulse">
                    TRIAL ATTIVO - {trialDaysLeft} giorni rimanenti
                  </span>
                )}
                {userAccess === 'expired' && (
                  <span className="px-3 py-1 bg-red-600 text-white text-sm font-bold rounded">
                    TRIAL SCADUTO
                  </span>
                )}
              </div>
              
              <h1 className={`text-5xl md:text-6xl font-black mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {course.name}
              </h1>
              
              <p className={`text-xl mb-6 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {course.description}
              </p>
              
              {/* Metrics */}
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-yellow-500" />
                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                    {course.metrics?.students ? course.metrics.students.toLocaleString() : '93'} studenti
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{course.metrics?.avgRating || 4.8}/5.0</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{course.metrics?.successRate || 89}% tasso di successo</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{course.totalDuration || '12 ore'}</span>
                </div>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                {userAccess === 'none' && (
                  <>
                    <button 
                      onClick={handleStartTrial}
                      className="px-8 py-4 bg-gradient-to-r from-yellow-600 to-red-600 border-2 border-yellow-400 rounded-lg font-bold text-white hover:from-yellow-500 hover:to-red-500 hover:border-yellow-300 transition-all transform hover:scale-105 flex items-center gap-2"
                    >
                      <Gift className="w-5 h-5" />
                      PROVA GRATIS {course.trialDays || 7} GIORNI
                    </button>
                    <button 
                      onClick={handlePurchase}
                      className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-800 border-2 border-purple-400 rounded-lg font-bold text-white hover:from-purple-500 hover:to-purple-700 hover:border-purple-300 transition-all"
                    >
                      ACQUISTA CORSO COMPLETO - €{course.price}
                    </button>
                  </>
                )}
                {userAccess === 'trial' && (
                  <button 
                    onClick={() => {
                      const pricingSection = document.getElementById('pricing-section');
                      if (pricingSection) {
                        pricingSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                    className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-800 border-2 border-green-400 rounded-lg font-bold text-white hover:from-green-500 hover:to-green-700 hover:border-green-300 transition-all transform hover:scale-105 flex items-center gap-2"
                  >
                    <Zap className="w-5 h-5" />
                    SBLOCCA CORSO COMPLETO - €1500
                  </button>
                )}
                {userAccess === 'expired' && (
                  <button 
                    onClick={handlePurchase}
                    className="px-8 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 border-2 border-yellow-400 rounded-lg font-bold text-white hover:from-yellow-500 hover:to-orange-500 hover:border-yellow-300 transition-all transform hover:scale-105"
                  >
                    ACQUISTA CORSO COMPLETO - €{course.price}
                  </button>
                )}
                {userAccess === 'full' && (
                  <button 
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-800 border-2 border-blue-400 rounded-lg font-bold text-white hover:from-blue-500 hover:to-blue-700 hover:border-blue-300 transition-all"
                  >
                    CONTINUA IL CORSO
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Course Content Overview Section */}
        <div className="container mx-auto px-4 py-12">
          {/* Course Contents Summary */}
          <div className="mb-16">
            <h2 className={`text-4xl font-black mb-8 text-center ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              📚 Cosa Imparerai in Questo Corso
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Contenuti principali */}
              <div className={`border rounded-xl p-6 ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-purple-900/30 to-purple-800/20 border-purple-600/30'
                  : 'bg-white border-purple-300 shadow-md'
              }`}>
                <div className="flex items-start gap-3 mb-4">
                  <div className="text-3xl">📘</div>
                  <h3 className={`text-lg font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Analisi Algoritmica Avanzata</h3>
                </div>
                <ul className={`space-y-2 text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <li>• Creazione automatizzata di strategie con generatore genetico</li>
                  <li>• Filtri logici e condizioni di mercato</li>
                  <li>• Analisi di robustezza e stress test</li>
                  <li>• Validazione out-of-sample e walk-forward</li>
                </ul>
              </div>
              
              <div className={`border rounded-xl p-6 ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-600/30'
                  : 'bg-white border-blue-300 shadow-md'
              }`}>
                <div className="flex items-start gap-3 mb-4">
                  <div className="text-3xl">📈</div>
                  <h3 className={`text-lg font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Strategie Algoritmiche</h3>
                </div>
                <ul className={`space-y-2 text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <li>• Costruzione di portafogli multi-strategy</li>
                  <li>• Ottimizzazione e clustering di strategie</li>
                  <li>• Adattamento ai diversi regimi di mercato</li>
                  <li>• Approccio quantitativo alla selezione dei sistemi</li>
                </ul>
              </div>
              
              <div className={`border rounded-xl p-6 ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-600/30'
                  : 'bg-white border-green-300 shadow-md'
              }`}>
                <div className="flex items-start gap-3 mb-4">
                  <div className="text-3xl">🛡️</div>
                  <h3 className={`text-lg font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Risk & Money Management Algoritmico</h3>
                </div>
                <ul className={`space-y-2 text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <li>• Gestione del rischio multi-strategy</li>
                  <li>• Position sizing dinamico</li>
                  <li>• Equity curve trading & portfolio rebalancing</li>
                  <li>• Metriche di performance avanzate (Monte Carlo, Sharpe, SQN, ecc.)</li>
                </ul>
              </div>
              
              <div className={`border rounded-xl p-6 ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 border-yellow-600/30'
                  : 'bg-white border-yellow-300 shadow-md'
              }`}>
                <div className="flex items-start gap-3 mb-4">
                  <div className="text-3xl">⚡</div>
                  <h3 className={`text-lg font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Psicologia e Mentalità Quant</h3>
                </div>
                <ul className={`space-y-2 text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <li>• Gestione emotiva del drawdown</li>
                  <li>• Disciplina operativa automatizzata</li>
                  <li>• Fiducia nel sistema e statistica applicata</li>
                  <li>• Mentalità quantitativa e approccio data-driven</li>
                </ul>
              </div>
              
              <div className={`border rounded-xl p-6 ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-red-900/30 to-red-800/20 border-red-600/30'
                  : 'bg-white border-red-300 shadow-md'
              }`}>
                <div className="flex items-start gap-3 mb-4">
                  <div className="text-3xl">💻</div>
                  <h3 className={`text-lg font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Trading Quantitativo Professionale</h3>
                </div>
                <ul className={`space-y-2 text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <li>• Analisi dei dati storici e qualità del tick</li>
                  <li>• Workflow completo in StrategyQuant</li>
                  <li>• Integrazione con MT4/MT5 e piattaforme broker</li>
                  <li>• Automazione dei test e validazioni batch</li>
                </ul>
              </div>
              
              <div className={`border rounded-xl p-6 ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-pink-900/30 to-pink-800/20 border-pink-600/30'
                  : 'bg-white border-pink-300 shadow-md'
              }`}>
                <div className="flex items-start gap-3 mb-4">
                  <div className="text-3xl">🤝</div>
                  <h3 className={`text-lg font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Community & Support</h3>
                </div>
                <ul className={`space-y-2 text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <li>• Accesso a gruppo privato per confronto tra quant</li>
                  <li>• Sessioni live di analisi e sviluppo EA</li>
                  <li>• Q&A tecniche settimanali su StrategyQuant</li>
                  <li>• Mentorship personalizzata su progetti algoritmici</li>
                </ul>
              </div>
            </div>
            
            {/* Disclaimer Box */}
            <div className={`border-2 rounded-xl p-8 ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-red-950/50 via-orange-950/50 to-red-950/50 border-red-600/50'
                : 'bg-white border-red-400 shadow-lg'
            }`}>
              <div className="flex items-start gap-4">
                <AlertCircle className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className={`text-xl font-bold mb-3 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    ⚠️ DISCLAIMER IMPORTANTE
                  </h3>
                  <div className={`space-y-3 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <p>
                      <strong className="text-red-400">Rischio di investimento:</strong> Il trading di strumenti finanziari comporta un alto livello di rischio e può risultare nella perdita di tutto il capitale investito. Non è adatto a tutti gli investitori.
                    </p>
                    <p>
                      <strong className="text-orange-400">Nessuna garanzia di profitto:</strong> I risultati passati non sono indicativi di risultati futuri. Le strategie e tecniche insegnate in questo corso non garantiscono profitti.
                    </p>
                    <p>
                      <strong className="text-yellow-400">Scopo educativo:</strong> Questo corso ha esclusivamente scopo formativo e informativo. Non costituisce consulenza finanziaria, di investimento o di trading.
                    </p>
                    <p className="text-sm text-gray-400 pt-2 border-t border-gray-700">
                      Prima di fare trading, consulta un consulente finanziario qualificato. Investi solo quello che puoi permetterti di perdere. 
                      La responsabilità delle decisioni di trading è esclusivamente tua.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content - Modules */}
            <div className="lg:col-span-2">
              <h2 className={`text-3xl font-black mb-8 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Moduli del Corso
              </h2>
              
              {/* Trial Info Box - Solo per utenti senza trial */}
              {userAccess === 'none' && (
                <div className={`border-2 rounded-xl p-6 mb-8 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-yellow-900/30 to-red-900/30 border-yellow-600/50'
                    : 'bg-white border-yellow-400 shadow-lg'
                }`}>
                  <div className="flex items-start gap-4">
                    <Gift className="w-8 h-8 text-yellow-500 flex-shrink-0" />
                    <div>
                      <h3 className={`text-xl font-bold mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        🎁 Prova GRATUITA di 7 giorni
                      </h3>
                      <p className={`mb-3 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Accedi SUBITO ai primi {course.trialModules || 2} moduli del corso senza carta di credito!
                      </p>
                      <ul className={`space-y-1 text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        <li>✅ Accesso immediato ai moduli introduttivi</li>
                        <li>✅ Video completi in alta qualità</li>
                        <li>✅ Nessun obbligo di acquisto</li>
                        <li>✅ Certificato di completamento trial</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Message for expired trial users */}
              {userAccess === 'expired' && (
                <div className={`border-2 rounded-xl p-6 mb-8 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-red-900/30 to-orange-900/30 border-red-600/50'
                    : 'bg-white border-red-400 shadow-lg'
                }`}>
                  <div className="flex items-start gap-4">
                    <AlertCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
                    <div>
                      <h3 className={`text-xl font-bold mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        ⚠️ Trial Scaduto
                      </h3>
                      <p className={`mb-3 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Il tuo periodo di prova è terminato. Acquista il corso completo per accedere a tutti i contenuti!
                      </p>
                      <ul className={`space-y-1 text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        <li>✅ Accesso a tutti i {course.totalModules || 22} moduli</li>
                        <li>✅ Oltre {course.totalLessons || 139} video lezioni</li>
                        <li>✅ Certificazione ufficiale</li>
                        <li>✅ Supporto dedicato a vita</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Info Box - I contenuti sono su Vimeo */}
              <div className={`border-2 rounded-xl p-6 mb-8 ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-600/50'
                  : 'bg-white border-blue-400 shadow-lg'
              }`}>
                <div className="flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className={`text-lg font-bold mb-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      🎥 Contenuti del Corso
                    </h3>
                    <p className={`mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Tutti i video del corso sono ospitati su <strong className="text-blue-400">Vimeo</strong> per garantire la massima qualità di streaming.
                    </p>
                    <p className="text-sm text-gray-400">
                      Dopo l'acquisto riceverai via email le credenziali di accesso alla piattaforma Vimeo dove potrai seguire tutte le lezioni in ordine.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Modules List */}
              <div className="space-y-4">
                {(course.courseModules || []).map((module) => {
                  // Mostra tutti i moduli, ma solo quelli trial sono accessibili se hai un trial attivo
                  const isAccessible = userAccess === 'full' || 
                    (userAccess === 'trial' && module.isTrialContent);
                  const isExpanded = expandedModules.includes(module.id);
                  const progress = calculateModuleProgress(module);
                  
                  return (
                    <div 
                      key={module.id}
                      className={`border-2 rounded-xl overflow-hidden transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-900/50 border-gray-800'
                          : 'bg-white border-gray-200 shadow-md'
                      }`}
                    >
                      {/* Module Header */}
                      <div 
                        className="p-6 cursor-pointer"
                        onClick={() => toggleModule(module.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-sm font-bold text-gray-500">
                                MODULO {module.order}
                              </span>
                              {module.isTrialContent && (
                                <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs font-bold rounded">
                                  TRIAL GRATUITO
                                </span>
                              )}
                              {!isAccessible && (
                                <Lock className="w-4 h-4 text-gray-500" />
                              )}
                            </div>
                            <h3 className={`text-xl font-bold mb-2 ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              {module.title}
                            </h3>
                            <p className={`mb-3 ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {module.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-gray-500">
                                <Clock className="w-4 h-4 inline mr-1" />
                                {module.duration}
                              </span>
                              <span className="text-gray-500">
                                <BookOpen className="w-4 h-4 inline mr-1" />
                                {module.lessons.length} lezioni
                              </span>
                              {progress > 0 && (
                                <div className="flex items-center gap-2">
                                  <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-gradient-to-r from-yellow-500 to-green-500"
                                      style={{ width: `${progress}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs text-gray-500">{progress}%</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <button className="text-gray-400 hover:text-white transition-colors">
                            {isExpanded ? <ChevronUp /> : <ChevronDown />}
                          </button>
                        </div>
                      </div>
                      
                      {/* Module Lessons - Solo visualizzazione, non cliccabili */}
                      {isExpanded && (
                        <div className="border-t border-gray-800">
                          {module.lessons.map((lesson, index) => {
                            return (
                              <div 
                                key={lesson.id}
                                className={`p-4 ${
                                  index < module.lessons.length - 1 ? 'border-b border-gray-800' : ''
                                } opacity-90 cursor-default`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-700">
                                      <BookOpen className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <div>
                                      <h4 className="text-white font-medium mb-1">
                                        {lesson.order}. {lesson.title}
                                      </h4>
                                      <p className="text-sm text-gray-500">
                                        {lesson.description}
                                      </p>
                                    </div>
                                  </div>
                                  <span className="text-sm text-gray-500">
                                    {lesson.duration}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Course Stats */}
              <div className={`border-2 rounded-xl p-6 mb-6 ${
                theme === 'dark'
                  ? 'bg-gray-900/50 border-red-900/30'
                  : 'bg-white border-red-300 shadow-md'
              }`}>
                <h3 className={`text-xl font-bold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Statistiche Corso
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Moduli totali</span>
                    <span className={`font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>{course.totalModules || 22}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Lezioni totali</span>
                    <span className={`font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>{course.totalLessons || 139}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Durata totale</span>
                    <span className={`font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>{course.totalDuration || '12 ore'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Studenti</span>
                    <span className={`font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {course.metrics?.students ? course.metrics.students.toLocaleString() : '93'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Valutazione</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => {
                        const rating = course.metrics?.avgRating || 4.8;
                        return (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${
                              i < Math.floor(rating) 
                                ? 'text-yellow-500 fill-current' 
                                : 'text-gray-600'
                            }`} 
                          />
                        );
                      })}
                      <span className={`font-bold ml-1 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {course.metrics?.avgRating || 4.8}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Certificate Info */}
              <div className={`border-2 rounded-xl p-6 mb-6 ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-600/50'
                  : 'bg-white border-purple-400 shadow-lg'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-8 h-8 text-yellow-500" />
                  <h3 className={`text-xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Certificazione
                  </h3>
                </div>
                <p className={`mb-4 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Completa il corso e ottieni la prestigiosa certificazione 
                  <span className="text-yellow-500 font-bold"> Spartan Trader</span>!
                </p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Certificato verificabile online</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Badge LinkedIn professionale</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Accesso alla community VIP</span>
                  </li>
                </ul>
              </div>

              {/* Pricing Section */}
              <div id="pricing-section" className={`border-2 rounded-xl p-6 ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-yellow-600/50'
                  : 'bg-white border-yellow-400 shadow-lg'
              }`}>
                {/* Special Trial Price for trial users */}
                {userAccess === 'trial' && (
                  <div className="bg-gradient-to-r from-green-900/50 to-green-800/30 border border-green-500/50 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 text-green-400 font-bold text-sm">
                      <Zap className="w-4 h-4" />
                      OFFERTA SPECIALE TRIAL
                    </div>
                  </div>
                )}
                
                <h3 className="text-xl font-bold text-white mb-4 text-center">
                  💰 Acquista il Corso Completo
                </h3>
                <div className="text-center mb-4">
                  {userAccess === 'trial' ? (
                    <>
                      <div className="text-gray-400 line-through text-lg">
                        €{course.originalPrice || 1997}
                      </div>
                      <div className="text-4xl font-black text-yellow-500 mb-2">
                        €1500
                      </div>
                      <p className="text-sm text-green-400 font-semibold">Prezzo Speciale Trial - Risparmia €497!</p>
                    </>
                  ) : (
                    <>
                      {course.originalPrice && (
                        <div className="text-gray-400 line-through text-lg">
                          €{course.originalPrice}
                        </div>
                      )}
                      <div className="text-4xl font-black text-yellow-500 mb-2">
                        €{course.price}
                      </div>
                      <p className="text-sm text-gray-400">Pagamento unico - Accesso a vita</p>
                    </>
                  )}
                </div>
                <button
                  onClick={handlePurchase}
                  className="w-full px-6 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 border-2 border-yellow-400 rounded-lg font-bold text-white hover:from-yellow-500 hover:to-orange-500 hover:border-yellow-300 transition-all transform hover:scale-105 mb-4"
                >
                  ACQUISTA ORA
                </button>
                <ul className={`space-y-2 text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Accesso immediato a tutti i contenuti</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Certificato di completamento</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Supporto dedicato</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Aggiornamenti gratuiti</span>
                  </li>
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
