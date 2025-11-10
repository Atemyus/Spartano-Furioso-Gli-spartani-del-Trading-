import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Loader2, XCircle, Home, Package, Shield } from 'lucide-react';

const Success: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setMessage('Sessione di pagamento non valida');
      return;
    }

    // Verifica lo stato del pagamento
    checkPaymentStatus();
  }, [sessionId]);

  const checkPaymentStatus = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/stripe/verify-session/${sessionId}`);
      
      if (response.ok) {
        const data = await response.json();
        setStatus('success');
        setMessage(data.message || 'Pagamento completato con successo!');
        
        // Redirect alla dashboard dopo 5 secondi
        setTimeout(() => {
          navigate('/dashboard');
        }, 5000);
      } else {
        setStatus('error');
        setMessage('Si è verificato un errore nella verifica del pagamento');
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      setStatus('error');
      setMessage('Errore di connessione. Contatta il supporto.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 text-center backdrop-blur-sm">
          {status === 'loading' && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 bg-blue-900/20 rounded-full flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">
                Verifica del pagamento...
              </h1>
              <p className="text-gray-400">
                Stiamo verificando il tuo pagamento. Non chiudere questa pagina.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 bg-green-900/20 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-3">
                Pagamento Completato!
              </h1>
              <p className="text-gray-300 mb-6">
                {message}
              </p>
              
              <div className="bg-green-900/20 border border-green-800/30 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3 text-green-400">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm">
                    Il tuo acquisto è stato processato con successo e riceverai una email di conferma.
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-6">
                Sarai reindirizzato alla dashboard tra 5 secondi...
              </p>

              <div className="flex flex-col gap-3">
                <Link
                  to="/dashboard"
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-semibold text-white hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <Package className="w-5 h-5" />
                  Vai alla Dashboard
                </Link>
                
                <Link
                  to="/"
                  className="w-full px-6 py-3 bg-gray-800 border border-gray-700 rounded-lg font-semibold text-gray-300 hover:bg-gray-700 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <Home className="w-5 h-5" />
                  Torna alla Home
                </Link>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 bg-red-900/20 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">
                Errore nel Pagamento
              </h1>
              <p className="text-gray-300 mb-6">
                {message}
              </p>

              <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-4 mb-6">
                <p className="text-red-400 text-sm">
                  Se hai bisogno di assistenza, contatta il nostro supporto fornendo il codice sessione:
                </p>
                <p className="text-red-300 font-mono text-xs mt-2 break-all">
                  {sessionId || 'N/A'}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  to="/products"
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-semibold text-white hover:from-purple-700 hover:to-blue-700 transition-all"
                >
                  Riprova l'acquisto
                </Link>
                
                <Link
                  to="/"
                  className="w-full px-6 py-3 bg-gray-800 border border-gray-700 rounded-lg font-semibold text-gray-300 hover:bg-gray-700 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <Home className="w-5 h-5" />
                  Torna alla Home
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Hai domande? Contattaci a{' '}
            <a href="mailto:support@spartantrading.com" className="text-purple-400 hover:text-purple-300">
              support@spartantrading.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Success;
