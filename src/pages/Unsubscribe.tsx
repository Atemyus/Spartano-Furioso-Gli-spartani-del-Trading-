import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Mail, CheckCircle, XCircle } from 'lucide-react';

const Unsubscribe: React.FC = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleUnsubscribe = async () => {
    if (!email) {
      setError('Email non valida');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/newsletter/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Errore durante la disiscrizione');
      }
    } catch (error) {
      console.error('Unsubscribe error:', error);
      setError('Errore di connessione. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-3 group">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-red-500/30 blur-xl rounded-full animate-pulse"></div>
              <img 
                src="/logo.png" 
                alt="Spartano Furioso Logo" 
                className="w-20 h-20 md:w-28 md:h-28 object-contain relative z-10 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)] group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div>
              <h1 className="text-3xl font-black">
                <span className="bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 bg-clip-text text-transparent">SPARTANO</span>
                <span className="text-white ml-2">FURIOSO</span>
              </h1>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-gray-900/50 backdrop-blur-sm border-2 border-red-800/50 rounded-2xl p-8">
          {!success ? (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-900/30 rounded-full mb-4">
                  <Mail className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2">Disiscrizione Newsletter</h2>
                <p className="text-gray-400">Ci dispiace vederti andare, guerriero!</p>
              </div>

              {email && (
                <div className="mb-6 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Email da disiscrivere:</p>
                  <p className="text-white font-medium">{email}</p>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <button
                  onClick={handleUnsubscribe}
                  disabled={loading || !email}
                  className="w-full py-3 px-6 bg-gradient-to-r from-red-600 to-red-800 rounded-xl font-bold text-white hover:from-red-500 hover:to-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Caricamento...' : 'Conferma Disiscrizione'}
                </button>

                <Link
                  to="/"
                  className="block w-full py-3 px-6 bg-gray-800 border border-gray-700 rounded-xl font-bold text-white text-center hover:bg-gray-700 transition-all duration-300"
                >
                  Torna alla Homepage
                </Link>
              </div>

              <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                <p className="text-xs text-yellow-400 text-center">
                  ⚠️ Cliccando "Conferma Disiscrizione" non riceverai più email dalla Falange di Spartano Furioso
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-900/30 rounded-full mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2">Disiscrizione Completata</h2>
                <p className="text-gray-400 mb-6">
                  Ti sei disiscritto con successo dalla newsletter. Non riceverai più email da noi.
                </p>

                <div className="space-y-4">
                  <p className="text-gray-300 text-sm">
                    Hai cambiato idea? Puoi sempre iscriverti di nuovo dalla homepage!
                  </p>

                  <Link
                    to="/"
                    className="block w-full py-3 px-6 bg-gradient-to-r from-yellow-600 to-red-600 rounded-xl font-bold text-white text-center hover:from-yellow-500 hover:to-red-500 transition-all duration-300"
                  >
                    Torna alla Homepage
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quote */}
        <div className="mt-8 text-center">
          <blockquote className="text-gray-400 italic text-sm">
            "La vera sconfitta è quando un guerriero perde la speranza."
            <p className="text-yellow-500 text-xs mt-2 font-bold">- Filosofia Spartana -</p>
          </blockquote>
        </div>
      </div>
    </div>
  );
};

export default Unsubscribe;
