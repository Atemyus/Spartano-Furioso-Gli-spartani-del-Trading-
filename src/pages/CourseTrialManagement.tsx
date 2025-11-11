import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import {
  ArrowLeft,
  Clock,
  PlayCircle,
  CheckCircle,
  BookOpen,
  Trophy,
  TrendingUp,
  Calendar,
  Star,
  Zap,
  ChevronRight,
  AlertTriangle,
  Gift,
  Rocket,
  MessageCircle,
  ExternalLink,
  Send,
  User
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
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      // Get course data from products
      console.log('🔍 CourseTrialManagement - courseId from URL:', courseId);
      const courseData = getProductById(courseId || '');
      console.log('📚 Course data found:', courseData);
      
      if (!courseData) {
        console.error('❌ Course not found for ID:', courseId);
        // Show error instead of navigating away immediately
        setLoading(false);
        return;
      }
      setCourse(courseData);

      // Get course modules from API
      try {
        const courseContentResponse = await fetch(`https://api.spartanofurioso.com/api/courses/${courseId}/content`);
        if (courseContentResponse.ok) {
          const courseContent = await courseContentResponse.json();
          console.log('📖 Course content loaded:', courseContent);
          
          if (courseContent.course && courseContent.course.modules) {
            // Filter trial modules
            const modules = courseContent.course.modules.filter(m => m.isTrialContent);
            setTrialModules(modules);
          }
        }
      } catch (error) {
        console.error('Error loading course modules:', error);
        // Fallback to courseData.courseModules if available
        if (courseData.courseModules) {
          const modules = courseData.courseModules.filter(m => m.isTrialContent);
          setTrialModules(modules);
        }
      }

      // Check trial status
      const response = await fetch(`https://api.spartanofurioso.com/api/trials/check/${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.isActive) {
          setTrial(data.trial);
          
          // Check if trial is expired
          if (data.trial.daysRemaining <= 0) {
            console.log('⚠️ Trial expired, blocking access');
            setTrial({ ...data.trial, isExpired: true });
          }
        } else {
          // No active trial, redirect to course page
          navigate(`/course/${courseId}`);
        }
      }
    } catch (error) {
      console.error('Error loading trial data:', error);
    } finally {
      setLoading(false);
    }
  }, [courseId, navigate]);

  const loadCourseProgress = useCallback(async () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (token && user.id) {
      try {
        const response = await fetch(`https://api.spartanofurioso.com/api/courses/${courseId}/progress/${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Course progress loaded:', data);
          setCourseProgress(data);
          setCompletedLessons(new Set(data.completedLessons || []));
        }
      } catch (error) {
        console.error('Error loading course progress:', error);
      }
    }
  }, [courseId]);

  useEffect(() => {
    loadTrialData();
    loadCourseProgress();
  }, [loadTrialData, loadCourseProgress]);

  const handleContinueCourse = () => {
    // Navigate to course viewer page, optionally to last lesson
    if (courseProgress && courseProgress.lastLessonId) {
      navigate(`/course/${courseId}/viewer`, { 
        state: { 
          lastLessonId: courseProgress.lastLessonId,
          lastModuleId: courseProgress.lastModuleId 
        } 
      });
    } else {
      navigate(`/course/${courseId}/viewer`);
    }
  };


  const handleUpgradeNow = () => {
    // Reindirizza alla pagina del corso dove ci sono i button per Stripe
    navigate(`/course/${courseId}`);
  };


  if (loading) {
    return (
      <AnimatedPage>
        <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
          theme === 'dark' ? 'bg-gradient-to-b from-black via-purple-950/20 to-black' : 'bg-white'
        }`}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </AnimatedPage>
    );
  }

  if (!trial || !course) {
    return (
      <AnimatedPage>
        <div className={`min-h-screen transition-colors duration-500 ${
          theme === 'dark' ? 'bg-gradient-to-b from-black via-purple-950/20 to-black' : 'bg-white'
        }`}>
          <div className="container mx-auto px-4 py-16 text-center">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className={`text-3xl font-black mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-black'
            }`}>Trial Non Trovato</h1>
            <p className={`mb-8 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>Non hai un trial attivo per questo corso.</p>
            <Link 
              to="/dashboard" 
              className="px-6 py-3 bg-purple-600 border-2 border-purple-400 rounded-lg text-white hover:bg-purple-500 hover:border-purple-300 transition-all"
            >
              Torna alla Dashboard
            </Link>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  // Check if trial is expired
  if (trial?.isExpired || trial?.daysRemaining <= 0) {
    return (
      <AnimatedPage>
        <div className={`min-h-screen transition-colors duration-500 ${
          theme === 'dark' ? 'bg-gradient-to-b from-black via-red-950/20 to-black' : 'bg-white'
        }`}>
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-red-900/20 border-2 border-red-500 rounded-2xl p-8 mb-8">
                <AlertTriangle className="w-20 h-20 text-red-500 mx-auto mb-6 animate-pulse" />
                <h1 className={`text-4xl font-black mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}>
                  TRIAL SCADUTO
                </h1>
                <p className="text-xl text-gray-300 mb-8">
                  Il tuo periodo di prova per <span className="text-yellow-500 font-bold">{course.name}</span> è terminato.
                </p>
                
                <div className="bg-black/50 border border-red-900/30 rounded-xl p-6 mb-8">
                  <div className="grid grid-cols-2 gap-4 text-left">
                    <div>
                      <span className="text-gray-400 text-sm">Iniziato il</span>
                      <p className="text-white font-bold">
                        {new Date(trial.startDate).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Terminato il</span>
                      <p className="text-red-400 font-bold">
                        {new Date(trial.endDate).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <button
                    onClick={() => navigate(`/course/${courseId}`)}
                    className="w-full px-8 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 border-2 border-yellow-400 rounded-xl font-bold text-white hover:from-yellow-500 hover:to-orange-500 hover:border-yellow-300 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3"
                  >
                    <Rocket className="w-6 h-6" />
                    ACQUISTA IL CORSO COMPLETO
                  </button>
                  
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full px-8 py-4 bg-gray-800 border-2 border-gray-600 rounded-xl font-bold text-gray-400 hover:bg-gray-700 hover:border-gray-500 transition-all duration-300"
                  >
                    Torna alla Dashboard
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  🎯 Cosa include il corso completo?
                </h3>
                <ul className="space-y-2 text-left text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>Accesso a tutti i 3 moduli del corso</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>11 video lezioni esclusive</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>Certificazione Spartan Trader al completamento</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>Accesso alla community privata a vita</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  // Use ONLY real course progress based on completed lessons (0% if no lessons completed)
  const progressPercentage = courseProgress?.progress || 0;

  return (
    <AnimatedPage>
      <div className={`min-h-screen transition-colors duration-500 ${
        theme === 'dark' ? 'bg-gradient-to-b from-black via-purple-950/20 to-black' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`backdrop-blur-sm border-b ${
          theme === 'dark' ? 'bg-black/50 border-purple-900/30' : 'bg-white border-purple-200'
        }`}>
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-900/30 border border-purple-500/50 rounded-lg text-purple-400 hover:text-purple-300 hover:bg-purple-900/50 hover:border-purple-400 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-bold">Indietro</span>
              </button>
              
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 bg-purple-900/30 border border-purple-800 rounded-lg">
                  <span className="text-purple-400 text-sm font-bold">Trial Attivo</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Trial Status Card */}
          <div className={`border-2 rounded-2xl p-8 mb-8 ${
            theme === 'dark'
              ? 'bg-gradient-to-b from-purple-900/20 to-black border-purple-500/30'
              : 'bg-white border-purple-300 shadow-lg'
          }`}>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Side - Course Info */}
              <div>
                <h1 className="text-3xl font-black text-white mb-2">
                  {course.name}
                </h1>
                <p className="text-gray-400 mb-6">
                  Stai provando gratuitamente questo corso di formazione
                </p>

                {/* Trial Progress */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      Progresso Trial
                    </span>
                    <span className="text-purple-400 font-bold">{progressPercentage}%</span>
                  </div>
                  <div className={`w-full rounded-full h-3 ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
                  }`}>
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className={`border rounded-lg p-3 ${
                    theme === 'dark' ? 'bg-black/50 border-purple-900/30' : 'bg-white border-purple-200 shadow-sm'
                  }`}>
                    <Clock className="w-5 h-5 text-purple-400 mb-1" />
                    <div className={`text-xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-black'
                    }`}>{trial.daysRemaining}</div>
                    <div className={`text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>Giorni Rimanenti</div>
                  </div>
                  <div className={`border rounded-lg p-3 ${
                    theme === 'dark' ? 'bg-black/50 border-purple-900/30' : 'bg-white border-purple-200 shadow-sm'
                  }`}>
                    <CheckCircle className="w-5 h-5 text-green-400 mb-1" />
                    <div className={`text-xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-black'
                    }`}>
                      {completedLessons.size}/11
                    </div>
                    <div className={`text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>Lezioni Totali</div>
                  </div>
                  <div className={`border rounded-lg p-3 ${
                    theme === 'dark' ? 'bg-black/50 border-purple-900/30' : 'bg-white border-purple-200 shadow-sm'
                  }`}>
                    <BookOpen className="w-5 h-5 text-blue-400 mb-1" />
                    <div className={`text-xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-black'
                    }`}>3</div>
                    <div className={`text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>Moduli Trial</div>
                  </div>
                </div>
              </div>

              {/* Right Side - Actions */}
              <div className="flex flex-col justify-center space-y-4">
                <button 
                  onClick={handleContinueCourse}
                  className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 border-2 border-purple-400 rounded-xl font-bold text-white hover:from-purple-500 hover:to-pink-500 hover:border-purple-300 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3"
                >
                  <PlayCircle className="w-6 h-6" />
                  {courseProgress && courseProgress.progress > 0 ? 'RIPRENDI CORSO' : 'INIZIA CORSO'}
                </button>

                <button 
                  onClick={handleUpgradeNow}
                  className="w-full px-6 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 border-2 border-yellow-400 rounded-xl font-bold text-white hover:from-yellow-500 hover:to-orange-500 hover:border-yellow-300 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3"
                >
                  <Rocket className="w-6 h-6" />
                  PASSA AL CORSO COMPLETO
                </button>
              </div>
            </div>
          </div>

          {/* Trial Content Preview */}
          <div className="mb-8">
            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
              <Gift className="w-6 h-6 text-purple-400" />
              CONTENUTI DISPONIBILI NEL TRIAL
            </h2>
            
            <div className="space-y-4">
              {trialModules.map((module, index) => (
                <div 
                  key={module.id}
                  className={`border rounded-xl p-6 ${
                    theme === 'dark'
                      ? 'bg-gradient-to-b from-gray-900 to-black border-purple-900/30'
                      : 'bg-white border-purple-200 shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-white">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-lg font-bold mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-black'
                      }`}>{module.title}</h3>
                      <p className={`mb-4 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>{module.description}</p>
                      
                      <div className="grid md:grid-cols-2 gap-3">
                        {module.lessons.map((lesson) => {
                          const isCompleted = completedLessons.has(lesson.id);
                          return (
                            <div 
                              key={lesson.id}
                              className={`flex items-center gap-2 rounded-lg p-2 transition-colors ${
                                isCompleted ? 'bg-green-900/20 border border-green-800' : 'bg-black/30'
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                              ) : (
                                <div className="w-4 h-4 border border-gray-600 rounded-full flex-shrink-0" />
                              )}
                              <span className={`text-sm ${isCompleted ? 'text-green-300' : 'text-gray-300'}`}>
                                {lesson.title}
                              </span>
                              <span className="text-xs text-gray-500 ml-auto">{lesson.duration}</span>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                        <span>{module.lessons.length} lezioni</span>
                        <span>•</span>
                        <span>{module.duration} totali</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upgrade Benefits */}
          <div className="bg-gradient-to-r from-yellow-950/50 via-orange-950/50 to-yellow-950/50 border-2 border-yellow-500/50 rounded-2xl p-8">
            <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              SBLOCCA IL CORSO COMPLETO
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-black text-yellow-500 mb-2">
                  22
                </div>
                <div className="text-gray-400">Moduli Totali</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-yellow-500 mb-2">
                  139
                </div>
                <div className="text-gray-400">Video Lezioni</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-yellow-500 mb-2">
                  {course.totalDuration || '300+'}
                </div>
                <div className="text-gray-400">Ore di Contenuto</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">Certificazione Ufficiale</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">Mentoring 1-on-1</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">Community VIP a Vita</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">Aggiornamenti Gratuiti</span>
              </div>
            </div>

            <div className="flex items-center justify-between bg-black/30 rounded-lg p-4">
              <div>
                <div className="text-gray-400 text-sm">Prezzo Speciale Trial</div>
                <div className="flex items-center gap-3">
                  {course.price?.originalPrice && (
                    <span className="text-gray-500 line-through">€{course.price.originalPrice}</span>
                  )}
                  <span className="text-3xl font-black text-yellow-500">
                    €{course.price?.oneTime || course.price?.monthly || 1500}
                  </span>
                </div>
              </div>
              <button 
                onClick={handleUpgradeNow}
                className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 border-2 border-yellow-400 rounded-xl font-bold text-white hover:from-yellow-500 hover:to-orange-500 hover:border-yellow-300 transition-all duration-300 flex items-center gap-2"
              >
                OTTIENI ACCESSO COMPLETO
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Telegram Support Box */}
          <div className="bg-gradient-to-r from-blue-950/50 via-purple-950/50 to-blue-950/50 border-2 border-blue-500/50 rounded-2xl p-6 mt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    Hai bisogno di aiuto? Contattaci su Telegram!
                  </h3>
                  <p className="text-gray-400">
                    Supporto dedicato per studenti del corso • Risposte rapide • Community esclusiva
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://t.me/codextrading"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 border-2 border-blue-400 rounded-lg font-bold text-white hover:from-blue-500 hover:to-blue-600 hover:border-blue-300 transition-all duration-300 transform hover:scale-105"
                >
                  <Send className="w-5 h-5" />
                  Contatta il Supporto
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
            
            {/* Quick Contact Info */}
            <div className="grid md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-blue-900/30">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">
                  <strong className="text-white">Online:</strong> Lun-Ven 9:00-18:00
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-sm text-gray-300">
                  <strong className="text-white">Username:</strong> @codextrading
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-sm text-gray-300">
                  <strong className="text-white">Risposta:</strong> Entro 2 ore
                </span>
              </div>
            </div>
          </div>

          {/* Learning Stats */}
          {course.metrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-black/50 border border-purple-900/30 rounded-lg p-4 text-center">
                <User className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">
                  {course.metrics?.students ? course.metrics.students.toLocaleString() : '2,847'}
                </div>
                <div className="text-sm text-gray-400">Studenti</div>
              </div>
              <div className="bg-black/50 border border-purple-900/30 rounded-lg p-4 text-center">
                <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">
                  {course.metrics?.avgRating || 4.9}/5
                </div>
                <div className="text-sm text-gray-400">Valutazione</div>
              </div>
              <div className="bg-black/50 border border-purple-900/30 rounded-lg p-4 text-center">
                <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">
                  {course.metrics?.successRate || 89}%
                </div>
                <div className="text-sm text-gray-400">Successo</div>
              </div>
              <div className="bg-black/50 border border-purple-900/30 rounded-lg p-4 text-center">
                <Trophy className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">
                  {course.metrics?.completionRate || 94}%
                </div>
                <div className="text-sm text-gray-400">Completamento</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
};

export default CourseTrialManagement;
