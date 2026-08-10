import React, { useEffect, useRef } from 'react';

/**
 * CalendlyInline — incorpora il widget Calendly direttamente nella pagina
 * (niente redirect esterno). Carica lo script ufficiale una volta sola e
 * passa i prefill (nome, email) + le risposte del sondaggio come custom
 * questions (a1, a2, ...) cosi' Calendly le mostra/registra con l'evento.
 *
 * Sostituisci CALENDLY_URL con il tuo link evento.
 */
interface Props {
  url: string;
  prefill?: { name?: string; email?: string };
  /** Risposte sondaggio: diventano a1, a2, a3... nelle custom questions Calendly */
  answers?: string[];
  dark?: boolean;
}

const CalendlyInline: React.FC<Props> = ({ url, prefill, answers, dark = true }) => {
  const ref = useRef<HTMLDivElement>(null);

  // Costruisce l'URL con prefill + custom answers
  const buildUrl = () => {
    const u = new URL(url);
    // tema/colori coerenti col brand
    u.searchParams.set('hide_gdpr_banner', '1');
    u.searchParams.set('background_color', dark ? '0b1220' : 'ffffff');
    u.searchParams.set('text_color', dark ? 'e2e8f0' : '0f172a');
    u.searchParams.set('primary_color', '06b6d4');
    if (prefill?.name) u.searchParams.set('name', prefill.name);
    if (prefill?.email) u.searchParams.set('email', prefill.email);
    (answers || []).forEach((a, i) => {
      if (a) u.searchParams.set(`a${i + 1}`, a);
    });
    return u.toString();
  };

  useEffect(() => {
    const SCRIPT_SRC = 'https://assets.calendly.com/assets/external/widget.js';
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (!existing) {
      const s = document.createElement('script');
      s.src = SCRIPT_SRC;
      s.async = true;
      document.body.appendChild(s);
    }
    // Calendly legge i div con class "calendly-inline-widget" e data-url al load.
    // Se lo script e' gia' presente, forziamo l'init.
    const tryInit = () => {
      // @ts-ignore
      if (window.Calendly && ref.current) {
        ref.current.innerHTML = '';
        // @ts-ignore
        window.Calendly.initInlineWidget({ url: buildUrl(), parentElement: ref.current });
      }
    };
    const t = setTimeout(tryInit, 600);
    const t2 = setTimeout(tryInit, 1500);
    return () => { clearTimeout(t); clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, JSON.stringify(prefill), JSON.stringify(answers)]);

  return (
    <div
      ref={ref}
      className="calendly-inline-widget rounded-xl overflow-hidden"
      data-url={buildUrl()}
      style={{ minWidth: '320px', height: '700px' }}
    />
  );
};

export default CalendlyInline;
