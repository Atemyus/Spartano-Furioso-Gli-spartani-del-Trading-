import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  PlayCircle,
  CheckCircle,
  Lock,
  Clock,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  Award,
  TrendingUp,
  BarChart3,
  Users,
  Zap,
  Sparkles
} from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import { getProductById } from '../data/products';

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  vimeoId: string;
  order: number;
  isTrialContent: boolean;
  downloadButton?: {
    enabled: boolean;
    label: string;
    fileUrl: string | null;
    fileName: string | null;
  };
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

interface CourseContent {
  id: string;
  name: string;
  modules: Module[];
}

const CourseViewer: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [courseContent, setCourseContent] = useState<CourseContent | null>(null);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isTrialUser, setIsTrialUser] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    loadCourseContent();
    checkTrialStatus();
    loadProgress();
  }, [courseId]);
  
  // Handle resume from last lesson
  useEffect(() => {
    if (location.state?.lastLessonId && courseContent) {
      const { lastLessonId, lastModuleId } = location.state as any;
      
      // Find and set the last module and lesson
      const module = courseContent.modules.find(m => m.id === lastModuleId);
      if (module) {
        const lesson = module.lessons.find(l => l.id === lastLessonId);
        if (lesson) {
          setCurrentModule(module);
          setCurrentLesson(lesson);
        }
      }
    }
  }, [courseContent, location.state]);

  const loadCourseContent = async () => {
    try {
      console.log('Loading course content for:', courseId);
      const response = await fetch(`http://localhost:3001/api/courses/${courseId}/content`);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Course data received:', data);
        setCourseContent(data.course);
        
        // Set first available lesson
        if (data.course && data.course.modules && data.course.modules.length > 0) {
          const firstModule = data.course.modules[0];
          setCurrentModule(firstModule);
          if (firstModule.lessons && firstModule.lessons.length > 0) {
            setCurrentLesson(firstModule.lessons[0]);
          }
        }
      } else {
        console.error('Failed to load course, status:', response.status);
        throw new Error(`Failed to load course: ${response.status}`);
      }
    } catch (error) {
      console.error('Error loading course content:', error);
      // Fallback to static data for now
      const courseData = getProductById(courseId || '');
      if (courseData && courseData.courseModules) {
        const fallbackContent: CourseContent = {
          id: courseData.id,
          name: courseData.name,
          modules: courseData.courseModules.map((m, idx) => ({
            ...m,
            lessons: m.lessons || [
              {
                id: `lesson_${idx}_1`,
                title: `Lezione ${idx + 1}.1`,
                description: 'Contenuto della lezione',
                duration: '20min',
                vimeoId: '123456789', // Placeholder
                order: 1,
                isTrialContent: m.isTrialContent
              }
            ]
          }))
        };
        setCourseContent(fallbackContent);
        if (fallbackContent.modules.length > 0) {
          setCurrentModule(fallbackContent.modules[0]);
          if (fallbackContent.modules[0].lessons.length > 0) {
            setCurrentLesson(fallbackContent.modules[0].lessons[0]);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const checkTrialStatus = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await fetch(`http://localhost:3001/api/trials/check/${courseId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setIsTrialUser(data.isActive);
        }
      } catch (error) {
        console.error('Error checking trial status:', error);
      }
    }
  };

  const loadProgress = async () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (token && user.id) {
      try {
        const response = await fetch(`http://localhost:3001/api/courses/${courseId}/progress/${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setCompletedLessons(new Set(data.completedLessons || []));
          setProgress(data.progress || 0);
        }
      } catch (error) {
        console.error('Error loading progress:', error);
      }
    }
  };

  const saveProgress = async (lessonId: string, moduleId?: string) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (token && user.id) {
      try {
        const response = await fetch(`http://localhost:3001/api/courses/${courseId}/progress`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: user.id,
            lessonId,
            moduleId: moduleId || currentModule?.id,
            completed: true
          })
        });
        
        // Update local state
        const newCompleted = new Set(completedLessons);
        newCompleted.add(lessonId);
        setCompletedLessons(newCompleted);
        
        // Calculate progress
        if (courseContent) {
          const totalLessons = courseContent.modules.reduce((acc, m) => 
            acc + (isTrialUser ? m.lessons.filter(l => l.isTrialContent).length : m.lessons.length), 0
          );
          setProgress(Math.round((newCompleted.size / totalLessons) * 100));
        }
      } catch (error) {
        console.error('Error saving progress:', error);
      }
    }
  };

  const handleLessonComplete = () => {
    if (currentLesson && currentModule) {
      // Show completion animation
      setShowCompletionAnimation(true);
      
      // Save progress
      saveProgress(currentLesson.id, currentModule.id);
      
      // Hide animation and go to next lesson after delay
      setTimeout(() => {
        setShowCompletionAnimation(false);
        handleNextLesson();
      }, 1500);
    }
  };

  const handleNextLesson = () => {
    if (!currentModule || !currentLesson || !courseContent || isTransitioning) return;
    
    setIsTransitioning(true);
    
    // Add a smooth transition effect
    setTimeout(() => {
      const currentLessonIndex = currentModule.lessons.findIndex(l => l.id === currentLesson.id);
      
      // Check next lesson in current module
      if (currentLessonIndex < currentModule.lessons.length - 1) {
        const nextLesson = currentModule.lessons[currentLessonIndex + 1];
        if (!isTrialUser || nextLesson.isTrialContent) {
          setCurrentLesson(nextLesson);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setIsTransitioning(false);
          return;
        }
      }
      
      // Check next module
      const currentModuleIndex = courseContent.modules.findIndex(m => m.id === currentModule.id);
      if (currentModuleIndex < courseContent.modules.length - 1) {
        const nextModule = courseContent.modules[currentModuleIndex + 1];
        if (!isTrialUser || nextModule.isTrialContent) {
          setCurrentModule(nextModule);
          if (nextModule.lessons.length > 0) {
            const firstAvailableLesson = nextModule.lessons.find(l => !isTrialUser || l.isTrialContent);
            if (firstAvailableLesson) {
              setCurrentLesson(firstAvailableLesson);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }
        }
      }
      setIsTransitioning(false);
    }, 300);
  };

  const handlePreviousLesson = () => {
    if (!currentModule || !currentLesson || !courseContent || isTransitioning) return;
    
    setIsTransitioning(true);
    
    setTimeout(() => {
      const currentLessonIndex = currentModule.lessons.findIndex(l => l.id === currentLesson.id);
      
      // Check previous lesson in current module
      if (currentLessonIndex > 0) {
        setCurrentLesson(currentModule.lessons[currentLessonIndex - 1]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setIsTransitioning(false);
        return;
      }
      
      // Check previous module
      const currentModuleIndex = courseContent.modules.findIndex(m => m.id === currentModule.id);
      if (currentModuleIndex > 0) {
        const prevModule = courseContent.modules[currentModuleIndex - 1];
        setCurrentModule(prevModule);
        if (prevModule.lessons.length > 0) {
          setCurrentLesson(prevModule.lessons[prevModule.lessons.length - 1]);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
      setIsTransitioning(false);
    }, 300);
  };

  const selectLesson = (module: Module, lesson: Lesson) => {
    if (isTrialUser && !lesson.isTrialContent) {
      // Show upgrade prompt
      if (window.confirm('Questo contenuto non è disponibile nel trial. Vuoi passare al corso completo?')) {
        navigate(`/course/${courseId}`);
      }
      return;
    }
    
    // Add transition effect
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentModule(module);
      setCurrentLesson(lesson);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsTransitioning(false);
    }, 300);
  };

  if (loading) {
    return (
      <AnimatedPage>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </AnimatedPage>
    );
  }

  if (!courseContent || !currentModule || !currentLesson) {
    return (
      <AnimatedPage>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Corso non trovato</h1>
            <Link to="/dashboard" className="text-purple-400 hover:text-purple-300">
              Torna alla Dashboard
            </Link>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-black flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-gray-900 border-r border-gray-800 overflow-hidden flex-shrink-0`}>
          <div className="h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-800">
              <Link 
                to="/dashboard"
                className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Dashboard</span>
              </Link>
              <h2 className="text-lg font-bold text-white">{courseContent.name}</h2>
              <div className="mt-2">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-400">Progresso</span>
                  <span className="text-purple-400 font-bold">{progress}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Modules List */}
            <div className="flex-1 overflow-y-auto p-4">
              {courseContent.modules.map((module) => {
                const isLocked = isTrialUser && !module.isTrialContent;
                const isActive = currentModule?.id === module.id;
                
                return (
                  <div key={module.id} className="mb-6">
                    <div className={`flex items-start gap-3 mb-3 ${isLocked ? 'opacity-50' : ''}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isActive ? 'bg-purple-600' : 'bg-gray-800'
                      }`}>
                        {isLocked ? (
                          <Lock className="w-4 h-4 text-gray-400" />
                        ) : (
                          <span className="text-sm font-bold text-white">{module.order}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-white">{module.title}</h3>
                        <p className="text-xs text-gray-400 mt-1">{module.duration}</p>
                      </div>
                    </div>

                    {/* Lessons */}
                    <div className="ml-11 space-y-2">
                      {module.lessons.map((lesson) => {
                        const isLessonLocked = isTrialUser && !lesson.isTrialContent;
                        const isCurrentLesson = currentLesson?.id === lesson.id;
                        const isCompleted = completedLessons.has(lesson.id);
                        
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => selectLesson(module, lesson)}
                            disabled={isLessonLocked}
                            className={`w-full text-left p-2 rounded-lg transition-colors ${
                              isCurrentLesson 
                                ? 'bg-purple-900/30 border border-purple-600' 
                                : isLessonLocked
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:bg-gray-800'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isCompleted ? (
                                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                              ) : isLessonLocked ? (
                                <Lock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                              ) : (
                                <PlayCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              )}
                              <span className={`text-sm ${isCurrentLesson ? 'text-white' : 'text-gray-300'}`}>
                                {lesson.title}
                              </span>
                              <span className="text-xs text-gray-500 ml-auto">{lesson.duration}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Trial Notice */}
            {isTrialUser && (
              <div className="p-4 border-t border-gray-800">
                <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg p-3">
                  <p className="text-sm text-white mb-2">🔒 Contenuto Trial Limitato</p>
                  <button
                    onClick={() => navigate(`/course/${courseId}`)}
                    className="w-full px-3 py-2 bg-purple-600 rounded-lg text-sm font-bold text-white hover:bg-purple-500 transition-colors"
                  >
                    Sblocca Corso Completo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <div className="bg-gray-900 border-b border-gray-800 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {sidebarOpen ? <X className="w-5 h-5 text-gray-400" /> : <Menu className="w-5 h-5 text-gray-400" />}
                </button>
                <div>
                  <div className="text-sm text-gray-400">{currentModule.title}</div>
                  <h1 className="text-xl font-bold text-white">{currentLesson.title}</h1>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreviousLesson}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-400" />
                </button>
                <button
                  onClick={handleNextLesson}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Video Player */}
          <div className="flex-1 bg-black p-8">
            <div className="max-w-6xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentLesson.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="aspect-video bg-gray-900 rounded-xl overflow-hidden mb-6 relative"
                >
                  {isTransitioning && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-black/80 flex items-center justify-center z-10"
                    >
                      <div className="text-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
                        />
                        <motion.p 
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className="text-white font-bold"
                        >
                          Caricamento prossima lezione...
                        </motion.p>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Video Player - Supports both MP4 and Vimeo */}
                  {(currentLesson as any).videoUrl ? (
                    <video
                      ref={playerRef as any}
                      controls
                      className="w-full h-full bg-black"
                      style={{ border: 0 }}
                    >
                      <source src={`http://localhost:3001${(currentLesson as any).videoUrl}`} type="video/mp4" />
                      Il tuo browser non supporta il tag video.
                    </video>
                  ) : currentLesson.vimeoId && currentLesson.vimeoId !== '123456789' ? (
                    <iframe
                      ref={playerRef}
                      src={`https://player.vimeo.com/video/${currentLesson.vimeoId}`}
                      className="w-full h-full"
                      style={{ border: 0 }}
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      title={currentLesson.title}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                      <div className="text-center p-8">
                        <PlayCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Video Non Disponibile</h3>
                        <p className="text-gray-400 mb-4">
                          Il video per questa lezione non è ancora stato caricato.
                        </p>
                        <p className="text-sm text-gray-500">
                          ID Vimeo: {currentLesson.vimeoId || 'Non configurato'}
                        </p>
                        {currentLesson.vimeoId === '123456789' && (
                          <p className="text-xs text-yellow-400 mt-2">
                            Questo è un ID di esempio. Aggiorna dal pannello admin.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Lesson Info */}
              <AnimatePresence mode="wait">
                <motion.div 
                  key={`info-${currentLesson.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="bg-gray-900 rounded-xl p-6 mb-6"
                >
                  <motion.h2 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold text-white mb-2 flex items-center gap-2"
                  >
                    {currentLesson.title}
                    {completedLessons.has(currentLesson.id) && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      >
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      </motion.span>
                    )}
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-gray-400 mb-4 whitespace-pre-line"
                  >
                    {currentLesson.description}
                  </motion.p>

                  {/* Download Button - Only for lesson 4 of module 1 */}
                  {currentLesson.downloadButton?.enabled && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                      className="mb-4"
                    >
                      {currentLesson.downloadButton.fileUrl ? (
                        <a
                          href={`http://localhost:3001/api/download/${currentLesson.downloadButton.fileUrl.split('/').pop()}?name=${encodeURIComponent(currentLesson.downloadButton.fileName || 'download')}`}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                          </svg>
                          {currentLesson.downloadButton.label}
                        </a>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 text-gray-400 font-bold rounded-lg cursor-not-allowed">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          File non ancora caricato
                        </div>
                      )}
                    </motion.div>
                  )}
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-6 text-sm text-gray-400"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{currentLesson.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span>Modulo {currentModule.order} - Lezione {currentLesson.order}</span>
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>

              {/* Action Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex gap-4 relative"
              >
                {/* Completion Animation Overlay */}
                <AnimatePresence>
                  {showCompletionAnimation && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.2, 1] }}
                        transition={{ duration: 0.5 }}
                        className="bg-green-500 rounded-full p-8"
                      >
                        <CheckCircle className="w-16 h-16 text-white" />
                      </motion.div>
                      
                      {/* Sparkles effect */}
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0, x: 0, y: 0 }}
                          animate={{ 
                            scale: [0, 1, 0],
                            x: [0, (i % 2 === 0 ? 50 : -50) * (i + 1)],
                            y: [0, -50 * (i + 1)]
                          }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className="absolute"
                        >
                          <Sparkles className="w-6 h-6 text-yellow-400" />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <motion.button
                  onClick={handleLessonComplete}
                  disabled={completedLessons.has(currentLesson.id) || isTransitioning}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 px-6 py-3 rounded-lg font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
                    completedLessons.has(currentLesson.id)
                      ? 'bg-gray-700 border-2 border-gray-600 cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 border-2 border-purple-400 hover:from-purple-500 hover:to-pink-500 hover:border-purple-300'
                  }`}
                >
                  <CheckCircle className="w-5 h-5" />
                  {completedLessons.has(currentLesson.id) ? 'Completato' : 'Segna come Completato'}
                </motion.button>
                
                <motion.button
                  onClick={handleNextLesson}
                  disabled={isTransitioning}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-gray-800 rounded-lg font-bold text-white hover:bg-gray-700 transition-colors flex items-center gap-2 group"
                >
                  Prossima Lezione
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </motion.span>
                </motion.button>
              </motion.div>

              {/* Additional Resources */}
              <div className="mt-8 grid md:grid-cols-3 gap-4">
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    <h3 className="font-bold text-white">Certificato</h3>
                  </div>
                  <p className="text-sm text-gray-400">Completa il corso per ottenere il certificato</p>
                </div>
                
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    <h3 className="font-bold text-white">Community</h3>
                  </div>
                  <p className="text-sm text-gray-400">Accedi al gruppo Telegram esclusivo</p>
                </div>
                
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                  <div className="flex items-center gap-3 mb-2">
                    <Zap className="w-5 h-5 text-purple-500" />
                    <h3 className="font-bold text-white">Supporto</h3>
                  </div>
                  <p className="text-sm text-gray-400">Assistenza dedicata per ogni dubbio</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default CourseViewer;
