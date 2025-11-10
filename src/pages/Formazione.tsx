import { GraduationCap, Award, BookOpen, Video, FileText, Clock, CheckCircle, Target, TrendingUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Formazione = () => {
  const { theme } = useTheme();
  const courses = [
    {
      icon: BookOpen,
      title: "Corso Base - Recluta Spartana",
      level: "Principiante",
      duration: "6 settimane",
      lessons: "24 lezioni",
      description: "Fondamenti del trading, analisi tecnica di base, psicologia del trader e prime strategie operative.",
      topics: ["Basi del trading", "Candele giapponesi", "Supporti e resistenze", "Gestione capitale"],
      color: "from-green-600 to-emerald-600"
    },
    {
      icon: GraduationCap,
      title: "Corso Avanzato - Oplita",
      level: "Intermedio",
      duration: "8 settimane",
      lessons: "32 lezioni",
      description: "Strategie complesse, pattern avanzati, gestione del rischio professionale e trading multi-timeframe.",
      topics: ["Pattern complessi", "Risk management", "Multi-timeframe", "Price action"],
      color: "from-blue-600 to-cyan-600"
    },
    {
      icon: Award,
      title: "Master Trading - Generale Spartano",
      level: "Esperto",
      duration: "12 settimane",
      lessons: "48 lezioni",
      description: "Trading algoritmico, sistemi automatici, backtesting avanzato e ottimizzazione delle strategie.",
      topics: ["Algo trading", "Sistemi automatici", "Backtesting", "Ottimizzazione"],
      color: "from-red-600 to-orange-600"
    }
  ];

  return (
    <div className={`min-h-screen pt-24 ${
      theme === 'light' ? 'bg-gradient-to-b from-white via-gray-50 to-white' : 'bg-black'
    }`}>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 bg-clip-text text-transparent">
            FORMAZIONE ELITE
          </h1>
          <p className={`text-xl max-w-3xl mx-auto ${
            theme === 'light' ? 'text-gray-600' : 'text-gray-300'
          }`}>
            Percorsi formativi strutturati per trasformarti da recluta a generale. 
            Dalla teoria alla pratica, con supporto continuo e certificazione finale.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Studenti', value: '5,000+' },
            { label: 'Ore di Contenuti', value: '200+' },
            { label: 'Tasso Successo', value: '89%' },
            { label: 'Certificati', value: '3,200+' }
          ].map((stat, i) => (
            <div key={i} className={`rounded-lg p-4 text-center ${
              theme === 'light'
                ? 'bg-white border-2 border-gray-200 shadow-md'
                : 'bg-gradient-to-b from-gray-900 to-black border border-red-800/30'
            }`}>
              <div className="text-3xl font-black text-yellow-500">{stat.value}</div>
              <div className={`text-sm ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Courses */}
        <div className="space-y-8 mb-12">
          {courses.map((course, index) => (
            <div key={index} className={`rounded-2xl p-8 transition-all duration-300 ${
              theme === 'light'
                ? 'bg-white border-2 border-gray-200 hover:border-yellow-600 shadow-lg'
                : 'bg-gradient-to-b from-gray-900 to-black border border-red-800/30 hover:border-yellow-500/50'
            }`}>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-shrink-0">
                  <div className={`w-20 h-20 bg-gradient-to-br ${course.color} rounded-xl flex items-center justify-center`}>
                    <course.icon className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h3 className={`text-2xl font-black ${
                      theme === 'light' ? 'text-gray-800' : 'text-white'
                    }`}>{course.title}</h3>
                    <span className={`px-3 py-1 bg-gradient-to-r ${course.color} text-white text-xs rounded-full font-bold`}>
                      {course.level}
                    </span>
                  </div>
                  <p className={`mb-4 ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                  }`}>{course.description}</p>
                  
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className={`flex items-center gap-2 ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      <Clock className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">{course.duration}</span>
                    </div>
                    <div className={`flex items-center gap-2 ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      <Video className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">{course.lessons}</span>
                    </div>
                    <div className={`flex items-center gap-2 ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      <FileText className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">Materiale scaricabile</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {course.topics.map((topic, i) => (
                      <span key={i} className={`px-3 py-1 rounded-lg text-sm ${
                        theme === 'light'
                          ? 'bg-gray-100 border border-gray-300 text-gray-700'
                          : 'bg-gray-800 border border-gray-700 text-gray-300'
                      }`}>
                        {topic}
                      </span>
                    ))}
                  </div>

                  <button className={`px-6 py-3 bg-gradient-to-r ${course.color} text-white rounded-xl font-bold hover:scale-105 transition-transform border-2 ${theme === 'light' ? 'border-gray-800 shadow-md' : 'border-transparent'}`}>
                    Scopri il Corso
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className={`rounded-2xl p-8 mb-12 ${
          theme === 'light'
            ? 'bg-gradient-to-r from-gray-100 to-gray-50 border-2 border-gray-200'
            : 'bg-gradient-to-r from-red-950/50 via-black/50 to-red-950/50 backdrop-blur-sm border border-red-800/30'
        }`}>
          <h2 className={`text-3xl font-black mb-6 text-center ${
            theme === 'light' ? 'text-gray-800' : 'text-white'
          }`}>Cosa Include Ogni Corso</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Video, text: 'Video lezioni HD on-demand' },
              { icon: FileText, text: 'Dispense e materiali PDF' },
              { icon: CheckCircle, text: 'Esercizi pratici e quiz' },
              { icon: Target, text: 'Progetti reali di trading' },
              { icon: Award, text: 'Certificato di completamento' },
              { icon: TrendingUp, text: 'Accesso a vita agli aggiornamenti' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <item.icon className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                <span className={theme === 'light' ? 'text-gray-700' : 'text-gray-300'}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-black text-white mb-4">Inizia il Tuo Addestramento</h2>
          <p className="text-gray-100 mb-6">Scegli il percorso giusto per il tuo livello e diventa un trader spartano</p>
          <button className={`px-8 py-4 bg-black text-yellow-500 rounded-xl font-bold text-lg hover:bg-gray-900 transition-all duration-300 hover:scale-105 active:scale-95 border-2 ${theme === 'light' ? 'border-gray-900 shadow-lg' : 'border-transparent'}`}>
            ESPLORA I CORSI
          </button>
        </div>
      </div>
    </div>
  );
};

export default Formazione;
