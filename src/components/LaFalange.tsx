import React, { useState } from 'react';
import { Shield, Swords, Target, BarChart3, Flame, Zap, Crown, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const LaFalange = () => {
  const { theme } = useTheme();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const features = [
    {
      icon: Shield,
      title: "Bot Trading d'Elite",
      subtitle: "Algoritmi di Guerra per Mercati Volatili",
      description: "Una collezione di bot trading automatici, ognuno specializzato in diverse strategie: scalping, swing trading, hedging. Ogni bot è un guerriero specializzato.",
      benefits: ["15+ Bot Specializzati", "Trading 24/7 Automatico", "Strategie Diversificate"],
      color: "from-red-600 to-orange-600",
      glowColor: "shadow-red-500/50"
    },
    {
      icon: Crown,
      title: "Formazioni Premium",
      subtitle: "Accademia Spartana per Trader d'Elite",
      description: "Corsi completi da zero a esperto, strategie proprietarie, mentoring personalizzato. Trasformiamo principianti in guerrieri dei mercati con formazione strutturata.",
      benefits: ["10+ Corsi Completi", "Mentoring 1-on-1", "Community Esclusiva"],
      color: "from-yellow-600 to-amber-600",
      glowColor: "shadow-yellow-500/50"
    },
    {
      icon: Target,
      title: "Indicatori Professionali",
      subtitle: "Strumenti di Analisi Avanzata",
      description: "Indicatori custom per MT4/MT5, TradingView. Ogni indicatore è stato testato in battaglia reale sui mercati e perfezionato per massima precisione.",
      benefits: ["20+ Indicatori Custom", "Multi-Piattaforma", "Segnali in Tempo Reale"],
      color: "from-purple-600 to-pink-600",
      glowColor: "shadow-purple-500/50"
    },
    {
      icon: BarChart3,
      title: "Servizi & Segnali VIP",
      subtitle: "Supporto Elite e Segnali Premium",
      description: "Copy trading, segnali VIP, analisi giornaliere, supporto dedicato. Un intero team di esperti che combatte al tuo fianco nei mercati.",
      benefits: ["Segnali VIP Giornalieri", "Copy Trading", "Supporto Prioritario"],
      color: "from-blue-600 to-cyan-600",
      glowColor: "shadow-blue-500/50"
    }
  ];

  return (
    <section id="falange" className={`py-20 relative overflow-hidden ${
      theme === 'dark' ? 'bg-gradient-to-b from-black to-red-950/10' : 'bg-gradient-to-b from-white to-red-50/30'
    }`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-600/20 to-red-600/20 px-4 py-2 rounded-full border border-yellow-600/30 mb-6">
            <Swords className="w-4 h-4 text-yellow-500" />
            <span className="text-yellow-400 text-sm font-medium">IL NOSTRO ARSENALE</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-white">LA </span>
            <span className="bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent">FALANGE</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            I quattro pilastri che rendono il nostro arsenale di bot, formazioni e indicatori 
            le armi più potenti per dominare i mercati finanziari
          </p>
        </div>

        {/* Features Grid with Epic Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto relative z-10">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className={`relative overflow-hidden bg-gradient-to-br ${
                theme === 'dark' ? 'from-gray-900 to-black' : 'from-gray-100 to-white'
              } border-2 border-yellow-600/30 rounded-2xl p-8 transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 ${
                hoveredIndex === index ? `shadow-2xl ${feature.glowColor}` : 'shadow-lg'
              }`}>
                {/* Animated Glow Background */}
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                {/* Top shine effect */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                {/* Icon with Epic Effects */}
                <div className={`relative w-20 h-20 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 shadow-lg ${feature.glowColor}`}>
                  <div className="absolute inset-0 bg-yellow-400/20 blur-xl group-hover:blur-2xl transition-all"></div>
                  <feature.icon className="relative z-10 w-10 h-10 text-white drop-shadow-lg" />
                  <Flame className="absolute -top-2 -right-2 w-5 h-5 text-orange-500 opacity-0 group-hover:opacity-100 animate-fire transition-opacity" />
                </div>

                {/* Content with Animations */}
                <h3 className={`text-2xl font-black mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                } group-hover:text-yellow-500 transition-colors`}>{feature.title}</h3>
                <h4 className="text-yellow-500 font-bold mb-4 text-sm uppercase tracking-wider">{feature.subtitle}</h4>
                <p className={`mb-6 leading-relaxed ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>{feature.description}</p>

                {/* Benefits with Check Icons */}
                <div className="space-y-3">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <div 
                      key={benefitIndex} 
                      className="flex items-center space-x-3 group/benefit"
                      style={{ animationDelay: `${benefitIndex * 100}ms` }}
                    >
                      <div className={`w-6 h-6 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center flex-shrink-0 group-hover/benefit:scale-125 transition-transform`}>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                      <span className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      } group-hover/benefit:text-yellow-500 transition-colors`}>{benefit}</span>
                    </div>
                  ))}
                </div>
                
                {/* Bottom glow line */}
                <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Quote */}
        <div className="mt-16 text-center">
          <div className="max-w-4xl mx-auto p-8 border-l-4 border-yellow-600 bg-gradient-to-r from-yellow-600/10 to-transparent rounded-r-lg">
            <blockquote className="text-xl italic text-gray-300 mb-4">
              "Come gli antichi spartani dominavano con lance, scudi e strategie, 
              oggi dominiamo i mercati con bot automatici, formazioni d'elite e indicatori di precisione. 
              Un arsenale completo per ogni battaglia finanziaria."
            </blockquote>
            <cite className="text-yellow-500 font-medium">- L'Arsenale del Trader Spartano</cite>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LaFalange;