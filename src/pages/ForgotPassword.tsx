import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, ArrowLeft, Send, CheckCircle, AlertCircle } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import { useTheme } from '../contexts/ThemeContext';
import { API_ENDPOINTS } from '../config/api';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateEmail(email)) {
      setError('Inserisci un indirizzo email valido');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.forgotPassword, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
      } else {
        setError(data.error || 'Errore durante il recupero password');
      }
    } catch (error) {
      console.error('Password recovery error:', error);
      setError('Errore di connessione. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black flex items-center justify-center px-4 py-12">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-red-900/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-yellow-900/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
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
                  <h2 className="text-2xl font-black text-white mb-2">RECUPERA LA TUA FORZA</h2>
                  <p className="text-gray-400">
                    Inserisci la tua email per ricevere le istruzioni
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Error Message */}
                  {error && (
                    <div className="p-4 bg-red-900/20 border border-red-600/50 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">
                      Email del Guerriero
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 pl-12 bg-black/50 border-2 border-red-900/50 rounded-lg text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none transition-colors"
                        placeholder="guerriero@sparta.com"
                        required
                      />
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-red-600 to-red-800 rounded-lg font-bold text-white hover:from-red-500 hover:to-red-700 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Invio in corso...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        <span>INVIA ISTRUZIONI</span>
                      </>
                    )}
                  </button>

                  {/* Back to Login */}
                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 text-gray-400 hover:text-yellow-500 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Torna al login</span>
                  </Link>
                </form>
              </>
            ) : (
              // Success Message
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-900/20 border-2 border-green-600/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-black text-white mb-4">EMAIL INVIATA!</h3>
                <p className="text-gray-400 mb-2">
                  Le istruzioni per recuperare la password sono state inviate a:
                </p>
                <p className="text-yellow-500 font-bold mb-6">{email}</p>
                <p className="text-sm text-gray-500 mb-8">
                  Controlla la tua casella di posta e segui le istruzioni.
                  <br />
                  Se non ricevi l'email entro qualche minuto, controlla lo spam.
                </p>
                <div className="space-y-3">
                  <Link
                    to="/login"
                    className="block w-full py-3 bg-gradient-to-r from-red-600 to-red-800 rounded-lg font-bold text-white hover:from-red-500 hover:to-red-700 transition-all duration-300"
                  >
                    TORNA AL LOGIN
                  </Link>
                  <button
                    onClick={() => {
                      setSuccess(false);
                      setEmail('');
                    }}
                    className="text-gray-400 hover:text-yellow-500 transition-colors text-sm"
                  >
                    Non hai ricevuto l'email? Riprova
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default ForgotPassword;
