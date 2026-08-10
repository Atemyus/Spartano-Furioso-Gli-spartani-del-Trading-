import React from 'react';
import { CheckCircle, Info } from 'lucide-react';

/**
 * FormattedDescription — parser leggero per descrizioni in plain text.
 *
 * Riconosce:
 *  - Separatori (linee di ═══ / ─── / ━━━): vengono ignorati
 *  - Header di sezione MAIUSCOLI standalone (es. "COME FUNZIONA")
 *    → tag mono-lab + barra cyan
 *  - Mini-header con emoji finiti in ":" (es. "📒 Cosa scoprirai:")
 *    → riga in font-display semibold con accento cyan
 *  - Lista puntata: righe che iniziano con ✓ ✅ ✔ • ■ ▸ ☑
 *    → CheckCircle emerald + testo
 *  - Lista numerata (1. 2. 3.)
 *    → numero in pill cyan + testo
 *  - Callout "TIER: / NB: / IMPORTANTE:" → box info
 *  - Tutto il resto: paragrafo normale (rispetta righe singole)
 */

interface Props {
  text: string;
  dark: boolean;
}

// Regex emoji generica (range Unicode dei simboli/pittogrammi)
const EMOJI_RE = /^(\p{Extended_Pictographic}|[☀-➿])(️)?/u;

const isSeparator = (line: string) => /^[═━─\-]{3,}$/.test(line.trim());

const isHeaderLine = (line: string) => {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (trimmed.length < 3 || trimmed.length > 45) return false;
  if (/^[✓•■▸\d]/.test(trimmed)) return false;
  const letters = trimmed.replace(/[^A-Za-zÀ-ÿ]/g, '');
  if (letters.length < 3) return false;
  return letters === letters.toUpperCase();
};

// Mini-header con emoji finito in ":" (es. "📒 Cosa scoprirai:", "🎯 Perfetto se:")
const isMiniHeaderLine = (line: string) => {
  const t = line.trim();
  if (t.length > 80 || t.length < 4) return false;
  if (!EMOJI_RE.test(t)) return false;
  return t.endsWith(':');
};

// Bullet markers riconosciuti (anche emoji check)
const BULLET_RE = /^(✅|✔️?|☑️?|✓|•|■|▸|◆|◾|◽|⬛|⬜)\s+/;
const isBulletLine = (line: string) => BULLET_RE.test(line.trim());
const stripBullet = (line: string) => line.trim().replace(BULLET_RE, '');

const isNumberedLine = (line: string) => /^\d+\.\s/.test(line.trim());
const isCalloutLine = (line: string) => /^(TIER|NB|NOTA|IMPORTANTE|ATTENZIONE):/i.test(line.trim());

const stripNumber = (line: string) => {
  const m = line.trim().match(/^(\d+)\.\s+(.*)$/);
  return m ? { num: m[1], text: m[2] } : { num: '', text: line.trim() };
};

type Block =
  | { kind: 'header'; text: string }
  | { kind: 'miniHeader'; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'bullets'; items: string[] }
  | { kind: 'numbered'; items: { num: string; text: string }[] }
  | { kind: 'callout'; text: string };

function parseDescription(text: string): Block[] {
  const blocks: Block[] = [];

  const cleanedLines = text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter((l) => !isSeparator(l));

  const rawBlocks = cleanedLines.join('\n').split(/\n\s*\n+/).map((b) => b.trim()).filter(Boolean);

  for (const rb of rawBlocks) {
    const lines = rb.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    // Single-line cases
    if (lines.length === 1) {
      const only = lines[0];
      if (isHeaderLine(only)) { blocks.push({ kind: 'header', text: only }); continue; }
      if (isMiniHeaderLine(only)) { blocks.push({ kind: 'miniHeader', text: only }); continue; }
      if (isCalloutLine(only)) { blocks.push({ kind: 'callout', text: only }); continue; }
      blocks.push({ kind: 'paragraph', text: only });
      continue;
    }

    // Multi-line: processa riga per riga, raggruppa bullets/numbered consecutive
    const allBullets = lines.every(isBulletLine);
    const allNumbered = lines.every(isNumberedLine);
    if (allBullets) { blocks.push({ kind: 'bullets', items: lines.map(stripBullet) }); continue; }
    if (allNumbered) { blocks.push({ kind: 'numbered', items: lines.map(stripNumber) }); continue; }

    // Misto: scorri linea per linea
    let bulletBuf: string[] = [];
    let numberedBuf: { num: string; text: string }[] = [];
    const flushBullets = () => { if (bulletBuf.length) { blocks.push({ kind: 'bullets', items: bulletBuf }); bulletBuf = []; } };
    const flushNumbered = () => { if (numberedBuf.length) { blocks.push({ kind: 'numbered', items: numberedBuf }); numberedBuf = []; } };

    for (const line of lines) {
      if (isBulletLine(line)) { flushNumbered(); bulletBuf.push(stripBullet(line)); continue; }
      if (isNumberedLine(line)) { flushBullets(); numberedBuf.push(stripNumber(line)); continue; }
      flushBullets(); flushNumbered();
      if (isHeaderLine(line)) blocks.push({ kind: 'header', text: line });
      else if (isMiniHeaderLine(line)) blocks.push({ kind: 'miniHeader', text: line });
      else if (isCalloutLine(line)) blocks.push({ kind: 'callout', text: line });
      else blocks.push({ kind: 'paragraph', text: line });
    }
    flushBullets(); flushNumbered();
  }
  return blocks;
}

