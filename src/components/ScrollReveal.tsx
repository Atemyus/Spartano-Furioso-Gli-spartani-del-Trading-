import React, { useEffect, useRef, useState } from 'react';

/**
 * ScrollReveal — wrapper che fa apparire i figli con un fade + slide leggero
 * quando entrano nel viewport. Usa IntersectionObserver (zero deps), si attiva
 * una sola volta per elemento e rispetta prefers-reduced-motion.
 *
 * Pensato per dare un tocco "vivo" allo scroll della home senza appesantire.
 */
interface ScrollRevealProps {
  children: React.ReactNode;
  /** Distanza iniziale in px (verticale o orizzontale a seconda di `direction`). */
  distance?: number;
  /** Direzione di entrata. */
  direction?: 'up' | 'down' | 'left' | 'right';
  /** Durata in secondi. */
  duration?: number;
  /** Ritardo in secondi (utile per cascate). */
  delay?: number;
  /** Soglia di intersezione (0–1). */
  threshold?: number;
  /** Trigger una sola volta (default true). */
  once?: boolean;
  className?: string;
  /** Tag wrapper (default div). */
  as?: keyof JSX.IntrinsicElements;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  distance = 28,
  direction = 'up',
  duration = 0.7,
  delay = 0,
  threshold = 0.12,
  once = true,
  className = '',
  as = 'div',
}) => {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion) { setVisible(true); return; }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) io.unobserve(entry.target);
          } else if (!once) {
            setVisible(false);
          }
        }
      },
      { threshold, rootMargin: '0px 0px -60px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, once, reduceMotion]);

  const initialTransform = (() => {
    switch (direction) {
      case 'up':    return `translate3d(0, ${distance}px, 0)`;
      case 'down':  return `translate3d(0, -${distance}px, 0)`;
      case 'left':  return `translate3d(${distance}px, 0, 0)`;
      case 'right': return `translate3d(-${distance}px, 0, 0)`;
    }
  })();

  const style: React.CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translate3d(0,0,0)' : initialTransform,
    transition: `opacity ${duration}s cubic-bezier(0.22, 0.61, 0.36, 1) ${delay}s, transform ${duration}s cubic-bezier(0.22, 0.61, 0.36, 1) ${delay}s`,
    willChange: visible ? 'auto' : 'opacity, transform',
  };

  return React.createElement(
    as,
    { ref: ref as any, className, style },
    children
  );
};

export default ScrollReveal;
