import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, RefreshCw, Shield } from 'lucide-react';

const AuthDebug: React.FC = () => {
  const navigate = useNavigate();
  const [localStorageData, setLocalStorageData] = useState<any>({});
  const [serverCheck, setServerCheck] = useState<string>('');

  useEffect(() => {
    loadLocalStorage();
    checkServerAuth();
  }, []);

  const loadLocalStorage = () => {
    const data = {
      token: localStorage.getItem('token'),
      user: localStorage.getItem('user'),
      timestamp: new Date().toISOString()
    };
    setLocalStorageData(data);
  };

  const checkServerAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setServerCheck('❌ Nessun token presente');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/auth/verify-token', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setServerCheck(`✅ Token valido - Utente: ${data.user?.email || 'Unknown'}`);
      } else {
        setServerCheck('❌ Token non valido o scaduto');
      }
    } catch (error) {
      setServerCheck('❌ Errore connessione server');
    }
  };

  const clearAll = () => {
    localStorage.clear();
    sessionStorage.clear();
    alert('✅ Tutti i dati sono stati cancellati!');
    loadLocalStorage();
    checkServerAuth();
  };

  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    alert('✅ Token e dati utente cancellati!');
    loadLocalStorage();
    checkServerAuth();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-900/50 border border-red-800/50 rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <Shield className="w-8 h-8 text-yellow-500" />
            Auth Debug Panel
          </h1>

          {/* Server Status */}
          <div className="mb-8 p-4 bg-black/50 rounded-lg">
            <h2 className="text-xl font-bold text-yellow-500 mb-3">🔐 Stato Server</h2>
            <p className="text-white font-mono">{serverCheck || 'Checking...'}</p>
          </div>

          {/* LocalStorage Content */}
          <div className="mb-8 p-4 bg-black/50 rounded-lg">
            <h2 className="text-xl font-bold text-yellow-500 mb-3">📦 LocalStorage</h2>
            
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Token:</p>
                <p className="text-white font-mono text-xs break-all">
                  {localStorageData.token || '(vuoto)'}
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">User Data:</p>
                <pre className="text-white font-mono text-xs overflow-auto p-2 bg-black/30 rounded">
                  {localStorageData.user 
                    ? JSON.stringify(JSON.parse(localStorageData.user), null, 2)
                    : '(vuoto)'
                  }
                </pre>
              </div>

              <div>
                <p className="text-gray-400 text-sm">Last Check:</p>
                <p className="text-white font-mono text-xs">
                  {localStorageData.timestamp}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={clearAuth}
              className="px-6 py-3 bg-yellow-600 hover:bg-yellow-500 rounded-lg font-bold text-white flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Cancella Auth
            </button>

            <button
              onClick={clearAll}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-lg font-bold text-white flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Cancella TUTTO
            </button>

            <button
              onClick={() => {
                loadLocalStorage();
                checkServerAuth();
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-white flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Ricarica
            </button>

            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-bold text-white"
            >
              Vai al Login
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
            <h3 className="text-lg font-bold text-blue-400 mb-2">🔍 Come usare:</h3>
            <ol className="text-gray-300 space-y-1 text-sm list-decimal list-inside">
              <li>Se vedi dati nel localStorage, clicca "Cancella Auth"</li>
              <li>Verifica che il server status sia "Nessun token presente"</li>
              <li>Vai al login e prova ad accedere</li>
              <li>Se ancora accede, clicca "Cancella TUTTO" e riprova</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthDebug;