const FormattedDescription: React.FC<Props> = ({ text, dark }) => {
  if (!text || typeof text !== 'string') return null;

  const blocks = parseDescription(text);
  if (blocks.length === 0) return null;

  const textMain = dark ? 'text-white' : 'text-slate-900';
  const textBody = dark ? 'text-slate-300' : 'text-slate-700';
  const textDim = dark ? 'text-slate-500' : 'text-slate-500';

  return (
    <div className="space-y-5">
      {blocks.map((b, i) => {
        if (b.kind === 'header') {
          return (
            <div key={i} className="flex items-center gap-3 pt-1">
              <span className="w-1 h-5 rounded-sm bg-gradient-to-b from-cyan-400 to-blue-500" />
              <h4 className="font-mono-lab text-[0.7rem] tracking-[0.3em] uppercase text-cyan-500">
                // {b.text.toLowerCase()}
              </h4>
            </div>
          );
        }
        if (b.kind === 'miniHeader') {
          // Estrae l'emoji iniziale + il testo (senza ":" finale)
          const m = b.text.match(EMOJI_RE);
          const emoji = m ? m[0] : '';
          const rest = b.text.replace(EMOJI_RE, '').replace(/:\s*$/, '').trim();
          return (
            <div key={i} className="flex items-center gap-2 pt-2">
              {emoji && <span className="text-base shrink-0">{emoji}</span>}
              <h5 className={`font-display font-semibold text-sm ${textMain}`}>{rest}</h5>
            </div>
          );
        }
        if (b.kind === 'bullets') {
          return (
            <ul key={i} className="space-y-1.5">
              {b.items.map((it, j) => (
                <li key={j} className="flex items-start gap-2.5 text-sm leading-relaxed">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span className={textBody}>{it}</span>
                </li>
              ))}
            </ul>
          );
        }
        if (b.kind === 'numbered') {
          return (
            <ol key={i} className="space-y-2">
              {b.items.map((it, j) => (
                <li key={j} className="flex items-start gap-3 text-sm leading-relaxed">
                  <span className={`shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-md font-mono-lab text-[0.7rem] font-bold ${
                    dark ? 'bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/30' : 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-500/30'
                  }`}>{it.num}</span>
                  <span className={`${textBody} pt-0.5`}>{it.text}</span>
                </li>
              ))}
            </ol>
          );
        }
        if (b.kind === 'callout') {
          // "TIER: blabla" → label + body
          const [labelRaw, ...rest] = b.text.split(':');
          const body = rest.join(':').trim();
          return (
            <div key={i} className={`rounded-lg border p-3 flex items-start gap-2.5 ${
              dark ? 'bg-cyan-500/5 border-cyan-500/30' : 'bg-cyan-50 border-cyan-500/40'
            }`}>
              <Info className="w-4 h-4 text-cyan-500 mt-0.5 shrink-0" />
              <div className="text-sm leading-relaxed">
                <span className="font-mono-lab text-[0.65rem] tracking-widest uppercase text-cyan-500 font-bold mr-1.5">{labelRaw}:</span>
                <span className={textBody}>{body}</span>
              </div>
            </div>
          );
        }
        // paragraph
        // Heuristica leggera: se contiene "TIER:" o "NB:" inline → trattalo come callout
        if (/^(TIER|NB|NOTA|IMPORTANTE|ATTENZIONE):/i.test(b.text)) {
          const [labelRaw, ...rest] = b.text.split(':');
          const body = rest.join(':').trim();
          return (
            <div key={i} className={`rounded-lg border p-3 flex items-start gap-2.5 ${
              dark ? 'bg-cyan-500/5 border-cyan-500/30' : 'bg-cyan-50 border-cyan-500/40'
            }`}>
              <Info className="w-4 h-4 text-cyan-500 mt-0.5 shrink-0" />
              <div className="text-sm leading-relaxed">
                <span className="font-mono-lab text-[0.65rem] tracking-widest uppercase text-cyan-500 font-bold mr-1.5">{labelRaw}:</span>
                <span className={textBody}>{body}</span>
              </div>
            </div>
          );
        }
        return (
          <p key={i} className={`text-sm leading-relaxed ${textBody}`}>
            {b.text}
          </p>
        );
      })}
    </div>
  );
};

export default FormattedDescription;
