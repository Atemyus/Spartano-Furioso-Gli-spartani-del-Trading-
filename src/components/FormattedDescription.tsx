import React from 'react';
import { CheckCircle, Info } from 'lucide-react';

/**
 * FormattedDescription — parser leggero per descrizioni di prodotto in plain text.
 *
 * Riconosce:
 *  - Separatori (linee di ═══ / ─── / ━━━): vengono ignorati (rappresentati
 *    visivamente dal cambio di sezione successivo)
 *  - Header di sezione: blocchi di una sola riga TUTTA MAIUSCOLA breve
 *    (es. "COME FUNZIONA", "IMPORTANTE") → tag mono-lab + barra cyan
 *  - Lista puntata: blocchi dove ogni riga inizia con ✓ / • / ■ / ▸
 *    → CheckCircle emerald + testo
 *  - Lista numerata: blocchi dove ogni riga inizia con "1." "2." ...
 *    → numero in mono-lab + testo
 *  - Callout "TIER: ..." o "NB:" → box info evidenziato
 *  - Tutto il resto: paragrafo normale
 *
 * Pensato per descrizioni come quelle dei prodotti Ranger Prop Pass dove
 * il testo nel DB e' gia' strutturato con ═══, sezioni MAIUSCOLE e bullet ✓.
 */

interface Props {
  text: string;
  dark: boolean;
}

const isSeparator = (line: string) => /^[═━─\-]{3,}$/.test(line.trim());

const isHeaderLine = (line: string) => {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (trimmed.length < 3 || trimmed.length > 45) return false;
  // No leading bullet, no leading number
  if (/^[✓•■▸\d]/.test(trimmed)) return false;
  // Tutto MAIUSCOLO (ignorando spazi, simboli e accenti)
  const letters = trimmed.replace(/[^A-Za-zÀ-ÿ]/g, '');
  if (letters.length < 3) return false;
  return letters === letters.toUpperCase();
};

const isBulletLine = (line: string) => /^[✓•■▸]\s/.test(line.trim());
const isNumberedLine = (line: string) => /^\d+\.\s/.test(line.trim());
const isCalloutLine = (line: string) => /^(TIER|NB|NOTA|IMPORTANTE|ATTENZIONE):/i.test(line.trim());

const stripBullet = (line: string) => line.trim().replace(/^[✓•■▸]\s+/, '');
const stripNumber = (line: string) => {
  const m = line.trim().match(/^(\d+)\.\s+(.*)$/);
  return m ? { num: m[1], text: m[2] } : { num: '', text: line.trim() };
};

type Block =
  | { kind: 'header'; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'bullets'; items: string[] }
  | { kind: 'numbered'; items: { num: string; text: string }[] }
  | { kind: 'callout'; text: string };

function parseDescription(text: string): Block[] {
  const blocks: Block[] = [];

  // Spezza il testo in blocchi separati da una o piu' righe vuote, dopo aver
  // rimosso eventuali righe-separatore (═══) che inquinano i blocchi.
  const cleanedLines = text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter((l) => !isSeparator(l));

  const rawBlocks = cleanedLines.join('\n').split(/\n\s*\n+/).map((b) => b.trim()).filter(Boolean);

  for (const rb of rawBlocks) {
    const lines = rb.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    const allBullets = lines.every(isBulletLine);
    const allNumbered = lines.every(isNumberedLine);

    // Header standalone
    if (lines.length === 1 && isHeaderLine(lines[0])) {
      blocks.push({ kind: 'header', text: lines[0] });
      continue;
    }

    // Lista puntata pura
    if (allBullets) {
      blocks.push({ kind: 'bullets', items: lines.map(stripBullet) });
      continue;
    }

    // Lista numerata pura
    if (allNumbered) {
      blocks.push({ kind: 'numbered', items: lines.map(stripNumber) });
      continue;
    }

    // Header + righe seguenti (es. "COME FUNZIONA\n1. ...")
    if (lines.length > 1 && isHeaderLine(lines[0])) {
      blocks.push({ kind: 'header', text: lines[0] });
      const rest = lines.slice(1);
      if (rest.every(isBulletLine)) blocks.push({ kind: 'bullets', items: rest.map(stripBullet) });
      else if (rest.every(isNumberedLine)) blocks.push({ kind: 'numbered', items: rest.map(stripNumber) });
      else blocks.push({ kind: 'paragraph', text: rest.join(' ') });
      continue;
    }

    // Callout (TIER: / NB: ...)
    if (lines.length === 1 && isCalloutLine(lines[0])) {
      blocks.push({ kind: 'callout', text: lines[0] });
      continue;
    }

    // Paragrafo (linee unite con spazio per evitare blocchetti spezzati)
    blocks.push({ kind: 'paragraph', text: lines.join(' ') });
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
