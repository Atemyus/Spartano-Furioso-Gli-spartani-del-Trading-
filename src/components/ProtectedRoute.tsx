import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { API_URL } from '../config/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Se abbiamo già token e user, autentichiamo subito senza chiamata API
      // La verifica token verrà fatta solo se necessario (es. dopo login)
      if (token && user) {
        setIsAuthenticated(true);
        setIsLoading(false);
        
        // Verifica token in background solo se è passato più di 1 ora dall'ultimo check
        const lastCheck = localStorage.getItem('lastAuthCheck');
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        
        if (!lastCheck || (now - parseInt(lastCheck)) > oneHour) {
          // Verifica in background senza bloccare l'UI
          fetch(`${API_URL}/api/auth/verify-token`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }).then(response => {
            if (response.ok) {
              localStorage.setItem('lastAuthCheck', now.toString());
              return response.json();
            } else {
              // Token non valido, logout
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              localStorage.removeItem('lastAuthCheck');
              window.location.href = '/login';
            }
          }).then(data => {
            if (data?.user) {
              localStorage.setItem('user', JSON.stringify(data.user));
            }
          }).catch(err => {
            console.error('Background auth check failed:', err);
          });
        }
        return;
      }

      // Se non abbiamo user ma abbiamo token, verifica subito
      const response = await fetch(`${API_URL}/api/auth/verify-token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        localStorage.setItem('lastAuthCheck', Date.now().toString());
        
        // Aggiorna i dati utente se necessario
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      } else {
        // Token non valido o scaduto
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('lastAuthCheck');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Mostra loading mentre verifica
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-900/20 rounded-full mb-4">
            <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Verifica accesso...</h2>
          <p className="text-gray-400">Un momento, stiamo verificando la tua autenticazione</p>
        </div>
      </div>
    );
  }

  // Se non è autenticato, redirect al login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Se è autenticato, mostra il contenuto
  return <>{children}</>;
};

export default ProtectedRoute;
