import React, { useEffect, useRef } from 'react';

/**
 * HologramSphere
 * Ologramma 3D animato su canvas (niente Three.js, bundle leggero).
 *
 * Varianti tematiche:
 *  - 'sphere' : blob wireframe distorta (eroe / centerpiece)
 *  - 'globe'  : pianeta digitalizzato (terra / community globale)
 *  - 'neural' : rete neurale 3D — nodi + connessioni con "segnali" che viaggiano (AI)
 *  - 'cpu'    : circuit board / chip con tracce e pulse animati (computing / lab)
 *  - 'chart'  : superficie 3D heightmap + price line con dot scorrevole (trading)
 *
 * Tutte le varianti:
 *  - ruotano in 3D + leggero "tilt" oscillante
 *  - reagiscono al mouse (parallax) se interactive=true
 *  - si fermano fuori schermo / con scheda inattiva
 *  - rispettano prefers-reduced-motion (un solo frame statico)
 */

type Variant = 'sphere' | 'globe' | 'neural' | 'cpu' | 'chart';

interface HologramSphereProps {
  className?: string;
  detail?: 'low' | 'high';
  intensity?: number;
  speed?: number;
  interactive?: boolean;
  variant?: Variant;
}

// Palette neon del brand (blu → ciano → indaco → viola → fucsia)
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

    // ====== Per-variant data ======

    // -- sphere / globe : griglia lat/lon
    type GridV = { lat: number; lon: number; cl: number; sl: number; co: number; so: number };
    const sphereGrid: GridV[][] = [];
    if (variant === 'sphere' || variant === 'globe') {
      const RINGS = detail === 'high' ? 26 : 18;
      const SEGMENTS = detail === 'high' ? 40 : 28;
      for (let i = 0; i <= RINGS; i++) {
        const lat = -Math.PI / 2 + (Math.PI * i) / RINGS;
        const cl = Math.cos(lat);
        const sl = Math.sin(lat);
        const row: GridV[] = [];
        for (let j = 0; j <= SEGMENTS; j++) {
          const lon = (2 * Math.PI * j) / SEGMENTS;
          row.push({ lat, lon, cl, sl, co: Math.cos(lon), so: Math.sin(lon) });
        }
        sphereGrid.push(row);
      }
    }
    const spherePts = Array.from({ length: variant === 'sphere' ? (detail === 'high' ? 90 : 40) : 0 }, () => {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      return {
        theta, phi,
        r: 1.12 + Math.random() * 0.5,
        spin: (0.2 + Math.random() * 0.8) * (Math.random() > 0.5 ? 1 : -1),
        size: 0.6 + Math.random() * 1.6,
        seed: Math.random() * 1000,
      };
    });

    // -- neural : nodi + edges (k-nearest neighbors) + particelle orbitanti
    type NNode = { x: number; y: number; z: number; size: number; phase: number };
    let nnodes: NNode[] = [];
    let nedges: [number, number, number][] = [];
    let nparticles: typeof spherePts = [];
    if (variant === 'neural') {
      const N = detail === 'high' ? 75 : 48;
      for (let i = 0; i < N; i++) {
        const u = Math.random();
        const v = Math.random();
        const phi = Math.acos(2 * v - 1);
        const theta = 2 * Math.PI * u;
        nnodes.push({
          x: Math.sin(phi) * Math.cos(theta),
          y: Math.cos(phi),
          z: Math.sin(phi) * Math.sin(theta),
          size: 1.3 + Math.random() * 1.6,
          phase: Math.random() * Math.PI * 2,
        });
      }
      const seen = new Set<string>();
      const K = 3;
      for (let i = 0; i < N; i++) {
        const dists: [number, number][] = [];
        for (let j = 0; j < N; j++) {
          if (i === j) continue;
          const dx = nnodes[i].x - nnodes[j].x;
          const dy = nnodes[i].y - nnodes[j].y;
          const dz = nnodes[i].z - nnodes[j].z;
          dists.push([j, dx * dx + dy * dy + dz * dz]);
        }
        dists.sort((a, b) => a[1] - b[1]);
        for (let m = 0; m < K; m++) {
          const j = dists[m][0];
          const key = i < j ? `${i}-${j}` : `${j}-${i}`;
          if (seen.has(key)) continue;
          seen.add(key);
          nedges.push([i, j, Math.random()]);
        }
      }
      nparticles = Array.from({ length: detail === 'high' ? 35 : 20 }, () => ({
        theta: Math.random() * Math.PI * 2,
        phi: Math.acos(2 * Math.random() - 1),
        r: 1.1 + Math.random() * 0.45,
        spin: (0.2 + Math.random() * 0.8) * (Math.random() > 0.5 ? 1 : -1),
        size: 0.5 + Math.random() * 1.2,
        seed: Math.random() * 1000,
      }));
    }

    // -- cpu : circuit board (traces + pads + chip centrale)
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
      // Tracce orizzontali (per ogni "riga" del grid)
      for (let row = 0; row <= cpuGrid; row++) {
        let segStart = -1;
        for (let col = 0; col <= cpuGrid; col++) {
          const inside = inChip(col, row);
          const breakSeg = inside || Math.random() > 0.88 || col === cpuGrid;
          if (!breakSeg && segStart < 0) segStart = col;
          if (breakSeg && segStart >= 0) {
            const end = inside ? col - 0.5 : col;
            if (end - segStart >= 1) {
              cpuTraces.push({
                x1: segStart, y1: row, x2: end, y2: row,
                phase: Math.random() * Math.PI * 2,
                sp: 0.5 + Math.random() * 1.4,
                pulse: Math.random() > 0.45,
              });
            }
            segStart = -1;
          }
        }
      }
      // Tracce verticali
      for (let col = 0; col <= cpuGrid; col++) {
        let segStart = -1;
        for (let row = 0; row <= cpuGrid; row++) {
          const inside = inChip(col, row);
          const breakSeg = inside || Math.random() > 0.88 || row === cpuGrid;
          if (!breakSeg && segStart < 0) segStart = row;
          if (breakSeg && segStart >= 0) {
            const end = inside ? row - 0.5 : row;
            if (end - segStart >= 1) {
              cpuTraces.push({
                x1: col, y1: segStart, x2: col, y2: end,
                phase: Math.random() * Math.PI * 2,
                sp: 0.5 + Math.random() * 1.4,
                pulse: Math.random() > 0.45,
              });
            }
            segStart = -1;
          }
        }
      }
      // Pad nei junction
      for (let i = 0; i <= cpuGrid; i++) {
        for (let j = 0; j <= cpuGrid; j++) {
          if (inChip(j, i)) continue;
          if (Math.random() > 0.72) cpuPads.push({ x: j, y: i, size: 1 + Math.random() * 0.8 });
        }
      }
    }

    // -- chart : superficie heightmap animata
    let chartSX = 0, chartSY = 0;
    if (variant === 'chart') {
      chartSX = detail === 'high' ? 22 : 14;
      chartSY = detail === 'high' ? 14 : 10;
    }

    // ====== Canvas setup ======
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

    // ====== Drawing per variant ======

    const drawSphere = (t: number, cx: number, cy: number, R: number, focal: number) => {
      const ay = t * 0.35 + mouse.current.x * 0.4;
      const ax = (variant === 'globe' ? 0.35 : 0.22) + Math.sin(t * 0.2) * 0.08 + mouse.current.y * 0.25;
      const cay = Math.cos(ay), say = Math.sin(ay), cax = Math.cos(ax), sax = Math.sin(ax);

      const project = (v: GridV) => {
        const wobble = variant === 'globe'
          ? 0.04 * Math.sin(v.lat * 6 + t * 1.2) + 0.03 * Math.sin(v.lon * 8 - t)
          : 0.16 * Math.sin(v.lat * 3 + t * 1.1) +
            0.12 * Math.sin(v.lon * 4 + t * 0.8) +
            0.08 * Math.sin((v.lat + v.lon) * 2.5 + t * 1.6);
        const r = R * (1 + wobble);
        const x = r * v.cl * v.co, y = r * v.sl, z = r * v.cl * v.so;
        const x1 = x * cay + z * say;
        const z1 = -x * say + z * cay;
        const y1 = y * cax - z1 * sax;
        const z2 = y * sax + z1 * cax;
        const scale = focal / (focal + z2);
        return { sx: cx + x1 * scale, sy: cy + y1 * scale, depth: z2 / R, nx: (x1 / R + 1) / 2, ny: (y1 / R + 1) / 2 };
      };

      const RINGS = sphereGrid.length - 1;
      const SEGMENTS = sphereGrid[0].length - 1;
      const proj = sphereGrid.map((row) => row.map(project));

      for (let i = 0; i <= RINGS; i++) {
        for (let j = 0; j <= SEGMENTS; j++) {
          const p = proj[i][j];
          const ct = p.nx * 0.6 + p.ny * 0.4;
          const [r, g, b] = paletteColor(ct);
          const depthA = 1 - (p.depth + 1) / 2;
          const alpha = (0.10 + depthA * 0.5) * intensity;
          if (j < SEGMENTS) {
            const q = proj[i][j + 1];
            ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
            ctx.beginPath(); ctx.moveTo(p.sx, p.sy); ctx.lineTo(q.sx, q.sy); ctx.stroke();
          }
          if (i < RINGS) {
            const q = proj[i + 1][j];
            ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
            ctx.beginPath(); ctx.moveTo(p.sx, p.sy); ctx.lineTo(q.sx, q.sy); ctx.stroke();
          }
          if (depthA > 0.55 && i % 2 === 0 && j % 2 === 0) {
            ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 1.1})`;
            ctx.beginPath(); ctx.arc(p.sx, p.sy, 1.1, 0, Math.PI * 2); ctx.fill();
          }
        }
      }

      // particelle orbitanti (solo sphere — la centerpiece era così)
      if (variant === 'sphere') {
        for (const pt of spherePts) {
          const theta = pt.theta + t * pt.spin * 0.3;
          const rr = R * pt.r * (1 + 0.04 * Math.sin(t * 0.8 + pt.seed));
          const x = rr * Math.sin(pt.phi) * Math.cos(theta);
          const y = rr * Math.cos(pt.phi);
          const z = rr * Math.sin(pt.phi) * Math.sin(theta);
          const x1 = x * cay + z * say;
          const z1 = -x * say + z * cay;
          const y1 = y * cax - z1 * sax;
          const z2 = y * sax + z1 * cax;
          const scale = focal / (focal + z2);
          const sx = cx + x1 * scale, sy = cy + y1 * scale;
          const d = 1 - (z2 / R + 1) / 2;
          const [r2, g2, b2] = paletteColor((x1 / R + 1) / 2 * 0.6 + 0.2);
          const alpha = (0.15 + d * 0.6) * intensity;
          ctx.fillStyle = `rgba(${r2},${g2},${b2},${alpha})`;
          ctx.beginPath(); ctx.arc(sx, sy, Math.max(0.4, pt.size * scale * (0.6 + d * 0.8)), 0, Math.PI * 2); ctx.fill();
        }
      }
    };

    const drawNeural = (t: number, cx: number, cy: number, R: number, focal: number) => {
      const ay = t * 0.3 + mouse.current.x * 0.4;
      const ax = 0.2 + Math.sin(t * 0.18) * 0.07 + mouse.current.y * 0.25;
      const cay = Math.cos(ay), say = Math.sin(ay), cax = Math.cos(ax), sax = Math.sin(ax);
      const proj = nnodes.map((n) => {
        const x = n.x * R, y = n.y * R, z = n.z * R;
        const x1 = x * cay + z * say;
        const z1 = -x * say + z * cay;
        const y1 = y * cax - z1 * sax;
        const z2 = y * sax + z1 * cax;
        const scale = focal / (focal + z2);
        return { sx: cx + x1 * scale, sy: cy + y1 * scale, depth: z2 / R };
      });

      // edges + segnali viaggianti
      for (const [i, j, seed] of nedges) {
        const a = proj[i], b = proj[j];
        const d = (1 - (a.depth + 1) / 2 + 1 - (b.depth + 1) / 2) / 2;
        const ct = Math.min(0.95, Math.max(0.05, (a.sx + b.sx) / (2 * width) * 0.7 + 0.15));
        const [r, g, bl] = paletteColor(ct);
        const alpha = (0.06 + d * 0.3) * intensity;
        ctx.strokeStyle = `rgba(${r},${g},${bl},${alpha})`;
        ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke();
        const period = 2.6;
        const ph = ((t * 0.65 + seed * period) % period) / 1.25;
        if (ph <= 1) {
          const px = a.sx + (b.sx - a.sx) * ph;
          const py = a.sy + (b.sy - a.sy) * ph;
          ctx.fillStyle = `rgba(${Math.min(255, r + 35)},${Math.min(255, g + 35)},${Math.min(255, bl + 35)},${(0.5 + d * 0.5) * intensity})`;
          ctx.beginPath(); ctx.arc(px, py, 1.6, 0, Math.PI * 2); ctx.fill();
        }
      }

      // nodi pulsanti
      for (let i = 0; i < nnodes.length; i++) {
        const n = nnodes[i], p = proj[i];
        const d = 1 - (p.depth + 1) / 2;
        const [r, g, bl] = paletteColor(Math.min(0.95, Math.max(0.05, p.sx / width * 0.6 + 0.2)));
        const pulse = 0.7 + 0.45 * Math.sin(t * 1.6 + n.phase);
        ctx.fillStyle = `rgba(${r},${g},${bl},${(0.35 + d * 0.55) * intensity})`;
        ctx.beginPath(); ctx.arc(p.sx, p.sy, n.size * (0.6 + d * 0.8) * pulse, 0, Math.PI * 2); ctx.fill();
      }

      // alone orbitante
      for (const pt of nparticles) {
        const theta = pt.theta + t * pt.spin * 0.3;
        const rr = R * pt.r;
        const x = rr * Math.sin(pt.phi) * Math.cos(theta);
        const y = rr * Math.cos(pt.phi);
        const z = rr * Math.sin(pt.phi) * Math.sin(theta);
        const x1 = x * cay + z * say;
        const z1 = -x * say + z * cay;
        const y1 = y * cax - z1 * sax;
        const z2 = y * sax + z1 * cax;
        const scale = focal / (focal + z2);
        const d = 1 - (z2 / R + 1) / 2;
        const [r2, g2, b2] = paletteColor(Math.min(0.9, Math.max(0.1, (x1 / R + 1) / 2 * 0.6 + 0.2)));
        ctx.fillStyle = `rgba(${r2},${g2},${b2},${(0.12 + d * 0.5) * intensity})`;
        ctx.beginPath(); ctx.arc(cx + x1 * scale, cy + y1 * scale, pt.size * scale, 0, Math.PI * 2); ctx.fill();
      }
    };

    const drawCpu = (t: number, cx: number, cy: number, R: number, focal: number) => {
      // Vista quasi dall'alto: tilt forte per "vedere" il circuito
      const ay = t * 0.22 + mouse.current.x * 0.4;
      const ax = 0.62 + Math.sin(t * 0.14) * 0.06 + mouse.current.y * 0.22;
      const cay = Math.cos(ay), say = Math.sin(ay), cax = Math.cos(ax), sax = Math.sin(ax);
      const span = R * 1.6;
      const step = span / cpuGrid;
      const off = -span / 2;

      const project = (gx: number, gy: number, h = 0) => {
        const x = off + gx * step;
        const z = off + gy * step;
        const x1 = x * cay + z * say;
        const z1 = -x * say + z * cay;
        const y1 = h * cax - z1 * sax;
        const z2 = h * sax + z1 * cax;
        const scale = focal / (focal + z2);
        return { sx: cx + x1 * scale, sy: cy + y1 * scale, depth: z2 / R };
      };

      // Cornice
      const fr = [project(0, 0), project(cpuGrid, 0), project(cpuGrid, cpuGrid), project(0, cpuGrid)];
      ctx.strokeStyle = `rgba(56,189,248,${0.16 * intensity})`;
      ctx.beginPath();
      ctx.moveTo(fr[0].sx, fr[0].sy);
      for (let k = 1; k < 4; k++) ctx.lineTo(fr[k].sx, fr[k].sy);
      ctx.closePath();
      ctx.stroke();

      // Tracce
      for (const tr of cpuTraces) {
        const a = project(tr.x1, tr.y1);
        const b = project(tr.x2, tr.y2);
        const d = (1 - (a.depth + 1) / 2 + 1 - (b.depth + 1) / 2) / 2;
        const ct = Math.min(0.9, Math.max(0.1, (a.sx + b.sx) / (2 * width) * 0.55 + 0.2));
        const [r, g, bl] = paletteColor(ct);
        ctx.strokeStyle = `rgba(${r},${g},${bl},${(0.18 + d * 0.25) * intensity})`;
        ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke();
        if (tr.pulse) {
          const period = 3.0;
          const ph = ((t * tr.sp + tr.phase) % period) / 1.2;
          if (ph <= 1) {
            const px = a.sx + (b.sx - a.sx) * ph;
            const py = a.sy + (b.sy - a.sy) * ph;
            ctx.fillStyle = `rgba(${Math.min(255, r + 55)},${Math.min(255, g + 55)},${Math.min(255, bl + 55)},${(0.7 + d * 0.3) * intensity})`;
            ctx.beginPath(); ctx.arc(px, py, 1.7, 0, Math.PI * 2); ctx.fill();
          }
        }
      }

      // Pad
      for (const p of cpuPads) {
        const pr = project(p.x, p.y);
        const d = 1 - (pr.depth + 1) / 2;
        const [r, g, bl] = paletteColor(Math.min(0.9, Math.max(0.1, pr.sx / width * 0.55 + 0.2)));
        const sz = p.size * (0.6 + d * 0.6);
        ctx.fillStyle = `rgba(${r},${g},${bl},${(0.3 + d * 0.4) * intensity})`;
        ctx.fillRect(pr.sx - sz, pr.sy - sz, sz * 2, sz * 2);
      }

      // Chip centrale
      const cc = cpuChip;
      const corners = [
        project(cc.cx - cc.w / 2, cc.cy - cc.h / 2),
        project(cc.cx + cc.w / 2, cc.cy - cc.h / 2),
        project(cc.cx + cc.w / 2, cc.cy + cc.h / 2),
        project(cc.cx - cc.w / 2, cc.cy + cc.h / 2),
      ];
      ctx.strokeStyle = `rgba(168,85,247,${0.75 * intensity})`;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(corners[0].sx, corners[0].sy);
      for (let i = 1; i < 4; i++) ctx.lineTo(corners[i].sx, corners[i].sy);
      ctx.closePath();
      ctx.stroke();
      ctx.lineWidth = 1;

      // Alone del chip (pulsante)
      const center = project(cc.cx, cc.cy);
      const chipPulse = 0.55 + 0.45 * Math.sin(t * 1.8);
      const chipGlow = ctx.createRadialGradient(center.sx, center.sy, 0, center.sx, center.sy, R * 0.45);
      chipGlow.addColorStop(0, `rgba(168,85,247,${0.4 * chipPulse * intensity})`);
      chipGlow.addColorStop(0.55, `rgba(56,189,248,${0.13 * chipPulse * intensity})`);
      chipGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = chipGlow;
      ctx.fillRect(0, 0, width, height);

      // Cross interno (effetto die/silicio)
      const inner = [
        project(cc.cx - cc.w / 3, cc.cy),
        project(cc.cx + cc.w / 3, cc.cy),
        project(cc.cx, cc.cy - cc.h / 3),
        project(cc.cx, cc.cy + cc.h / 3),
      ];
      ctx.strokeStyle = `rgba(217,70,239,${0.55 * intensity})`;
      ctx.beginPath();
      ctx.moveTo(inner[0].sx, inner[0].sy); ctx.lineTo(inner[1].sx, inner[1].sy);
      ctx.moveTo(inner[2].sx, inner[2].sy); ctx.lineTo(inner[3].sx, inner[3].sy);
      ctx.stroke();
    };

    const drawChart = (t: number, cx: number, cy: number, R: number, focal: number) => {
      const ay = t * 0.18 + mouse.current.x * 0.32;
      const ax = 0.55 + Math.sin(t * 0.13) * 0.05 + mouse.current.y * 0.2;
      const cay = Math.cos(ay), say = Math.sin(ay), cax = Math.cos(ax), sax = Math.sin(ax);
      const span = R * 1.6;
      const stepX = span / chartSX;
      const stepY = span / chartSY;
      const offX = -span / 2;
      const offY = -span / 2;

      const heightAt = (gx: number, gy: number) => {
        const u = (gx - chartSX / 2) / (chartSX / 2);
        const v = (gy - chartSY / 2) / (chartSY / 2);
        return (
          Math.sin(u * 1.5 + t * 0.8) * 0.55 +
          Math.sin(v * 2.0 - t * 0.6) * 0.4 +
          Math.cos((u + v) * 1.8 + t * 1.0) * 0.32 +
          Math.sin(u * 3.0 + v * 1.2 + t * 1.2) * 0.18
        ) * R * 0.17;
      };

      const project = (gx: number, gy: number) => {
        const x = offX + gx * stepX;
        const z = offY + gy * stepY;
        const y = -heightAt(gx, gy);
        const x1 = x * cay + z * say;
        const z1 = -x * say + z * cay;
        const y1 = y * cax - z1 * sax;
        const z2 = y * sax + z1 * cax;
        const scale = focal / (focal + z2);
        return { sx: cx + x1 * scale, sy: cy + y1 * scale, depth: z2 / R, h: -y / R };
      };

      // Pre-proietta tutta la griglia
      const proj: { sx: number; sy: number; depth: number; h: number }[][] = [];
      for (let i = 0; i <= chartSY; i++) {
        const row: typeof proj[number] = [];
        for (let j = 0; j <= chartSX; j++) row.push(project(j, i));
        proj.push(row);
      }

      // Wireframe surface
      for (let i = 0; i <= chartSY; i++) {
        for (let j = 0; j <= chartSX; j++) {
          const p = proj[i][j];
          const hN = Math.min(1, Math.max(0, (p.h + 0.6) / 1.2));
          const [r, g, bl] = paletteColor(Math.min(0.95, Math.max(0.05, hN * 0.7 + 0.15)));
          const d = 1 - (p.depth + 1) / 2;
          const alpha = (0.13 + d * 0.28 + hN * 0.14) * intensity;
          ctx.strokeStyle = `rgba(${r},${g},${bl},${alpha})`;
          if (j < chartSX) {
            const q = proj[i][j + 1];
            ctx.beginPath(); ctx.moveTo(p.sx, p.sy); ctx.lineTo(q.sx, q.sy); ctx.stroke();
          }
          if (i < chartSY) {
            const q = proj[i + 1][j];
            ctx.beginPath(); ctx.moveTo(p.sx, p.sy); ctx.lineTo(q.sx, q.sy); ctx.stroke();
          }
        }
      }

      // Price line lungo la riga centrale
      const midI = Math.floor(chartSY / 2);
      ctx.lineWidth = 2.2;
      const [pr, pg, pb] = paletteColor(0.02);
      ctx.strokeStyle = `rgba(${pr},${pg},${pb},${0.85 * intensity})`;
      ctx.beginPath();
      for (let j = 0; j <= chartSX; j++) {
        const p = proj[midI][j];
        if (j === 0) ctx.moveTo(p.sx, p.sy);
        else ctx.lineTo(p.sx, p.sy);
      }
      ctx.stroke();
      ctx.lineWidth = 1;

      // Tracker dot scorrevole sulla price line
      const u = (Math.sin(t * 0.45) * 0.5 + 0.5) * chartSX;
      const uI = Math.min(chartSX - 1, Math.floor(u));
      const uF = u - uI;
      const a = proj[midI][uI];
      const b = proj[midI][uI + 1];
      const px = a.sx + (b.sx - a.sx) * uF;
      const py = a.sy + (b.sy - a.sy) * uF;
      ctx.fillStyle = `rgba(${pr},${pg},${pb},${intensity})`;
      ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
      const halo = ctx.createRadialGradient(px, py, 0, px, py, R * 0.18);
      halo.addColorStop(0, `rgba(${pr},${pg},${pb},${0.45 * intensity})`);
      halo.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, width, height);
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

      if (variant === 'sphere' || variant === 'globe') drawSphere(t, cx, cy, R, focal);
      else if (variant === 'neural') drawNeural(t, cx, cy, R, focal);
      else if (variant === 'cpu') drawCpu(t, cx, cy, R, focal);
      else if (variant === 'chart') drawChart(t, cx, cy, R, focal);

      // Alone centrale soft (sphere / globe / neural; cpu/chart hanno glow propri)
      if (variant === 'sphere' || variant === 'globe' || variant === 'neural') {
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.4);
        glow.addColorStop(0, `rgba(56,189,248,${0.10 * intensity})`);
        glow.addColorStop(0.5, `rgba(37,99,235,${0.05 * intensity})`);
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
