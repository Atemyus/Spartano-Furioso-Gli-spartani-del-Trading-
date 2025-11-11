import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.spartanofurioso.com';

// Genera o recupera sessionId
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  
  return sessionId;
};

// Track page view
const trackPageView = async (page: string, referrer: string | null) => {
  try {
    const sessionId = getSessionId();
    
    await fetch(`${API_URL}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page,
        referrer,
        sessionId,
      }),
    });
  } catch (error) {
    // Silently fail - non vogliamo interrompere l'esperienza utente
    console.debug('Analytics tracking failed:', error);
  }
};

/**
 * Hook per tracciare automaticamente le pageview
 * Uso: usePageTracking() all'interno del componente principale App
 */
export const usePageTracking = () => {
  const location = useLocation();
  const previousPath = useRef<string | null>(null);

  useEffect(() => {
    const currentPath = location.pathname + location.search;
    const referrer = previousPath.current;
    
    // Track page view
    trackPageView(currentPath, referrer);
    
    // Aggiorna il riferimento per la prossima navigazione
    previousPath.current = currentPath;
  }, [location]);
};

export default usePageTracking;
