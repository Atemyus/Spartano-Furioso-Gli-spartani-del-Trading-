import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, User, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import { useTheme } from '../contexts/ThemeContext';
import { API_ENDPOINTS } from '../config/api';
import { generateDeviceFingerprint } from '../utils/deviceFingerprint';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [deviceFingerprint, setDeviceFingerprint] = useState<any>(null);

  // Genera device fingerprint al caricamento
  useEffect(() => {
    const getFingerprint = async () => {
      try {
        const fingerprint = await generateDeviceFingerprint();
        setDeviceFingerprint(fingerprint);
        console.log('🔐 Device fingerprint generato per protezione anti-abuso');
      } catch (error) {
        console.error('Error generating fingerprint:', error);
      }
    };
    getFingerprint();
  }, []);

  // Validazione email
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Validazione password forte
  const validatePassword = (password: string) => {
    if (password.length < 8) return 'La password deve essere almeno 8 caratteri';
    if (!/[A-Z]/.test(password)) return 'La password deve contenere almeno una maiuscola';
    if (!/[a-z]/.test(password)) return 'La password deve contenere almeno una minuscola';
    if (!/[0-9]/.test(password)) return 'La password deve contenere almeno un numero';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    
    // Validazione completa
    const newErrors: any = {};
    
    // Nome e cognome
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Nome richiesto';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'Nome troppo corto';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Cognome richiesto';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Cognome troppo corto';
    }
    
    // Email
    if (!formData.email) {
      newErrors.email = 'Email richiesta';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email non valida';
    }
    
    // Password
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }
    
    // Conferma password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Conferma la password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Le password non corrispondono';
    }
    
    // Termini
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Devi accettare i termini e condizioni';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(API_ENDPOINTS.register, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          password: formData.password,
          deviceFingerprint
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setRegistrationSuccess(true);
        // Dopo 5 secondi redirect al login
        setTimeout(() => {
          navigate('/login');
        }, 5000);
      } else {
        // Gestione specifica per email duplicata
        if (data.error && data.error.includes('email esiste già')) {
          setErrors({ ...errors, email: 'Questa email è già registrata. Prova ad accedere o usa un\'altra email.' });
          setServerError(null);
        } else {
          setServerError(data.error || 'Errore durante la registrazione');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setServerError('Errore di connessione. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const passwordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strength = passwordStrength(formData.password);
  const strengthText = ['', 'Molto Debole', 'Debole', 'Media', 'Forte', 'Molto Forte'][strength];
  const strengthColor = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'][strength];

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

        {/* Register Card */}
        <div className={`backdrop-blur-sm border-2 rounded-2xl p-8 ${
          theme === 'light'
            ? 'bg-white/80 border-gray-200'
            : 'bg-gray-900/50 border-red-800/50'
        }`}>
          <div className="text-center mb-8">
            <h2 className={`text-2xl font-black mb-2 ${
              theme === 'light' ? 'text-gray-800' : 'text-white'
            }`}>UNISCITI ALLA FALANGE</h2>
            <p className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>Diventa un guerriero del trading</p>
          </div>

          {/* Success Message */}
          {registrationSuccess && (
            <div className="p-4 bg-green-900/20 border border-green-600/50 rounded-lg mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-400 font-medium">Registrazione completata con successo!</p>
                  <p className="text-green-300 text-sm mt-1">
                    Controlla la tua email per verificare il tuo account.
                  </p>
                  <p className="text-gray-400 text-xs mt-2">
                    Sarai reindirizzato al login tra pochi secondi...
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Server Error */}
            {serverError && (
              <div className="p-4 bg-red-900/20 border border-red-600/50 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{serverError}</p>
              </div>
            )}
            
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-bold mb-2 ${
                theme === 'light' ? 'text-gray-700' : 'text-gray-300'
              }`}>
                  Nome
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pl-12 border-2 rounded-lg focus:outline-none transition-colors placeholder-${
                    theme === 'light' ? 'gray-400' : 'gray-500'
                  } ${
                    theme === 'light'
                      ? 'bg-white border-gray-300 text-gray-800 focus:border-yellow-600'
                      : 'bg-black/50 border-red-900/50 text-white focus:border-yellow-500'
                  }`}
                    placeholder="Leonida"
                    required
                  />
                  <User className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    theme === 'light' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-bold mb-2 ${
                theme === 'light' ? 'text-gray-700' : 'text-gray-300'
              }`}>
                  Cognome
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pl-12 border-2 rounded-lg focus:outline-none transition-colors placeholder-${
                    theme === 'light' ? 'gray-400' : 'gray-500'
                  } ${
                    theme === 'light'
                      ? 'bg-white border-gray-300 text-gray-800 focus:border-yellow-600'
                      : 'bg-black/50 border-red-900/50 text-white focus:border-yellow-500'
                  }`}
                    placeholder="Di Sparta"
                    required
                  />
                  <User className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    theme === 'light' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                </div>
              </div>
            </div>

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
                  } ${
                    errors.email ? 'border-red-500' : ''
                  }`}
                  placeholder="guerriero@sparta.com"
                  required
                />
                <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  theme === 'light' ? 'text-gray-400' : 'text-gray-500'
                }`} />
              </div>
              {errors.email && (
                <div className="mt-1 text-sm text-red-500">
                  <p className="flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </p>
                  {errors.email.includes('già registrata') && (
                    <p className="mt-1 text-gray-400">
                      <Link to="/login" className="text-yellow-500 hover:text-yellow-400 underline">
                        Vai al login
                      </Link>
                    </p>
                  )}
                </div>
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
                  placeholder="Minimo 8 caratteri"
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
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded ${
                          i <= strength ? strengthColor : 'bg-gray-700'
                        }`}
                      ></div>
                    ))}
                  </div>
                  <p className={`text-xs ${strength < 3 ? 'text-red-400' : 'text-green-400'}`}>
                    Forza password: {strengthText}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className={`block text-sm font-bold mb-2 ${
                theme === 'light' ? 'text-gray-700' : 'text-gray-300'
              }`}>
                Conferma Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pl-12 pr-12 border-2 rounded-lg focus:outline-none transition-colors placeholder-${
                    theme === 'light' ? 'gray-400' : 'gray-500'
                  } ${
                    theme === 'light'
                      ? 'bg-white border-gray-300 text-gray-800 focus:border-yellow-600'
                      : 'bg-black/50 border-red-900/50 text-white focus:border-yellow-500'
                  }`}
                  placeholder="Ripeti la password"
                  required
                />
                <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  theme === 'light' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms */}
            <div>
              <label className="flex items-start">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className={`w-4 h-4 mt-0.5 border-2 rounded text-yellow-500 focus:ring-yellow-500 ${
                    theme === 'light'
                      ? 'bg-white border-gray-300'
                      : 'bg-black/50 border-red-900/50'
                  }`}
                />
                <span className={`ml-2 text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Accetto i{' '}
                  <Link to="/terms" className={`text-yellow-500 hover:text-yellow-400 ${
                    theme === 'light' ? 'text-yellow-600 hover:text-yellow-700' : ''
                  }`}>
                    Termini di Servizio
                  </Link>{' '}
                  e la{' '}
                  <Link to="/privacy" className={`text-yellow-500 hover:text-yellow-400 ${
                    theme === 'light' ? 'text-yellow-600 hover:text-yellow-700' : ''
                  }`}>
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="mt-1 text-sm text-red-500">{errors.acceptTerms}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.acceptTerms}
              className={`w-full py-4 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 hover:shadow-xl ${
                theme === 'light'
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-400 hover:to-yellow-500 border-2 border-yellow-700 shadow-md'
                  : 'bg-gradient-to-r from-red-600 to-red-800 text-white hover:from-red-500 hover:to-red-700'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Registrazione in corso...</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span>DIVENTA SPARTANO</span>
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className={`${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Hai già un account?{' '}
              <Link to="/login" className={`font-bold ${
                theme === 'light' ? 'text-yellow-600 hover:text-yellow-700' : 'text-yellow-500 hover:text-yellow-400'
              }`}>
                Accedi
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
    </AnimatedPage>
  );
};

export default Register;
