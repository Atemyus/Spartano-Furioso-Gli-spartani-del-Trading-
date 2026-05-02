import { GraduationCap, Award, BookOpen, Video, FileText, Clock, CheckCircle, Target, TrendingUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Formazione = () => {
  const { theme } = useTheme();
  const courses = [
    {
      icon: BookOpen,
      tag: '01 / Foundations',
      title: 'Foundations',
      level: 'Principiante',
      duration: '6 settimane',
      lessons: '24 lezioni',
      description: 'Le basi solide: come funzionano i mercati, analisi tecnica essenziale, psicologia del trader e money management. Punto di partenza per chi vuole iniziare bene.',
      topics: ['Mercati e strumenti', 'Analisi tecnica', 'Money management', 'Psicologia operativa'],
      color: 'from-cyan-500 to-blue-500',
    },
    {
      icon: GraduationCap,
      tag: '02 / Operator',
      title: 'Operator',
      level: 'Intermedio',
      duration: '8 settimane',
      lessons: '32 lezioni',
      description: 'Strategie operative reali: pattern, multi-timeframe, gestione del rischio professionale e costruzione di un piano di trading replicabile.',
      topics: ['Pattern avanzati', 'Risk management', 'Multi-timeframe', 'Price action'],
      color: 'from-blue-500 to-indigo-500',
    },
    {
      icon: Award,
      tag: '03 / Systems',
      title: 'Systems',
      level: 'Avanzato',
      duration: '12 settimane',
      lessons: '48 lezioni',
      description: 'Trading algoritmico: dalla progettazione del sistema al backtesting fino alla messa in produzione. Per chi vuole automatizzare il proprio edge.',
      topics: ['Algo trading', 'Bot e automazione', 'Backtesting', 'Ottimizzazione'],
      color: 'from-blue-600 to-cyan-500',
    }
  ];

  return (
    <div className={`min-h-screen pt-24 ${
      theme === 'light' ? 'bg-gradient-to-b from-white via-gray-50 to-white' : 'bg-black'
    }`}>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <span className="font-mono-lab text-xs text-cyan-400 tracking-[0.3em] uppercase">// Academy</span>
          <h1 className={`font-display text-5xl md:text-6xl font-bold mt-2 mb-4 tracking-tight ${
            theme === 'light' ? 'text-slate-900' : 'text-white'
          }`}>
            <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">Formazione</span> strutturata
          </h1>
          <p className={`text-lg md:text-xl max-w-3xl mx-auto leading-relaxed ${
            theme === 'light' ? 'text-slate-600' : 'text-slate-300'
          }`}>
            Tre percorsi modulari per costruire competenze concrete: dalle basi del trading
            ai sistemi automatici. Video, esercizi pratici e mentoring dedicato.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Studenti', value: '5,000+' },
            { label: 'Ore di contenuti', value: '200+' },
            { label: 'Completion rate', value: '89%' },
            { label: 'Certificati', value: '3,200+' }
          ].map((stat, i) => (
            <div key={i} className={`rounded-lg p-4 text-center ${
              theme === 'light'
                ? 'bg-white border border-slate-200 shadow-sm'
                : 'bg-slate-900/50 border border-slate-700/60 backdrop-blur-sm'
            }`}>
              <div className="font-display text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">{stat.value}</div>
              <div className={`font-mono-lab text-[0.7rem] tracking-widest uppercase mt-1 ${
                theme === 'light' ? 'text-slate-600' : 'text-slate-400'
              }`}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Courses */}
        <div className="space-y-8 mb-12">
          {courses.map((course, index) => (
            <div key={index} className={`rounded-2xl p-8 transition-all duration-300 ${
              theme === 'light'
                ? 'bg-white border-2 border-gray-200 hover:border-cyan-600 shadow-lg'
                : 'bg-gradient-to-b from-gray-900 to-black border border-blue-800/30 hover:border-cyan-500/50'
            }`}>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-shrink-0">
                  <div className={`w-20 h-20 bg-gradient-to-br ${course.color} rounded-xl flex items-center justify-center`}>
                    <course.icon className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="font-mono-lab text-xs text-cyan-500 tracking-widest uppercase">{course.tag}</span>
                    <h3 className={`font-display text-2xl md:text-3xl font-semibold tracking-tight ${
                      theme === 'light' ? 'text-slate-900' : 'text-white'
                    }`}>{course.title}</h3>
                    <span className={`px-2.5 py-0.5 font-mono-lab tracking-widest bg-gradient-to-r ${course.color} text-white text-[0.65rem] rounded-md uppercase`}>
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
                      <Clock className="w-4 h-4 text-cyan-500" />
                      <span className="text-sm">{course.duration}</span>
                    </div>
                    <div className={`flex items-center gap-2 ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      <Video className="w-4 h-4 text-cyan-500" />
                      <span className="text-sm">{course.lessons}</span>
                    </div>
                    <div className={`flex items-center gap-2 ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      <FileText className="w-4 h-4 text-cyan-500" />
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

                  <button className={`px-6 py-3 bg-gradient-to-r ${course.color} text-white rounded-lg font-display font-semibold tracking-wide transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-blue-500/20 hover:shadow-cyan-500/40`}>
                    Scopri il percorso →
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
            : 'bg-gradient-to-r from-blue-950/50 via-black/50 to-blue-950/50 backdrop-blur-sm border border-blue-800/30'
        }`}>
          <h2 className={`font-display text-3xl font-semibold mb-6 text-center tracking-tight ${
            theme === 'light' ? 'text-slate-900' : 'text-white'
          }`}>Cosa è incluso in ogni percorso</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Video, text: 'Video lezioni HD on-demand' },
              { icon: FileText, text: 'Materiali PDF e cheatsheet' },
              { icon: CheckCircle, text: 'Esercizi pratici e quiz' },
              { icon: Target, text: 'Progetti reali e case study' },
              { icon: Award, text: 'Certificato di completamento' },
              { icon: TrendingUp, text: 'Accesso a vita agli aggiornamenti' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <span className={`text-sm ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-10 text-center">
          <span className="font-mono-lab text-xs text-white/70 tracking-[0.3em] uppercase">// Start now</span>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-white mt-2 mb-3 tracking-tight">Inizia il tuo percorso formativo</h2>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">Scegli il modulo coerente con il tuo livello e parti con un piano strutturato.</p>
          <button className="px-7 py-3 bg-white text-blue-600 rounded-lg font-display font-semibold transition-all duration-300 hover:-translate-y-0.5 shadow-lg">
            Esplora i percorsi →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Formazione;
