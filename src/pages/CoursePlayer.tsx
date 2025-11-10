import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  PlayCircle, 
  ChevronLeft,
  ChevronRight,
  Lock, 
  CheckCircle, 
  MessageCircle,
  FileText,
  Download,
  Send
} from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoId: string;
  isTrialContent: boolean;
  order: number;
  completed?: boolean;
  resources?: {
    title: string;
    url: string;
    type: 'pdf' | 'doc' | 'zip';
  }[];
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
  courseModules: Module[];
}

const CoursePlayer: React.FC = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLDivElement>(null);
  
  const [course, setCourse] = useState<Course | null>(null);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [nextLesson, setNextLesson] = useState<Lesson | null>(null);
  const [prevLesson, setPrevLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [userAccess, setUserAccess] = useState<'none' | 'trial' | 'full'>('trial');
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  useEffect(() => {
    loadCourseData();
  }, [courseId, lessonId]);

  useEffect(() => {
    // Integrazione Vimeo Player
    if (currentLesson && videoRef.current) {
      const script = document.createElement('script');
      script.src = 'https://player.vimeo.com/api/player.js';
      document.body.appendChild(script);

      script.onload = () => {
        const iframe = document.createElement('iframe');
        iframe.src = `https://player.vimeo.com/video/${currentLesson.videoId.replace('vimeo_', '')}?h=abcdef1234&badge=0&autopause=0&player_id=0&app_id=58479`;
        iframe.width = '100%';
        iframe.height = '100%';
        iframe.frameBorder = '0';
        iframe.allow = 'autoplay; fullscreen; picture-in-picture';
        iframe.allowFullscreen = true;
        iframe.title = currentLesson.title;
        
        if (videoRef.current) {
          videoRef.current.innerHTML = '';
          videoRef.current.appendChild(iframe);

          // @ts-ignore
          const player = new window.Vimeo.Player(iframe);
          
          player.on('timeupdate', (data: any) => {
            const percent = (data.seconds / data.duration) * 100;
            setProgress(percent);
            
            // Marca come completata se > 90%
            if (percent > 90 && !completedLessons.includes(lessonId!)) {
              markLessonComplete();
            }
          });
        }
      };

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [currentLesson]);

  const loadCourseData = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/products/${courseId}`);
      if (response.ok) {
        const data = await response.json();
        setCourse(data);
        
        // Trova modulo e lezione corrente
        let foundModule: Module | null = null;
        let foundLesson: Lesson | null = null;
        let allLessons: { module: Module; lesson: Lesson }[] = [];
        
        data.courseModules?.forEach((module: Module) => {
          module.lessons.forEach((lesson: Lesson) => {
            allLessons.push({ module, lesson });
            if (lesson.id === lessonId) {
              foundModule = module;
              foundLesson = lesson;
            }
          });
        });
        
        setCurrentModule(foundModule);
        setCurrentLesson(foundLesson);
        
        // Trova lezione precedente e successiva
        const currentIndex = allLessons.findIndex(l => l.lesson.id === lessonId);
        if (currentIndex > 0) {
          setPrevLesson(allLessons[currentIndex - 1].lesson);
        }
        if (currentIndex < allLessons.length - 1) {
          setNextLesson(allLessons[currentIndex + 1].lesson);
        }
      }
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  const markLessonComplete = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await fetch(`http://localhost:3001/api/courses/${courseId}/lessons/${lessonId}/complete`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setCompletedLessons(prev => [...prev, lessonId!]);
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    }
  };

  const handleNextLesson = () => {
    if (nextLesson) {
      navigate(`/course/${courseId}/lesson/${nextLesson.id}`);
    }
  };

  const handlePrevLesson = () => {
    if (prevLesson) {
      navigate(`/course/${courseId}/lesson/${prevLesson.id}`);
    }
  };

  const saveNotes = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await fetch(`http://localhost:3001/api/courses/${courseId}/lessons/${lessonId}/notes`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes })
      });
    } catch (error) {
      console.error('Error saving notes:', error);
    }
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

  if (!course || !currentLesson || !currentModule) {
    return (
      <AnimatedPage>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <p className="text-white">Lezione non trovata</p>
        </div>
      </AnimatedPage>
    );
  }

  const isLessonAccessible = userAccess === 'full' || 
    (userAccess === 'trial' && currentLesson.isTrialContent);

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-black">
        {/* Header */}
        <div className="bg-gray-900/50 border-b border-gray-800">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link 
                  to={`/course/${courseId}`}
                  className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </Link>
                <div>
                  <p className="text-sm text-gray-500">
                    {course.name} / {currentModule.title}
                  </p>
                  <h1 className="text-xl font-bold text-white">
                    {currentLesson.title}
                  </h1>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="flex items-center gap-4">
                <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-500 to-green-500 transition-all"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-400">{Math.round(progress)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Video Player */}
            <div className="lg:col-span-3">
              {isLessonAccessible ? (
                <div className="bg-gray-900 rounded-xl overflow-hidden">
                  <div 
                    ref={videoRef}
                    className="aspect-video bg-black"
                  >
                    {/* Il player Vimeo verrà inserito qui */}
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-white">Caricamento video...</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Video Controls */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <button 
                        onClick={handlePrevLesson}
                        disabled={!prevLesson}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                          prevLesson 
                            ? 'bg-gray-800 text-white hover:bg-gray-700' 
                            : 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                        } transition-colors`}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Lezione Precedente
                      </button>
                      
                      <button 
                        onClick={markLessonComplete}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                          completedLessons.includes(lessonId!)
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-800 text-white hover:bg-gray-700'
                        } transition-colors`}
                      >
                        <CheckCircle className="w-4 h-4" />
                        {completedLessons.includes(lessonId!) ? 'Completata' : 'Segna come completata'}
                      </button>
                      
                      <button 
                        onClick={handleNextLesson}
                        disabled={!nextLesson}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                          nextLesson 
                            ? 'bg-yellow-600 text-white hover:bg-yellow-500' 
                            : 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                        } transition-colors`}
                      >
                        Lezione Successiva
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Lesson Description */}
                    <div className="border-t border-gray-800 pt-6">
                      <h2 className="text-2xl font-bold text-white mb-4">
                        {currentLesson.title}
                      </h2>
                      <p className="text-gray-400 mb-6">
                        {currentLesson.description}
                      </p>
                      
                      {/* Tabs */}
                      <div className="flex gap-4 border-b border-gray-800">
                        <button 
                          onClick={() => setShowNotes(false)}
                          className={`pb-4 px-2 font-medium transition-colors ${
                            !showNotes 
                              ? 'text-yellow-500 border-b-2 border-yellow-500' 
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          Panoramica
                        </button>
                        <button 
                          onClick={() => setShowNotes(true)}
                          className={`pb-4 px-2 font-medium transition-colors ${
                            showNotes 
                              ? 'text-yellow-500 border-b-2 border-yellow-500' 
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          Note Personali
                        </button>
                      </div>
                      
                      {/* Tab Content */}
                      <div className="mt-6">
                        {!showNotes ? (
                          <div>
                            <h3 className="text-lg font-bold text-white mb-3">
                              In questa lezione imparerai:
                            </h3>
                            <ul className="space-y-2 text-gray-400">
                              <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span>Concetti fondamentali del trading professionale</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span>Come applicare la strategia nella pratica</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span>Esempi reali di trading con analisi dettagliata</span>
                              </li>
                            </ul>
                          </div>
                        ) : (
                          <div>
                            <textarea
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              onBlur={saveNotes}
                              placeholder="Scrivi qui le tue note..."
                              className="w-full h-40 p-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none resize-none"
                            />
                            <p className="text-sm text-gray-500 mt-2">
                              Le note vengono salvate automaticamente
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Blocked Content
                <div className="bg-gray-900 rounded-xl p-12">
                  <div className="text-center">
                    <Lock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-4">
                      Contenuto Bloccato
                    </h2>
                    <p className="text-gray-400 mb-6">
                      Questa lezione è disponibile solo con l'accesso completo al corso.
                    </p>
                    <button 
                      onClick={() => navigate(`/course/${courseId}`)}
                      className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-red-600 rounded-lg font-bold text-white hover:from-yellow-500 hover:to-red-500 transition-all"
                    >
                      Sblocca Corso Completo
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Sidebar - Course Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900/50 border-2 border-gray-800 rounded-xl p-4 max-h-[80vh] overflow-y-auto">
                <h3 className="text-lg font-bold text-white mb-4">
                  Contenuto del Corso
                </h3>
                
                {course.courseModules?.map((module) => (
                  <div key={module.id} className="mb-6">
                    <h4 className="text-sm font-bold text-gray-500 mb-3">
                      MODULO {module.order}: {module.title}
                    </h4>
                    <div className="space-y-2">
                      {module.lessons.map((lesson) => {
                        const isCurrentLesson = lesson.id === lessonId;
                        const isAccessible = userAccess === 'full' || 
                          (userAccess === 'trial' && lesson.isTrialContent);
                        const isCompleted = completedLessons.includes(lesson.id);
                        
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => isAccessible && navigate(`/course/${courseId}/lesson/${lesson.id}`)}
                            disabled={!isAccessible}
                            className={`w-full text-left p-3 rounded-lg transition-colors ${
                              isCurrentLesson 
                                ? 'bg-yellow-600/20 border border-yellow-600' 
                                : isAccessible 
                                  ? 'bg-gray-800 hover:bg-gray-700' 
                                  : 'bg-gray-800/50 opacity-50 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                isCompleted 
                                  ? 'bg-green-600' 
                                  : isCurrentLesson 
                                    ? 'bg-yellow-600' 
                                    : 'bg-gray-700'
                              }`}>
                                {isCompleted ? (
                                  <CheckCircle className="w-4 h-4 text-white" />
                                ) : isAccessible ? (
                                  <PlayCircle className="w-4 h-4 text-white" />
                                ) : (
                                  <Lock className="w-3 h-3 text-gray-500" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm ${
                                  isCurrentLesson ? 'text-yellow-500' : 'text-white'
                                } truncate`}>
                                  {lesson.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {lesson.duration}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Resources */}
              {currentLesson.resources && currentLesson.resources.length > 0 && (
                <div className="bg-gray-900/50 border-2 border-gray-800 rounded-xl p-4 mt-4">
                  <h3 className="text-lg font-bold text-white mb-4">
                    Risorse
                  </h3>
                  <div className="space-y-2">
                    {currentLesson.resources.map((resource, index) => (
                      <a
                        key={index}
                        href={resource.url}
                        className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <FileText className="w-5 h-5 text-yellow-500" />
                        <span className="text-white text-sm flex-1">
                          {resource.title}
                        </span>
                        <Download className="w-4 h-4 text-gray-500" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Telegram Support */}
              <div className="bg-gradient-to-r from-blue-950/50 via-purple-950/50 to-blue-950/50 border-2 border-blue-500/50 rounded-xl p-4 mt-4">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-400" />
                  Hai bisogno di aiuto?
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  Contatta il nostro supporto dedicato per qualsiasi domanda sul corso.
                </p>
                <div className="space-y-3">
                  <a
                    href="https://t.me/codextrading"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg font-bold text-white hover:from-blue-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-105"
                  >
                    <Send className="w-4 h-4" />
                    Contatta il Supporto
                  </a>
                </div>
                <div className="mt-4 pt-4 border-t border-blue-900/30">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Risposta entro 2 ore</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default CoursePlayer;
