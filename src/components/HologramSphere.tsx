import React, { useEffect, useRef } from 'react';

/**
 * HologramSphere
 * Ologramma 3D in stile "lab/tech" disegnato su canvas, senza dipendenze esterne
 * (niente Three.js: bundle leggero e animazione fluida).
 *
 * Ispirato alle reference: sfera wireframe distorta con onde animate "interne",
 * alone di particelle orbitanti e palette neon blu → ciano → viola (brand NexoraLab).
 *
 * Performance: l'animazione gira solo quando il canvas è visibile (IntersectionObserver)
 * e la scheda è attiva; rispetta prefers-reduced-motion (rende un frame statico).
 */

type Variant = 'sphere' | 'globe';

interface HologramSphereProps {
  className?: string;
  /** Densità/dettaglio: 'low' per accenti ambientali, 'high' per l'eroe. */
  detail?: 'low' | 'high';
  /** Opacità globale del disegno (0–1). */
  intensity?: number;
  /** Velocità di rotazione relativa (1 = default). */
  speed?: number;
  /** Reagisce al movimento del mouse con un leggero parallax. */
  interactive?: boolean;
  variant?: Variant;
}

// Stop colore della palette (blu → ciano → viola → magenta) come nelle reference.
const PALETTE: [number, number, number][] = [
  [56, 189, 248],  // cyan-400
  [37, 99, 235],   // blue-600
  [129, 140, 248], // indigo-400
  [168, 85, 247],  // violet-500
  [217, 70, 239],  // fuchsia-500
];

function paletteColor(t: number): [number, number, number] {
  const clamped = Math.min(0.9999, Math.max(0, t));
  const scaled = clamped * (PALETTE.length - 1);
  const i = Math.floor(scaled);
  const f = scaled - i;
  const a = PALETTE[i];
  const b = PALETTE[Math.min(PALETTE.length - 1, i + 1)];
  return [
    Math.round(a[0] + (b[0] - a[0]) * f),
    Math.round(a[1] + (b[1] - a[1]) * f),
    Math.round(a[2] + (b[2] - a[2]) * f),
  ];
}

