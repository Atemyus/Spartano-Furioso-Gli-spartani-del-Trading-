import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Zap, Sword, Trophy, Flame, Shield, ArrowRight, Clock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const LAddestramento = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [activePhase, setActivePhase] = useState<number | null>(null);

  const phases = [
    {
      icon: UserPlus,
      phase: "Fase 1",
      title: "L'Arruolamento",
      subtitle: "Setup e Configurazione Iniziale",
      description: "Come ogni spartano inizia nell'Agoge, il tuo percorso inizia con una configurazione precisa. Setup del bot, connessione al broker, parametri di base.",
      duration: "5 minuti",
      color: "from-yellow-600 to-yellow-400",
      glowColor: "shadow-yellow-500/50",
      bgGlow: "bg-yellow-500/20"
    },
    {
      icon: Zap,
      phase: "Fase 2", 
      title: "L'Agoge",
      subtitle: "Periodo di Testing e Ottimizzazione",
      description: "L'addestramento spartano era brutale ma necessario. Il bot viene testato su dati storici e ottimizzato per le tue esigenze specifiche.",
      duration: "1 settimana",
      color: "from-orange-600 to-yellow-500",
      glowColor: "shadow-orange-500/50",
      bgGlow: "bg-orange-500/20"
    },
    {
      icon: Sword,
      phase: "Fase 3",
      title: "La Battaglia",
      subtitle: "Trading Live sui Mercati",
      description: "Con l'addestramento completato, il tuo guerriero spartano entra in battaglia. Trading automatico 24/7 con la disciplina di ferro di Sparta.",
      duration: "Continuo",
      color: "from-red-600 to-orange-500",
      glowColor: "shadow-red-500/50",
      bgGlow: "bg-red-500/20"
    },
    {
      icon: Trophy,
      phase: "Fase 4",
      title: "La Gloria",
      subtitle: "Monitoraggio Performance e Profitti",
      description: "Celebra le vittorie come un vero spartano. Dashboard completa per monitorare performance, profitti e crescita del tuo capitale.",
      duration: "Per sempre",
      color: "from-red-800 to-red-600",
      glowColor: "shadow-red-800/50",
      bgGlow: "bg-red-800/20"
    }
  ];

  return (
    <section id="addestramento" className={`py-20 relative overflow-hidden ${
      theme === 'dark' ? 'bg-gradient-to-b from-red-950/10 to-black' : 'bg-gradient-to-b from-red-50/30 to-white'
    }`}>
      {/* Epic Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        {/* Vertical timeline line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-500 via-red-500 to-red-800 opacity-20"></div>
      </div>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-600/20 to-red-600/20 px-4 py-2 rounded-full border border-yellow-600/30 mb-6">
            <Sword className="w-4 h-4 text-yellow-500" />
            <span className="text-yellow-400 text-sm font-medium">IL PERCORSO DELLO SPARTANO</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-white">L'</span>
            <span className="bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent">ADDESTRAMENTO</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Dalla recluta al guerriero spartano: il percorso che trasforma un trader normale 
            in un maestro dei mercati finanziari
          </p>
        </div>

        {/* Epic Timeline with 3D Effects */}
        <div className="max-w-5xl mx-auto relative z-10">
          {phases.map((phase, index) => (
            <div 
              key={index} 
              className="relative mb-16 last:mb-0"
              onMouseEnter={() => setActivePhase(index)}
              onMouseLeave={() => setActivePhase(null)}
            >
              {/* Animated Connection Line */}
              {index < phases.length - 1 && (
                <div className="absolute left-10 top-24 w-1 h-20 bg-gradient-to-b from-yellow-500 via-red-500 to-red-700 z-0 animate-pulse">
                  <div className="absolute inset-0 bg-gradient-to-b from-yellow-400 to-red-600 blur-sm"></div>
                </div>
              )}

              <div className={`flex items-start gap-8 relative z-10 transition-all duration-500 ${
                activePhase === index ? 'scale-105' : ''
              }`}>
                {/* Epic Icon Circle */}
                <div className="relative flex-shrink-0">
                  <div className={`absolute inset-0 ${phase.bgGlow} rounded-full blur-xl opacity-0 group-hover:opacity-100 animate-pulse`}></div>
                  <div className={`relative w-20 h-20 bg-gradient-to-br ${phase.color} rounded-full flex items-center justify-center shadow-2xl ${phase.glowColor} transform transition-all duration-500 ${
                    activePhase === index ? 'scale-125 rotate-12' : 'hover:scale-110'
                  }`}>
                    <div className="absolute inset-0 bg-white/20 rounded-full blur-md"></div>
                    <phase.icon className="relative z-10 w-10 h-10 text-white drop-shadow-lg" />
                    {activePhase === index && (
                      <Flame className="absolute -top-2 -right-2 w-6 h-6 text-orange-400 animate-fire" />
                    )}
                  </div>
                  {/* Phase number badge */}
                  <div className={`absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br ${phase.color} rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-black`}>
                    {index + 1}
                  </div>
                </div>

                {/* Epic Content Card */}
                <div className={`flex-1 relative overflow-hidden bg-gradient-to-br ${
                  theme === 'dark' ? 'from-gray-900 to-black' : 'from-gray-100 to-white'
                } border-2 rounded-2xl p-8 transition-all duration-500 transform ${
                  activePhase === index 
                    ? `border-yellow-500 shadow-2xl ${phase.glowColor} -translate-y-2` 
                    : 'border-yellow-600/30 shadow-lg hover:-translate-y-1'
                }`}>
                  {/* Top shine effect */}
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${phase.color} opacity-0 ${
                    activePhase === index ? 'opacity-100' : ''
                  } transition-opacity`}></div>
                  
                  {/* Background glow */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${phase.color} opacity-0 ${
                    activePhase === index ? 'opacity-5' : ''
                  } transition-opacity duration-500`}></div>
                  
                  <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <span className="inline-block px-3 py-1 bg-gradient-to-r from-yellow-600/20 to-red-600/20 rounded-full text-yellow-500 text-xs font-bold uppercase tracking-wider mb-2 border border-yellow-600/30">
                          {phase.phase}
                        </span>
                        <h3 className={`text-3xl font-black mb-1 ${
                          theme === 'dark' ? 'text-white' : 'text-black'
                        } ${activePhase === index ? 'text-yellow-500' : ''} transition-colors`}>
                          {phase.title}
                        </h3>
                        <h4 className="text-yellow-500 font-bold text-sm uppercase tracking-wide">
                          {phase.subtitle}
                        </h4>
                      </div>
                      <div className="mt-4 md:mt-0">
                        <div className={`flex items-center gap-2 bg-gradient-to-r ${phase.color} px-4 py-2 rounded-lg text-white font-bold text-sm shadow-lg`}>
                          <Clock className="w-4 h-4" />
                          {phase.duration}
                        </div>
                      </div>
                    </div>
                    <p className={`leading-relaxed ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {phase.description}
                    </p>
                    
                    {/* Progress indicator */}
                    {activePhase === index && (
                      <div className="mt-4 flex items-center gap-2 text-yellow-500 animate-fade-in">
                        <ArrowRight className="w-5 h-5 animate-pulse" />
                        <span className="text-sm font-bold">Fase Attiva</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Bottom glow line */}
                  <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${phase.color} opacity-0 ${
                    activePhase === index ? 'opacity-100' : ''
                  } transition-opacity`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-gray-900 to-black border border-yellow-600/30 rounded-xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">Pronto per l'Addestramento?</h3>
            <p className="text-gray-300 mb-6">
              Inizia il tuo percorso da spartano del trading. La disciplina di ferro ti aspetta.
            </p>
            <button 
              onClick={() => navigate('/register')}
              className="bg-gradient-to-r from-red-800 to-red-600 px-8 py-4 rounded-lg font-bold hover:from-red-700 hover:to-red-500 transition-all duration-300 transform hover:scale-105">
              INIZIA L'AGOGE
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LAddestramento;