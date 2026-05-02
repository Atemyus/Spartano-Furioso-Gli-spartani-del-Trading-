import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Swords, Flame, Skull, User, LogOut, LayoutDashboard, Mail, Sun, Moon } from 'lucide-react';
import NewsletterForm from './NewsletterForm';
import { useTheme } from '../contexts/ThemeContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Verifica se l'utente è autenticato
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        setIsAuthenticated(true);
        try {
          setUserData(JSON.parse(user));
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      } else {
        setIsAuthenticated(false);
        setUserData(null);
      }
    };

    checkAuth();
    // Ascolta i cambiamenti nel localStorage
    window.addEventListener('storage', checkAuth);
    
    // Controlla ad ogni cambio di route
    checkAuth();
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUserData(null);
    navigate('/');
  };

  const handleNavClick = (sectionId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (isHomePage) {
      // Se siamo sulla homepage, scroll alla sezione
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Se siamo su un'altra pagina, naviga alla homepage con l'anchor
      navigate('/', { state: { scrollTo: sectionId } });
    }
    setIsMenuOpen(false);
  };

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      isScrolled 
        ? theme === 'dark' 
          ? 'bg-black/95 backdrop-blur-md border-b-2 border-blue-800 shadow-2xl shadow-blue-900/50'
          : 'bg-white/95 backdrop-blur-md border-b-2 border-blue-400 shadow-2xl shadow-blue-300/50'
        : theme === 'dark'
          ? 'bg-gradient-to-b from-black/80 via-black/60 to-transparent'
          : 'bg-gradient-to-b from-white/80 via-white/60 to-transparent'
    }`}>
      {/* Epic Top Border with Animated Gradient */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-900 via-cyan-500 via-blue-600 to-blue-900 animate-gradient bg-[length:200%_auto]"></div>
      <div className="absolute top-1 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent animate-pulse"></div>
      
      <div className="container mx-auto px-4 py-0">
        <div className="flex items-center justify-between gap-8">
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center group"
          >
            {/* Horizontal Logo (NexoraLab + tagline already embedded) */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <img
                src="/logo.png"
                alt="Nexora Lab"
                className="relative z-10 h-12 md:h-16 lg:h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#falange" onClick={handleNavClick('falange')} className="relative group px-3 py-2 cursor-pointer whitespace-nowrap overflow-hidden">
              <span className={`font-display font-medium uppercase tracking-widest text-sm transition-all duration-300 group-hover:text-cyan-400 inline-block ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                Piattaforma
              </span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-600 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-blue-500/10 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></span>
            </a>
            <a href="#addestramento" onClick={handleNavClick('addestramento')} className="relative group px-3 py-2 cursor-pointer whitespace-nowrap overflow-hidden">
              <span className={`font-display font-medium uppercase tracking-widest text-sm transition-all duration-300 group-hover:text-cyan-400 inline-block ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                Metodo
              </span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-600 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-blue-500/10 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></span>
            </a>
            <a href="#veterani" onClick={handleNavClick('veterani')} className="relative group px-3 py-2 cursor-pointer whitespace-nowrap overflow-hidden">
              <span className={`font-display font-medium uppercase tracking-widest text-sm transition-all duration-300 group-hover:text-cyan-400 inline-block ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                Risultati
              </span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-600 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-blue-500/10 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></span>
            </a>
            <a href="#community" onClick={handleNavClick('community')} className="relative group px-3 py-2 cursor-pointer whitespace-nowrap overflow-hidden">
              <span className={`font-display font-medium uppercase tracking-widest text-sm transition-all duration-300 group-hover:text-cyan-400 inline-block ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                Community
              </span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-600 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-blue-500/10 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></span>
            </a>

            {/* Mostra pulsanti diversi se autenticato o no */}
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`px-4 py-2 font-bold hover:text-cyan-500 transition-colors flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className={`relative overflow-hidden border px-5 py-2 font-display font-medium tracking-wide transition-all duration-300 group rounded-lg ${
                    theme === 'dark'
                      ? 'border-slate-700 bg-slate-900/50 text-slate-200 hover:border-cyan-500 hover:text-cyan-300'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-cyan-500 hover:text-cyan-600'
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-2 text-sm">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </span>
                </button>
                {userData && (
                  <div className="ml-3 relative group/name">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-cyan-500/20 blur-lg opacity-50 group-hover/name:opacity-100 transition-opacity"></div>
                    <div className="relative flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-900/30 via-cyan-900/20 to-blue-900/30 border border-cyan-500/30 rounded-md">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                      </span>
                      <span className="font-display font-medium whitespace-nowrap tracking-wide bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                        {userData.name || userData.email?.split('@')[0]}
                      </span>
                    </div>
                  </div>
                )}
                {/* Theme Toggle - After name */}
                <button
                  onClick={toggleTheme}
                  className="ml-2 p-2 text-cyan-500 hover:text-cyan-400 transition-colors rounded-lg hover:bg-white/5"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={`px-4 py-2 font-bold hover:text-cyan-500 transition-colors flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                  <User className="w-5 h-5" />
                  Accedi
                </Link>
                <Link to="/register" className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-2.5 font-display font-semibold tracking-wide text-white transition-all duration-300 transform hover:-translate-y-0.5 group rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-cyan-500/40">
                  <span className="relative z-10 flex items-center gap-2 text-sm">
                    Inizia ora
                    <span className="opacity-70">→</span>
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-white/20 to-cyan-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                </Link>
                {/* Theme Toggle - For non-authenticated users */}
                <button
                  onClick={toggleTheme}
                  className="ml-2 p-2 text-cyan-500 hover:text-cyan-400 transition-colors rounded-lg hover:bg-white/5"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </button>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className={`md:hidden ${theme === 'dark' ? 'text-white' : 'text-black'}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-cyan-600/30 pt-4">
            <div className="flex flex-wrap gap-3 mb-4">
              <a href="#falange" onClick={handleNavClick('falange')} className={`font-display hover:text-cyan-400 transition-colors duration-300 font-medium cursor-pointer px-3 py-2 whitespace-nowrap ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                Piattaforma
              </a>
              <a href="#addestramento" onClick={handleNavClick('addestramento')} className={`font-display hover:text-cyan-400 transition-colors duration-300 font-medium cursor-pointer px-3 py-2 whitespace-nowrap ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                Metodo
              </a>
              <a href="#veterani" onClick={handleNavClick('veterani')} className={`font-display hover:text-cyan-400 transition-colors duration-300 font-medium cursor-pointer px-3 py-2 whitespace-nowrap ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                Risultati
              </a>
              <a href="#community" onClick={handleNavClick('community')} className={`font-display hover:text-cyan-400 transition-colors duration-300 font-medium cursor-pointer px-3 py-2 whitespace-nowrap ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                Community
              </a>
            </div>
            
            <div className="flex flex-col space-y-4">
              
              {/* Theme Toggle Mobile */}
              <button
                onClick={toggleTheme}
                className={`flex items-center gap-2 hover:text-cyan-500 transition-colors duration-300 font-medium py-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-5 h-5" />
                    Modalità Chiara
                  </>
                ) : (
                  <>
                    <Moon className="w-5 h-5" />
                    Modalità Scura
                  </>
                )}
              </button>
              
              {/* Mostra opzioni diverse per utenti autenticati */}
              {isAuthenticated ? (
                <>
                  {userData && (
                    <div className="text-center py-3 border-t border-cyan-600/30">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-900/30 via-cyan-900/20 to-blue-900/30 border border-cyan-500/30 rounded-md">
                        <Flame className="w-4 h-4 text-sky-500 animate-fire" />
                        <span className="font-bold tracking-wide bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
                          {userData.name || userData.email?.split('@')[0]}
                        </span>
                      </div>
                    </div>
                  )}
                  <Link
                    to="/dashboard"
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-lg font-display font-semibold hover:shadow-lg hover:shadow-cyan-500/40 transition-all duration-300 text-center block flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="bg-slate-800 text-white px-6 py-3 rounded-lg font-display font-medium hover:bg-slate-700 transition-all duration-300 text-center block w-full flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="bg-slate-800 text-white px-6 py-3 rounded-lg font-display font-medium hover:bg-slate-700 transition-all duration-300 mt-4 text-center block">
                    Accedi
                  </Link>
                  <Link to="/register" className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-lg font-display font-semibold hover:shadow-lg hover:shadow-cyan-500/40 transition-all duration-300 text-center block">
                    Entra nel Lab
                  </Link>
                </>
              )}
              
              {/* Newsletter Section */}
              <div className="mt-6 pt-4 border-t border-cyan-600/30">
                <div className="text-center mb-3">
                  <Mail className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                  <h4 className="font-mono-lab text-xs font-medium text-cyan-400 uppercase tracking-[0.2em]">// Lab Brief</h4>
                  <p className="text-xs text-slate-400 mt-1">Insight settimanali su trading e creator economy</p>
                </div>
                <NewsletterForm source="header-mobile" compact />
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;