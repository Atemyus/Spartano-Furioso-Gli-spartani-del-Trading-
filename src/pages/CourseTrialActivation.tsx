import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { 
  BookOpen,
  PlayCircle,
  CheckCircle,
  Clock,
  Lock,
  Star,
  Users,
  Gift,
  Zap,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  isTrialContent: boolean;
  order: number;
}

interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  isTrialContent: boolean;
  duration: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  trialDays: number;
  totalModules: number;
  totalLessons: number;
  totalDuration: string;
  trialModules: number;
  courseModules: Module[];
  metrics?: {
    students: number;
    successRate: number;
    avgRating: number;
    completionRate: number;
  };
  category?: string;
  image?: string;
}

const CourseTrialActivation: React.FC = () => {
  const { theme } = useTheme();
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [trialActivated, setTrialActivated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  let userData = null;
  try {
    userData = user ? JSON.parse(user) : null;
  } catch (e) {
    console.error('Error parsing user data:', e);
  }

  useEffect(() => {
    console.log('CourseTrialActivation: useEffect triggered, courseId:', courseId, 'token:', !!token);
    
    if (!token) {
      console.log('CourseTrialActivation: No token, redirecting to login');
      navigate('/login');
      return;
    }
    
    if (courseId) {
      console.log('CourseTrialActivation: Starting to fetch course...');
      fetchCourse();
      checkTrialStatus();
    } else {
      console.log('CourseTrialActivation: No courseId!');
      setError('ID del corso mancante');
      setLoading(false);
    }
  }, [courseId]); // Rimuovo navigate e token dalle dipendenze per evitare loop

  const fetchCourse = async () => {
    // Aggiungi timeout per evitare blocchi infiniti
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.error('CourseTrialActivation: Fetch timeout!');
        setError('Timeout: Il caricamento sta impiegando troppo tempo');
        setLoading(false);
      }
    }, 10000); // 10 secondi di timeout
    
    try {
      console.log('CourseTrialActivation: Fetching course with ID:', courseId);
      const response = await fetch(`http://localhost:3001/api/products/${courseId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('CourseTrialActivation: Course data received:', data);
        console.log('CourseTrialActivation: Category:', data.category);
        
        // Verifica che sia effettivamente un corso di formazione
        if (data.category !== 'Formazione') {
          console.log('CourseTrialActivation: Not a Formazione course, redirecting to standard trial');
          navigate(`/trial-activation/${courseId}`);
          return;
        }
        
        // Carica i moduli REALI dal database
        try {
          const modulesResponse = await fetch(`http://localhost:3001/api/courses/${courseId}/content`);
          if (modulesResponse.ok) {
            const modulesData = await modulesResponse.json();
            console.log('CourseTrialActivation: Real modules loaded from database:', modulesData);
            
            if (modulesData.success && modulesData.course?.modules) {
              data.courseModules = modulesData.course.modules;
              console.log(`CourseTrialActivation: Loaded ${data.courseModules.length} real modules`);
            }
          } else {
            console.warn('CourseTrialActivation: Failed to load modules from database');
          }
        } catch (moduleError) {
          console.error('CourseTrialActivation: Error loading modules:', moduleError);
        }
        
        // Se ancora non ci sono moduli, usa struttura di esempio
        if (!data.courseModules || data.courseModules.length === 0) {
          console.warn('CourseTrialActivation: No courseModules found, using demo modules');
          data.courseModules = [
            {
              id: 'mod1',
              title: 'Introduzione al Trading Spartano',
              description: 'Le basi filosofiche e tecniche del trading professionale',
              order: 1,
              isTrialContent: true,
              duration: '4 ore',
              lessons: [
                {
                  id: 'les1',
                  title: 'Benvenuto nell\'Accademia Spartana',
                  description: 'Presentazione del corso e del metodo',
                  duration: '15:30',
                  isTrialContent: true,
                  order: 1
                },
                {
                  id: 'les2',
                  title: 'La Mentalità del Guerriero Trader',
                  description: 'Psicologia del trading e gestione emotiva',
                  duration: '45:00',
                  isTrialContent: true,
                  order: 2
                },
                {
                  id: 'les3',
                  title: 'Setup della Postazione di Trading',
                  description: 'Come configurare il tuo ambiente di lavoro',
                  duration: '30:00',
                  isTrialContent: true,
                  order: 3
                }
              ]
            },
            {
              id: 'mod2',
              title: 'Analisi Tecnica Avanzata',
              description: 'Pattern, indicatori e strategie tecniche',
              order: 2,
              isTrialContent: true,
              duration: '6 ore',
              lessons: [
                {
                  id: 'les4',
                  title: 'I Pattern Spartani',
                  description: 'Riconoscere i pattern ad alta probabilità',
                  duration: '60:00',
                  isTrialContent: true,
                  order: 1
                },
                {
                  id: 'les5',
                  title: 'Support & Resistance Warfare',
                  description: 'Identificare livelli chiave',
                  duration: '45:00',
                  isTrialContent: true,
                  order: 2
                }
              ]
            },
            {
              id: 'mod3',
              title: 'Risk Management Militare',
              description: 'Proteggere il capitale come uno scudo spartano',
              order: 3,
              isTrialContent: true,
              duration: '5 ore',
              lessons: [
                {
                  id: 'les6',
                  title: 'Position Sizing Strategico',
                  description: 'Calcolare la dimensione ottimale',
                  duration: '40:00',
                  isTrialContent: true,
                  order: 1
                },
                {
                  id: 'les7',
                  title: 'Stop Loss Tattici',
                  description: 'Come proteggere ogni posizione',
                  duration: '35:00',
                  isTrialContent: true,
                  order: 2
                }
              ]
            },
            {
              id: 'mod4',
              title: 'Strategie di Trading Spartane',
              description: 'Le strategie proprietarie dell\'accademia',
              order: 4,
              isTrialContent: false,
              duration: '8 ore',
              lessons: []
            }
          ];
          
          // Aggiungi anche dati mancanti
          data.totalModules = data.totalModules || 22;
          data.totalLessons = data.totalLessons || 139;
          data.totalDuration = data.totalDuration || '37 ore';
        }
        
        // Calcola il numero di moduli trial basandosi sui moduli reali
        if (data.courseModules && data.courseModules.length > 0) {
          const trialModulesCount = data.courseModules.filter((m: Module) => m.isTrialContent).length;
          data.trialModules = trialModulesCount;
          console.log(`CourseTrialActivation: Calculated ${trialModulesCount} trial modules from real data`);
        } else {
          data.trialModules = data.trialModules || 3;
        }
        
        setCourse(data);
      } else {
        console.error('CourseTrialActivation: Course not found, status:', response.status);
        setError(`Corso non trovato (status: ${response.status})`);
        setLoading(false);
      }
    } catch (error) {
      console.error('CourseTrialActivation: Error fetching course:', error);
      setError('Errore nel caricamento del corso. Riprova più tardi.');
    } finally {
      // IMPORTANTE: setLoading(false) deve essere sempre chiamato!
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const checkTrialStatus = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/trials/check/${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Trial status check:', data);
        
        // Se il trial è attivo, vai alla gestione del trial
        if (data.isActive && data.trial && data.trial.daysRemaining > 0) {
          console.log('Trial attivo, reindirizzo a manage-trial');
          navigate(`/course/${courseId}/manage-trial`);
          return;
        }
        
        // Se il trial esiste ma è scaduto, reindirizza alla pagina del corso per acquistare
        if (data.trial && data.trial.daysRemaining <= 0) {
          console.log('Trial scaduto, reindirizzo alla pagina del corso');
          navigate(`/course/${courseId}`);
          return;
        }
        
        // Se non c'è trial, permetti l'attivazione
        console.log('Nessun trial trovato, permetto attivazione');
      }
    } catch (error) {
      console.error('Error checking trial status:', error);
    }
  };

  const activateTrial = async () => {
    if (!course) return;
    
    setActivating(true);
    try {
      const response = await fetch('http://localhost:3001/api/trials/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          productId: course.id,
          productName: course.name 
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setTrialActivated(true);
        
        // Aggiorna i dati dell'utente nel localStorage
        if (userData) {
          const updatedUser = {
            ...userData,
            trials: [...(userData.trials || []), data.trial]
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        
        // Dopo 2 secondi, reindirizza alla pagina del corso
        setTimeout(() => {
          navigate(`/course/${courseId}`);
        }, 2000);
      } else {
        alert(data.error || 'Errore nell\'attivazione del trial');
      }
    } catch (error) {
      console.error('Error activating trial:', error);
      alert('Errore nell\'attivazione del trial');
    } finally {
      setActivating(false);
    }
  };

  const handleStartCourse = () => {
    navigate(`/course/${courseId}`);
  };

  // Mostra errore se presente
  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
        theme === 'dark' ? 'bg-gradient-to-b from-black via-gray-950 to-black' : 'bg-white'
      }`}>
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className={`text-2xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-black'
          }`}>Errore</h2>
          <p className={`mb-6 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>{error}</p>
          <button 
            onClick={() => navigate('/products')}
            className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg"
          >
            Torna ai prodotti
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
        theme === 'dark' ? 'bg-gradient-to-b from-black via-gray-950 to-black' : 'bg-white'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Caricamento corso...
          </p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
        theme === 'dark' ? 'bg-gradient-to-b from-black via-gray-950 to-black' : 'bg-white'
      }`}>
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className={`text-2xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-black'
          }`}>Corso non trovato</h2>
          <button 
            onClick={() => navigate('/products')}
            className={`text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Torna ai corsi
          </button>
        </div>
      </div>
    );
  }

  // Filtra solo i moduli disponibili nel trial
  const trialModules = course.courseModules?.filter(m => m.isTrialContent) || [];

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      theme === 'dark' ? 'bg-gradient-to-b from-black via-gray-950 to-black' : 'bg-white'
    }`}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10" />
        
        <div className="container mx-auto px-4 py-12 relative">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/20 border border-purple-600/50 rounded-full mb-6">
                <BookOpen className="w-5 h-5 text-purple-400" />
                <span className="text-purple-400 font-bold">FORMAZIONE PROFESSIONALE</span>
              </div>
              
              <h1 className={`text-4xl md:text-5xl font-black mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}>{course.name}</h1>
              
              <p className={`text-xl mb-8 max-w-2xl ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>{course.description}</p>
            </div>

            {/* Trial Info Box */}
            {!trialActivated ? (
              <div className={`border-2 rounded-2xl p-8 mb-12 ${
                theme === 'dark'
                  ? 'bg-gradient-to-b from-gray-900 to-black border-yellow-500/30'
                  : 'bg-white border-yellow-400/50 shadow-xl'
              }`}>
                <div className="text-center">
                  <Gift className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                  
                  <h2 className={`text-3xl font-black mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-black'
                  }`}>Prova Gratuita di {course.trialDays} Giorni</h2>
                  
                  <p className={`mb-8 max-w-2xl ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>Accedi gratuitamente ai primi {trialModules.length} moduli del corso per {course.trialDays} giorni. Potrai valutare la qualità dei contenuti prima di acquistare il corso completo.</p>

                  {/* What's Included in Trial */}
                  <div className="bg-black/50 rounded-xl p-6 mb-8 max-w-3xl mx-auto">
                    <h3 className={`text-lg font-bold mb-4 ${
                      theme === 'dark' ? 'text-white' : 'text-black'
                    }`}>Cosa include il trial:</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-left">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                        <div>
                          <div className={`text-white font-semibold ${
                            theme === 'dark' ? 'text-white' : 'text-black'
                          }`}>Primi {trialModules.length} Moduli Completi</div>
                          <div className={`text-gray-400 text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>Accesso completo ai moduli introduttivi</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                        <div>
                          <div className={`text-white font-semibold ${
                            theme === 'dark' ? 'text-white' : 'text-black'
                          }`}>Video HD + Materiali</div>
                          <div className={`text-gray-400 text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>Lezioni video e risorse scaricabili</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                        <div>
                          <div className={`text-white font-semibold ${
                            theme === 'dark' ? 'text-white' : 'text-black'
                          }`}>Supporto Community</div>
                          <div className={`text-gray-400 text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>Accesso al gruppo studenti</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                        <div>
                          <div className={`text-white font-semibold ${
                            theme === 'dark' ? 'text-white' : 'text-black'
                          }`}>Senza Impegno</div>
                          <div className={`text-gray-400 text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>Nessun addebito automatico</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={activateTrial}
                    disabled={activating}
                    className={`px-12 py-5 rounded-xl font-black text-white text-lg transition-all duration-300 transform hover:scale-105 ${
                      activating 
                        ? 'bg-gray-600 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-yellow-600 to-red-600 hover:from-yellow-500 hover:to-red-500'
                    }`}
                  >
                    {activating ? (
                      <span className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Attivazione in corso...
                      </span>
                    ) : (
                      <span className="flex items-center gap-3">
                        <Zap className="w-6 h-6" />
                        ATTIVA TRIAL GRATUITO
                      </span>
                    )}
                  </button>

                  <p className={`text-gray-500 text-sm mt-4 ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
                  }`}>
                    No carta di credito richiesta • Cancella quando vuoi
                  </p>
                </div>
              </div>
            ) : (
              // Trial Activated Success Message
              <div className={`border-2 rounded-2xl p-8 mb-12 ${
                theme === 'dark'
                  ? 'bg-gradient-to-b from-green-900/20 to-black border-green-500/30'
                  : 'bg-white border-green-400/50 shadow-xl'
              }`}>
                <div className="text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  
                  <h2 className={`text-3xl font-black mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-black'
                  }`}>Trial Attivato con Successo!</h2>
                  
                  <p className={`mb-8 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>Hai ora accesso ai primi {trialModules.length} moduli del corso per {course.trialDays} giorni. Ti stiamo reindirizzando al corso...</p>

                  <button
                    onClick={handleStartCourse}
                    className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-bold text-white hover:from-green-500 hover:to-emerald-500 transition-all duration-300 transform hover:scale-105 flex items-center gap-2 mx-auto"
                  >
                    <PlayCircle className="w-5 h-5" />
                    VAI AL CORSO
                  </button>
                </div>
              </div>
            )}

            {/* Trial Modules Preview */}
            <div className="mb-12">
              <h3 className={`text-2xl font-black mb-6 ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}>Moduli Disponibili nel Trial</h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trialModules.map((module, index) => (
                  <div 
                    key={module.id}
                    className={`border rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 ${
                      theme === 'dark'
                        ? 'bg-gradient-to-b from-gray-900 to-black border-purple-900/30'
                        : 'bg-white border-purple-200 shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-xl font-bold text-white">{index + 1}</span>
                      </div>
                      <div>
                        <h4 className={`text-lg font-bold mb-1 ${
                          theme === 'dark' ? 'text-white' : 'text-black'
                        }`}>{module.title}</h4>
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>{module.description}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {module.lessons.slice(0, 3).map((lesson) => (
                        <div key={lesson.id} className="flex items-center gap-2 text-sm">
                          <PlayCircle className="w-4 h-4 text-purple-400" />
                          <span className="text-gray-300">{lesson.title}</span>
                        </div>
                      ))}
                      {module.lessons.length > 3 && (
                        <div className="text-sm text-purple-400 font-semibold">
                          +{module.lessons.length - 3} altre lezioni
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        {module.lessons.length} lezioni
                      </span>
                      <span className="text-gray-500">
                        {module.duration}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Locked Modules Preview */}
            {course.courseModules && course.courseModules.length > trialModules.length && (
              <div className="text-center">
                <h3 className="text-2xl font-black text-white mb-6">
                  + Altri {course.courseModules.length - trialModules.length} Moduli nel Corso Completo
                </h3>
                
                <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6 max-w-3xl mx-auto">
                  <Lock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-6">
                    Sblocca l'accesso completo a tutti i {course.totalModules} moduli e {course.totalLessons} lezioni del corso
                  </p>
                  
                  <div className="flex items-center justify-center gap-8 mb-6">
                    <div>
                      <div className="text-2xl font-bold text-white">{course.totalModules}</div>
                      <div className="text-sm text-gray-400">Moduli Totali</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{course.totalLessons}</div>
                      <div className="text-sm text-gray-400">Lezioni</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{course.totalDuration}</div>
                      <div className="text-sm text-gray-400">Ore di Contenuto</div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => navigate(`/course/${courseId}`)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-white hover:from-purple-500 hover:to-pink-500 transition-all duration-300 inline-flex items-center gap-2"
                  >
                    Scopri il Corso Completo
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Course Stats */}
            {course.metrics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
                <div className="bg-black/50 border border-purple-900/30 rounded-lg p-4 text-center">
                  <Users className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    {course.metrics?.students ? course.metrics.students.toLocaleString() : '93'}
                  </div>
                  <div className="text-sm text-gray-400">Studenti</div>
                </div>
                <div className="bg-black/50 border border-purple-900/30 rounded-lg p-4 text-center">
                  <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    {course.metrics?.avgRating || 4.8}/5
                  </div>
                  <div className="text-sm text-gray-400">Valutazione</div>
                </div>
                <div className="bg-black/50 border border-purple-900/30 rounded-lg p-4 text-center">
                  <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    {course.metrics?.successRate || 95}%
                  </div>
                  <div className="text-sm text-gray-400">Successo</div>
                </div>
                <div className="bg-black/50 border border-purple-900/30 rounded-lg p-4 text-center">
                  <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    {course.metrics?.completionRate || 89}%
                  </div>
                  <div className="text-sm text-gray-400">Completamento</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseTrialActivation;
