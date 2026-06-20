import { useEffect } from 'react';

/**
 * useScrollLock — blocca lo scroll del <body> finche' active=true.
 *
 * Quando un modale o un overlay si apre, lo scroll della pagina sottostante
 * dovrebbe essere bloccato per evitare:
 *  - effetto "il modale appare e poi il body scrolla sotto"
 *  - scroll della pagina con la rotella mentre si interagisce col modale
 *  - reset della scroll position se il body diventa scrollable di nuovo
 *
 * Compensa anche la scrollbar verticale che sparisce su Windows/Chrome,
 * aggiungendo un padding-right pari alla sua larghezza, in modo che il
 * contenuto non "salti" lateralmente all'apertura del modale.
 */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const body = document.body;
    const html = document.documentElement;

    const prevBodyOverflow = body.style.overflow;
    const prevBodyPadding = body.style.paddingRight;
    const scrollBarWidth = window.innerWidth - html.clientWidth;

    body.style.overflow = 'hidden';
    if (scrollBarWidth > 0) {
      body.style.paddingRight = `${scrollBarWidth}px`;
    }

    return () => {
      body.style.overflow = prevBodyOverflow;
      body.style.paddingRight = prevBodyPadding;
    };
  }, [active]);
}
