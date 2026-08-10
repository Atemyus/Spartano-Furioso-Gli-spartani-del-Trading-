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
      console.log('🚀 Invio registrazione a:', API_ENDPOINTS.register);
      console.log('📤 Dati inviati:', {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        hasPassword: !!formData.password,
        hasFingerprint: !!deviceFingerprint
      });
      
      // Aumenta timeout a 60 secondi (il server potrebbe impiegare tempo per inviare email)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.error('⏱️ Timeout dopo 60 secondi');
        controller.abort();
      }, 60000);
      
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
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('📥 Response status:', response.status);
      const data = await response.json();
      console.log('📦 Response data:', data);
      
      // Gestione più flessibile della risposta
      if (response.ok) {
        // Se la risposta è OK (200-299), considera la registrazione riuscita
        setRegistrationSuccess(true);
        console.log('✅ Registrazione completata con successo!');
        // Dopo 5 secondi redirect al login
        setTimeout(() => {
          navigate('/login');
        }, 5000);
      } else {
        // Gestione errori
        console.error('❌ Errore registrazione:', data);
        
        // Gestione specifica per email duplicata
        const errorMessage = data.error || data.message || '';
        if (errorMessage.toLowerCase().includes('email') && 
            (errorMessage.toLowerCase().includes('esiste') || 
             errorMessage.toLowerCase().includes('already exists') ||
             errorMessage.toLowerCase().includes('duplicat'))) {
          setErrors({ ...errors, email: 'Questa email è già registrata. Prova ad accedere o usa un\'altra email.' });
          setServerError(null);
        } else {
          setServerError(errorMessage || 'Errore durante la registrazione');
        }
      }
    } catch (error: any) {
      console.error('💥 Registration error:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      
      if (error.name === 'AbortError') {
        setServerError('Il server sta impiegando troppo tempo a rispondere (oltre 60 secondi). L\'account potrebbe essere stato creato comunque. Prova ad accedere o contatta il supporto.');
      } else if (error.message?.includes('Failed to fetch')) {
        setServerError('Impossibile connettersi al server. Verifica la tua connessione internet.');
      } else {
        setServerError('Errore di connessione. Riprova più tardi.');
      }
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
  const strengthColor = ['', 'bg-blue-500', 'bg-sky-500', 'bg-cyan-500', 'bg-lime-500', 'bg-green-500'][strength];

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
          theme === 'light' ? 'bg-blue-200/20' : 'bg-blue-900/10'
        }`}></div>
        <div className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl ${
          theme === 'light' ? 'bg-cyan-200/20' : 'bg-cyan-900/10'
        }`}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block group">
            <div className="relative transform group-hover:scale-[1.03] transition-transform duration-300">
              <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full"></div>
              <img
                src="/logo.png"
                alt="Nexora Lab"
                className="relative z-10 h-16 md:h-20 w-auto mx-auto object-contain"
              />
            </div>
          </Link>
        </div>

        {/* Register Card */}
        <div className={`backdrop-blur-sm border-2 rounded-2xl p-8 ${
          theme === 'light'
            ? 'bg-white/80 border-gray-200'
            : 'bg-gray-900/50 border-blue-800/50'
        }`}>
          <div className="text-center mb-8">
            <h2 className={`text-2xl font-black mb-2 ${
              theme === 'light' ? 'text-gray-800' : 'text-white'
            }`}>UNISCITI A NEXORA LAB</h2>
            <p className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>Crea il tuo account e inizia subito</p>
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
              <div className="p-4 bg-blue-900/20 border border-blue-600/50 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-blue-400 text-sm">{serverError}</p>
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
                      ? 'bg-white border-gray-300 text-gray-800 focus:border-cyan-600'
                      : 'bg-black/50 border-blue-900/50 text-white focus:border-cyan-500'
                  }`}
                    placeholder="Mario"
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
                      ? 'bg-white border-gray-300 text-gray-800 focus:border-cyan-600'
                      : 'bg-black/50 border-blue-900/50 text-white focus:border-cyan-500'
                  }`}
                    placeholder="Rossi"
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
                      ? 'bg-white border-gray-300 text-gray-800 focus:border-cyan-600'
                      : 'bg-black/50 border-blue-900/50 text-white focus:border-cyan-500'
                  } ${
                    errors.email ? 'border-blue-500' : ''
                  }`}
                  placeholder="tu@email.it"
                  required
                />
                <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  theme === 'light' ? 'text-gray-400' : 'text-gray-500'
                }`} />
              </div>
              {errors.email && (
                <div className="mt-1 text-sm text-blue-500">
                  <p className="flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </p>
                  {errors.email.includes('già registrata') && (
                    <p className="mt-1 text-gray-400">
                      <Link to="/login" className="text-cyan-500 hover:text-cyan-400 underline">
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
                      ? 'bg-white border-gray-300 text-gray-800 focus:border-cyan-600'
                      : 'bg-black/50 border-blue-900/50 text-white focus:border-cyan-500'
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
                    theme === 'light' ? 'text-gray-400 hover:text-cyan-600' : 'text-gray-500 hover:text-cyan-500'
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
                  <p className={`text-xs ${strength < 3 ? 'text-blue-400' : 'text-green-400'}`}>
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
                      ? 'bg-white border-gray-300 text-gray-800 focus:border-cyan-600'
                      : 'bg-black/50 border-blue-900/50 text-white focus:border-cyan-500'
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
                <p className="mt-1 text-sm text-blue-500">{errors.confirmPassword}</p>
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
                  className={`w-4 h-4 mt-0.5 border-2 rounded text-cyan-500 focus:ring-cyan-500 ${
                    theme === 'light'
                      ? 'bg-white border-gray-300'
                      : 'bg-black/50 border-blue-900/50'
                  }`}
                />
                <span className={`ml-2 text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Accetto i{' '}
                  <Link to="/terms" className={`text-cyan-500 hover:text-cyan-400 ${
                    theme === 'light' ? 'text-cyan-600 hover:text-cyan-700' : ''
                  }`}>
                    Termini di Servizio
                  </Link>{' '}
                  e la{' '}
                  <Link to="/privacy" className={`text-cyan-500 hover:text-cyan-400 ${
                    theme === 'light' ? 'text-cyan-600 hover:text-cyan-700' : ''
                  }`}>
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="mt-1 text-sm text-blue-500">{errors.acceptTerms}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.acceptTerms}
              className={`w-full py-4 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 hover:shadow-xl ${
                theme === 'light'
                  ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white hover:from-cyan-400 hover:to-cyan-500 border-2 border-cyan-700 shadow-md'
                  : 'bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-500 hover:to-blue-700'
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
                  <span>CREA ACCOUNT</span>
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
                theme === 'light' ? 'text-cyan-600 hover:text-cyan-700' : 'text-cyan-500 hover:text-cyan-400'
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
