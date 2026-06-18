import React, { useEffect, useRef } from 'react';

/**
 * NeonCracks — sfondo decorativo: reticolo di crepe luminose stile "neon lava".
 *
 * Concept: prende ispirazione dalle texture "lava cracks" (frammentazione poligonale
 * con luce che fuoriesce dalle fessure) e la traduce nella palette del brand
 * (blu/ciano/viola). Ogni crepa e' un segmento spezzato con piccoli "denti"
 * organici. Glow a 3 livelli (outer / mid / bright core) per dare un effetto 3D
 * di "tubo luminoso" sotto la superficie.
 *
 * Effetti animati (4 livelli sovrapposti, danno vivacita' senza essere caotici):
 *  1. Breath          — pulsazione lenta di luminosita' per crepa
 *  2. Travel pulses   — punti luminosi che scorrono lungo ogni crepa
 *  3. Shockwaves      — onde d'energia (anelli espandenti) che propagano luce
 *                       attraverso il network; partono da punti casuali ogni 2-5s
 *  4. Lightning strike— ogni crepa "lampeggia" forte una volta ogni ~18s, sfalsate
 *
 * Interattivo (opt-in): le crepe sotto il cursore si illuminano in tempo reale.
 *
 * Performance: l'animazione si ferma quando il componente non e' visibile
 * (IntersectionObserver) o la scheda non e' attiva; rispetta prefers-reduced-motion.
 */

type Density = 'low' | 'medium' | 'high';

interface NeonCracksProps {
  className?: string;
  intensity?: number;
  density?: Density;
  interactive?: boolean;
}

const PALETTE: [number, number, number][] = [
  [56, 189, 248],
  [37, 99, 235],
  [129, 140, 248],
  [168, 85, 247],
  [217, 70, 239],
];

function paletteColor(t: number): [number, number, number] {
  const c = Math.min(0.9999, Math.max(0, t));
  const s = c * (PALETTE.length - 1);
  const i = Math.floor(s);
  const f = s - i;
  const a = PALETTE[i];
  const b = PALETTE[Math.min(PALETTE.length - 1, i + 1)];
  return [
    Math.round(a[0] + (b[0] - a[0]) * f),
    Math.round(a[1] + (b[1] - a[1]) * f),
    Math.round(a[2] + (b[2] - a[2]) * f),
  ];
}

