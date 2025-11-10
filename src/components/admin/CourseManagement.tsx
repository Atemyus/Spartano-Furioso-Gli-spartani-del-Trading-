import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Video,
  Clock,
  ChevronDown,
  ChevronRight,
  Upload,
  Eye,
  EyeOff,
  BookOpen,
  AlertCircle,
  FileText
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  vimeoId?: string;
  videoUrl?: string;
  order: number;
  isTrialContent: boolean;
  resources?: {
    title: string;
    url: string;
    type: 'pdf' | 'doc' | 'zip' | 'other';
  }[];
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

interface Course {
  id: string;
  name: string;
  description?: string;
  modules: Module[];
}

const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<{ [key: string]: Course }>({});
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState<boolean>(false);
  const [courseEditData, setCourseEditData] = useState<{ name: string; description?: string }>({ name: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddLesson, setShowAddLesson] = useState<string | null>(null);
  const [showAddModule, setShowAddModule] = useState<number | null>(null);
  const [newModule, setNewModule] = useState({
    title: '',
    description: '',
    duration: '',
    isTrialContent: true
  });
  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    duration: '',
    vimeoId: '',
    videoUrl: '',
    isTrialContent: true
  });
  const [newLessonFiles, setNewLessonFiles] = useState<{
    title: string;
    file: File | null;
    type: 'pdf' | 'doc' | 'zip' | 'other';
    url?: string;
  }[]>([]);
  const [editLessonFiles, setEditLessonFiles] = useState<{
    title: string;
    url: string;
    type: 'pdf' | 'doc' | 'zip' | 'other';
  }[]>([]);

  useEffect(() => {
    loadAllCourses();
  }, []);

  // Helper function to get file type from MIME type
  const getFileType = (mimeType: string): 'pdf' | 'doc' | 'zip' | 'other' => {
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'doc';
    if (mimeType.includes('zip')) return 'zip';
    return 'other';
  };

  const loadAllCourses = async () => {
    const token = localStorage.getItem('token');
    try {
      console.log('Loading all courses');
      const response = await fetch('http://localhost:3001/api/courses/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('All courses data:', data);
        
        if (data.courses) {
          setCourses(data.courses);
          // Select first course if available
          const courseIds = Object.keys(data.courses);
          if (courseIds.length > 0 && !selectedCourse) {
            setSelectedCourse(courseIds[0]);
            // Expand all modules of first course
            if (data.courses[courseIds[0]].modules) {
              const moduleIds = data.courses[courseIds[0]].modules.map((m: Module) => m.id);
              setExpandedModules(new Set(moduleIds));
            }
          }
        } else {
          console.error('No courses data in response');
        }
      } else {
        console.error('Failed to load courses:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCourseContent = async (courseId: string) => {
    try {
      console.log('Loading course:', courseId);
      const response = await fetch(`http://localhost:3001/api/courses/${courseId}/content`);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Course data:', data);
        
        if (data.course) {
          setCourses(prev => ({ ...prev, [courseId]: data.course }));
          // Expand all modules by default
          if (data.course.modules) {
            const moduleIds = data.course.modules.map((m: Module) => m.id);
            setExpandedModules(new Set(moduleIds));
          }
        } else {
          console.error('No course data in response');
        }
      } else {
        console.error('Failed to load course:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error loading course content:', error);
    }
  };

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const handleAddLesson = async (moduleId: string) => {
    const token = localStorage.getItem('token');
    setSaving(true);
    
    try {
      // Prepare lesson data with resources
      const lessonData = {
        ...newLesson,
        resources: newLessonFiles
          .filter(f => f.url) // Only include files that have been uploaded
          .map(f => ({
            title: f.title,
            url: f.url!,
            type: f.type
          }))
      };

      const response = await fetch(`http://localhost:3001/api/courses/${selectedCourse}/module/${moduleId}/lesson`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(lessonData)
      });
      
      if (response.ok) {
        // Reload course content
        await loadCourseContent(selectedCourse);
        setShowAddLesson(null);
        setNewLesson({
          title: '',
          description: '',
          duration: '',
          vimeoId: '',
          videoUrl: '',
          isTrialContent: true
        });
        setNewLessonFiles([]);
      }
    } catch (error) {
      console.error('Error adding lesson:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateLesson = async (moduleId: string, lessonId: string, updates: Partial<Lesson>) => {
    const token = localStorage.getItem('token');
    setSaving(true);
    
    try {
      // Prepare lesson data with resources
      const lessonData = {
        ...updates,
        resources: editLessonFiles.filter(f => f.title.trim()).map(f => ({
          title: f.title.trim(),
          url: f.url || `/uploads/${f.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.${f.type}`,
          type: f.type
        }))
      };

      const response = await fetch(`http://localhost:3001/api/courses/${selectedCourse}/module/${moduleId}/lesson/${lessonId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(lessonData)
      });
      
      if (response.ok) {
        await loadCourseContent(selectedCourse);
        setEditingLesson(null);
        setEditLessonFiles([]);
      }
    } catch (error) {
      console.error('Error updating lesson:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa lezione?')) return;
    
    const token = localStorage.getItem('token');
    setSaving(true);
    
    try {
      const response = await fetch(`http://localhost:3001/api/courses/${selectedCourse}/module/${moduleId}/lesson/${lessonId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        await loadCourseContent(selectedCourse);
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleTrialContent = async (moduleId: string, lessonId: string, currentStatus: boolean) => {
    await handleUpdateLesson(moduleId, lessonId, { isTrialContent: !currentStatus });
  };

  const handleUpdateCourse = async () => {
    const token = localStorage.getItem('token');
    setSaving(true);
    
    try {
      const response = await fetch(`http://localhost:3001/api/courses/${selectedCourse}/content`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(courseEditData)
      });
      
      if (response.ok) {
        // Update local state
        setCourses(prev => ({
          ...prev,
          [selectedCourse]: {
            ...prev[selectedCourse],
            ...courseEditData
          }
        }));
        setEditingCourse(false);
      }
    } catch (error) {
      console.error('Error updating course:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateModule = async (moduleId: string, updates: Partial<Module>) => {
    const token = localStorage.getItem('token');
    setSaving(true);
    
    try {
      const response = await fetch(`http://localhost:3001/api/courses/${selectedCourse}/module/${moduleId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        await loadCourseContent(selectedCourse);
        setEditingModule(null);
      }
    } catch (error) {
      console.error('Error updating module:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddModule = async (insertBeforeOrder?: number) => {
    const token = localStorage.getItem('token');
    setSaving(true);
    
    try {
      const moduleData = {
        ...newModule,
        insertBeforeOrder
      };

      const response = await fetch(`http://localhost:3001/api/courses/${selectedCourse}/module`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(moduleData)
      });
      
      if (response.ok) {
        await loadAllCourses();
        setShowAddModule(null);
        setNewModule({
          title: '',
          description: '',
          duration: '',
          isTrialContent: true
        });
      } else {
        const error = await response.json();
        alert(`Errore: ${error.error || 'Impossibile creare il modulo'}`);
      }
    } catch (error) {
      console.error('Error adding module:', error);
      alert('Errore durante la creazione del modulo');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo modulo e tutte le sue lezioni?')) return;
    
    const token = localStorage.getItem('token');
    setSaving(true);
    
    try {
      const response = await fetch(`http://localhost:3001/api/courses/${selectedCourse}/module/${moduleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        await loadAllCourses();
      }
    } catch (error) {
      console.error('Error deleting module:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const course = courses[selectedCourse];
  const hasCourses = Object.keys(courses).length > 0;
  
  if (!hasCourses) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <p className="text-gray-400 mb-4">Nessun corso di formazione trovato</p>
        <p className="text-sm text-gray-500">Crea un prodotto con categoria "Formazione" per vederlo qui</p>
        <button
          onClick={loadAllCourses}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500"
        >
          Ricarica
        </button>
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <p className="text-gray-400">Seleziona un corso</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-purple-400" />
              Gestione Contenuti Corsi
            </h2>
            <p className="text-gray-400 mt-1">Modifica i video e i contenuti dei corsi di formazione</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={loadAllCourses}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Ricarica
            </button>
          </div>
        </div>

        {/* Course Selector */}
        {Object.keys(courses).length > 1 && (
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">Seleziona Corso</label>
            <select
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                const course = courses[e.target.value];
                if (course?.modules) {
                  const moduleIds = course.modules.map((m: Module) => m.id);
                  setExpandedModules(new Set(moduleIds));
                }
              }}
              className="w-full px-4 py-2 bg-black/30 border border-gray-700 rounded-lg text-white"
            >
              {Object.entries(courses).map(([id, course]) => (
                <option key={id} value={id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Course Info */}
        <div className="bg-black/20 rounded-lg p-4">
          {editingCourse ? (
            <div className="space-y-3">
              <input
                type="text"
                value={courseEditData.name}
                onChange={(e) => setCourseEditData({ ...courseEditData, name: e.target.value })}
                className="w-full px-3 py-2 bg-black/30 border border-gray-700 rounded-lg text-white"
                placeholder="Nome del corso"
              />
              <textarea
                value={courseEditData.description || ''}
                onChange={(e) => setCourseEditData({ ...courseEditData, description: e.target.value })}
                className="w-full px-3 py-2 bg-black/30 border border-gray-700 rounded-lg text-white"
                rows={2}
                placeholder="Descrizione del corso"
              />
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    await handleUpdateCourse();
                    setEditingCourse(false);
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditingCourse(false)}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">{course.name}</h3>
                {course.description && (
                  <p className="text-sm text-gray-400 mt-1">{course.description}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                  <span>{course.modules.length} moduli</span>
                  <span>•</span>
                  <span>
                    {course.modules.reduce((acc, m) => acc + m.lessons.length, 0)} lezioni totali
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setCourseEditData({ 
                      name: course.name, 
                      description: course.description 
                    });
                    setEditingCourse(true);
                  }}
                  className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 bg-purple-900/30 border border-purple-700 rounded-lg text-purple-400 text-sm">
                  Corso Attivo
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modules */}
      <div className="space-y-4">
        {course.modules.map((module) => (
          <div key={module.id}>
            {/* Add Module Button - Shows before each module */}
            {showAddModule === module.order ? (
              <div className="bg-purple-900/20 border-2 border-purple-600 rounded-lg p-4 mb-4">
                <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-purple-400" />
                  Inserisci Nuovo Modulo Prima del Modulo {module.order}
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Titolo Modulo</label>
                    <input
                      type="text"
                      value={newModule.title}
                      onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                      className="w-full px-3 py-2 bg-black/30 border border-gray-700 rounded-lg text-white"
                      placeholder="Es. Modulo di Presentazione"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Descrizione</label>
                    <textarea
                      value={newModule.description}
                      onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                      className="w-full px-3 py-2 bg-black/30 border border-gray-700 rounded-lg text-white"
                      rows={2}
                      placeholder="Descrizione del modulo..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Durata</label>
                      <input
                        type="text"
                        value={newModule.duration}
                        onChange={(e) => setNewModule({ ...newModule, duration: e.target.value })}
                        className="w-full px-3 py-2 bg-black/30 border border-gray-700 rounded-lg text-white"
                        placeholder="Es. 30min"
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-6">
                      <input
                        type="checkbox"
                        id="new-module-trial"
                        checked={newModule.isTrialContent}
                        onChange={(e) => setNewModule({ ...newModule, isTrialContent: e.target.checked })}
                        className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded"
                      />
                      <label htmlFor="new-module-trial" className="text-sm text-gray-400">
                        Disponibile nel Trial
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => {
                        setShowAddModule(null);
                        setNewModule({
                          title: '',
                          description: '',
                          duration: '',
                          isTrialContent: true
                        });
                      }}
                      className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
                    >
                      Annulla
                    </button>
                    <button
                      onClick={() => handleAddModule(module.order)}
                      disabled={!newModule.title || saving}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Creazione...' : 'Crea Modulo'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddModule(module.order)}
                className="w-full mb-4 py-2 border-2 border-dashed border-gray-700 rounded-lg text-gray-500 hover:border-purple-600 hover:text-purple-400 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Inserisci modulo prima del Modulo {module.order}
              </button>
            )}
            
            <div className="bg-gray-900 rounded-lg overflow-hidden">
            {/* Module Header */}
            <div
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/50 transition-colors"
              onClick={() => toggleModule(module.id)}
            >
              <div className="flex items-center gap-3">
                <button className="p-1">
                  {expandedModules.has(module.id) ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                
                <div className="w-10 h-10 bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-purple-400 font-bold">{module.order}</span>
                </div>
                
                <div>
                  <h3 className="text-white font-bold">{module.title}</h3>
                  <p className="text-sm text-gray-400">{module.description}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>{module.lessons.length} lezioni</span>
                    <span>•</span>
                    <span>{module.duration}</span>
                    {module.isTrialContent && (
                      <>
                        <span>•</span>
                        <span className="text-green-400">Disponibile nel Trial</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {editingModule === module.id ? (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Save module edits
                        const titleEl = document.getElementById(`module-title-${module.id}`) as HTMLInputElement | null;
                        const descEl = document.getElementById(`module-desc-${module.id}`) as HTMLTextAreaElement | null;
                        const durEl = document.getElementById(`module-duration-${module.id}`) as HTMLInputElement | null;
                        const isTrialEl = document.getElementById(`module-trial-${module.id}`) as HTMLInputElement | null;
                        const updates: Partial<Module> = {
                          title: titleEl?.value || module.title,
                          description: descEl?.value || module.description,
                          duration: durEl?.value || module.duration,
                          isTrialContent: isTrialEl?.checked ?? module.isTrialContent
                        };
                        handleUpdateModule(module.id, updates);
                      }}
                      className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingModule(null);
                      }}
                      className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingModule(module.id);
                      // Expand if closed
                      if (!expandedModules.has(module.id)) toggleModule(module.id);
                    }}
                    className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAddLesson(module.id);
                  }}
                  className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors"
                  title="Aggiungi lezione"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteModule(module.id);
                  }}
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
                  title="Elimina modulo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Lessons */}
            {expandedModules.has(module.id) && (
              <div className="border-t border-gray-800">
                {/* Module Edit Inline Form */}
                {editingModule === module.id && (
                  <div className="p-4 bg-gray-800/30 border-b border-gray-800">
                    <h4 className="text-white font-bold mb-3">Modifica Modulo</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Titolo Modulo</label>
                        <input
                          id={`module-title-${module.id}`}
                          type="text"
                          defaultValue={module.title}
                          className="w-full px-3 py-2 bg-black/30 border border-gray-700 rounded-lg text-white"
                          placeholder="Titolo modulo"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Descrizione</label>
                        <textarea
                          id={`module-desc-${module.id}`}
                          defaultValue={module.description}
                          className="w-full px-3 py-2 bg-black/30 border border-gray-700 rounded-lg text-white"
                          rows={2}
                          placeholder="Descrizione del modulo"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Durata</label>
                          <input
                            id={`module-duration-${module.id}`}
                            type="text"
                            defaultValue={module.duration}
                            className="w-full px-3 py-2 bg-black/30 border border-gray-700 rounded-lg text-white"
                            placeholder="Es. 2h 30min"
                          />
                        </div>
                        <div className="flex items-center gap-2 mt-6">
                          <input
                            id={`module-trial-${module.id}`}
                            type="checkbox"
                            defaultChecked={module.isTrialContent}
                            className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded"
                          />
                          <label htmlFor={`module-trial-${module.id}`} className="text-sm text-gray-400">
                            Disponibile nel periodo di prova
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Add New Lesson Form */}
                {showAddLesson === module.id && (
                  <div className="p-4 bg-gray-800/30 border-b border-gray-800">
                    <h4 className="text-white font-bold mb-3">Aggiungi Nuova Lezione</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Titolo</label>
                        <input
                          type="text"
                          value={newLesson.title}
                          onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                          className="w-full px-3 py-2 bg-black/30 border border-gray-700 rounded-lg text-white"
                          placeholder="Es. Introduzione al Trading"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Descrizione</label>
                        <textarea
                          value={newLesson.description}
                          onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
                          className="w-full px-3 py-2 bg-black/30 border border-gray-700 rounded-lg text-white"
                          rows={2}
                          placeholder="Descrizione della lezione..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Durata</label>
                        <input
                          type="text"
                          value={newLesson.duration}
                          onChange={(e) => setNewLesson({ ...newLesson, duration: e.target.value })}
                          className="w-full px-3 py-2 bg-black/30 border border-gray-700 rounded-lg text-white"
                          placeholder="Es. 15min"
                        />
                      </div>
                      
                      <div className="border border-gray-700 rounded-lg p-3 bg-black/20">
                        <h5 className="text-white font-semibold text-sm mb-2">Scegli il tipo di video:</h5>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">
                              <input
                                type="radio"
                                name="videoType"
                                value="mp4"
                                defaultChecked
                                className="mr-2"
                              />
                              Carica Video MP4
                            </label>
                            <input
                              type="file"
                              accept="video/mp4,video/x-m4v,video/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const formData = new FormData();
                                  formData.append('file', file);
                                  
                                  try {
                                    const token = localStorage.getItem('token');
                                    const response = await fetch('http://localhost:3001/api/upload', {
                                      method: 'POST',
                                      headers: {
                                        'Authorization': `Bearer ${token}`
                                      },
                                      body: formData
                                    });
                                    
                                    if (response.ok) {
                                      const data = await response.json();
                                      setNewLesson({ ...newLesson, vimeoId: '', videoUrl: data.fileUrl });
                                      alert('✅ Video caricato con successo!');
                                    } else {
                                      alert('❌ Errore durante l\'upload del video');
                                    }
                                  } catch (error) {
                                    console.error('Upload error:', error);
                                    alert('❌ Errore durante l\'upload del video');
                                  }
                                }
                              }}
                              className="w-full text-sm text-gray-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">Carica un file video MP4 dal tuo computer</p>
                          </div>
                          
                          <div className="border-t border-gray-700 pt-3">
                            <label className="block text-sm text-gray-400 mb-1">
                              <input
                                type="radio"
                                name="videoType"
                                value="vimeo"
                                className="mr-2"
                              />
                              Oppure usa Vimeo ID
                            </label>
                            <input
                              type="text"
                              value={newLesson.vimeoId}
                              onChange={(e) => setNewLesson({ ...newLesson, vimeoId: e.target.value, videoUrl: '' })}
                              className="w-full px-3 py-2 bg-black/30 border border-gray-700 rounded-lg text-white"
                              placeholder="Es. 912345678"
                            />
                            <p className="text-xs text-gray-500 mt-1">Solo l'ID numerico da vimeo.com/ID</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`trial-${module.id}`}
                          checked={newLesson.isTrialContent}
                          onChange={(e) => setNewLesson({ ...newLesson, isTrialContent: e.target.checked })}
                          className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded"
                        />
                        <label htmlFor={`trial-${module.id}`} className="text-sm text-gray-400">
                          Disponibile nel periodo di prova
                        </label>
                      </div>
                      
                      {/* File Attachments */}
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">File Allegati (Opzionali)</label>
                        <div className="space-y-2">
                          {newLessonFiles.map((fileItem, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg">
                              <FileText className="w-4 h-4 text-blue-400" />
                              <div className="flex-1">
                                <input
                                  type="file"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      // Upload file to server
                                      const formData = new FormData();
                                      formData.append('file', file);
                                      
                                      try {
                                        const token = localStorage.getItem('token');
                                        const response = await fetch('http://localhost:3001/api/upload', {
                                          method: 'POST',
                                          headers: {
                                            'Authorization': `Bearer ${token}`
                                          },
                                          body: formData
                                        });
                                        
                                        if (response.ok) {
                                          const data = await response.json();
                                          const newFiles = [...newLessonFiles];
                                          newFiles[index] = {
                                            title: file.name,
                                            file: null,
                                            type: getFileType(file.type),
                                            url: data.fileUrl
                                          };
                                          setNewLessonFiles(newFiles);
                                        } else {
                                          alert('Errore durante l\'upload del file');
                                        }
                                      } catch (error) {
                                        console.error('Upload error:', error);
                                        alert('Errore durante l\'upload del file');
                                      }
                                    }
                                  }}
                                  className="text-sm text-gray-300 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-blue-600 file:text-white hover:file:bg-blue-500"
                                  accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.jpg,.jpeg,.png,.gif,.txt"
                                />
                                {fileItem.url && (
                                  <span className="text-xs text-green-400 ml-2">✓ Caricato</span>
                                )}
                              </div>
                              <button
                                onClick={() => {
                                  setNewLessonFiles(newLessonFiles.filter((_, i) => i !== index));
                                }}
                                className="p-1 text-red-400 hover:text-red-300"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              setNewLessonFiles([...newLessonFiles, { title: '', file: null, type: 'pdf', url: '' }]);
                            }}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300"
                          >
                            <Upload className="w-4 h-4" />
                            Aggiungi File
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          onClick={() => {
                            setShowAddLesson(null);
                            setNewLesson({
                              title: '',
                              description: '',
                              duration: '',
                              vimeoId: '',
                              videoUrl: '',
                              isTrialContent: true
                            });
                            setNewLessonFiles([]);
                          }}
                          className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
                        >
                          Annulla
                        </button>
                        <button
                          onClick={() => handleAddLesson(module.id)}
                          disabled={!newLesson.title || (!newLesson.vimeoId && !newLesson.videoUrl) || saving}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? 'Salvataggio...' : 'Aggiungi Lezione'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Lessons List */}
                <div className="divide-y divide-gray-800">
                  {module.lessons.map((lesson) => (
                    <div key={lesson.id} className="p-4 hover:bg-gray-800/30 transition-colors">
                      {editingLesson === lesson.id ? (
                        // Edit Mode
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Titolo Lezione</label>
                            <input
                              id={`lesson-title-${lesson.id}`}
                              type="text"
                              defaultValue={lesson.title}
                              className="w-full px-3 py-2 bg-black/30 border border-gray-700 rounded-lg text-white"
                              placeholder="Titolo della lezione"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Descrizione</label>
                            <textarea
                              id={`lesson-desc-${lesson.id}`}
                              defaultValue={lesson.description}
                              className="w-full px-3 py-2 bg-black/30 border border-gray-700 rounded-lg text-white"
                              rows={2}
                              placeholder="Descrizione della lezione"
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Durata</label>
                              <input
                                id={`lesson-duration-${lesson.id}`}
                                type="text"
                                defaultValue={lesson.duration}
                                className="w-full px-3 py-2 bg-black/30 border border-gray-700 rounded-lg text-white"
                                placeholder="Es. 15min"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Vimeo ID</label>
                              <input
                                id={`lesson-vimeo-${lesson.id}`}
                                type="text"
                                defaultValue={lesson.vimeoId}
                                className="w-full px-3 py-2 bg-black/30 border border-gray-700 rounded-lg text-white"
                                placeholder="912345678"
                              />
                              <p className="text-xs text-gray-500 mt-1">Solo ID</p>
                            </div>
                            <div className="flex items-center gap-2 mt-5">
                              <input
                                id={`lesson-trial-${lesson.id}`}
                                type="checkbox"
                                defaultChecked={lesson.isTrialContent}
                                className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded"
                              />
                              <label htmlFor={`lesson-trial-${lesson.id}`} className="text-xs text-gray-400">
                                Trial
                              </label>
                            </div>
                          </div>
                          
                          {/* Special Download Button for Specific Lessons */}
                          {(lesson.id === 'lesson_1758030571170' || lesson.id === 'lesson_3_1') && (
                            <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                              <label className="block text-sm font-bold text-yellow-400 mb-2 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                </svg>
                                Pulsante Download "SCARICA QUI"
                              </label>
                              <p className="text-xs text-gray-400 mb-3">
                                Questo file apparirà sotto la descrizione del video con un pulsante giallo "SCARICA QUI"
                              </p>
                              <input
                                type="file"
                                id={`download-button-${lesson.id}`}
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const formData = new FormData();
                                    formData.append('file', file);
                                    
                                    try {
                                      console.log('📤 Uploading file:', file.name);
                                      
                                      const response = await fetch('http://localhost:3001/api/upload', {
                                        method: 'POST',
                                        body: formData
                                      });
                                      
                                      console.log('Response status:', response.status);
                                      const data = await response.json();
                                      console.log('Response data:', data);
                                      
                                      if (response.ok && data.success) {
                                        // Update lesson with download button info
                                        const updatedLesson = {
                                          ...lesson,
                                          downloadButton: {
                                            enabled: true,
                                            label: 'SCARICA QUI',
                                            fileUrl: data.fileUrl,
                                            fileName: file.name
                                          }
                                        };
                                        
                                        console.log('💾 Saving lesson with download button...');
                                        // Save to server
                                        await handleUpdateLesson(module.id, lesson.id, updatedLesson);
                                        alert(`✅ File "${file.name}" caricato con successo!\n\nIl pulsante "SCARICA QUI" è ora attivo nella lezione.`);
                                        
                                        // Reload course to show updated data
                                        await loadAllCourses();
                                      } else {
                                        const errorMsg = data.error || 'Errore sconosciuto';
                                        console.error('❌ Upload failed:', errorMsg);
                                        alert(`❌ Errore durante l'upload:\n${errorMsg}`);
                                      }
                                    } catch (error) {
                                      console.error('❌ Upload error:', error);
                                      const errorMessage = error instanceof Error ? error.message : 'Errore di rete';
                                      alert(`❌ Errore durante l'upload del file:\n${errorMessage}`);
                                    }
                                  }
                                }}
                                className="w-full text-sm text-gray-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-yellow-500 file:text-black hover:file:bg-yellow-400 cursor-pointer"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.7z"
                              />
                              {(lesson as any).downloadButton?.fileUrl && (
                                <div className="mt-2 flex items-center gap-2 text-xs text-green-400">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  File caricato: {(lesson as any).downloadButton?.fileName}
                                </div>
                              )}
                            </div>
                          )}

                          {/* File Attachments for Edit */}
                          <div className="mt-4">
                            <label className="block text-xs text-gray-400 mb-2">File Allegati</label>
                            <div className="space-y-2">
                              {editLessonFiles.map((fileItem, index) => (
                                <div key={index} className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg">
                                  <FileText className="w-4 h-4 text-blue-400" />
                                  <div className="flex-1">
                                    <input
                                      type="file"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          // Upload file to server
                                          const formData = new FormData();
                                          formData.append('file', file);
                                          
                                          try {
                                            const token = localStorage.getItem('token');
                                            const response = await fetch('http://localhost:3001/api/upload', {
                                              method: 'POST',
                                              headers: {
                                                'Authorization': `Bearer ${token}`
                                              },
                                              body: formData
                                            });
                                            
                                            if (response.ok) {
                                              const data = await response.json();
                                              const newFiles = [...editLessonFiles];
                                              newFiles[index] = {
                                                title: file.name,
                                                url: data.fileUrl,
                                                type: getFileType(file.type)
                                              };
                                              setEditLessonFiles(newFiles);
                                            } else {
                                              alert('Errore durante l\'upload del file');
                                            }
                                          } catch (error) {
                                            console.error('Upload error:', error);
                                            alert('Errore durante l\'upload del file');
                                          }
                                        }
                                      }}
                                      className="text-sm text-gray-300 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-blue-600 file:text-white hover:file:bg-blue-500"
                                      accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.jpg,.jpeg,.png,.gif,.txt"
                                    />
                                    <span className="text-xs text-gray-400 ml-2">File attuale: {fileItem.title}</span>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setEditLessonFiles(editLessonFiles.filter((_, i) => i !== index));
                                    }}
                                    className="p-1 text-red-400 hover:text-red-300"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                              <button
                                onClick={() => {
                                  setEditLessonFiles([...editLessonFiles, { title: '', url: '', type: 'pdf' }]);
                                }}
                                className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300"
                              >
                                <Upload className="w-4 h-4" />
                                Aggiungi File
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingLesson(null);
                                setEditLessonFiles([]);
                              }}
                              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
                            >
                              Annulla
                            </button>
                            <button
                              onClick={async () => {
                                const titleEl = document.getElementById(`lesson-title-${lesson.id}`) as HTMLInputElement;
                                const descEl = document.getElementById(`lesson-desc-${lesson.id}`) as HTMLTextAreaElement;
                                const durEl = document.getElementById(`lesson-duration-${lesson.id}`) as HTMLInputElement;
                                const vimeoEl = document.getElementById(`lesson-vimeo-${lesson.id}`) as HTMLInputElement;
                                const trialEl = document.getElementById(`lesson-trial-${lesson.id}`) as HTMLInputElement;
                                
                                await handleUpdateLesson(module.id, lesson.id, {
                                  title: titleEl?.value || lesson.title,
                                  description: descEl?.value || lesson.description,
                                  duration: durEl?.value || lesson.duration,
                                  vimeoId: vimeoEl?.value || lesson.vimeoId,
                                  isTrialContent: trialEl?.checked ?? lesson.isTrialContent
                                });
                              }}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 flex items-center gap-2"
                            >
                              <Save className="w-4 h-4" />
                              Salva Modifiche
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Video className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-white font-semibold">{lesson.title}</h4>
                              <p className="text-sm text-gray-400 mt-1">{lesson.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {lesson.duration}
                                </span>
                                <span>ID: {lesson.vimeoId}</span>
                                {lesson.isTrialContent ? (
                                  <span className="text-green-400 flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    Trial
                                  </span>
                                ) : (
                                  <span className="text-yellow-400 flex items-center gap-1">
                                    <EyeOff className="w-3 h-3" />
                                    Premium
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleTrialContent(module.id, lesson.id, lesson.isTrialContent)}
                              className={`p-2 rounded-lg transition-colors ${
                                lesson.isTrialContent 
                                  ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50' 
                                  : 'bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/50'
                              }`}
                              title={lesson.isTrialContent ? 'Rimuovi dal trial' : 'Aggiungi al trial'}
                            >
                              {lesson.isTrialContent ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => {
                                setEditingLesson(lesson.id);
                                setEditLessonFiles(lesson.resources || []);
                              }}
                              className="p-2 bg-blue-900/30 text-blue-400 rounded-lg hover:bg-blue-900/50"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteLesson(module.id, lesson.id)}
                              className="p-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            </div>
          </div>
        ))}
        
        {/* Add Module at the End */}
        {showAddModule === -1 ? (
          <div className="bg-purple-900/20 border-2 border-purple-600 rounded-lg p-4">
            <h4 className="text-white font-bold mb-3 flex items-center gap-2">
              <Plus className="w-5 h-5 text-purple-400" />
              Aggiungi Nuovo Modulo alla Fine
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Titolo Modulo</label>
                <input
                  type="text"
                  value={newModule.title}
                  onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                  className="w-full px-3 py-2 bg-black/30 border border-gray-700 rounded-lg text-white"
                  placeholder="Es. Modulo Finale"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Descrizione</label>
                <textarea
                  value={newModule.description}
                  onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                  className="w-full px-3 py-2 bg-black/30 border border-gray-700 rounded-lg text-white"
                  rows={2}
                  placeholder="Descrizione del modulo..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Durata</label>
                  <input
                    type="text"
                    value={newModule.duration}
                    onChange={(e) => setNewModule({ ...newModule, duration: e.target.value })}
                    className="w-full px-3 py-2 bg-black/30 border border-gray-700 rounded-lg text-white"
                    placeholder="Es. 30min"
                  />
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input
                    type="checkbox"
                    id="new-module-trial-end"
                    checked={newModule.isTrialContent}
                    onChange={(e) => setNewModule({ ...newModule, isTrialContent: e.target.checked })}
                    className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded"
                  />
                  <label htmlFor="new-module-trial-end" className="text-sm text-gray-400">
                    Disponibile nel Trial
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    setShowAddModule(null);
                    setNewModule({
                      title: '',
                      description: '',
                      duration: '',
                      isTrialContent: true
                    });
                  }}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
                >
                  Annulla
                </button>
                <button
                  onClick={() => handleAddModule()}
                  disabled={!newModule.title || saving}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Creazione...' : 'Crea Modulo'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddModule(-1)}
            className="w-full py-3 border-2 border-dashed border-gray-700 rounded-lg text-gray-500 hover:border-purple-600 hover:text-purple-400 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Aggiungi Nuovo Modulo alla Fine
          </button>
        )}
      </div>

      {/* Help Section */}
      <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-blue-400 font-semibold mb-2">Guida Rapida</h4>
            
            <div className="mb-3">
              <h5 className="text-blue-300 font-semibold text-sm mb-1">Gestione Moduli:</h5>
              <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside ml-2">
                <li>Clicca su "Inserisci modulo prima del Modulo X" per aggiungere un modulo di presentazione o introduttivo</li>
                <li>Usa "Aggiungi Nuovo Modulo alla Fine" per aggiungere moduli alla fine del corso</li>
                <li>I moduli vengono automaticamente riordinati quando ne inserisci uno nuovo</li>
                <li>Puoi modificare, eliminare o riordinare i moduli in qualsiasi momento</li>
              </ul>
            </div>
            
            <div>
              <h5 className="text-blue-300 font-semibold text-sm mb-1">Gestione Video e Lezioni:</h5>
              <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside ml-2">
                <li>Carica il video su Vimeo e copia l'ID dall'URL (es. vimeo.com/123456789 → ID: 123456789)</li>
                <li>Incolla l'ID nel campo "Vimeo ID" quando aggiungi o modifichi una lezione</li>
                <li>I contenuti contrassegnati come "Trial" saranno accessibili durante il periodo di prova</li>
                <li>Usa la sezione "File Allegati" per aggiungere materiali scaricabili alle lezioni</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseManagement;
