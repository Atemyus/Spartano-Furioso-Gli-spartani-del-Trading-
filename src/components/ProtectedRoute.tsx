import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Shield, Loader2 } from 'lucide-react';

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
      
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Verifica il token con il backend
      const response = await fetch('http://localhost:3001/api/auth/verify-token', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        
        // Aggiorna i dati utente se necessario
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      } else {
        // Token non valido o scaduto
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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
