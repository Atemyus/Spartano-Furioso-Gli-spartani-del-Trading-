import React, { useEffect, useRef } from 'react';

/**
 * HologramSphere — ologrammi 3D animati su canvas (no Three.js).
 *
 * 11 varianti tematiche:
 *   sphere   — eroe: blob wireframe distorta con onde interne
 *   globe    — terra/mondo digitalizzato
 *   neural   — rete neurale densa con hub, segnali e flash all'arrivo (AI)
 *   cpu      — circuit board / chip con tracce e pulse (computing)
 *   chart    — superficie heightmap 3D + price line (trading)
 *   candles  — candele giapponesi 3D animate (trading classico)
 *   dna      — doppia elica con segnali che salgono (formazione/crescita)
 *   atom     — nucleo + 3 orbite con elettroni che girano (lab/scienza)
 *   cube     — cubo wireframe con grafico a barre interno (tool/strategia)
 *   torus    — anello/toro con pulse che orbitano (cicli mercato)
 *   crypto   — blockchain: catena di blocchi con pulse di propagazione
 *
 * Tutte le varianti:
 *   - 3D rotation + parallax mouse opzionale
 *   - animazione attiva solo quando visibili (IntersectionObserver)
 *   - rispettano prefers-reduced-motion
 */

type Variant =
  | 'sphere' | 'globe' | 'neural' | 'cpu' | 'chart'
  | 'candles' | 'dna' | 'atom' | 'cube' | 'torus' | 'crypto';

interface HologramSphereProps {
  className?: string;
  detail?: 'low' | 'high';
  intensity?: number;
  speed?: number;
  interactive?: boolean;
  variant?: Variant;
}

