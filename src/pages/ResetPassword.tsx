import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, Lock, Eye, EyeOff, CheckCircle, AlertCircle, KeyRound } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setServerError('Token mancante. Richiedi un nuovo link di recupero password.');
    }
  }, [token]);

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

    // Validazione
    const newErrors: any = {};
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Conferma la password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Le password non corrispondono';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setServerError(data.error || 'Errore durante il reset della password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setServerError('Errore di connessione. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
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
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black flex items-center justify-center px-4 py-12">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-red-900/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-yellow-900/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <Shield className="w-12 h-12 text-yellow-500 group-hover:scale-110 transition-transform" />
              <div>
                <h1 className="text-3xl font-black">
                  <span className="bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 bg-clip-text text-transparent">
                    SPARTANO
                  </span>
                  <span className="text-white ml-2">FURIOSO</span>
                </h1>
              </div>
            </Link>
          </div>

          {/* Card */}
          <div className="bg-gray-900/50 backdrop-blur-sm border-2 border-red-800/50 rounded-2xl p-8">
            {!success ? (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-red-900/20 border-2 border-red-600/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <KeyRound className="w-8 h-8 text-yellow-500" />
                  </div>
                  <h2 className="text-2xl font-black text-white mb-2">NUOVA PASSWORD</h2>
                  <p className="text-gray-400">
                    Scegli una nuova password per il tuo account
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Server Error */}
                  {serverError && (
                    <div className="p-4 bg-red-900/20 border border-red-600/50 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-red-400 text-sm">{serverError}</p>
                    </div>
                  )}

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">
                      Nuova Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 pl-12 pr-12 bg-black/50 border-2 ${
                          errors.password ? 'border-red-500' : 'border-red-900/50'
                        } rounded-lg text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none transition-colors`}
                        placeholder="Minimo 8 caratteri"
                        required
                        disabled={!token}
                      />
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-yellow-500 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                    )}
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
                    <label className="block text-sm font-bold text-gray-300 mb-2">
                      Conferma Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 pl-12 pr-12 bg-black/50 border-2 ${
                          errors.confirmPassword ? 'border-red-500' : 'border-red-900/50'
                        } rounded-lg text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none transition-colors`}
                        placeholder="Ripeti la password"
                        required
                        disabled={!token}
                      />
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                      {formData.confirmPassword && formData.password === formData.confirmPassword && (
                        <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                      )}
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || !token}
                    className="w-full py-4 bg-gradient-to-r from-red-600 to-red-800 rounded-lg font-bold text-white hover:from-red-500 hover:to-red-700 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Reimpostazione in corso...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        <span>REIMPOSTA PASSWORD</span>
                      </>
                    )}
                  </button>

                  {/* Back to Login */}
                  <Link
                    to="/login"
                    className="block text-center text-gray-400 hover:text-yellow-500 transition-colors"
                  >
                    Torna al login
                  </Link>
                </form>
              </>
            ) : (
              // Success Message
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-900/20 border-2 border-green-600/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-black text-white mb-4">PASSWORD REIMPOSTATA!</h3>
                <p className="text-gray-400 mb-6">
                  La tua password è stata reimpostata con successo.
                  <br />
                  Ora puoi accedere con la tua nuova password.
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Sarai reindirizzato al login tra pochi secondi...
                </p>
                <Link
                  to="/login"
                  className="inline-block px-8 py-3 bg-gradient-to-r from-red-600 to-red-800 rounded-lg font-bold text-white hover:from-red-500 hover:to-red-700 transition-all duration-300"
                >
                  VAI AL LOGIN
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default ResetPassword;
