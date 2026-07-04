/**
 * Telegram notifier service
 *
 * Manda messaggi a uno o piu' chat ID tramite Bot API.
 * Configurazione via env vars:
 *   TELEGRAM_BOT_TOKEN     → token del bot (BotFather)
 *   TELEGRAM_CHAT_IDS      → chat ID separati da virgola (es. "12345,67890")
 *
 * options.chatIds permette di sovrascrivere i destinatari per una singola
 * notifica (es. le call della LP Ranger vanno solo ad alcuni chat ID).
 *
 * Se manca anche solo una variabile, le funzioni fanno no-op e loggano warning
 * (cosi' il backend continua a funzionare anche senza Telegram configurato).
 */

const TELEGRAM_API = 'https://api.telegram.org';

function getConfig() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const idsRaw = process.env.TELEGRAM_CHAT_IDS || '';
  const ids = idsRaw.split(',').map(s => s.trim()).filter(Boolean);
  if (!token || ids.length === 0) {
    return null;
  }
  return { token, ids };
}

/**
 * Manda un messaggio (in parsemode HTML) a tutti i chat ID configurati.
 * Ritorna un array di esiti, uno per chat.
 */
export async function notifyTelegram(text, options = {}) {
  const cfg = getConfig();
  if (!cfg) {
    console.warn('⚠️  Telegram non configurato (TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_IDS mancante). Notifica saltata.');
    return [];
  }

  const url = `${TELEGRAM_API}/bot${cfg.token}/sendMessage`;
  const results = [];

  // Destinatari: override per-notifica se fornito, altrimenti quelli globali
  const targetIds =
    Array.isArray(options.chatIds) && options.chatIds.length > 0
      ? options.chatIds
      : cfg.ids;

  for (const chatId of targetIds) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: options.parseMode || 'HTML',
          disable_web_page_preview: options.disablePreview ?? false,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        console.error(`❌ Telegram sendMessage fallito per ${chatId}:`, data);
        results.push({ chatId, ok: false, error: data.description || res.status });
      } else {
        console.log(`📨 Telegram notificato: ${chatId}`);
        results.push({ chatId, ok: true });
      }
    } catch (err) {
      console.error(`❌ Telegram errore di rete per ${chatId}:`, err.message);
      results.push({ chatId, ok: false, error: err.message });
    }
  }
  return results;
}

/**
 * Escape HTML per i messaggi Telegram (parse_mode=HTML).
 */
export function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
