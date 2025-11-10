import React, { useEffect, useState } from 'react';
import { Sword, Shield, TrendingUp, Users, Flame, Skull, Swords, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

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
      {/* Epic Animated Background */}
      <div className="absolute inset-0">
        {/* Multi-layer gradient background */}
        <div className={`absolute inset-0 ${
          theme === 'dark' 
            ? 'bg-gradient-to-b from-red-950/40 via-black to-black' 
            : 'bg-gradient-to-b from-red-50/40 via-white to-white'
        }`}></div>
        
        {/* Animated diagonal lines */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent animate-pulse"></div>
          <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent animate-pulse delay-300"></div>
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse delay-500"></div>
          <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-600 to-transparent animate-pulse delay-700"></div>
        </div>
        
        {/* Epic Spartan geometric patterns */}
        <div className="absolute top-0 left-0 w-full h-full opacity-40">
          {/* Top left */}
          <div className="absolute top-20 left-10 w-32 h-32 border-4 border-red-800/50 rotate-45 animate-spin-slow">
            <div className="absolute inset-4 border-2 border-yellow-600/30"></div>
          </div>
          {/* Top right */}
          <div className="absolute top-40 right-20 w-24 h-24 border-4 border-yellow-600/50 rotate-12 animate-spin-slow">
            <Shield className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-red-500" />
          </div>
          {/* Bottom left */}
          <div className="absolute bottom-20 left-1/3 w-40 h-40 border-4 border-red-600/30 -rotate-45 animate-spin-slow">
            <Swords className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-yellow-500 rotate-45" />
          </div>
          {/* Bottom right */}
          <div className="absolute bottom-32 right-1/4 w-28 h-28 border-4 border-yellow-500/40 rotate-90 animate-spin-slow">
            <Flame className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-orange-500" />
          </div>
        </div>
        
        {/* Floating particles effect */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-500/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            ></div>
          ))}
        </div>
        
        {/* War smoke effect with gradient */}
        <div className={`absolute bottom-0 left-0 w-full h-1/3 ${
          theme === 'dark'
            ? 'bg-gradient-to-t from-red-950/30 via-transparent to-transparent'
            : 'bg-gradient-to-t from-red-100/30 via-transparent to-transparent'
        }`}></div>
        
        {/* Radial glow effect */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Epic Badge */}
          <div className={`inline-flex items-center space-x-2 bg-gradient-to-r from-red-900/50 to-yellow-600/50 px-6 py-3 rounded-full border-2 border-red-600 mb-12 transform transition-all duration-1000 ${
            isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'
          }`}>
            <Flame className="w-5 h-5 text-yellow-500 animate-pulse" />
            <span className="text-yellow-400 font-black tracking-widest text-sm">L'ARSENALE SPARTANO • TRADING ELITE</span>
            <Skull className="w-5 h-5 text-red-500 animate-pulse" />
          </div>

          {/* EPIC Main Title */}
          <div className="mb-8">
            {/* Decorative top element */}
            <div className="flex justify-center items-center gap-4 mb-4">
              <Swords className="w-8 h-8 text-red-600 rotate-45" />
              <Crown className="w-10 h-10 text-yellow-500" />
              <Swords className="w-8 h-8 text-red-600 -rotate-45" />
            </div>
            
            {/* Main Epic Title */}
            <h1 className="relative">
              {/* SPARTANO */}
              <div className={`text-6xl md:text-8xl lg:text-9xl font-black mb-2 transform transition-all duration-1000 delay-300 ${
                isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
              }`}>
                <span className="relative inline-block">
                  <span className="absolute inset-0 text-red-900 blur-xl">SPARTANO</span>
                  <span className="absolute inset-0 text-red-700 blur-md">SPARTANO</span>
                  <span className="relative bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 bg-clip-text text-transparent animate-gradient">
                    SPARTANO
                  </span>
                </span>
              </div>
              
              {/* FURIOSO */}
              <div className={`text-7xl md:text-9xl lg:text-[10rem] font-black -mt-4 md:-mt-8 transform transition-all duration-1000 delay-500 ${
                isLoaded ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-50'
              }`}>
                <span className="relative inline-block">
                  {/* Fire effect layers */}
                  <span className="absolute inset-0 text-yellow-600 blur-2xl animate-pulse">FURIOSO</span>
                  <span className="absolute inset-0 text-red-600 blur-lg animate-pulse delay-75">FURIOSO</span>
                  <span className="relative text-white" style={{
                    textShadow: '0 0 30px rgba(239, 68, 68, 0.9), 0 0 60px rgba(234, 179, 8, 0.6), 0 0 90px rgba(239, 68, 68, 0.4)'
                  }}>
                    FURIOSO
                  </span>
                  {/* Flame icons around the text */}
                  <Flame className="absolute -top-6 left-0 w-8 h-8 text-orange-500 animate-bounce" />
                  <Flame className="absolute -top-6 right-0 w-8 h-8 text-red-500 animate-bounce delay-150" />
                  <Flame className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-10 h-10 text-yellow-500 animate-bounce delay-300" />
                </span>
              </div>
            </h1>
            
            {/* Subtitle with animation */}
            <div className={`mt-8 transform transition-all duration-1000 delay-700 ${
              isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <p className="text-2xl md:text-3xl font-bold text-red-400 tracking-widest">
                L'ARSENALE COMPLETO PER TRADER SPARTANI
              </p>
              <div className="flex justify-center items-center gap-2 mt-2">
                <div className="w-20 h-0.5 bg-gradient-to-r from-transparent to-yellow-500"></div>
                <Shield className="w-6 h-6 text-yellow-500" />
                <div className="w-20 h-0.5 bg-gradient-to-l from-transparent to-yellow-500"></div>
              </div>
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            <strong className="text-yellow-500">Bot Trading Premium</strong> • <strong className="text-red-500">Formazioni Elite</strong> • <strong className="text-purple-500">Indicatori Pro</strong><br />
            Tutto l'arsenale per dominare i mercati con strategia spartana
          </p>

          {/* Epic Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {[
              { icon: Skull, value: '15+', label: 'BOT & INDICATORI', color: 'text-red-500' },
              { icon: Shield, value: '10+', label: 'CORSI PREMIUM', color: 'text-yellow-500' },
              { icon: Swords, value: '500+', label: 'TRADER SPARTANI', color: 'text-red-600' },
              { icon: Flame, value: '24/7', label: 'SUPPORTO ELITE', color: 'text-orange-500' }
            ].map((stat, index) => (
              <div key={index} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-b from-red-900/20 to-transparent rounded-lg blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className={`relative border rounded-lg p-4 transform hover:scale-110 transition-all duration-300 hover:border-yellow-500 ${
                  theme === 'dark'
                    ? 'bg-black/50 border-red-800/50'
                    : 'bg-white border-red-300 shadow-md'
                }`}>
                  <stat.icon className={`w-10 h-10 ${stat.color} mx-auto mb-2 group-hover:animate-pulse`} />
                  <div className="text-3xl font-black bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-xs font-bold text-red-400 tracking-wider">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Epic CTA Buttons with 3D effects */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            {/* Primary CTA - DIVENTA SPARTANO */}
            <button 
              onClick={() => navigate('/register')}
              className="group relative overflow-hidden bg-gradient-to-r from-red-900 via-red-700 to-red-900 px-10 py-5 font-black text-xl uppercase tracking-wider transition-all duration-300 transform hover:scale-110 hover:-translate-y-2 border-2 border-red-600 shadow-2xl shadow-red-900/50 hover:shadow-red-500/70 rounded-lg">
              {/* Animated glow effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-yellow-600/0 via-yellow-600/60 to-yellow-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
              {/* Top shine effect */}
              <span className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></span>
              {/* Pulsing glow */}
              <span className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-yellow-500 blur-xl transition-opacity duration-300"></span>
              <span className="relative z-10 flex items-center gap-3">
                <Swords className="w-6 h-6 group-hover:rotate-45 group-hover:scale-125 transition-all duration-300" />
                <span className="drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">DIVENTA SPARTANO</span>
                <Flame className="w-6 h-6 animate-fire group-hover:scale-125 transition-transform" />
              </span>
              <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent group-hover:h-2 transition-all duration-300"></span>
            </button>
            
            {/* Secondary CTA - PROVA LA FURIA */}
            <button 
              onClick={() => navigate('/la-falange')}
              className={`group relative overflow-hidden border-2 border-yellow-600 px-10 py-5 font-black text-xl uppercase tracking-wider text-yellow-400 transition-all duration-300 transform hover:scale-110 ${
                theme === 'dark' ? 'bg-black/50' : 'bg-white shadow-lg'
              }`}>
              <span className="absolute inset-0 bg-gradient-to-t from-yellow-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative z-10 flex items-center gap-3">
                <Shield className="w-6 h-6 group-hover:animate-pulse" />
                <span className="group-hover:text-white transition-colors">PROVA LA FURIA</span>
              </span>
              <span className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent group-hover:h-2 transition-all duration-300"></span>
            </button>
          </div>
          
          {/* War Cry Text */}
          <div className="mb-8">
            <p className="text-lg font-bold text-red-500 tracking-widest animate-pulse">
              ⚡ MOLON LABE - VIENI A PRENDERLE ⚡
            </p>
          </div>

          {/* Quote */}
          <div className="mt-16 p-6 border-l-4 border-yellow-600 bg-gradient-to-r from-yellow-600/10 to-transparent rounded-r-lg">
            <blockquote className="text-lg italic text-gray-300">
              "Come i guerrieri spartani, il trading richiede rigore mentale, strategia precisa e resistenza. 
              Fury Of Sparta è il tuo scudo nella battaglia quotidiana contro la volatilità dei mercati."
            </blockquote>
            <cite className="text-yellow-500 font-medium mt-2 block">- Leonida, Re di Sparta (Ispirazione)</cite>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-yellow-600 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-yellow-500 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;