const PALETTE: [number, number, number][] = [
  [56, 189, 248],   // cyan-400
  [37, 99, 235],    // blue-600
  [129, 140, 248],  // indigo-400
  [168, 85, 247],   // violet-500
  [217, 70, 239],   // fuchsia-500
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

// 8 corner posizionali di un cubo unitario (-1/+1) — usati da 'cube' e 'crypto'.
const CUBE_CORNERS: [number, number, number][] = [
  [-1,-1,-1],[ 1,-1,-1],[-1, 1,-1],[ 1, 1,-1],
  [-1,-1, 1],[ 1,-1, 1],[-1, 1, 1],[ 1, 1, 1],
];
const CUBE_EDGES: [number, number][] = [
  [0,1],[1,3],[3,2],[2,0],
  [4,5],[5,7],[7,6],[6,4],
  [0,4],[1,5],[2,6],[3,7],
];

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

    // RNG deterministica, seed legato al nome della variante (visual stabile + diverso fra varianti).
    const rng = (() => {
      let s = 0x9e3779b9;
      for (let i = 0; i < variant.length; i++) s = ((s * 31) + variant.charCodeAt(i)) | 0;
      return () => {
        s = ((s * 1664525) + 1013904223) | 0;
        return ((s >>> 0) % 1e9) / 1e9;
      };
    })();

    // ====== Dati per-variante (pre-calcolati una volta) ======

    // sphere/globe
    type GridV = { lat: number; lon: number; cl: number; sl: number; co: number; so: number };
    let sphereGrid: GridV[][] = [];
    const spherePts: { theta: number; phi: number; r: number; spin: number; size: number; seed: number }[] = [];
    if (variant === 'sphere' || variant === 'globe') {
      const RINGS = detail === 'high' ? 26 : 18;
      const SEGMENTS = detail === 'high' ? 40 : 28;
      for (let i = 0; i <= RINGS; i++) {
        const lat = -Math.PI / 2 + (Math.PI * i) / RINGS;
        const cl = Math.cos(lat), sl = Math.sin(lat);
        const row: GridV[] = [];
        for (let j = 0; j <= SEGMENTS; j++) {
          const lon = (2 * Math.PI * j) / SEGMENTS;
          row.push({ lat, lon, cl, sl, co: Math.cos(lon), so: Math.sin(lon) });
        }
        sphereGrid.push(row);
      }
      if (variant === 'sphere') {
        const n = detail === 'high' ? 90 : 40;
        for (let i = 0; i < n; i++) {
          spherePts.push({
            theta: rng() * Math.PI * 2,
            phi: Math.acos(2 * rng() - 1),
            r: 1.12 + rng() * 0.5,
            spin: (0.2 + rng() * 0.8) * (rng() > 0.5 ? 1 : -1),
            size: 0.6 + rng() * 1.6,
            seed: rng() * 1000,
          });
        }
      }
    }

    // neural (riprogettata)
    type NNode = { x: number; y: number; z: number; size: number; phase: number; hub: boolean };
    const nnodes: NNode[] = [];
    const nedges: [number, number, number][] = [];
    const nparticles: typeof spherePts = [];
    let flashArr: Float32Array | null = null;
    if (variant === 'neural') {
      const N = detail === 'high' ? 110 : 65;
      // 70% nodi sulla superficie + 30% interni → profondità reale
      for (let i = 0; i < N; i++) {
        const phi = Math.acos(2 * rng() - 1);
        const theta = 2 * Math.PI * rng();
        const inner = i >= Math.floor(N * 0.7);
        const r = inner ? 0.4 + rng() * 0.35 : 1.0;
        nnodes.push({
          x: r * Math.sin(phi) * Math.cos(theta),
          y: r * Math.cos(phi),
          z: r * Math.sin(phi) * Math.sin(theta),
          size: 1.3 + rng() * 1.4,
          phase: rng() * Math.PI * 2,
          hub: rng() > 0.85,
        });
      }
      for (const n of nnodes) if (n.hub) n.size *= 1.9;

      // K nearest neighbors (hub: K+2)
      const K = 4;
      const seen = new Set<string>();
      for (let i = 0; i < N; i++) {
        const dists: [number, number][] = [];
        for (let j = 0; j < N; j++) {
          if (i === j) continue;
          const dx = nnodes[i].x - nnodes[j].x;
          const dy = nnodes[i].y - nnodes[j].y;
          const dz = nnodes[i].z - nnodes[j].z;
          dists.push([j, dx*dx + dy*dy + dz*dz]);
        }
        dists.sort((a, b) => a[1] - b[1]);
        const useK = nnodes[i].hub ? K + 2 : K;
        for (let m = 0; m < useK; m++) {
          const j = dists[m][0];
          const key = i < j ? `${i}-${j}` : `${j}-${i}`;
          if (seen.has(key)) continue;
          seen.add(key);
          nedges.push([i, j, rng()]);
        }
      }
      flashArr = new Float32Array(N);

      const PC = detail === 'high' ? 40 : 22;
      for (let i = 0; i < PC; i++) {
        nparticles.push({
          theta: rng() * Math.PI * 2,
          phi: Math.acos(2 * rng() - 1),
          r: 1.15 + rng() * 0.45,
          spin: (0.2 + rng() * 0.8) * (rng() > 0.5 ? 1 : -1),
          size: 0.5 + rng() * 1.2,
          seed: rng() * 1000,
        });
      }
    }

    // cpu
    type Trace = { x1: number; y1: number; x2: number; y2: number; phase: number; sp: number; pulse: boolean };
    type Pad = { x: number; y: number; size: number };
    const cpuTraces: Trace[] = [];
    const cpuPads: Pad[] = [];
    let cpuGrid = 0;
    const cpuChip = { cx: 0, cy: 0, w: 0, h: 0 };
    if (variant === 'cpu') {
      cpuGrid = detail === 'high' ? 10 : 8;
      cpuChip.cx = cpuGrid / 2;
      cpuChip.cy = cpuGrid / 2;
      cpuChip.w = 2.4;
      cpuChip.h = 2.4;
      const inChip = (x: number, y: number) =>
        Math.abs(x - cpuChip.cx) < cpuChip.w / 2 && Math.abs(y - cpuChip.cy) < cpuChip.h / 2;
      const buildTraces = (horizontal: boolean) => {
        for (let p = 0; p <= cpuGrid; p++) {
          let s = -1;
          for (let q = 0; q <= cpuGrid; q++) {
            const c = horizontal ? q : p;
            const r = horizontal ? p : q;
            const inside = inChip(c, r);
            const br = inside || rng() > 0.88 || q === cpuGrid;
            if (!br && s < 0) s = q;
            if (br && s >= 0) {
              const e = inside ? q - 0.5 : q;
              if (e - s >= 1) {
                cpuTraces.push({
                  x1: horizontal ? s : p, y1: horizontal ? p : s,
                  x2: horizontal ? e : p, y2: horizontal ? p : e,
                  phase: rng() * Math.PI * 2,
                  sp: 0.5 + rng() * 1.4,
                  pulse: rng() > 0.45,
                });
              }
              s = -1;
            }
          }
        }
      };
      buildTraces(true);
      buildTraces(false);
      for (let i = 0; i <= cpuGrid; i++) for (let j = 0; j <= cpuGrid; j++) {
        if (inChip(j, i)) continue;
        if (rng() > 0.72) cpuPads.push({ x: j, y: i, size: 1 + rng() * 0.8 });
      }
    }

    // chart (heightmap)
    let chartSX = 0, chartSY = 0;
    if (variant === 'chart') {
      chartSX = detail === 'high' ? 24 : 16;
      chartSY = detail === 'high' ? 15 : 11;
    }

    // candles
    type CandleData = { phase: number; trend: number; volMul: number };
    const candlesData: CandleData[] = [];
    let candleCount = 0;
    if (variant === 'candles') {
      candleCount = detail === 'high' ? 14 : 10;
      for (let i = 0; i < candleCount; i++) {
        candlesData.push({ phase: rng() * Math.PI * 2, trend: -0.4 + rng() * 0.8, volMul: 0.7 + rng() * 0.6 });
      }
    }

    // dna
    const dnaPoints: { y: number; angle: number }[] = [];
    if (variant === 'dna') {
      const STEPS = detail === 'high' ? 70 : 44;
      const TURNS = 4;
      for (let i = 0; i <= STEPS; i++) {
        const u = i / STEPS;
        dnaPoints.push({ y: (u - 0.5) * 2, angle: u * TURNS * Math.PI * 2 });
      }
    }

    // atom
    type Orbit = { u: [number, number, number]; v: [number, number, number]; phase: number; speed: number; tint: number };
    const atomNucleus: { x: number; y: number; z: number; phase: number }[] = [];
    const atomOrbits: Orbit[] = [];
    if (variant === 'atom') {
      for (let i = 0; i < 14; i++) {
        const phi = Math.acos(2 * rng() - 1);
        const th = 2 * Math.PI * rng();
        const r = 0.04 + rng() * 0.08;
        atomNucleus.push({
          x: r * Math.sin(phi) * Math.cos(th),
          y: r * Math.cos(phi),
          z: r * Math.sin(phi) * Math.sin(th),
          phase: rng() * Math.PI * 2,
        });
      }
      const oR = 0.85;
      const planes: [number, number, number][] = [
        [0, 0, 0.10],
        [Math.PI / 3, Math.PI / 4, 0.55],
        [-Math.PI / 4, -Math.PI / 3, 0.78],
      ];
      for (const [aX, aY, tint] of planes) {
        const cy_ = Math.cos(aY), sy_ = Math.sin(aY);
        const cx_ = Math.cos(aX), sx_ = Math.sin(aX);
        atomOrbits.push({
          u: [oR * cy_, 0, oR * sy_],
          v: [-oR * sy_ * sx_, oR * cx_, oR * cy_ * sx_],
          phase: rng() * Math.PI * 2,
          speed: 1.0 + rng() * 0.6,
          tint,
        });
      }
    }

    // cube (con barre interne)
    const cubeBars: { x: number; z: number; phase: number }[] = [];
    if (variant === 'cube') {
      const NB = 6;
      for (let i = 0; i < NB; i++) {
        cubeBars.push({ x: -0.42 + i * 0.17, z: 0, phase: rng() * Math.PI * 2 });
      }
    }

    // torus
    let torusU = 0, torusV = 0;
    if (variant === 'torus') {
      torusU = detail === 'high' ? 36 : 24;
      torusV = detail === 'high' ? 14 : 10;
    }

    // crypto (blockchain)
    const cryptoBlocks: { x: number; y: number; z: number; rot: number; phase: number }[] = [];
    if (variant === 'crypto') {
      const N = 6;
      for (let i = 0; i < N; i++) {
        const u = i / (N - 1);
        const a = u * Math.PI * 1.6 - Math.PI * 0.8;
        cryptoBlocks.push({
          x: 0.55 * Math.cos(a),
          y: (u - 0.5) * 1.7,
          z: 0.55 * Math.sin(a),
          rot: rng() * Math.PI * 2,
          phase: rng() * Math.PI * 2,
        });
      }
    }

    // ====== Canvas setup ======
    let width = 0, height = 0;
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

    let visible = true;
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0 });
    io.observe(wrap);

    const onMouse = (e: MouseEvent) => {
      const rect = wrap.getBoundingClientRect();
      mouse.current.tx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouse.current.ty = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    if (interactive) window.addEventListener('mousemove', onMouse, { passive: true });

    // helpers di disegno
    type Rot = { cay: number; say: number; cax: number; sax: number };
    const makeRot = (t: number, tilt = 0.22, spinSpeed = 0.3): Rot => {
      const ay = t * spinSpeed + mouse.current.x * 0.4;
      const ax = tilt + Math.sin(t * 0.18) * 0.06 + mouse.current.y * 0.22;
      return { cay: Math.cos(ay), say: Math.sin(ay), cax: Math.cos(ax), sax: Math.sin(ax) };
    };
    const project = (x: number, y: number, z: number, r: Rot, focal: number, cx: number, cy: number, R: number) => {
      const x1 = x * r.cay + z * r.say;
      const z1 = -x * r.say + z * r.cay;
      const y1 = y * r.cax - z1 * r.sax;
      const z2 = y * r.sax + z1 * r.cax;
      const scale = focal / (focal + z2);
      return { sx: cx + x1 * scale, sy: cy + y1 * scale, depth: z2 / R, scale };
    };
    const rgba = (r: number, g: number, b: number, a: number) => `rgba(${r},${g},${b},${a})`;
    const stroke = (x1: number, y1: number, x2: number, y2: number, color: string) => {
      ctx.strokeStyle = color;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    };
    const dot = (x: number, y: number, r: number, color: string) => {
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    };
    const haloDot = (x: number, y: number, r: number, color: string, glowR: number, glowColor: string) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, glowR);
      g.addColorStop(0, glowColor);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - glowR, y - glowR, glowR * 2, glowR * 2);
      dot(x, y, r, color);
    };

    // ====== Draw functions ======

    const drawSphere = (t: number, cx: number, cy: number, R: number, focal: number) => {
      const rot = makeRot(t, variant === 'globe' ? 0.35 : 0.22, 0.35);
      const projectV = (v: GridV) => {
        const wobble = variant === 'globe'
          ? 0.04 * Math.sin(v.lat * 6 + t * 1.2) + 0.03 * Math.sin(v.lon * 8 - t)
          : 0.16 * Math.sin(v.lat * 3 + t * 1.1) + 0.12 * Math.sin(v.lon * 4 + t * 0.8) + 0.08 * Math.sin((v.lat + v.lon) * 2.5 + t * 1.6);
        const r = R * (1 + wobble);
        const p = project(r * v.cl * v.co, r * v.sl, r * v.cl * v.so, rot, focal, cx, cy, R);
        return { ...p, nx: ((p.sx - cx) / R + 1) / 2, ny: ((p.sy - cy) / R + 1) / 2 };
      };
      const RINGS = sphereGrid.length - 1;
      const SEGMENTS = sphereGrid[0].length - 1;
      const ps = sphereGrid.map(row => row.map(projectV));
      for (let i = 0; i <= RINGS; i++) for (let j = 0; j <= SEGMENTS; j++) {
        const p = ps[i][j];
        const ct = p.nx * 0.6 + p.ny * 0.4;
        const [r, g, b] = paletteColor(ct);
        const d = 1 - (p.depth + 1) / 2;
        const al = (0.10 + d * 0.5) * intensity;
        if (j < SEGMENTS) stroke(p.sx, p.sy, ps[i][j+1].sx, ps[i][j+1].sy, rgba(r, g, b, al));
        if (i < RINGS)    stroke(p.sx, p.sy, ps[i+1][j].sx, ps[i+1][j].sy, rgba(r, g, b, al));
        if (d > 0.55 && i % 2 === 0 && j % 2 === 0) dot(p.sx, p.sy, 1.1, rgba(r, g, b, al * 1.1));
      }
      if (variant === 'sphere') {
        for (const pt of spherePts) {
          const th = pt.theta + t * pt.spin * 0.3;
          const rr = R * pt.r * (1 + 0.04 * Math.sin(t * 0.8 + pt.seed));
          const p = project(rr * Math.sin(pt.phi) * Math.cos(th), rr * Math.cos(pt.phi), rr * Math.sin(pt.phi) * Math.sin(th), rot, focal, cx, cy, R);
          const d = 1 - (p.depth + 1) / 2;
          const [r2, g2, b2] = paletteColor(Math.min(0.9, Math.max(0.1, ((p.sx - cx) / R / 2 + 0.5) * 0.6 + 0.2)));
          dot(p.sx, p.sy, Math.max(0.4, pt.size * p.scale * (0.6 + d * 0.8)), rgba(r2, g2, b2, (0.15 + d * 0.6) * intensity));
        }
      }
    };

    const drawNeural = (t: number, cx: number, cy: number, R: number, focal: number) => {
      const rot = makeRot(t, 0.22, 0.32);
      const ps = nnodes.map(n => project(n.x * R, n.y * R, n.z * R, rot, focal, cx, cy, R));

      // azzera flash di questo frame
      if (flashArr) for (let i = 0; i < flashArr.length; i++) flashArr[i] = 0;

      // edges + segnali viaggianti (2 per edge, fasati)
      for (const [a, b, seed] of nedges) {
        const pa = ps[a], pb = ps[b];
        const da = 1 - (pa.depth + 1) / 2;
        const db = 1 - (pb.depth + 1) / 2;
        const avg = (da + db) / 2;
        const ct = Math.min(0.95, Math.max(0.05, ((pa.sx + pb.sx) / 2 / width) * 0.6 + 0.2));
        const [r, g, bl] = paletteColor(ct);
        stroke(pa.sx, pa.sy, pb.sx, pb.sy, rgba(r, g, bl, (0.05 + avg * 0.32) * intensity));
        for (let sig = 0; sig < 2; sig++) {
          const period = 2.6;
          const ph = ((t * 0.65 + seed * period + sig * period * 0.5) % period) / 1.25;
          if (ph <= 1) {
            const px = pa.sx + (pb.sx - pa.sx) * ph;
            const py = pa.sy + (pb.sy - pa.sy) * ph;
            dot(px, py, 1.6, rgba(Math.min(255, r + 40), Math.min(255, g + 40), Math.min(255, bl + 40), (0.55 + avg * 0.45) * intensity));
            if (ph > 0.84 && flashArr) {
              const spike = 1 - Math.abs(ph - 0.95) / 0.11;
              if (spike > 0) flashArr[b] = Math.max(flashArr[b], spike);
            }
          }
        }
      }

      // nodi: pulse + flash arriving signals + glow per hub
      for (let i = 0; i < nnodes.length; i++) {
        const n = nnodes[i], p = ps[i];
        const d = 1 - (p.depth + 1) / 2;
        const fl = flashArr ? flashArr[i] : 0;
        const ct = Math.min(0.95, Math.max(0.05, ((p.sx - cx) / R) * 0.3 + 0.5));
        const [r, g, bl] = paletteColor(ct);
        const pulse = 0.7 + 0.4 * Math.sin(t * 1.6 + n.phase);
        const size = n.size * (0.55 + d * 0.7) * pulse * (1 + fl * 0.75);
        const al = (0.32 + d * 0.5 + fl * 0.45) * intensity;
        if (fl > 0.15 || n.hub) {
          const gR = (n.hub ? 9 : 6) * (1 + fl * 1.8);
          haloDot(p.sx, p.sy, size, rgba(r, g, bl, al),
            gR, rgba(r, g, bl, (n.hub ? 0.35 : 0.25 + fl * 0.45) * intensity));
        } else {
          dot(p.sx, p.sy, size, rgba(r, g, bl, al));
        }
      }

      // alone orbitante
      for (const pt of nparticles) {
        const th = pt.theta + t * pt.spin * 0.3;
        const p = project(R * pt.r * Math.sin(pt.phi) * Math.cos(th), R * pt.r * Math.cos(pt.phi), R * pt.r * Math.sin(pt.phi) * Math.sin(th), rot, focal, cx, cy, R);
        const d = 1 - (p.depth + 1) / 2;
        const [r2, g2, b2] = paletteColor(Math.min(0.9, Math.max(0.1, ((p.sx - cx) / R) * 0.3 + 0.5)));
        dot(p.sx, p.sy, pt.size * p.scale, rgba(r2, g2, b2, (0.12 + d * 0.5) * intensity));
      }
    };

    const drawCpu = (t: number, cx: number, cy: number, R: number, focal: number) => {
      const rot = makeRot(t, 0.62, 0.22);
      const span = R * 1.6;
      const step = span / cpuGrid;
      const off = -span / 2;
      const proj2 = (gx: number, gy: number, h = 0) => project(off + gx * step, h, off + gy * step, rot, focal, cx, cy, R);

      const fr = [proj2(0, 0), proj2(cpuGrid, 0), proj2(cpuGrid, cpuGrid), proj2(0, cpuGrid)];
      ctx.strokeStyle = rgba(56, 189, 248, 0.16 * intensity);
      ctx.beginPath();
      ctx.moveTo(fr[0].sx, fr[0].sy);
      for (let k = 1; k < 4; k++) ctx.lineTo(fr[k].sx, fr[k].sy);
      ctx.closePath(); ctx.stroke();

      for (const tr of cpuTraces) {
        const a = proj2(tr.x1, tr.y1), b = proj2(tr.x2, tr.y2);
        const d = (1 - (a.depth + 1) / 2 + 1 - (b.depth + 1) / 2) / 2;
        const [r, g, bl] = paletteColor(Math.min(0.9, Math.max(0.1, ((a.sx + b.sx) / 2 / width) * 0.55 + 0.2)));
        stroke(a.sx, a.sy, b.sx, b.sy, rgba(r, g, bl, (0.18 + d * 0.25) * intensity));
        if (tr.pulse) {
          const period = 3.0;
          const ph = ((t * tr.sp + tr.phase) % period) / 1.2;
          if (ph <= 1) {
            const px = a.sx + (b.sx - a.sx) * ph;
            const py = a.sy + (b.sy - a.sy) * ph;
            dot(px, py, 1.7, rgba(Math.min(255, r + 55), Math.min(255, g + 55), Math.min(255, bl + 55), (0.7 + d * 0.3) * intensity));
          }
        }
      }
      for (const p of cpuPads) {
        const pr = proj2(p.x, p.y);
        const d = 1 - (pr.depth + 1) / 2;
        const [r, g, bl] = paletteColor(Math.min(0.9, Math.max(0.1, (pr.sx / width) * 0.55 + 0.2)));
        const sz = p.size * (0.6 + d * 0.6);
        ctx.fillStyle = rgba(r, g, bl, (0.3 + d * 0.4) * intensity);
        ctx.fillRect(pr.sx - sz, pr.sy - sz, sz * 2, sz * 2);
      }
      const cc = cpuChip;
      const corners = [
        proj2(cc.cx - cc.w / 2, cc.cy - cc.h / 2),
        proj2(cc.cx + cc.w / 2, cc.cy - cc.h / 2),
        proj2(cc.cx + cc.w / 2, cc.cy + cc.h / 2),
        proj2(cc.cx - cc.w / 2, cc.cy + cc.h / 2),
      ];
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = rgba(168, 85, 247, 0.75 * intensity);
      ctx.beginPath();
      ctx.moveTo(corners[0].sx, corners[0].sy);
      for (let i = 1; i < 4; i++) ctx.lineTo(corners[i].sx, corners[i].sy);
      ctx.closePath(); ctx.stroke();
      ctx.lineWidth = 1;
      const center = proj2(cc.cx, cc.cy);
      const cp = 0.55 + 0.45 * Math.sin(t * 1.8);
      const gG = ctx.createRadialGradient(center.sx, center.sy, 0, center.sx, center.sy, R * 0.45);
      gG.addColorStop(0, rgba(168, 85, 247, 0.4 * cp * intensity));
      gG.addColorStop(0.55, rgba(56, 189, 248, 0.13 * cp * intensity));
      gG.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gG;
      ctx.fillRect(0, 0, width, height);
      const inner = [
        proj2(cc.cx - cc.w / 3, cc.cy), proj2(cc.cx + cc.w / 3, cc.cy),
        proj2(cc.cx, cc.cy - cc.h / 3), proj2(cc.cx, cc.cy + cc.h / 3),
      ];
      stroke(inner[0].sx, inner[0].sy, inner[1].sx, inner[1].sy, rgba(217, 70, 239, 0.55 * intensity));
      stroke(inner[2].sx, inner[2].sy, inner[3].sx, inner[3].sy, rgba(217, 70, 239, 0.55 * intensity));
    };

    const drawChart = (t: number, cx: number, cy: number, R: number, focal: number) => {
      const rot = makeRot(t, 0.55, 0.18);
      const span = R * 1.6;
      const stepX = span / chartSX;
      const stepY = span / chartSY;
      const offX = -span / 2, offY = -span / 2;
      const h = (gx: number, gy: number) => {
        const u = (gx - chartSX / 2) / (chartSX / 2);
        const v = (gy - chartSY / 2) / (chartSY / 2);
        return (
          Math.sin(u * 1.5 + t * 0.8) * 0.55 +
          Math.sin(v * 2.0 - t * 0.6) * 0.4 +
          Math.cos((u + v) * 1.8 + t * 1.0) * 0.32 +
          Math.sin(u * 3.0 + v * 1.2 + t * 1.2) * 0.18
        ) * R * 0.17;
      };
      const proj2 = (gx: number, gy: number) => {
        const p = project(offX + gx * stepX, -h(gx, gy), offY + gy * stepY, rot, focal, cx, cy, R);
        return { ...p, h: -((-h(gx, gy)) / R) };
      };
      const ps: { sx: number; sy: number; depth: number; scale: number; h: number }[][] = [];
      for (let i = 0; i <= chartSY; i++) {
        const row: typeof ps[number] = [];
        for (let j = 0; j <= chartSX; j++) row.push(proj2(j, i));
        ps.push(row);
      }
      for (let i = 0; i <= chartSY; i++) for (let j = 0; j <= chartSX; j++) {
        const p = ps[i][j];
        const hN = Math.min(1, Math.max(0, (p.h + 0.6) / 1.2));
        const [r, g, bl] = paletteColor(Math.min(0.95, Math.max(0.05, hN * 0.7 + 0.15)));
        const d = 1 - (p.depth + 1) / 2;
        const al = (0.12 + d * 0.28 + hN * 0.15) * intensity;
        if (j < chartSX) stroke(p.sx, p.sy, ps[i][j+1].sx, ps[i][j+1].sy, rgba(r, g, bl, al));
        if (i < chartSY) stroke(p.sx, p.sy, ps[i+1][j].sx, ps[i+1][j].sy, rgba(r, g, bl, al));
      }
      const midI = Math.floor(chartSY / 2);
      ctx.lineWidth = 2.2;
      const [pr, pg, pb] = paletteColor(0.02);
      ctx.strokeStyle = rgba(pr, pg, pb, 0.85 * intensity);
      ctx.beginPath();
      for (let j = 0; j <= chartSX; j++) {
        const p = ps[midI][j];
        if (j === 0) ctx.moveTo(p.sx, p.sy); else ctx.lineTo(p.sx, p.sy);
      }
      ctx.stroke(); ctx.lineWidth = 1;
      const u = (Math.sin(t * 0.45) * 0.5 + 0.5) * chartSX;
      const uI = Math.min(chartSX - 1, Math.floor(u));
      const uF = u - uI;
      const a = ps[midI][uI], b = ps[midI][uI + 1];
      const px = a.sx + (b.sx - a.sx) * uF;
      const py = a.sy + (b.sy - a.sy) * uF;
      haloDot(px, py, 4, rgba(pr, pg, pb, intensity), R * 0.18, rgba(pr, pg, pb, 0.45 * intensity));
    };

    const drawCandles = (t: number, cx: number, cy: number, R: number, focal: number) => {
      const rot = makeRot(t, 0.45, 0.18);
      const w = R * 1.7;
      const spacing = w / candleCount;
      const startX = -w / 2 + spacing / 2;
      const baseY = R * 0.55;
      const cw = spacing * 0.55;
      const cd = R * 0.11;

      // Floor grid
      for (let i = -4; i <= 4; i++) {
        const a = project(-R * 0.9, baseY, i * R * 0.18, rot, focal, cx, cy, R);
        const b = project(R * 0.9, baseY, i * R * 0.18, rot, focal, cx, cy, R);
        stroke(a.sx, a.sy, b.sx, b.sy, rgba(56, 189, 248, 0.15 * intensity));
      }
      for (let j = 0; j < candleCount; j += 2) {
        const xPos = startX + j * spacing;
        const a = project(xPos, baseY, -R * 0.4, rot, focal, cx, cy, R);
        const b = project(xPos, baseY,  R * 0.4, rot, focal, cx, cy, R);
        stroke(a.sx, a.sy, b.sx, b.sy, rgba(56, 189, 248, 0.10 * intensity));
      }

      // Candele
      for (let i = 0; i < candleCount; i++) {
        const x = startX + i * spacing;
        const cd_i = candlesData[i];
        const base = Math.sin(i * 0.4 + t * 0.6 + cd_i.phase) * 0.28 + cd_i.trend * 0.3;
        const range = (0.16 + 0.1 * Math.sin(i * 0.2 + t + cd_i.phase)) * cd_i.volMul;
        const open = base - range / 4;
        const close = base + range / 4 + Math.sin(t * 1.4 + i + cd_i.phase) * 0.08;
        const high = Math.max(open, close) + 0.05 + 0.04 * Math.cos(t + i);
        const low = Math.min(open, close) - 0.05 - 0.04 * Math.sin(t + i);
        const bull = close > open;
        const bodyTop = baseY - Math.max(open, close) * R;
        const bodyBot = baseY - Math.min(open, close) * R;
        const wickTop = baseY - high * R;
        const wickBot = baseY - low * R;

        const wickA = project(x, wickTop, 0, rot, focal, cx, cy, R);
        const wickB = project(x, wickBot, 0, rot, focal, cx, cy, R);
        const wickColor = bull ? rgba(56, 189, 248, 0.7 * intensity) : rgba(217, 70, 239, 0.7 * intensity);
        stroke(wickA.sx, wickA.sy, wickB.sx, wickB.sy, wickColor);

        const corners = [
          project(x - cw / 2, bodyBot, -cd / 2, rot, focal, cx, cy, R),
          project(x + cw / 2, bodyBot, -cd / 2, rot, focal, cx, cy, R),
          project(x + cw / 2, bodyBot,  cd / 2, rot, focal, cx, cy, R),
          project(x - cw / 2, bodyBot,  cd / 2, rot, focal, cx, cy, R),
          project(x - cw / 2, bodyTop, -cd / 2, rot, focal, cx, cy, R),
          project(x + cw / 2, bodyTop, -cd / 2, rot, focal, cx, cy, R),
          project(x + cw / 2, bodyTop,  cd / 2, rot, focal, cx, cy, R),
          project(x - cw / 2, bodyTop,  cd / 2, rot, focal, cx, cy, R),
        ];
        const [r, g, bl] = bull ? paletteColor(0.08) : paletteColor(0.78);
        const al = 0.72 * intensity;
        for (const [a, b] of CUBE_EDGES) stroke(corners[a].sx, corners[a].sy, corners[b].sx, corners[b].sy, rgba(r, g, bl, al));
      }
    };

    const drawDna = (t: number, cx: number, cy: number, R: number, focal: number) => {
      const rot = makeRot(t, 0.20, 0.25);
      const helixR = R * 0.5;
      const halfH = R * 1.0;
      const spin = t * 0.45;
      const s1: ReturnType<typeof project>[] = [];
      const s2: ReturnType<typeof project>[] = [];
      for (const pt of dnaPoints) {
        const a1 = pt.angle + spin;
        const a2 = a1 + Math.PI;
        const yPos = pt.y * halfH;
        s1.push(project(helixR * Math.cos(a1), yPos, helixR * Math.sin(a1), rot, focal, cx, cy, R));
        s2.push(project(helixR * Math.cos(a2), yPos, helixR * Math.sin(a2), rot, focal, cx, cy, R));
      }
      for (let i = 0; i < s1.length - 1; i++) {
        const a = s1[i], b = s1[i+1];
        const d = (1 - (a.depth + 1) / 2 + 1 - (b.depth + 1) / 2) / 2;
        const [r, g, bl] = paletteColor(0.1);
        stroke(a.sx, a.sy, b.sx, b.sy, rgba(r, g, bl, (0.35 + d * 0.4) * intensity));
      }
      for (let i = 0; i < s2.length - 1; i++) {
        const a = s2[i], b = s2[i+1];
        const d = (1 - (a.depth + 1) / 2 + 1 - (b.depth + 1) / 2) / 2;
        const [r, g, bl] = paletteColor(0.78);
        stroke(a.sx, a.sy, b.sx, b.sy, rgba(r, g, bl, (0.35 + d * 0.4) * intensity));
      }
      const rungStep = 4;
      for (let i = 0; i < s1.length; i += rungStep) {
        const a = s1[i], b = s2[i];
        const d = (1 - (a.depth + 1) / 2 + 1 - (b.depth + 1) / 2) / 2;
        const [r, g, bl] = paletteColor(0.45);
        stroke(a.sx, a.sy, b.sx, b.sy, rgba(r, g, bl, (0.25 + d * 0.35) * intensity));
      }
      // Segnali che salgono (strand1) e scendono (strand2)
      for (let sig = 0; sig < 3; sig++) {
        const u = (t * 0.32 + sig / 3) % 1;
        const idx = u * (s1.length - 1);
        const i = Math.floor(idx);
        const f = idx - i;
        const a = s1[i], b = s1[i + 1];
        haloDot(a.sx + (b.sx - a.sx) * f, a.sy + (b.sy - a.sy) * f, 2.5,
          rgba(56, 189, 248, intensity), 10, rgba(56, 189, 248, 0.5 * intensity));
      }
      for (let sig = 0; sig < 3; sig++) {
        const u = (1 - ((t * 0.32 + sig / 3 + 0.2) % 1));
        const idx = u * (s2.length - 1);
        const i = Math.floor(idx);
        const f = idx - i;
        const a = s2[i], b = s2[Math.min(s2.length - 1, i + 1)];
        haloDot(a.sx + (b.sx - a.sx) * f, a.sy + (b.sy - a.sy) * f, 2.5,
          rgba(217, 70, 239, intensity), 10, rgba(217, 70, 239, 0.5 * intensity));
      }
    };

    const drawAtom = (t: number, cx: number, cy: number, R: number, focal: number) => {
      const rot = makeRot(t, 0.15, 0.2);
      // Nucleo (cluster particelle)
      for (const n of atomNucleus) {
        const jx = n.x + Math.sin(t * 2 + n.phase) * 0.02;
        const jy = n.y + Math.cos(t * 2.3 + n.phase) * 0.02;
        const jz = n.z + Math.sin(t * 1.8 + n.phase * 0.7) * 0.02;
        const p = project(jx * R, jy * R, jz * R, rot, focal, cx, cy, R);
        const d = 1 - (p.depth + 1) / 2;
        dot(p.sx, p.sy, 2 * p.scale, rgba(168, 85, 247, (0.6 + d * 0.4) * intensity));
      }
      const nc = project(0, 0, 0, rot, focal, cx, cy, R);
      const ng = ctx.createRadialGradient(nc.sx, nc.sy, 0, nc.sx, nc.sy, R * 0.28);
      ng.addColorStop(0, rgba(217, 70, 239, 0.5 * intensity));
      ng.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = ng;
      ctx.fillRect(0, 0, width, height);

      // Orbite
      for (let oi = 0; oi < atomOrbits.length; oi++) {
        const o = atomOrbits[oi];
        const SEGS = 80;
        let prev: ReturnType<typeof project> | null = null;
        for (let k = 0; k <= SEGS; k++) {
          const a = (2 * Math.PI * k) / SEGS;
          const cosa = Math.cos(a), sina = Math.sin(a);
          const wx = o.u[0] * cosa + o.v[0] * sina;
          const wy = o.u[1] * cosa + o.v[1] * sina;
          const wz = o.u[2] * cosa + o.v[2] * sina;
          const p = project(wx * R, wy * R, wz * R, rot, focal, cx, cy, R);
          if (prev) {
            const d = (1 - (p.depth + 1) / 2 + 1 - (prev.depth + 1) / 2) / 2;
            const [r, g, bl] = paletteColor(o.tint);
            stroke(prev.sx, prev.sy, p.sx, p.sy, rgba(r, g, bl, (0.22 + d * 0.4) * intensity));
          }
          prev = p;
        }
        // Elettrone
        const ea = t * o.speed + o.phase;
        const ec = Math.cos(ea), es = Math.sin(ea);
        const ewx = o.u[0] * ec + o.v[0] * es;
        const ewy = o.u[1] * ec + o.v[1] * es;
        const ewz = o.u[2] * ec + o.v[2] * es;
        const ep = project(ewx * R, ewy * R, ewz * R, rot, focal, cx, cy, R);
        const [er, eg, eb] = paletteColor(o.tint < 0.5 ? 0.05 : 0.92);
        haloDot(ep.sx, ep.sy, 4 * ep.scale, rgba(er, eg, eb, intensity), 22 * ep.scale, rgba(er, eg, eb, 0.55 * intensity));
      }
    };

    const drawCube = (t: number, cx: number, cy: number, R: number, focal: number) => {
      const rot = makeRot(t, 0.22, 0.35);
      const cs = 0.7;
      const cps = CUBE_CORNERS.map(([x, y, z]) => project(x * cs * R, y * cs * R, z * cs * R, rot, focal, cx, cy, R));
      for (const [a, b] of CUBE_EDGES) {
        const pa = cps[a], pb = cps[b];
        const d = (1 - (pa.depth + 1) / 2 + 1 - (pb.depth + 1) / 2) / 2;
        const [r, g, bl] = paletteColor(0.15 + d * 0.4);
        stroke(pa.sx, pa.sy, pb.sx, pb.sy, rgba(r, g, bl, (0.35 + d * 0.45) * intensity));
      }
      const baseY = cs * R;
      const bw = 0.07 * R;
      for (let i = 0; i < cubeBars.length; i++) {
        const bar = cubeBars[i];
        const hN = 0.4 + Math.sin(t * 0.8 + bar.phase) * 0.3 + Math.cos(t * 0.4 + i) * 0.15;
        const yTop = baseY - hN * 1.2 * cs * R;
        const bx = bar.x * cs * R, bz = bar.z * cs * R;
        const corners = [
          project(bx - bw / 2, baseY, bz - bw / 2, rot, focal, cx, cy, R),
          project(bx + bw / 2, baseY, bz - bw / 2, rot, focal, cx, cy, R),
          project(bx + bw / 2, baseY, bz + bw / 2, rot, focal, cx, cy, R),
          project(bx - bw / 2, baseY, bz + bw / 2, rot, focal, cx, cy, R),
          project(bx - bw / 2, yTop,  bz - bw / 2, rot, focal, cx, cy, R),
          project(bx + bw / 2, yTop,  bz - bw / 2, rot, focal, cx, cy, R),
          project(bx + bw / 2, yTop,  bz + bw / 2, rot, focal, cx, cy, R),
          project(bx - bw / 2, yTop,  bz + bw / 2, rot, focal, cx, cy, R),
        ];
        const [r, g, bl] = paletteColor(Math.min(0.95, Math.max(0.05, hN * 0.55 + 0.1)));
        const al = 0.7 * intensity;
        for (const [a, b] of CUBE_EDGES) stroke(corners[a].sx, corners[a].sy, corners[b].sx, corners[b].sy, rgba(r, g, bl, al));
      }
    };

    const drawTorus = (t: number, cx: number, cy: number, R: number, focal: number) => {
      const rot = makeRot(t, 0.5, 0.28);
      const ringR = 0.55 * R, tubeR = 0.18 * R;
      const ps: ReturnType<typeof project>[][] = [];
      for (let i = 0; i < torusU; i++) {
        const u = (i / torusU) * Math.PI * 2;
        const cu = Math.cos(u), su = Math.sin(u);
        const row: ReturnType<typeof project>[] = [];
        for (let j = 0; j < torusV; j++) {
          const v = (j / torusV) * Math.PI * 2;
          const cv = Math.cos(v), sv = Math.sin(v);
          const wx = (ringR + tubeR * cv) * cu;
          const wy = tubeR * sv;
          const wz = (ringR + tubeR * cv) * su;
          row.push(project(wx, wy, wz, rot, focal, cx, cy, R));
        }
        ps.push(row);
      }
      for (let i = 0; i < torusU; i++) {
        const next = (i + 1) % torusU;
        for (let j = 0; j < torusV; j++) {
          const jn = (j + 1) % torusV;
          const p = ps[i][j], pj = ps[i][jn], pn = ps[next][j];
          const d = 1 - (p.depth + 1) / 2;
          const [r, g, bl] = paletteColor(0.2 + (j / torusV) * 0.65);
          const al = (0.15 + d * 0.35) * intensity;
          stroke(p.sx, p.sy, pj.sx, pj.sy, rgba(r, g, bl, al));
          stroke(p.sx, p.sy, pn.sx, pn.sy, rgba(r, g, bl, al));
        }
      }
      // Pulse che orbitano lungo U
      for (let s = 0; s < 4; s++) {
        const u = ((t * 0.55 + s / 4) % 1) * torusU;
        const i = Math.floor(u) % torusU;
        const f = u - Math.floor(u);
        const inext = (i + 1) % torusU;
        const a = ps[i][0], b = ps[inext][0];
        const px = a.sx + (b.sx - a.sx) * f;
        const py = a.sy + (b.sy - a.sy) * f;
        haloDot(px, py, 3, rgba(217, 70, 239, intensity), 14, rgba(217, 70, 239, 0.55 * intensity));
      }
    };

    const drawCrypto = (t: number, cx: number, cy: number, R: number, focal: number) => {
      const rot = makeRot(t, 0.22, 0.18);
      const blockSize = R * 0.13;
      const centers = cryptoBlocks.map(b => project(b.x * R, b.y * R, b.z * R, rot, focal, cx, cy, R));

      // Connettori fra blocchi
      for (let i = 0; i < centers.length - 1; i++) {
        const a = centers[i], b = centers[i + 1];
        const [r, g, bl] = paletteColor(0.35 + i * 0.07);
        stroke(a.sx, a.sy, b.sx, b.sy, rgba(r, g, bl, 0.45 * intensity));
        const period = 2.0;
        const ph = ((t * 0.55 + i * 0.18) % period) / 1.0;
        if (ph < 1) {
          haloDot(a.sx + (b.sx - a.sx) * ph, a.sy + (b.sy - a.sy) * ph, 3,
            rgba(217, 70, 239, intensity), 12, rgba(217, 70, 239, 0.55 * intensity));
        }
      }

      // Blocchi (cubi wireframe con rotazione locale)
      for (let i = 0; i < cryptoBlocks.length; i++) {
        const b = cryptoBlocks[i];
        const la = b.rot + t * 0.35;
        const cl = Math.cos(la), sl = Math.sin(la);
        const corners = CUBE_CORNERS.map(([x, y, z]) => {
          const rx = x * cl + z * sl;
          const rz = -x * sl + z * cl;
          return project(b.x * R + rx * blockSize, b.y * R + y * blockSize, b.z * R + rz * blockSize, rot, focal, cx, cy, R);
        });
        const [r, g, bl] = paletteColor(0.25 + i * 0.10);
        const pulse = 0.7 + 0.3 * Math.sin(t * 1.6 + b.phase);
        for (const [a, c] of CUBE_EDGES) {
          const pa = corners[a], pc = corners[c];
          const d = (1 - (pa.depth + 1) / 2 + 1 - (pc.depth + 1) / 2) / 2;
          stroke(pa.sx, pa.sy, pc.sx, pc.sy, rgba(r, g, bl, (0.45 + d * 0.4) * pulse * intensity));
        }
        const cc = centers[i];
        const glow = ctx.createRadialGradient(cc.sx, cc.sy, 0, cc.sx, cc.sy, blockSize * 2.2);
        glow.addColorStop(0, rgba(r, g, bl, 0.32 * pulse * intensity));
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(cc.sx - blockSize * 2.2, cc.sy - blockSize * 2.2, blockSize * 4.4, blockSize * 4.4);
      }
    };

    const draw = (t: number) => {
      mouse.current.x += (mouse.current.tx - mouse.current.x) * 0.05;
      mouse.current.y += (mouse.current.ty - mouse.current.y) * 0.05;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineWidth = 1;

      const cx = width / 2;
      const cy = height / 2;
      const R = Math.min(width, height) * 0.34;
      const focal = R * 3.2;

      switch (variant) {
        case 'sphere':
        case 'globe':   drawSphere(t, cx, cy, R, focal); break;
        case 'neural':  drawNeural(t, cx, cy, R, focal); break;
        case 'cpu':     drawCpu(t, cx, cy, R, focal); break;
        case 'chart':   drawChart(t, cx, cy, R, focal); break;
        case 'candles': drawCandles(t, cx, cy, R, focal); break;
        case 'dna':     drawDna(t, cx, cy, R, focal); break;
        case 'atom':    drawAtom(t, cx, cy, R, focal); break;
        case 'cube':    drawCube(t, cx, cy, R, focal); break;
        case 'torus':   drawTorus(t, cx, cy, R, focal); break;
        case 'crypto':  drawCrypto(t, cx, cy, R, focal); break;
      }

      // Alone centrale soft (omesso per varianti con glow proprio)
      const skipGlow = variant === 'cpu' || variant === 'chart' || variant === 'atom';
      if (!skipGlow) {
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.4);
        glow.addColorStop(0, rgba(56, 189, 248, 0.10 * intensity));
        glow.addColorStop(0.5, rgba(37, 99, 235, 0.05 * intensity));
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);
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
        draw((elapsed / 1000) * speed);
      }
    };

    if (reduceMotion) draw(0.6);
    else raf = requestAnimationFrame(loop);

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
