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
          ? 'bg-black/95 backdrop-blur-md border-b-2 border-red-800 shadow-2xl shadow-red-900/50'
          : 'bg-white/95 backdrop-blur-md border-b-2 border-red-400 shadow-2xl shadow-red-300/50'
        : theme === 'dark'
          ? 'bg-gradient-to-b from-black/80 via-black/60 to-transparent'
          : 'bg-gradient-to-b from-white/80 via-white/60 to-transparent'
    }`}>
      {/* Epic Top Border with Animated Gradient */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-900 via-yellow-500 via-red-600 to-red-900 animate-gradient bg-[length:200%_auto]"></div>
      <div className="absolute top-1 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent animate-pulse"></div>
      
      <div className="container mx-auto px-4 py-0">
        <div className="flex items-center justify-between gap-8">
          <Link 
            to="/" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-0 group -ml-28 md:-ml-36"
          >
            {/* Logo Image */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-red-500/30 blur-xl rounded-full animate-pulse mt-4" style={{ transform: 'translateX(48px)' }}></div>
              <img 
                src="/logo.png" 
                alt="Spartano Furioso Logo" 
                className="w-24 h-20 md:w-32 md:h-24 object-contain relative z-10 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)] group-hover:scale-110 transition-transform duration-300"
                style={{ transform: 'translateX(48px)' }}
              />
            </div>
            {/* Logo Text with Epic Gradient */}
            <div className="relative flex-shrink-0">
              <h1 className="text-lg md:text-xl font-black tracking-tight relative whitespace-nowrap">
                <span className="bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto] drop-shadow-[0_0_15px_rgba(218,165,32,0.5)]">
                  SPARTANO
                </span>
                <span className={`ml-1 ${theme === 'dark' ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'text-black drop-shadow-[0_0_10px_rgba(0,0,0,0.2)]'}`}> FURIOSO</span>
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/20 via-red-500/20 to-yellow-500/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </h1>
              <p className={`text-xs font-bold tracking-[0.1em] flex items-center gap-1 mt-1 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                <Flame className="w-3 h-3 animate-fire" />
                FURIA • DISCIPLINA • VITTORIA
                <Skull className="w-3 h-3 opacity-70 animate-pulse" />
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#falange" onClick={handleNavClick('falange')} className="relative group px-3 py-2 cursor-pointer whitespace-nowrap overflow-hidden">
              <span className={`font-bold uppercase tracking-wider transition-all duration-300 group-hover:text-yellow-500 group-hover:scale-110 inline-block drop-shadow-[0_0_8px_rgba(218,165,32,0)] group-hover:drop-shadow-[0_0_8px_rgba(218,165,32,0.8)] ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                La Falange
              </span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-red-600 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              <span className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-red-500/10 to-yellow-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></span>
            </a>
            <a href="#addestramento" onClick={handleNavClick('addestramento')} className="relative group px-3 py-2 cursor-pointer whitespace-nowrap overflow-hidden">
              <span className={`font-bold uppercase tracking-wider transition-all duration-300 group-hover:text-yellow-500 group-hover:scale-110 inline-block drop-shadow-[0_0_8px_rgba(218,165,32,0)] group-hover:drop-shadow-[0_0_8px_rgba(218,165,32,0.8)] ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                L'Addestramento
              </span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-red-600 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              <span className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-red-500/10 to-yellow-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></span>
            </a>
            <a href="#veterani" onClick={handleNavClick('veterani')} className="relative group px-3 py-2 cursor-pointer whitespace-nowrap overflow-hidden">
              <span className={`font-bold uppercase tracking-wider transition-all duration-300 group-hover:text-yellow-500 group-hover:scale-110 inline-block drop-shadow-[0_0_8px_rgba(218,165,32,0)] group-hover:drop-shadow-[0_0_8px_rgba(218,165,32,0.8)] ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                I Veterani
              </span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-red-600 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              <span className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-red-500/10 to-yellow-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></span>
            </a>
            <a href="#community" onClick={handleNavClick('community')} className="relative group px-3 py-2 cursor-pointer whitespace-nowrap overflow-hidden">
              <span className={`font-bold uppercase tracking-wider transition-all duration-300 group-hover:text-yellow-500 group-hover:scale-110 inline-block drop-shadow-[0_0_8px_rgba(218,165,32,0)] group-hover:drop-shadow-[0_0_8px_rgba(218,165,32,0.8)] ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                Community
              </span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-red-600 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              <span className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-red-500/10 to-yellow-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></span>
            </a>

            {/* Mostra pulsanti diversi se autenticato o no */}
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`px-4 py-2 font-bold hover:text-yellow-500 transition-colors flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="relative overflow-hidden bg-gradient-to-r from-red-900 via-red-700 to-red-900 px-6 py-3 font-black uppercase tracking-wider transition-all duration-300 transform hover:scale-105 group border-2 border-red-600 shadow-lg shadow-red-900/50"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <LogOut className="w-5 h-5" />
                    LOGOUT
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-gray-600 via-red-600 to-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </button>
                {userData && (
                  <div className="ml-3 relative group/name">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-red-500/20 to-yellow-500/20 blur-lg opacity-50 group-hover/name:opacity-100 transition-opacity"></div>
                    <div className="relative flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-red-900/30 via-yellow-900/20 to-red-900/30 border border-yellow-500/30 rounded-md">
                      <Flame className="w-4 h-4 text-orange-500 animate-fire" />
                      <span className="font-bold whitespace-nowrap tracking-wide bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto] drop-shadow-[0_0_10px_rgba(218,165,32,0.8)]">
                        {userData.name || userData.email?.split('@')[0]}
                      </span>
                    </div>
                  </div>
                )}
                {/* Theme Toggle - After name */}
                <button
                  onClick={toggleTheme}
                  className="ml-2 p-2 text-yellow-500 hover:text-yellow-400 transition-colors rounded-lg hover:bg-white/5"
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
                <Link to="/login" className={`px-4 py-2 font-bold hover:text-yellow-500 transition-colors flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                  <User className="w-5 h-5" />
                  Accedi
                </Link>
                <Link to="/register" className="relative overflow-hidden bg-gradient-to-r from-red-900 via-red-700 to-red-900 px-8 py-3 font-black uppercase tracking-wider transition-all duration-300 transform hover:scale-105 group border-2 border-red-600 shadow-lg shadow-red-900/50">
                  <span className="relative z-10 flex items-center gap-2">
                    <Swords className="w-5 h-5" />
                    ARRUOLATI ORA
                    <Skull className="w-5 h-5" />
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-yellow-600 via-red-600 to-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </Link>
                {/* Theme Toggle - For non-authenticated users */}
                <button
                  onClick={toggleTheme}
                  className="ml-2 p-2 text-yellow-500 hover:text-yellow-400 transition-colors rounded-lg hover:bg-white/5"
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
          <nav className="md:hidden mt-4 pb-4 border-t border-yellow-600/30 pt-4">
            <div className="flex flex-wrap gap-3 mb-4">
              <a href="#falange" onClick={handleNavClick('falange')} className={`hover:text-yellow-500 transition-colors duration-300 font-medium cursor-pointer px-3 py-2 whitespace-nowrap ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                La Falange
              </a>
              <a href="#addestramento" onClick={handleNavClick('addestramento')} className={`hover:text-yellow-500 transition-colors duration-300 font-medium cursor-pointer px-3 py-2 whitespace-nowrap ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                L'Addestramento
              </a>
              <a href="#veterani" onClick={handleNavClick('veterani')} className={`hover:text-yellow-500 transition-colors duration-300 font-medium cursor-pointer px-3 py-2 whitespace-nowrap ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                I Veterani
              </a>
              <a href="#community" onClick={handleNavClick('community')} className={`hover:text-yellow-500 transition-colors duration-300 font-medium cursor-pointer px-3 py-2 whitespace-nowrap ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                Community
              </a>
            </div>
            
            <div className="flex flex-col space-y-4">
              
              {/* Theme Toggle Mobile */}
              <button
                onClick={toggleTheme}
                className={`flex items-center gap-2 hover:text-yellow-500 transition-colors duration-300 font-medium py-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}
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
                    <div className="text-center py-3 border-t border-yellow-600/30">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-900/30 via-yellow-900/20 to-red-900/30 border border-yellow-500/30 rounded-md">
                        <Flame className="w-4 h-4 text-orange-500 animate-fire" />
                        <span className="font-bold tracking-wide bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 bg-clip-text text-transparent">
                          {userData.name || userData.email?.split('@')[0]}
                        </span>
                      </div>
                    </div>
                  )}
                  <Link 
                    to="/dashboard" 
                    className="bg-yellow-600 px-6 py-3 rounded-lg font-bold hover:bg-yellow-500 transition-all duration-300 text-center block flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    DASHBOARD
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="bg-gradient-to-r from-red-800 to-red-600 px-6 py-3 rounded-lg font-bold hover:from-red-700 hover:to-red-500 transition-all duration-300 text-center block w-full flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-5 h-5" />
                    LOGOUT
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="bg-gray-800 px-6 py-3 rounded-lg font-bold hover:bg-gray-700 transition-all duration-300 mt-4 text-center block">
                    ACCEDI
                  </Link>
                  <Link to="/register" className="bg-gradient-to-r from-red-800 to-red-600 px-6 py-3 rounded-lg font-bold hover:from-red-700 hover:to-red-500 transition-all duration-300 text-center block">
                    UNISCITI ALLA FALANGE
                  </Link>
                </>
              )}
              
              {/* Newsletter Section */}
              <div className="mt-6 pt-4 border-t border-yellow-600/30">
                <div className="text-center mb-3">
                  <Mail className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-yellow-500 uppercase">Newsletter Falange</h4>
                  <p className="text-xs text-gray-400">Ricevi strategie esclusive</p>
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