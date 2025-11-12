import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Mail, RefreshCw } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import { useTheme } from '../contexts/ThemeContext';
import { API_ENDPOINTS } from '../config/api';

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  
  const token = searchParams.get('token');

  // DEBUG: Log per verificare che la pagina venga caricata
  console.log('🔍 VerifyEmail page loaded!');
  console.log('🔍 Token:', token);

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setStatus('error');
      setMessage('Token di verifica mancante');
    }
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.verifyEmail, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Email verificata con successo!');
        
        // Save token and redirect after 3 seconds
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        }
      } else {
        setStatus('error');
        setMessage(data.error || 'Verifica email fallita');
        
        if (data.error === 'Token di verifica scaduto') {
          setEmail(data.email || '');
        }
      }
    } catch (error) {
      setStatus('error');
      setMessage('Errore di connessione. Riprova più tardi.');
    }
  };

  const handleResendVerification = async () => {
    if (!email) return;
    
    setIsResending(true);
    
    try {
      const response = await fetch(API_ENDPOINTS.resendVerification, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Email di verifica reinviata! Controlla la tua casella di posta.');
      } else {
        setMessage(data.error || 'Impossibile reinviare email di verifica');
      }
    } catch (error) {
      setMessage('Errore di connessione. Riprova più tardi.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Status Icon */}
          <div className="flex justify-center mb-6">
            {status === 'loading' && (
              <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center animate-pulse">
                <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
            )}
            {status === 'error' && (
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-400" />
              </div>
            )}
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-center text-white mb-4">
            {status === 'loading' && 'Verifica in corso...'}
            {status === 'success' && 'Email Verificata!'}
            {status === 'error' && 'Verifica Fallita'}
          </h2>

          {/* Message */}
          <p className="text-center text-gray-300 mb-6">
            {message}
          </p>

          {/* Success redirect message */}
          {status === 'success' && (
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-4">
                Sarai reindirizzato alla dashboard tra pochi secondi...
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-purple-400 hover:text-purple-300 underline"
              >
                Vai alla dashboard ora
              </button>
            </div>
          )}

          {/* Error with expired token */}
          {status === 'error' && message.includes('scaduto') && (
            <div className="space-y-4">
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-200">
                      Il tuo link di verifica è scaduto. Clicca il pulsante qui sotto per ricevere un nuovo link di verifica.
                    </p>
                  </div>
                </div>
              </div>

              {email && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    La tua email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="tua@email.com"
                  />
                </div>
              )}

              <button
                onClick={handleResendVerification}
                disabled={!email || isResending}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-5 h-5 ${isResending ? 'animate-spin' : ''}`} />
                <span>{isResending ? 'Invio in corso...' : 'Reinvia Email di Verifica'}</span>
              </button>
            </div>
          )}

          {/* Error actions */}
          {status === 'error' && !message.includes('scaduto') && (
            <div className="space-y-3">
              <button
                onClick={() => navigate('/register')}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all"
              >
                Registrati di nuovo
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-all border border-white/20"
              >
                Vai al Login
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-center text-sm text-gray-400">
              Hai bisogno di aiuto?{' '}
              <button
                onClick={() => navigate('/contact')}
                className="text-purple-400 hover:text-purple-300 underline"
              >
                Contattaci
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
