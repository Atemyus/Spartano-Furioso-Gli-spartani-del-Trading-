import { ArrowUp, Cpu, Sparkles, BookOpen, Instagram, Send, ChevronRight, Award, Users, TrendingUp, Zap, ArrowRight, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';
import NewsletterForm from './NewsletterForm';
import { useTheme } from '../contexts/ThemeContext';

const Footer = () => {
  const { theme } = useTheme();

  const stats = [
    { icon: Users, value: '500+', label: 'Membri attivi' },
    { icon: TrendingUp, value: '€500K+', label: 'Volume gestito' },
    { icon: Award, value: '95%', label: 'Soddisfazione' },
    { icon: Zap, value: '24/7', label: 'Lab operativo' }
  ];

  const socialLinks = [
    { icon: Send, href: 'https://t.me/nexoraLabSolutions', label: 'Telegram', color: 'hover:bg-blue-500', isCustom: false },
    { icon: Instagram, href: 'https://www.instagram.com/nexoralabsolutions/', label: 'Instagram', color: 'hover:bg-gradient-to-br hover:from-purple-600 hover:to-indigo-600', isCustom: false },
    { icon: Facebook, href: 'https://www.facebook.com/profile.php?id=61583546939980', label: 'Facebook', color: 'hover:bg-blue-600', isCustom: false }
  ];

  return (
    <footer className={`relative overflow-hidden border-t-4 border-blue-800 transition-colors duration-500 ${
      theme === 'dark'
        ? 'bg-gradient-to-b from-black via-gray-950 to-black'
        : 'bg-gradient-to-b from-white via-gray-50 to-white'
    }`}>
      {/* Animated Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSI0MCIgZmlsbD0iI2ZmZmZmZjA1Ii8+PHJlY3QgeD0iMzkiIHdpZHRoPSIxIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZmZmZmZmMDUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-10"></div>
        <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse ${
          theme === 'dark' ? 'bg-blue-900/10' : 'bg-blue-100/30'
        }`}></div>
        <div className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000 ${
          theme === 'dark' ? 'bg-cyan-900/10' : 'bg-cyan-100/30'
        }`}></div>
      </div>

      {/* Newsletter Section */}
      <div className={`relative z-10 border-b ${
        theme === 'dark' ? 'border-blue-900/30' : 'border-blue-200'
      }`}>
        <div className="container mx-auto px-4 py-12">
          <div className={`backdrop-blur-sm rounded-2xl p-8 border ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-blue-950/50 via-black/50 to-blue-950/50 border-blue-800/30'
              : 'bg-gradient-to-r from-blue-50/80 via-white/80 to-blue-50/80 border-blue-200'
          }`}>
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="text-center lg:text-left">
                <span className="font-mono-lab text-xs text-cyan-400 tracking-[0.25em] uppercase">// Lab Brief</span>
                <h3 className={`font-display text-2xl md:text-3xl font-semibold mt-1 mb-2 tracking-tight ${
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                }`}>
                  Insight settimanali su trading e creator economy
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                  Una mail a settimana, niente spam: setup operativi, framework e cose che funzionano.
                </p>
              </div>

              <NewsletterForm source="footer" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className={`relative z-10 py-12 border-b ${
        theme === 'dark' ? 'border-blue-900/30' : 'border-blue-200'
      }`}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl mb-3 group-hover:scale-110 transition-transform duration-300 ${
                    theme === 'dark'
                      ? 'bg-gradient-to-br from-blue-900/30 to-cyan-900/30'
                      : 'bg-gradient-to-br from-blue-100 to-cyan-100'
                  }`}>
                    <Icon className="w-8 h-8 text-cyan-500" />
                  </div>
                  <div className={`font-display text-3xl font-bold mb-1 bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent`}>{stat.value}</div>
                  <div className={`font-mono-lab text-[0.7rem] uppercase tracking-widest ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                  }`}>{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="mb-8 group">
              <div className="relative inline-block transform group-hover:scale-[1.03] transition-transform duration-300">
                <div className="absolute inset-0 bg-cyan-500/15 blur-2xl rounded-full"></div>
                <div className={`relative z-10 inline-block transition-colors duration-300 ${
                  theme === 'light'
                    ? 'bg-slate-900 rounded-xl px-4 py-2 shadow-md shadow-slate-900/10 ring-1 ring-slate-800/10'
                    : ''
                }`}>
                  <img
                    src="/logo.png"
                    alt="Nexora Lab"
                    className="h-14 md:h-16 lg:h-20 w-auto object-contain"
                  />
                </div>
              </div>
            </div>

            <p className={`leading-relaxed mb-8 max-w-md ${
              theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
            }`}>
              L'ecosistema italiano per costruire reddito digitale moderno. Trading professionale,
              creator economy, formazione e operazioni in un unico lab.
              <span className="block mt-2 font-mono-lab text-xs text-cyan-500 tracking-widest uppercase">// build · learn · earn · repeat</span>
            </p>

            {/* Social Links */}
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={`group relative w-12 h-12 border rounded-xl flex items-center justify-center transition-all duration-300 hover:border-cyan-500 ${social.color} overflow-hidden ${
                      theme === 'dark'
                        ? 'bg-gray-900/50 border-blue-900/30'
                        : 'bg-white border-blue-200'
                    }`}
                  >
                    {social.isCustom ? (
                      <Icon className="w-5 h-5 text-gray-400 group-hover:text-white relative z-10 transition-colors" />
                    ) : (
                      <Icon className="w-5 h-5 text-gray-400 group-hover:text-white relative z-10 transition-colors" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Navigation Columns */}
          <div>
            <h4 className={`font-mono-lab text-xs font-medium tracking-[0.25em] uppercase mb-5 flex items-center gap-2 ${
              theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'
            }`}>
              <Cpu className="w-3.5 h-3.5" />
              // Trading
            </h4>
            <ul className="space-y-3">
              {[
                { name: 'Strategia', to: '/strategia', hot: true },
                { name: 'Trading Room', to: '/trading-room' },
                { name: 'Formazione', to: '/formazione' },
                { name: 'Segnali', to: '/segnali', hot: true },
                { name: 'Analisi mercati', to: '/analisi' },
                { name: 'Catalogo tool', to: '/products' }
              ].map((link, index) => (
                <li key={index} className="group">
                  <Link 
                    to={link.to} 
                    className={`flex items-center gap-2 transition-all duration-300 ${
                      theme === 'dark'
                        ? 'text-gray-400 hover:text-cyan-500'
                        : 'text-gray-600 hover:text-cyan-600'
                    }`}
                  >
                    <ChevronRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                    {link.name}
                    {link.hot && (
                      <span className="px-2 py-0.5 bg-gradient-to-r from-blue-600 to-sky-600 text-white text-xs rounded-full font-bold animate-pulse">
                        HOT
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className={`font-mono-lab text-xs font-medium tracking-[0.25em] uppercase mb-5 flex items-center gap-2 ${
              theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'
            }`}>
              <Sparkles className="w-3.5 h-3.5" />
              // Risorse
            </h4>
            <ul className="space-y-3">
              {[
                { name: 'Blog', to: '/blog', new: true },
                { name: 'Video tutorial', to: '/video-tutorial' },
                { name: 'Podcast', to: '/podcast', new: true },
                { name: 'Glossario', to: '/glossario' },
                { name: 'Calcolatori', to: '/calcolatori' },
                { name: 'Dashboard', to: '/dashboard' }
              ].map((link, index) => (
                <li key={index} className="group">
                  <Link 
                    to={link.to} 
                    className={`flex items-center gap-2 transition-all duration-300 ${
                      theme === 'dark'
                        ? 'text-gray-400 hover:text-cyan-500'
                        : 'text-gray-600 hover:text-cyan-600'
                    }`}
                  >
                    <ChevronRight className="w-4 h-4 text-cyan-600 group-hover:translate-x-1 transition-transform" />
                    {link.name}
                    {link.new && (
                      <span className="px-2 py-0.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs rounded-full font-bold">
                        NEW
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className={`font-mono-lab text-xs font-medium tracking-[0.25em] uppercase mb-5 flex items-center gap-2 ${
              theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'
            }`}>
              <BookOpen className="w-3.5 h-3.5" />
              // Supporto
            </h4>
            <ul className="space-y-3">
              {[
                { name: 'Centro aiuto', to: '/centro-aiuto' },
                { name: 'FAQ', to: '/faq' },
                { name: 'Contatti', to: '/contatto' },
                { name: 'Partnership', to: '/partnership' },
                { name: 'Affiliazione', to: '/affiliazione' }
              ].map((link, index) => (
                <li key={index} className="group">
                  <Link 
                    to={link.to} 
                    className={`flex items-center gap-2 transition-all duration-300 ${
                      theme === 'dark'
                        ? 'text-gray-400 hover:text-cyan-500'
                        : 'text-gray-600 hover:text-cyan-600'
                    }`}
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`border-t mt-16 pt-8 ${
          theme === 'dark' ? 'border-blue-900/30' : 'border-blue-200'
        }`}>
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className={`flex flex-col sm:flex-row items-center gap-4 text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <p className="font-mono-lab text-xs tracking-widest">© 2025 NEXORA LAB</p>
              <span className="hidden sm:block">·</span>
              <p className="font-mono-lab text-xs tracking-widest">Made in Italy</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link to="/legal/privacy" className={`transition-colors duration-300 flex items-center gap-1 ${
                theme === 'dark'
                  ? 'text-gray-400 hover:text-cyan-500'
                  : 'text-gray-600 hover:text-cyan-600'
              }`}>
                Privacy Policy
                <ArrowRight className="w-3 h-3" />
              </Link>
              <Link to="/legal/termini" className={`transition-colors duration-300 flex items-center gap-1 ${
                theme === 'dark'
                  ? 'text-gray-400 hover:text-cyan-500'
                  : 'text-gray-600 hover:text-cyan-600'
              }`}>
                Termini di Servizio
                <ArrowRight className="w-3 h-3" />
              </Link>
              <Link to="/legal/risk-disclaimer" className={`transition-colors duration-300 flex items-center gap-1 ${
                theme === 'dark'
                  ? 'text-gray-400 hover:text-cyan-500'
                  : 'text-gray-600 hover:text-cyan-600'
              }`}>
                Risk Disclaimer
                <ArrowRight className="w-3 h-3" />
              </Link>
              <Link to="/legal/cookie-policy" className={`transition-colors duration-300 flex items-center gap-1 ${
                theme === 'dark'
                  ? 'text-gray-400 hover:text-cyan-500'
                  : 'text-gray-600 hover:text-cyan-600'
              }`}>
                Cookie Policy
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Manifesto Quote */}
        <div className="mt-12 text-center">
          <blockquote className="relative">
            <p className={`italic text-base font-light relative z-10 max-w-2xl mx-auto ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
            }`}>
              "Il futuro del reddito è un sistema modulare. Nexora Lab è il lab dove
              lo costruisci, un modulo alla volta."
            </p>
            <p className="font-mono-lab text-cyan-500 text-xs mt-3 tracking-[0.3em] uppercase">
              — Nexora Lab · Manifesto
            </p>
          </blockquote>
        </div>
      </div>

      {/* Scroll-to-top Badge */}
      <div className="fixed bottom-8 right-8 z-50 hidden xl:block">
        <a
          href="#top"
          className="flex items-center justify-center bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-3 rounded-full shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-shadow"
          aria-label="Torna su"
        >
          <ArrowUp className="w-5 h-5" />
        </a>
      </div>
    </footer>
  );
};

export default Footer;