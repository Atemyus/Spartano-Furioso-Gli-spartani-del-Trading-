import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Portal — renderizza i children direttamente sotto document.body.
 *
 * Serve per i modali/overlay: se un modale con `position: fixed` viene
 * renderizzato dentro un elemento che ha un `transform` (es. le pagine
 * animate con framer-motion), il `fixed` si posiziona rispetto a
 * quell'antenato invece che alla viewport, facendo apparire il modale
 * spostato/non centrato. Montando il modale nel body via portal si evita
 * del tutto il problema: il fixed torna relativo alla viewport reale.
 */
const Portal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  if (!mounted) return null;
  return createPortal(children, document.body);
};

export default Portal;