const HologramSphere: React.FC<HologramSphereProps> = ({
  className = '',
  detail = 'high',
  intensity = 1,
  speed = 1,
  interactive = false,
  variant = 'sphere',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Risoluzione mesh in base al dettaglio richiesto.
    const RINGS = detail === 'high' ? 26 : 16;     // latitudine
    const SEGMENTS = detail === 'high' ? 40 : 26;  // longitudine
    const PARTICLES = detail === 'high' ? 90 : 40;

    // Pre-calcolo dei vertici della sfera (direzioni unitarie + lat/long per il noise).
    type V = { lat: number; lon: number; cl: number; sl: number; co: number; so: number };
    const grid: V[][] = [];
    for (let i = 0; i <= RINGS; i++) {
      const lat = -Math.PI / 2 + (Math.PI * i) / RINGS;
      const cl = Math.cos(lat);
      const sl = Math.sin(lat);
      const row: V[] = [];
      for (let j = 0; j <= SEGMENTS; j++) {
        const lon = (2 * Math.PI * j) / SEGMENTS;
        row.push({ lat, lon, cl, sl, co: Math.cos(lon), so: Math.sin(lon) });
      }
      grid.push(row);
    }

    // Particelle orbitanti (alone esterno).
    const particles = Array.from({ length: PARTICLES }, () => {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      return {
        theta,
        phi,
        r: 1.12 + Math.random() * 0.5,
        spin: (0.2 + Math.random() * 0.8) * (Math.random() > 0.5 ? 1 : -1),
        size: 0.6 + Math.random() * 1.6,
        seed: Math.random() * 1000,
      };
    });

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    // Stato di visibilità per mettere in pausa quando fuori schermo.
    let visible = true;
    const io = new IntersectionObserver(
      ([entry]) => { visible = entry.isIntersecting; },
      { threshold: 0 }
    );
    io.observe(wrap);

    const onMouse = (e: MouseEvent) => {
      const rect = wrap.getBoundingClientRect();
      mouse.current.tx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouse.current.ty = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    if (interactive) window.addEventListener('mousemove', onMouse, { passive: true });

    let raf = 0;
    let prev = performance.now();
    let elapsed = 0; // tempo accumulato solo mentre è visibile (niente salti dopo la pausa)

    const draw = (t: number) => {
      // Smoothing del parallax del mouse.
      mouse.current.x += (mouse.current.tx - mouse.current.x) * 0.05;
      mouse.current.y += (mouse.current.ty - mouse.current.y) * 0.05;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const R = Math.min(width, height) * 0.34;
      const focal = R * 3.2;

      // Rotazione globale + leggero tilt e parallax.
      const ay = t * 0.35 + mouse.current.x * 0.4;
      const ax = (variant === 'globe' ? 0.35 : 0.22) + Math.sin(t * 0.2) * 0.08 + mouse.current.y * 0.25;
      const cay = Math.cos(ay), say = Math.sin(ay);
      const cax = Math.cos(ax), sax = Math.sin(ax);

      // Disegno additivo per il look neon.
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineWidth = 1;

      // Proietta un vertice della griglia in coordinate schermo.
      const project = (v: V) => {
        // Onde animate "interne" che deformano il raggio (effetto blob vivo).
        const wobble =
          variant === 'globe'
            ? 0.04 * Math.sin(v.lat * 6 + t * 1.2) + 0.03 * Math.sin(v.lon * 8 - t)
            : 0.16 * Math.sin(v.lat * 3 + t * 1.1) +
              0.12 * Math.sin(v.lon * 4 + t * 0.8) +
              0.08 * Math.sin((v.lat + v.lon) * 2.5 + t * 1.6);
        const r = R * (1 + wobble);

        let x = r * v.cl * v.co;
        let y = r * v.sl;
        let z = r * v.cl * v.so;

        // Rotazione Y.
        let x1 = x * cay + z * say;
        let z1 = -x * say + z * cay;
        // Rotazione X (tilt).
        let y1 = y * cax - z1 * sax;
        let z2 = y * sax + z1 * cax;

        const scale = focal / (focal + z2);
        return {
          sx: cx + x1 * scale,
          sy: cy + y1 * scale,
          depth: z2 / R,        // -1 (vicino) .. 1 (lontano)
          nx: (x1 / R + 1) / 2, // posizione orizzontale normalizzata per il colore
          ny: (y1 / R + 1) / 2,
        };
      };

      // Pre-proietta tutta la griglia.
      const proj = grid.map((row) => row.map(project));

      // Linee dei meridiani/paralleli.
      for (let i = 0; i <= RINGS; i++) {
        for (let j = 0; j <= SEGMENTS; j++) {
          const p = proj[i][j];
          // colore in base alla posizione (diagonale) come nelle reference
          const ct = (p.nx * 0.6 + p.ny * 0.4);
          const [r, g, b] = paletteColor(ct);
          // più vicino = più luminoso
          const depthA = (1 - (p.depth + 1) / 2);
          const alpha = (0.10 + depthA * 0.5) * intensity;

          // verso destra (j+1)
          if (j < SEGMENTS) {
            const q = proj[i][j + 1];
            ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p.sx, p.sy);
            ctx.lineTo(q.sx, q.sy);
            ctx.stroke();
          }
          // verso il basso (i+1)
          if (i < RINGS) {
            const q = proj[i + 1][j];
            ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p.sx, p.sy);
            ctx.lineTo(q.sx, q.sy);
            ctx.stroke();
          }

          // nodi luminosi sui vertici più vicini
          if (depthA > 0.55 && (i % 2 === 0) && (j % 2 === 0)) {
            ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 1.1})`;
            ctx.beginPath();
            ctx.arc(p.sx, p.sy, 1.1, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Alone di particelle orbitanti.
      for (const pt of particles) {
        const theta = pt.theta + t * pt.spin * 0.3;
        const r = R * pt.r * (1 + 0.04 * Math.sin(t * 0.8 + pt.seed));
        let x = r * Math.sin(pt.phi) * Math.cos(theta);
        let y = r * Math.cos(pt.phi);
        let z = r * Math.sin(pt.phi) * Math.sin(theta);

        let x1 = x * cay + z * say;
        let z1 = -x * say + z * cay;
        let y1 = y * cax - z1 * sax;
        let z2 = y * sax + z1 * cax;

        const scale = focal / (focal + z2);
        const sx = cx + x1 * scale;
        const sy = cy + y1 * scale;
        const depthA = 1 - (z2 / R + 1) / 2;
        const ct = (x1 / R + 1) / 2;
        const [r2, g2, b2] = paletteColor(ct * 0.6 + 0.2);
        const alpha = (0.15 + depthA * 0.6) * intensity;
        const size = pt.size * scale * (0.6 + depthA * 0.8);

        ctx.fillStyle = `rgba(${r2},${g2},${b2},${alpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(0.4, size), 0, Math.PI * 2);
        ctx.fill();
      }

      // Bagliore centrale soft.
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.4);
      glow.addColorStop(0, `rgba(56,189,248,${0.10 * intensity})`);
      glow.addColorStop(0.5, `rgba(37,99,235,${0.05 * intensity})`);
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = 'source-over';
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const active = visible && document.visibilityState === 'visible';
      const dt = now - prev;
      prev = now;
      // Accumula il tempo (e quindi anima) solo quando è realmente visibile.
      if (active) {
        elapsed += Math.min(dt, 50); // clamp per evitare scatti dopo throttling/pausa
        draw((elapsed / 1000) * speed);
      }
    };

    if (reduceMotion) {
      // Niente animazione: un solo frame statico.
      draw(0.6);
    } else {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      if (interactive) window.removeEventListener('mousemove', onMouse);
    };
  }, [detail, intensity, speed, interactive, variant]);

  return (
    <div ref={wrapRef} className={`pointer-events-none ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default HologramSphere;
