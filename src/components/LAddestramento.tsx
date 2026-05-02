import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, FlaskConical, Rocket, LineChart, ArrowRight, Clock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const LAddestramento = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [activePhase, setActivePhase] = useState<number | null>(null);

  const phases = [
    {
      icon: Compass,
      phase: 'Step 01',
      title: 'Onboarding',
      subtitle: 'Audit, obiettivi e scelta del modulo',
      description: 'Definiamo insieme il punto di partenza: capitale, tempo disponibile, obiettivi. Scegli il modulo (Trading, Academy, Creator, Operations) o costruisci un mix su misura.',
      duration: '~30 min',
      color: 'from-cyan-500 to-blue-500',
      glowColor: 'shadow-cyan-500/30',
    },
    {
      icon: FlaskConical,
      phase: 'Step 02',
      title: 'Setup & Lab',
      subtitle: 'Configurazione strumenti, formazione mirata',
      description: 'Installazione e configurazione di bot, indicatori o studio creator: tutto è guidato, con percorsi formativi modulari per partire senza tempi morti.',
      duration: '1 settimana',
      color: 'from-sky-500 to-cyan-500',
      glowColor: 'shadow-sky-500/30',
    },
    {
      icon: Rocket,
      phase: 'Step 03',
      title: 'Esecuzione',
      subtitle: 'Operatività live e monitoraggio',
      description: 'Si va in produzione: trading automatico, pubblicazione contenuti, lancio prodotti. Dashboard centralizzata per monitorare KPI e iterare sui dati reali.',
      duration: 'Continuativo',
      color: 'from-blue-500 to-indigo-500',
      glowColor: 'shadow-blue-500/30',
    },
    {
      icon: LineChart,
      phase: 'Step 04',
      title: 'Scale',
      subtitle: 'Ottimizzazione, diversificazione, crescita',
      description: 'Una volta validato il sistema, si scala: nuovi mercati, nuovi format di contenuto, nuovi flussi di reddito. Il lab diventa il tuo asset operativo.',
      duration: 'Long-term',
      color: 'from-blue-600 to-cyan-500',
      glowColor: 'shadow-blue-600/30',
    },
  ];

  return (
    <section id="addestramento" className={`py-24 relative overflow-hidden ${
      theme === 'dark' ? 'bg-gradient-to-b from-blue-950/10 to-black' : 'bg-gradient-to-b from-blue-50/30 to-white'
    }`}>
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 px-4 py-1.5 rounded-full border border-cyan-500/30 mb-6 backdrop-blur-sm">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono-lab text-xs text-cyan-300 tracking-[0.25em] uppercase">// Il Metodo</span>
          </div>
          <h2 className={`font-display text-4xl md:text-6xl font-bold mb-6 tracking-tight ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}>
            Dal primo audit allo <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">scaling</span>
          </h2>
          <p className={`text-lg md:text-xl max-w-3xl mx-auto leading-relaxed ${
            theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Un protocollo in quattro step pensato per portarti da zero a un sistema di reddito
            digitale operativo, sia che tu venga dal trading, dal mondo creator, o entrambi.
          </p>
        </div>

        {/* Timeline */}
        <div className="max-w-5xl mx-auto relative z-10">
          {phases.map((phase, index) => (
            <div
              key={index}
              className="relative mb-10 last:mb-0"
              onMouseEnter={() => setActivePhase(index)}
              onMouseLeave={() => setActivePhase(null)}
            >
              {/* Connection Line */}
              {index < phases.length - 1 && (
                <div className="absolute left-9 top-20 w-px h-16 bg-gradient-to-b from-cyan-500/60 to-cyan-500/10 z-0"></div>
              )}

              <div className={`flex items-start gap-6 relative z-10 transition-all duration-500`}>
                {/* Icon Circle */}
                <div className="relative flex-shrink-0">
                  <div className={`relative w-[4.5rem] h-[4.5rem] bg-gradient-to-br ${phase.color} rounded-2xl flex items-center justify-center shadow-lg ${phase.glowColor} transition-all duration-500 ${
                    activePhase === index ? 'scale-110' : ''
                  }`}>
                    <div className="absolute inset-0 bg-white/10 rounded-2xl blur-md"></div>
                    <phase.icon className="relative z-10 w-8 h-8 text-white" />
                  </div>
                  <div className={`absolute -bottom-2 -right-2 w-7 h-7 bg-slate-900 rounded-full flex items-center justify-center font-mono-lab text-cyan-400 font-semibold text-xs border ${
                    theme === 'dark' ? 'border-cyan-500/40' : 'border-cyan-500/40'
                  }`}>
                    0{index + 1}
                  </div>
                </div>

                {/* Content Card */}
                <div className={`flex-1 relative overflow-hidden border rounded-2xl p-7 transition-all duration-500 ${
                  theme === 'dark'
                    ? 'bg-slate-900/60 backdrop-blur-sm'
                    : 'bg-white shadow-sm'
                } ${
                  activePhase === index
                    ? `border-cyan-400 shadow-2xl ${phase.glowColor} -translate-y-1`
                    : theme === 'dark' ? 'border-slate-700/60' : 'border-slate-200'
                }`}>
                  <div className={`absolute top-0 left-0 w-full h-px bg-gradient-to-r ${phase.color} opacity-0 ${
                    activePhase === index ? 'opacity-100' : ''
                  } transition-opacity`}></div>

                  <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
                      <div>
                        <span className="font-mono-lab inline-block px-2.5 py-1 bg-cyan-500/10 rounded-md text-cyan-400 text-[0.65rem] font-medium uppercase tracking-[0.2em] mb-2 border border-cyan-500/30">
                          {phase.phase}
                        </span>
                        <h3 className={`font-display text-2xl md:text-3xl font-semibold tracking-tight ${
                          theme === 'dark' ? 'text-white' : 'text-slate-900'
                        } ${activePhase === index ? 'text-cyan-400' : ''} transition-colors`}>
                          {phase.title}
                        </h3>
                        <h4 className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'
                        }`}>
                          {phase.subtitle}
                        </h4>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono-lab tracking-widest ${
                        theme === 'dark'
                          ? 'bg-slate-800/80 text-slate-300 border border-slate-700'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        <Clock className="w-3.5 h-3.5" />
                        {phase.duration}
                      </div>
                    </div>
                    <p className={`leading-relaxed text-sm md:text-base ${
                      theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {phase.description}
                    </p>

                    {activePhase === index && (
                      <div className="mt-4 flex items-center gap-2 text-cyan-400 animate-fade-in">
                        <ArrowRight className="w-4 h-4 animate-pulse" />
                        <span className="font-mono-lab text-xs tracking-widest uppercase">Step attivo</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className={`max-w-2xl mx-auto p-8 border rounded-2xl ${
            theme === 'dark'
              ? 'bg-slate-900/60 border-slate-700/60 backdrop-blur-sm'
              : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <h3 className={`font-display text-2xl md:text-3xl font-semibold mb-3 tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>
              Pronto a partire dallo Step 01?
            </h3>
            <p className={`mb-6 ${
              theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Crea il tuo account: ti guidiamo nell'audit iniziale e nella scelta del modulo
              più adatto al tuo punto di partenza.
            </p>
            <button
              onClick={() => navigate('/register')}
              className="group bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-3.5 rounded-lg font-display font-semibold transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-blue-500/30 hover:shadow-cyan-500/40 inline-flex items-center gap-2">
              Avvia onboarding
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LAddestramento;
