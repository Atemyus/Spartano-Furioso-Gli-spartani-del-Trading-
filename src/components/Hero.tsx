import React, { useEffect, useState } from 'react';
import { Shield, TrendingUp, Users, Sparkles, BarChart3, Cpu, Beaker, ArrowRight, Play, Atom } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import HologramSphere from './HologramSphere';
import NeonCracks from './NeonCracks';

const Hero = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section className={`min-h-screen relative overflow-hidden pt-24 transition-colors duration-500 ${
      theme === 'dark' ? 'bg-black' : 'bg-white'
    }`}>
      {/* Background */}
      <div className="absolute inset-0">
        <div className={`absolute inset-0 ${
          theme === 'dark'
            ? 'bg-gradient-to-b from-blue-950/40 via-black to-black'
            : 'bg-gradient-to-b from-blue-50/40 via-white to-white'
        }`}></div>

        {/* Scanlines / lab grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-pulse"></div>
          <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse delay-300"></div>
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse delay-500"></div>
          <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse delay-700"></div>
        </div>

        {/* Geometric lab patterns */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-24 left-10 w-32 h-32 border border-cyan-500/40 rotate-45 animate-spin-slow">
            <div className="absolute inset-4 border border-blue-500/30"></div>
          </div>
          <div className="absolute top-40 right-20 w-24 h-24 border border-cyan-500/40 rotate-12 animate-spin-slow">
            <Atom className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-cyan-400" />
          </div>
          <div className="absolute bottom-24 left-1/3 w-40 h-40 border border-blue-500/30 -rotate-12 animate-spin-slow">
            <Beaker className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-cyan-400" />
          </div>
          <div className="absolute bottom-32 right-1/4 w-28 h-28 border border-cyan-500/40 rotate-90 animate-spin-slow">
            <BarChart3 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-400" />
          </div>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-cyan-400/40 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            ></div>
          ))}
        </div>

        {/* Bottom haze */}
        <div className={`absolute bottom-0 left-0 w-full h-1/3 ${
          theme === 'dark'
            ? 'bg-gradient-to-t from-blue-950/30 via-transparent to-transparent'
            : 'bg-gradient-to-t from-blue-100/30 via-transparent to-transparent'
        }`}></div>

        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>

        {/* Reticolo di crepe neon (riveste le aree vuote) */}
        <NeonCracks
          className="absolute inset-0"
          density="medium"
          intensity={theme === 'dark' ? 0.75 : 0.35}
          interactive
        />

        {/* Ologramma 3D centrale (centerpiece) */}
        <HologramSphere
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] md:w-[46rem] md:h-[46rem] lg:w-[56rem] lg:h-[56rem]"
          detail="high"
          interactive
          intensity={theme === 'dark' ? 0.85 : 0.6}
        />
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          {/* Lab Badge */}
          <div className={`inline-flex items-center gap-3 bg-gradient-to-r from-blue-900/40 to-cyan-600/30 px-5 py-2.5 rounded-full border border-cyan-500/40 mb-10 backdrop-blur-sm transform transition-all duration-1000 ${
            isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'
          }`}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="font-mono-lab text-cyan-300 font-medium tracking-[0.2em] text-xs uppercase">
              // Nexora Lab · Modern Income Engine
            </span>
          </div>

          {/* Main Title */}
          <div className="mb-8">
            <div className="flex justify-center items-center gap-3 mb-6">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-cyan-500"></div>
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-cyan-500"></div>
            </div>

            <h1 className="relative font-display">
              <div className={`text-6xl md:text-8xl lg:text-9xl font-bold mb-2 transform transition-all duration-1000 delay-300 tracking-tight ${
                isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
              }`}>
                <span className="relative inline-block">
                  <span className="absolute inset-0 text-blue-900 blur-2xl">NEXORA</span>
                  <span className="absolute inset-0 text-blue-700 blur-md">NEXORA</span>
                  <span className="relative bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                    NEXORA
                  </span>
                </span>
              </div>

              <div className={`text-7xl md:text-9xl lg:text-[10rem] font-bold -mt-4 md:-mt-6 transform transition-all duration-1000 delay-500 tracking-tight ${
                isLoaded ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-50'
              }`}>
                <span className="relative inline-block">
                  <span className="absolute inset-0 text-cyan-600 blur-2xl animate-pulse">LAB</span>
                  <span className="absolute inset-0 text-blue-600 blur-lg animate-pulse delay-75">LAB</span>
                  <span className={`relative ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`} style={{
                    textShadow: '0 0 30px rgba(59, 130, 246, 0.7), 0 0 60px rgba(34, 211, 238, 0.4)'
                  }}>
                    LAB
                  </span>
                </span>
              </div>
            </h1>

            {/* Tagline */}
            <div className={`mt-10 transform transition-all duration-1000 delay-700 ${
              isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <p className="font-display text-2xl md:text-3xl font-medium text-cyan-300 tracking-tight">
                L'ecosistema dei nuovi metodi di guadagno digitale
              </p>
              <div className="flex justify-center items-center gap-2 mt-3">
                <div className="w-20 h-px bg-gradient-to-r from-transparent to-cyan-500"></div>
                <Atom className="w-5 h-5 text-cyan-500" />
                <div className="w-20 h-px bg-gradient-to-l from-transparent to-cyan-500"></div>
              </div>
            </div>
          </div>

          {/* Subtitle */}
          <p className={`text-lg md:text-xl mb-12 leading-relaxed max-w-3xl mx-auto ${
            theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Una piattaforma, due grandi pilastri.{' '}
            <strong className="text-cyan-400">Trading & Investimenti</strong> e{' '}
            <strong className="text-blue-400">Creator Economy</strong>: strumenti, formazione
            e community per costruire reddito digitale in modo professionale e ripetibile.
          </p>

          {/* Two pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 max-w-3xl mx-auto">
            {[
              {
                icon: TrendingUp,
                tag: '01 / Trading',
                title: 'Trading & Investimenti',
                desc: 'Bot automatici, analisi, segnali e formazione per i mercati finanziari.',
              },
              {
                icon: Sparkles,
                tag: '02 / Creator',
                title: 'Creator Economy',
                desc: 'Monetizzazione contenuti, brand personale, prodotti digitali e community.',
              },
            ].map((pillar, i) => (
              <div key={i} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className={`relative border rounded-xl p-5 text-left h-full transition-all duration-300 group-hover:border-cyan-400 group-hover:-translate-y-1 ${
                  theme === 'dark'
                    ? 'bg-slate-900/40 border-slate-700/60 backdrop-blur-sm'
                    : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                      <pillar.icon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <span className="font-mono-lab text-xs text-cyan-500 tracking-widest">{pillar.tag}</span>
                  </div>
                  <h3 className={`font-display text-lg font-semibold mb-1 ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}>
                    {pillar.title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    {pillar.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Lab Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { icon: Cpu, value: '15+', label: 'Tool & Bot' },
              { icon: Shield, value: '10+', label: 'Percorsi formativi' },
              { icon: Users, value: '500+', label: 'Membri attivi' },
              { icon: Beaker, value: '24/7', label: 'Lab support' }
            ].map((stat, index) => (
              <div key={index} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent rounded-lg blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className={`relative border rounded-lg p-4 transition-all duration-300 group-hover:border-cyan-400 group-hover:-translate-y-1 ${
                  theme === 'dark'
                    ? 'bg-slate-900/40 border-slate-700/60 backdrop-blur-sm'
                    : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <stat.icon className="w-7 h-7 text-cyan-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="font-display text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className={`font-mono-lab text-[0.7rem] tracking-widest uppercase mt-1 ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button
              onClick={() => navigate('/register')}
              className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-4 font-display font-semibold text-base tracking-wide transition-all duration-300 transform hover:-translate-y-0.5 shadow-xl shadow-blue-500/30 hover:shadow-cyan-500/40 rounded-lg text-white">
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-white/20 to-cyan-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
              <span className="relative z-10 flex items-center gap-2">
                Entra in Nexora Lab
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>

            <button
              onClick={() => navigate('/la-falange')}
              className={`group relative overflow-hidden border px-8 py-4 font-display font-semibold text-base tracking-wide transition-all duration-300 transform hover:-translate-y-0.5 rounded-lg ${
                theme === 'dark'
                  ? 'border-cyan-500/40 bg-slate-900/40 text-cyan-300 hover:bg-slate-900/70 hover:border-cyan-400'
                  : 'border-cyan-500/40 bg-white text-cyan-700 hover:bg-slate-50 hover:border-cyan-500'
              }`}>
              <span className="relative z-10 flex items-center gap-2">
                <Play className="w-4 h-4" />
                Esplora la piattaforma
              </span>
            </button>
          </div>

          {/* Lab Manifesto */}
          <div className="mb-8">
            <p className="font-mono-lab text-xs md:text-sm text-cyan-500 tracking-[0.3em] uppercase">
              build · learn · earn · repeat
            </p>
          </div>

          {/* Quote */}
          <div className={`mt-16 p-6 border-l-2 border-cyan-500 rounded-r-lg backdrop-blur-sm ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-cyan-500/5 to-transparent'
              : 'bg-gradient-to-r from-cyan-50 to-transparent'
          }`}>
            <blockquote className={`text-base md:text-lg italic ${
              theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
            }`}>
              "Il futuro del reddito non è un singolo lavoro: è un sistema. Nexora Lab è
              il laboratorio dove costruisci il tuo, combinando trading professionale e
              creator economy con strumenti che funzionano davvero."
            </blockquote>
            <cite className="font-mono-lab text-cyan-500 text-xs tracking-widest mt-3 block">
              — Nexora Lab · Manifesto
            </cite>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-cyan-500 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-cyan-500 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
