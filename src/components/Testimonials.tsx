import React, { useState } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Testimonials = () => {
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const testimonialsPerPage = 3;
  
  const testimonials = [
    {
      name: "Daniele",
      role: "POSTE ITALIANE",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
      certificate: "/testimonials/daniele-ftmo.jpg",
      quote: "Grazie a Fury of Sparta ho superato l'intero FTMO Evaluation Process! La disciplina spartana del bot mi ha permesso di completare sia la FTMO Challenge che la Verification, raggiungendo tutti gli obiettivi di trading richiesti. Un trading avanzato e costante che ha portato risultati concreti. Certificato FTMO ottenuto!",
      rating: 5,
      profit: "FTMO Verified"
    },
    {
      name: "Daniel",
      role: "Lavoratore Autonomo",
      image: "/testimonials/daniel-photo.jpg",
      certificate: "/testimonials/daniel-fundednext.jpg",
      quote: "Con Fury of Sparta sono diventato ufficialmente un FundedNext 'ELITE TRADER'! La strategia del bot è impeccabile: esecuzione perfetta, gestione del rischio rigorosa e disciplina assoluta. Le competenze acquisite mi permettono ora di operare come trader professionista nei mercati ad alta frequenza. Un risultato straordinario!",
      rating: 5,
      profit: "Elite Trader"
    },
    {
      name: "Vitantonio",
      role: "Pensionato",
      image: "/testimonials/vitantonio-photo.jpg",
      certificate: "/testimonials/vitantonio-ftmo.jpg",
      quote: "A 65 anni ho scoperto una nuova passione grazie a Fury of Sparta! Il bot mi ha guidato con precisione militare attraverso la FTMO Challenge. La sua disciplina ferrea e la gestione del rischio impeccabile mi hanno permesso di superare tutte le fasi. Mai avrei pensato di diventare un trader certificato FTMO in pensione!",
      rating: 5,
      profit: "FTMO Passed"
    },
    {
      name: "Giuliano",
      role: "Impiegato",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
      certificates: [
        "/testimonials/giuliano-propnumberone-1.jpg",
        "/testimonials/giuliano-propnumberone-2.jpg"
      ],
      quote: "Grazie alla Spartan Codex Academy ho superato ben 2 challenge PropNumberOne! La formazione ricevuta e la disciplina spartana mi hanno permesso di raggiungere obiettivi che sembravano impossibili. Due account finanziati, due successi consecutivi. Un percorso formativo che cambia davvero la vita!",
      rating: 5,
      profit: "2x Prop Funded"
    },
    {
      name: "Luana",
      role: "Estetista",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      certificate: "/testimonials/luana-propnumberone.jpg",
      quote: "Grazie alla Spartan Codex Academy ho superato la Fase 2 della sfida PropNumberOne per un account da 100k! Ho completato tutti i passaggi richiesti e ora sono pronta per diventare un Trader Finanziato con la Proposta Numero Uno. Un traguardo incredibile che sembrava impossibile!",
      rating: 5,
      profit: "100K Funded"
    },
    {
      name: "Francesco",
      role: "Trader Intermedio",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop",
      certificate: "/testimonials/francesco-acceleration.jpg",
      quote: "Grazie alla Spartan Codex Academy sono riuscito ad arrivare in fase Acceleration in pochissimo tempo! La formazione ricevuta e le strategie apprese mi hanno permesso di progredire rapidamente. Profitto mensile previsto: $761.56. Un risultato straordinario che dimostra l'efficacia del metodo spartano!",
      rating: 5,
      profit: "Acceleration Phase"
    },
    {
      name: "Fabiano",
      role: "Ex Falegname",
      image: "/testimonials/fabiano-photo.jpg",
      certificate: "/testimonials/fabiano-axi-gold.jpg",
      quote: "Grazie alla Spartan Codex Academy sono arrivato direttamente in fase Gold su Axi Select! Edge Score 91/100, equity $21,408.73 e performance del 7.04%. Da falegname a trader professionista: un percorso incredibile che ha cambiato completamente la mia vita. La disciplina spartana funziona davvero!",
      rating: 5,
      profit: "Axi Gold Phase"
    },
    {
      name: "Mirco",
      role: "Commerciante",
      image: "/testimonials/mirco-photo.jpg",
      certificate: "/testimonials/mirco-axi-acceleration.jpg",
      quote: "Grazie alla Spartan Codex Academy sono arrivato alla fase Acceleration su Axi Select! Edge Score 81/100, equity $1606.38 e profitto mensile $305.72. Gestisco un negozio e la formazione ricevuta mi ha permesso di diventare trader mentre lavoro. Un risultato straordinario!",
      rating: 5,
      profit: "Axi Acceleration"
    },
    {
      name: "Antonio",
      role: "Insegnante",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
      certificate: "/testimonials/antonio-fundednext.jpg",
      quote: "Ho superato la fase di FundedNext con tempi davvero rapidi grazie a Fury of Sparta! Sono ora ufficialmente un FundedNext 'CROWN TRADER'. La disciplina del bot e la strategia impeccabile mi hanno permesso di raggiungere questo traguardo straordinario. Un certificato che testimonia competenze professionali di alto livello!",
      rating: 5,
      profit: "Crown Trader"
    },
    {
      name: "Alice",
      role: "Trader Esperto",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop",
      certificate: "/testimonials/alice-certificate.jpg",
      quote: "Grazie alla Spartan Codex Academy ho superato la challenge con risultati eccezionali! La formazione avanzata e le strategie professionali mi hanno permesso di raggiungere un livello superiore nel trading. La disciplina spartana unita alla mia esperienza ha creato una combinazione vincente. Risultati concreti e certificati!",
      rating: 5,
      profit: "Challenge Passed"
    },
    {
      name: "Alessandro",
      role: "Architetto",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop",
      certificate: "/testimonials/alessandro-ftmo-payout.jpg",
      quote: "Grazie a Fury of Sparta sono riuscito a fare il payout! FTMO Overall Rewards: $5,469.98. La disciplina del bot e la gestione del rischio impeccabile mi hanno permesso di raggiungere questo traguardo straordinario. Un risultato concreto che dimostra l'efficacia del sistema spartano. Payout certificato FTMO!",
      rating: 5,
      profit: "$5,469 Payout"
    }
  ];

  const totalPages = Math.ceil(testimonials.length / testimonialsPerPage);
  
  const nextSlide = () => {
    if (isAnimating) return;
    setDirection('right');
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % totalPages);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    setDirection('left');
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const visibleTestimonials = testimonials.slice(
    currentIndex * testimonialsPerPage,
    (currentIndex + 1) * testimonialsPerPage
  );

  return (
    <section id="veterani" className={`py-20 transition-colors duration-500 ${
      theme === 'dark'
        ? 'bg-gradient-to-b from-black to-red-950/20'
        : 'bg-gradient-to-b from-white to-red-50/40'
    }`}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-600/20 to-red-600/20 px-4 py-2 rounded-full border border-yellow-600/30 mb-6">
            <Quote className="w-4 h-4 text-yellow-500" />
            <span className="text-yellow-400 text-sm font-medium">STORIE DI GLORIA</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>I </span>
            <span className="bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent">VETERANI</span>
            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}> PARLANO</span>
          </h2>
          <p className={`text-xl max-w-3xl mx-auto leading-relaxed ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Le testimonianze di chi ha già abbracciato la disciplina spartana e conquistato i mercati
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative max-w-7xl mx-auto">
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-3 rounded-full border-2 transition-all duration-300 hover:scale-110 ${
              theme === 'dark'
                ? 'bg-black/80 border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/20'
                : 'bg-white/80 border-yellow-600/50 text-yellow-600 hover:bg-yellow-50'
            }`}
            aria-label="Testimonianza precedente"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextSlide}
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-3 rounded-full border-2 transition-all duration-300 hover:scale-110 ${
              theme === 'dark'
                ? 'bg-black/80 border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/20'
                : 'bg-white/80 border-yellow-600/50 text-yellow-600 hover:bg-yellow-50'
            }`}
            aria-label="Testimonianza successiva"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Testimonials Grid */}
          <div className="overflow-hidden">
            <div 
              className={`grid md:grid-cols-2 lg:grid-cols-3 gap-8 transition-transform duration-600 ease-out ${
                direction === 'right' ? 'animate-slideInRight' : 'animate-slideInLeft'
              }`}
              key={currentIndex}
            >
              {visibleTestimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className={`border border-yellow-600/30 rounded-xl p-8 hover:border-yellow-500/50 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-yellow-600/20 ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-gray-900 to-black'
                  : 'bg-gradient-to-br from-white to-gray-50'
              }`}
              >
              {/* Header */}
              <div className="flex items-center space-x-4 mb-6">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full border-2 border-yellow-500"
                />
                <div>
                  <h3 className={`text-lg font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>{testimonial.name}</h3>
                  <p className="text-yellow-400 text-sm">{testimonial.role}</p>
                </div>
              </div>

              {/* Stars */}
              <div className="flex space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, starIndex) => (
                  <Star key={starIndex} className="w-5 h-5 text-yellow-500 fill-current" />
                ))}
              </div>

              {/* Certificate Image (if exists) */}
              {testimonial.certificate && (
                <div className="mb-4">
                  <img 
                    src={testimonial.certificate} 
                    alt={`Certificato ${testimonial.name}`}
                    className="w-full rounded-lg border border-yellow-500/30 shadow-lg"
                  />
                </div>
              )}

              {/* Multiple Certificates (if exists) */}
              {testimonial.certificates && (
                <div className="mb-4 grid grid-cols-2 gap-2">
                  {testimonial.certificates.map((cert, certIndex) => (
                    <img 
                      key={certIndex}
                      src={cert} 
                      alt={`Certificato ${testimonial.name} ${certIndex + 1}`}
                      className="w-full rounded-lg border border-yellow-500/30 shadow-lg"
                    />
                  ))}
                </div>
              )}

              {/* Quote */}
              <blockquote className={`mb-6 leading-relaxed italic ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                "{testimonial.quote}"
              </blockquote>

              {/* Profit Badge */}
              <div className="inline-flex items-center bg-gradient-to-r from-green-600/20 to-green-400/20 px-4 py-2 rounded-full border border-green-500/30">
                <span className="text-green-400 font-bold">{testimonial.profit}</span>
                <span className="text-green-300 text-sm ml-2">Profitto</span>
              </div>
            </div>
          ))}
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-yellow-500 w-8'
                    : theme === 'dark'
                    ? 'bg-gray-600 hover:bg-gray-500'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Vai alla pagina ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {
            [
              { number: "100+", label: "Utenti Attivi" },
              { number: "€500K+", label: "Volume Gestito" },
              { number: "95%", label: "Soddisfazione Clienti" },
              { number: "24/7", label: "Operatività Continua" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-yellow-500 mb-2">{stat.number}</div>
                <div className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>{stat.label}</div>
              </div>
            ))
          }
        </div>
      </div>
    </section>
  );
};

export default Testimonials;