import React, { useState } from 'react';
import { LineChart, GraduationCap, Sparkles, Users, CheckCircle2, Cpu, Mic2, Briefcase } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import HologramSphere from './HologramSphere';

const LaFalange = () => {
  const { theme } = useTheme();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const features = [
    {
      icon: Cpu,
      tag: '01 / Trading',
      title: 'Trading Lab',
      subtitle: 'Bot automatici · Indicatori · Analisi',
      description: 'Il modulo finanziario di Nexora Lab: una suite di bot per MT4/MT5, indicatori custom e analisi di mercato pensata per chi vuole automatizzare e professionalizzare il proprio approccio ai mercati.',
      benefits: ['15+ bot e tool', 'Backtest e ottimizzazione', 'Risk management integrato'],
      color: 'from-blue-500 to-cyan-500',
      glowColor: 'shadow-cyan-500/30',
    },
    {
      icon: GraduationCap,
      tag: '02 / Academy',
      title: 'Academy',
      subtitle: 'Percorsi formativi · Mentoring · Certificazioni',
      description: 'Programmi strutturati su trading e creator economy: dalle basi alle strategie avanzate, con video, esercizi e mentoring 1-on-1 per misurare progressi reali.',
      benefits: ['Percorsi step-by-step', 'Mentoring 1-on-1', 'Community studenti'],
      color: 'from-cyan-500 to-sky-500',
      glowColor: 'shadow-cyan-500/30',
    },
    {
      icon: Mic2,
      tag: '03 / Creator',
      title: 'Creator Studio',
      subtitle: 'Contenuti · Personal brand · Monetizzazione',
      description: 'Strumenti e playbook per costruire un brand personale online: dal posizionamento alla creazione di contenuti, fino ai modelli di monetizzazione (sponsor, prodotti digitali, membership).',
      benefits: ['Framework brand & content', 'Pipeline monetizzazione', 'Template e prompt pronti'],
      color: 'from-blue-500 to-indigo-500',
      glowColor: 'shadow-blue-500/30',
    },
    {
      icon: Briefcase,
      tag: '04 / Operations',
      title: 'Operations Suite',
      subtitle: 'Segnali · Copy · Supporto operativo',
      description: 'L\'infrastruttura operativa: segnali curati, copy trading, dashboard di monitoraggio e supporto dedicato per chi vuole eseguire senza perdere tempo in setup.',
      benefits: ['Segnali quotidiani', 'Copy trading verificato', 'Supporto prioritario'],
      color: 'from-sky-500 to-blue-500',
      glowColor: 'shadow-sky-500/30',
    },
  ];

  return (
    <section id="falange" className={`py-24 relative overflow-hidden ${
      theme === 'dark' ? 'bg-gradient-to-b from-black to-blue-950/10' : 'bg-gradient-to-b from-white to-blue-50/30'
    }`}>
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>
      <HologramSphere
        className="absolute -top-20 -right-24 w-[28rem] h-[28rem] hidden md:block"
        detail="low"
        speed={0.8}
        intensity={theme === 'dark' ? 0.5 : 0.35}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 px-4 py-1.5 rounded-full border border-cyan-500/30 mb-6 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono-lab text-xs text-cyan-300 tracking-[0.25em] uppercase">// La Piattaforma</span>
          </div>
          <h2 className={`font-display text-4xl md:text-6xl font-bold mb-6 tracking-tight ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}>
            Quattro moduli, <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">un solo lab</span>
          </h2>
          <p className={`text-lg md:text-xl max-w-3xl mx-auto leading-relaxed ${
            theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Nexora Lab non è un singolo prodotto: è una piattaforma modulare che unisce trading e
            creator economy con strumenti, formazione e supporto operativo. Scegli il modulo, costruisci
            il tuo sistema di reddito.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className={`relative overflow-hidden border rounded-2xl p-7 h-full transition-all duration-500 transform hover:-translate-y-1 ${
                theme === 'dark'
                  ? 'bg-slate-900/60 border-slate-700/60 backdrop-blur-sm hover:border-cyan-400'
                  : 'bg-white border-slate-200 hover:border-cyan-400 shadow-sm'
              } ${hoveredIndex === index ? `shadow-2xl ${feature.glowColor}` : 'shadow-md'}`}>

                {/* Top shine on hover */}
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                {/* Icon and tag */}
                <div className="flex items-start justify-between mb-5">
                  <div className={`relative w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center shadow-lg ${feature.glowColor} group-hover:scale-110 transition-transform duration-500`}>
                    <div className="absolute inset-0 bg-cyan-400/20 blur-xl"></div>
                    <feature.icon className="relative z-10 w-7 h-7 text-white" />
                  </div>
                  <span className="font-mono-lab text-xs text-cyan-500 tracking-widest pt-1">
                    {feature.tag}
                  </span>
                </div>

                {/* Content */}
                <h3 className={`font-display text-2xl font-semibold mb-1 tracking-tight ${
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                } group-hover:text-cyan-400 transition-colors`}>
                  {feature.title}
                </h3>
                <h4 className={`text-sm font-medium mb-4 ${
                  theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'
                }`}>
                  {feature.subtitle}
                </h4>
                <p className={`mb-6 leading-relaxed text-sm ${
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  {feature.description}
                </p>

                {/* Benefits */}
                <div className="space-y-2.5">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                      <span className={`text-sm ${
                        theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                      }`}>{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* Bottom glow line on hover */}
                <div className={`absolute bottom-0 left-0 w-full h-px bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Quote */}
        <div className="mt-16 text-center">
          <div className={`max-w-4xl mx-auto p-8 border-l-2 border-cyan-500 rounded-r-lg ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-cyan-500/5 to-transparent'
              : 'bg-gradient-to-r from-cyan-50 to-transparent'
          }`}>
            <blockquote className={`text-base md:text-lg italic mb-3 ${
              theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
            }`}>
              "Il futuro del reddito non è specializzazione estrema, è composizione: un trader che sa
              monetizzare la propria voce, un creator che sa investire i propri ricavi. Nexora Lab è
              il punto in cui questi due mondi si incontrano."
            </blockquote>
            <cite className="font-mono-lab text-cyan-500 text-xs tracking-widest">— Nexora Lab · Vision</cite>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LaFalange;
