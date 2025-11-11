import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Mail, Lock, Eye, EyeOff, Swords, Github, Chrome, AlertCircle } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import { useTheme } from '../contexts/ThemeContext';
import { API_ENDPOINTS } from '../config/api';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);

  // Carica credenziali salvate all'avvio
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');
    
    if (savedEmail && savedPassword) {
      setFormData({
        email: savedEmail,
        password: savedPassword
      });
      setRememberMe(true);
    }
  }, []);

  // Validazione email
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Validazione form
  const validateForm = () => {
    const newErrors: any = {};
    
    if (!formData.email) {
      newErrors.email = 'Email richiesta';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email non valida';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password richiesta';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La password deve essere almeno 6 caratteri';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setNeedsVerification(false);
    
    // Validazione
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('🔐 Tentativo di login con:', formData.email);
      
      const response = await fetch(API_ENDPOINTS.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📦 Response data:', data);
      
      if (response.ok && data.success) {
        console.log('✅ Login successful!');
        
        // Salva token e dati utente
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Gestione "Ricordami"
        if (rememberMe) {
          // Salva credenziali per il prossimo login
          localStorage.setItem('rememberedEmail', formData.email);
          localStorage.setItem('rememberedPassword', formData.password);
          console.log('💾 Credenziali salvate per il prossimo accesso');
        } else {
          // Rimuovi credenziali salvate se "Ricordami" non è spuntato
          localStorage.removeItem('rememberedEmail');
          localStorage.removeItem('rememberedPassword');
          console.log('🗑️ Credenziali rimosse dal localStorage');
        }
        
        // Redirect alla dashboard o alla pagina richiesta
        const from = location.state?.from || '/dashboard';
        console.log('🚀 Redirecting to:', from);
        navigate(from);
      } else {
        console.log('❌ Login failed:', data.error || 'Unknown error');
        // Gestione errori
        if (data.requiresVerification) {
          setNeedsVerification(true);
          setServerError('Devi prima verificare la tua email. Controlla la tua casella di posta.');
        } else if (data.error) {
          setServerError(data.error);
        } else {
          setServerError('Credenziali non valide');
        }
        
        // IMPORTANTE: Non permettere navigation se login fallito
        return;
      }
    } catch (error) {
      console.error('🔥 Login error:', error);
      setServerError('Errore di connessione. Verifica che il server sia attivo.');
      // IMPORTANTE: Non permettere navigation se c'è errore
      return;
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  return (
    <AnimatedPage>
      <div className={`min-h-screen flex items-center justify-center px-4 py-12 ${
        theme === 'light' 
          ? 'bg-gradient-to-b from-white via-gray-50 to-white' 
          : 'bg-gradient-to-b from-black via-gray-950 to-black'
      }`}>
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl ${
          theme === 'light' ? 'bg-red-200/20' : 'bg-red-900/10'
        }`}></div>
        <div className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl ${
          theme === 'light' ? 'bg-yellow-200/20' : 'bg-yellow-900/10'
        }`}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-0 group">
            <div className="relative flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300">
              <div className="absolute inset-0 bg-red-500/30 blur-xl rounded-full animate-pulse" style={{ transform: 'translateX(60px)' }}></div>
              <img 
                src="/logo.png" 
                alt="Spartano Furioso Logo" 
                className="w-28 h-24 md:w-40 md:h-32 object-contain relative z-10 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]"
                style={{ transform: 'translateX(60px)' }}
              />
            </div>
            <div>
              <h1 className="text-3xl font-black">
                <span className="bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                  SPARTANO
                </span>
                <span className={`ml-2 ${
                  theme === 'light' ? 'text-gray-800' : 'text-white'
                }`}>FURIOSO</span>
              </h1>
            </div>
          </Link>
        </div>

        {/* Login Card */}
        <div className={`backdrop-blur-sm border-2 rounded-2xl p-8 ${
          theme === 'light'
            ? 'bg-white/80 border-gray-200'
            : 'bg-gray-900/50 border-red-800/50'
        }`}>
          <div className="text-center mb-8">
            <h2 className={`text-2xl font-black mb-2 ${
              theme === 'light' ? 'text-gray-800' : 'text-white'
            }`}>BENTORNATO GUERRIERO</h2>
            <p className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>Accedi al tuo account spartano</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Server Error Message */}
            {serverError && (
              <div className="p-4 bg-red-900/20 border border-red-600/50 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-400 text-sm font-medium">{serverError}</p>
                  {needsVerification && (
                    <Link 
                      to="/register" 
                      className="text-yellow-500 hover:text-yellow-400 text-sm underline mt-2 inline-block"
                    >
                      Reinvia email di verifica
                    </Link>
                  )}
                </div>
              </div>
            )}
            
            {/* Email Field */}
            <div>
              <label className={`block text-sm font-bold mb-2 ${
                theme === 'light' ? 'text-gray-700' : 'text-gray-300'
              }`}>
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pl-12 border-2 rounded-lg focus:outline-none transition-colors placeholder-${
                    theme === 'light' ? 'gray-400' : 'gray-500'
                  } ${
                    theme === 'light'
                      ? 'bg-white border-gray-300 text-gray-800 focus:border-yellow-600'
                      : 'bg-black/50 border-red-900/50 text-white focus:border-yellow-500'
                  }`}
                  placeholder="guerriero@sparta.com"
                  required
                />
                <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  theme === 'light' ? 'text-gray-400' : 'text-gray-500'
                }`} />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className={`block text-sm font-bold mb-2 ${
                theme === 'light' ? 'text-gray-700' : 'text-gray-300'
              }`}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pl-12 pr-12 border-2 rounded-lg focus:outline-none transition-colors placeholder-${
                    theme === 'light' ? 'gray-400' : 'gray-500'
                  } ${
                    theme === 'light'
                      ? 'bg-white border-gray-300 text-gray-800 focus:border-yellow-600'
                      : 'bg-black/50 border-red-900/50 text-white focus:border-yellow-500'
                  }`}
                  placeholder="••••••••"
                  required
                />
                <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  theme === 'light' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors ${
                    theme === 'light' ? 'text-gray-400 hover:text-yellow-600' : 'text-gray-500 hover:text-yellow-500'
                  }`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className={`w-4 h-4 border-2 rounded text-yellow-500 focus:ring-yellow-500 cursor-pointer ${
                    theme === 'light'
                      ? 'bg-white border-gray-300'
                      : 'bg-black/50 border-red-900/50'
                  }`}
                />
                <span className={`ml-2 text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>Ricordami</span>
              </label>
              <Link
                to="/forgot-password"
                className={`text-sm transition-colors ${
                  theme === 'light' ? 'text-yellow-600 hover:text-yellow-700' : 'text-yellow-500 hover:text-yellow-400'
                }`}
              >
                Password dimenticata?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 hover:shadow-xl ${
                theme === 'light'
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-400 hover:to-yellow-500 border-2 border-yellow-700 shadow-md'
                  : 'bg-gradient-to-r from-red-600 to-red-800 text-white hover:from-red-500 hover:to-red-700'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Accesso in corso...</span>
                </>
              ) : (
                <>
                  <Swords className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span>ACCEDI</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{
                borderColor: theme === 'light' ? 'rgba(209, 213, 219, 0.3)' : 'rgba(127, 29, 29, 0.3)'
              }}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-4 text-sm ${
                theme === 'light' ? 'bg-white/80 text-gray-600' : 'bg-gray-900/50 text-gray-400'
              }`}>O</span>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className={`mb-4 ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>Non hai ancora un account?</p>
            <Link
              to="/register"
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all duration-300 group hover:scale-105 active:scale-95 hover:shadow-xl ${
                theme === 'light'
                  ? 'bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-gray-600 hover:to-gray-700 border-2 border-gray-900 shadow-md'
                  : 'bg-gradient-to-r from-yellow-600 to-yellow-800 text-white hover:from-yellow-500 hover:to-yellow-700'
              }`}
            >
              <Shield className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              UNISCITI ALLA FALANGE
            </Link>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center">
          <div className="flex justify-center gap-6 text-sm">
            <Link to="/terms" className={`text-sm transition-colors ${
              theme === 'light' ? 'text-gray-500 hover:text-yellow-600' : 'text-gray-500 hover:text-yellow-500'
            }`}>
              Termini di Servizio
            </Link>
            <Link to="/privacy" className={`text-sm transition-colors ${
              theme === 'light' ? 'text-gray-500 hover:text-yellow-600' : 'text-gray-500 hover:text-yellow-500'
            }`}>
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
    </AnimatedPage>
  );
};

export default Login;