const NeonCracks: React.FC<NeonCracksProps> = ({
  className = '',
  intensity = 1,
  density = 'medium',
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: -10000, y: -10000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    type V = { x: number; y: number };
    type Edge = {
      pts: { x: number; y: number }[];   // polilinea (vertici giuntura inclusi)
      segLens: number[];
      length: number;
      midX: number;
      midY: number;
      phase: number;
      pulsePhase: number;
      pulseSpeed: number;
      colorT: number;
      strikePhase: number;
    };

    let vertices: V[] = [];
    let edges: Edge[] = [];

    const buildNetwork = () => {
      vertices = [];
      edges = [];
      const target = density === 'low' ? 170 : density === 'high' ? 90 : 125;
      const cols = Math.max(3, Math.round(width / target));
      const rows = Math.max(3, Math.round(height / target));
      const sx = width / cols;
      const sy = height / rows;

      // Grid jitterata: pattern denso poligonale (richiama il Voronoi della reference)
      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          const off = (r % 2) * 0.5;
          vertices.push({
            x: (c + off) * sx + (Math.random() - 0.5) * sx * 0.55,
            y: r * sy + (Math.random() - 0.5) * sy * 0.55,
          });
        }
      }

      // Connetti ogni vertice ai K piu' vicini (filtrando per distanza max)
      const K = 4;
      const seen = new Set<string>();
      const maxDist = Math.max(sx, sy) * 1.7;
      for (let i = 0; i < vertices.length; i++) {
        const dists: [number, number][] = [];
        for (let j = 0; j < vertices.length; j++) {
          if (i === j) continue;
          const dx = vertices[i].x - vertices[j].x;
          const dy = vertices[i].y - vertices[j].y;
          dists.push([j, dx * dx + dy * dy]);
        }
        dists.sort((a, b) => a[1] - b[1]);
        for (let k = 0; k < K; k++) {
          if (k >= dists.length) break;
          const [j, dsq] = dists[k];
          if (Math.sqrt(dsq) > maxDist) break;
          const key = i < j ? `${i}-${j}` : `${j}-${i}`;
          if (seen.has(key)) continue;
          // ~15% delle connessioni scartate → pattern irregolare/spezzato come la lava
          if (Math.random() > 0.85) continue;
          seen.add(key);

          const a = vertices[i], b = vertices[j];
          const dist = Math.sqrt(dsq);
          const px = -(b.y - a.y) / dist;
          const py = (b.x - a.x) / dist;
          const numMids = 2 + Math.floor(Math.random() * 2);
          const pts: { x: number; y: number }[] = [{ x: a.x, y: a.y }];
          for (let m = 1; m <= numMids; m++) {
            const t = m / (numMids + 1);
            const jit = (Math.random() - 0.5) * dist * 0.18;
            pts.push({
              x: a.x + (b.x - a.x) * t + px * jit,
              y: a.y + (b.y - a.y) * t + py * jit,
            });
          }
          pts.push({ x: b.x, y: b.y });

          let totLen = 0;
          const segLens: number[] = [];
          for (let m = 0; m < pts.length - 1; m++) {
            const l = Math.hypot(pts[m + 1].x - pts[m].x, pts[m + 1].y - pts[m].y);
            segLens.push(l);
            totLen += l;
          }

          edges.push({
            pts,
            segLens,
            length: totLen,
            midX: (a.x + b.x) / 2,
            midY: (a.y + b.y) / 2,
            phase: Math.random() * Math.PI * 2,
            pulsePhase: Math.random(),
            pulseSpeed: 0.25 + Math.random() * 0.3,
            colorT: 0.1 + Math.random() * 0.8,
            strikePhase: Math.random() * 18,
          });
        }
      }
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const newW = Math.max(1, rect.width);
      const newH = Math.max(1, rect.height);
      const changed = Math.abs(newW - width) > 5 || Math.abs(newH - height) > 5;
      width = newW;
      height = newH;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      if (changed || edges.length === 0) buildNetwork();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    let visible = true;
    const io = new IntersectionObserver(
      ([entry]) => { visible = entry.isIntersecting; },
      { threshold: 0 }
    );
    io.observe(wrap);

    const onMouse = (e: MouseEvent) => {
      const rect = wrap.getBoundingClientRect();
      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = e.clientY - rect.top;
    };
    if (interactive) window.addEventListener('mousemove', onMouse, { passive: true });

    // Onde d'urto (shockwaves) — anelli espandenti che illuminano le crepe
    type Wave = { x: number; y: number; t: number; speed: number; maxR: number };
    let waves: Wave[] = [];
    let nextWaveAt = 0.8; // primo wave dopo 0.8s

    const drawPolyline = (pts: { x: number; y: number }[], stroke: string, lw: number) => {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let k = 1; k < pts.length; k++) ctx.lineTo(pts[k].x, pts[k].y);
      ctx.stroke();
    };

    const pointAt = (e: Edge, tNorm: number) => {
      const target = tNorm * e.length;
      let acc = 0;
      for (let k = 0; k < e.segLens.length; k++) {
        if (acc + e.segLens[k] >= target) {
          const tk = (target - acc) / e.segLens[k];
          return {
            x: e.pts[k].x + (e.pts[k + 1].x - e.pts[k].x) * tk,
            y: e.pts[k].y + (e.pts[k + 1].y - e.pts[k].y) * tk,
          };
        }
        acc += e.segLens[k];
      }
      return e.pts[e.pts.length - 1];
    };

    const draw = (t: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalCompositeOperation = 'lighter';

      for (let i = 0; i < edges.length; i++) {
        const e = edges[i];
        const [r, g, bl] = paletteColor(e.colorT);

        // 1) breath
        const breath = 0.55 + 0.35 * Math.sin(t * 0.4 + e.phase);

        // 2) shockwave contributo
        let waveBoost = 0;
        for (const w of waves) {
          const d = Math.hypot(e.midX - w.x, e.midY - w.y);
          const ringR = w.t * w.speed;
          const ringW = 90;
          const dist = Math.abs(d - ringR);
          if (dist < ringW) {
            const age = 1 - (w.t * w.speed) / w.maxR;
            waveBoost = Math.max(waveBoost, (1 - dist / ringW) * 0.95 * Math.max(0, age));
          }
        }

        // 3) mouse glow
        let mouseBoost = 0;
        if (interactive && mouse.current.x > -1000) {
          const d = Math.hypot(e.midX - mouse.current.x, e.midY - mouse.current.y);
          mouseBoost = Math.max(0, 1 - d / 260) * 0.7;
        }

        // 4) lightning strike (rapido lampeggio sfalsato)
        const cyc = 18;
        const sT = ((t + e.strikePhase) % cyc) / cyc;
        let strikeBoost = 0;
        if (sT < 0.07) strikeBoost = Math.sin((sT / 0.07) * Math.PI) * 0.7;

        const brightness = Math.min(1.15, (0.28 * breath + waveBoost + mouseBoost + strikeBoost) * intensity);
        const baseAlpha = Math.min(0.95, brightness);

        // Disegno multi-strato (illusione di "tubo luminoso" → effetto 3D)
        drawPolyline(e.pts, `rgba(${r},${g},${bl},${baseAlpha * 0.12})`, 8);
        drawPolyline(e.pts, `rgba(${r},${g},${bl},${baseAlpha * 0.34})`, 2.6);
        drawPolyline(e.pts, `rgba(255,255,255,${baseAlpha * 0.5})`, 0.7);

        // Pulse scorrevole
        const period = 4 / e.pulseSpeed;
        const u = ((t * e.pulseSpeed + e.pulsePhase * period) % period) / period;
        const p = pointAt(e, u);
        const pr = 13;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pr);
        grad.addColorStop(0, `rgba(255,255,255,${0.85 * intensity})`);
        grad.addColorStop(0.4, `rgba(${r},${g},${bl},${0.55 * intensity})`);
        grad.addColorStop(1, `rgba(${r},${g},${bl},0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(p.x - pr, p.y - pr, pr * 2, pr * 2);
      }

      // Anelli delle shockwave (sottili, accenti sull'origine)
      for (const w of waves) {
        const ringR = w.t * w.speed;
        const age = 1 - ringR / w.maxR;
        const a = Math.max(0, age) * 0.28 * intensity;
        if (a < 0.01) continue;
        ctx.strokeStyle = `rgba(56,189,248,${a})`;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.arc(w.x, w.y, ringR, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.globalCompositeOperation = 'source-over';
    };

    let raf = 0;
    let prev = performance.now();
    let elapsed = 0;

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const active = visible && document.visibilityState === 'visible';
      const dt = now - prev;
      prev = now;
      if (active) {
        elapsed += Math.min(dt, 50);
        const t = elapsed / 1000;

        if (t >= nextWaveAt) {
          const maxR = Math.max(width, height) * 1.35;
          waves.push({
            x: Math.random() * width,
            y: Math.random() * height,
            t: 0,
            speed: 240 + Math.random() * 200,
            maxR,
          });
          nextWaveAt = t + 2 + Math.random() * 3;
        }

        waves = waves.filter((w) => {
          w.t += dt / 1000;
          return w.t * w.speed < w.maxR;
        });

        draw(t);
      }
    };

    if (reduceMotion) draw(0.5);
    else raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      if (interactive) window.removeEventListener('mousemove', onMouse);
    };
  }, [density, intensity, interactive]);

  return (
    <div ref={wrapRef} className={`pointer-events-none ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default NeonCracks;
