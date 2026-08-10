/**
 * Calendly Webhook
 * Endpoint: POST /webhook/calendly
 *
 * Calendly chiama questo endpoint ad ogni "invitee.created" (nuova prenotazione)
 * o "invitee.canceled" (cancellazione). Inoltriamo la notifica via Telegram
 * ai chat ID configurati in TELEGRAM_CHAT_IDS.
 *
 * SICUREZZA: Calendly firma ogni richiesta con HMAC-SHA256 nell'header
 * "calendly-webhook-signature". Se CALENDLY_WEBHOOK_SECRET e' configurato,
 * la firma viene verificata e le richieste non valide rifiutate.
 *
 * NOTA: questa route monta un body parser raw (necessario per HMAC), quindi
 * va registrata PRIMA del body parser json globale (vedi server/index.js).
 */
import express from 'express';
import crypto from 'crypto';
import { notifyTelegram, escapeHtml } from '../services/telegramNotifier.js';

const router = express.Router();

// Verifica la firma HMAC-SHA256 di Calendly
function verifyCalendlySignature(rawBody, signatureHeader, secret) {
  if (!signatureHeader || !secret) return false;
  // Formato: "t=<timestamp>,v1=<signature>"
  const parts = Object.fromEntries(
    signatureHeader.split(',').map(p => p.split('=').map(s => s.trim()))
  );
  const timestamp = parts.t;
  const sig = parts.v1;
  if (!timestamp || !sig) return false;

  const payload = `${timestamp}.${rawBody.toString('utf8')}`;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  // Confronto timing-safe
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

// Formatta una data ISO in italiano (Europe/Rome)
function formatDateIT(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('it-IT', {
      timeZone: 'Europe/Rome',
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

// Estrae il primo conferencing link disponibile (Meet/Zoom/Calendly)
function pickJoinUrl(event) {
  if (!event) return '';
  const loc = event.location || {};
  return loc.join_url || loc.data?.join_url || loc.location || '';
}

router.post(
  '/',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    try {
      const rawBody = req.body; // Buffer (raw)
      const signature = req.headers['calendly-webhook-signature'];
      const secret = process.env.CALENDLY_WEBHOOK_SECRET;

      // Se il secret e' configurato, verifica la firma
      if (secret) {
        if (!verifyCalendlySignature(rawBody, signature, secret)) {
          console.warn('⚠️  Calendly webhook: firma non valida');
          return res.status(401).json({ error: 'Invalid signature' });
        }
      } else {
        console.warn('⚠️  CALENDLY_WEBHOOK_SECRET non configurato — accetto senza verifica firma');
      }

      // Parse JSON manualmente perche' abbiamo usato express.raw
      let body;
      try {
        body = JSON.parse(rawBody.toString('utf8'));
      } catch {
        return res.status(400).json({ error: 'Invalid JSON' });
      }

      const event = body.event;          // "invitee.created" | "invitee.canceled"
      const payload = body.payload || {};

      // Estrai dati dell'invitee
      const inviteeName = payload.name || payload.first_name || 'Ospite';
      const inviteeEmail = payload.email || '—';

      // Dettagli dell'evento Calendly (orario, link join, nome event type)
      const scheduledEvent = payload.scheduled_event || {};
      const eventName = scheduledEvent.name || 'Discovery Call';
      const startTime = scheduledEvent.start_time;
      const endTime = scheduledEvent.end_time;
      const joinUrl = pickJoinUrl(scheduledEvent);
      const calendlyEventUrl = payload.uri || scheduledEvent.uri || '';

      // Fonte della prenotazione: utm_source aggiunto al link Calendly dalla
      // landing page (es. "ranger-prop-pass" dalla LP Ranger). Se assente,
      // la call arriva dal link standard (LP Codex / discovery-call diretta).
      const utmSource = payload.tracking?.utm_source || '';
      const sourceLabel =
        utmSource === 'ranger-prop-pass' ? '🎯 Ranger Prop Pass' : utmSource;

      // Risposte alle domande personalizzate (se ce ne sono)
      const questionsAndAnswers = Array.isArray(payload.questions_and_answers)
        ? payload.questions_and_answers
        : [];
      const answersBlock = questionsAndAnswers
        .filter(qa => qa.answer)
        .map(qa => `• <i>${escapeHtml(qa.question)}</i>: ${escapeHtml(qa.answer)}`)
        .join('\n');

      // Componi il messaggio Telegram in base al tipo di evento
      let message;
      if (event === 'invitee.canceled') {
        message =
          `❌ <b>Call cancellata</b>\n\n` +
          `👤 ${escapeHtml(inviteeName)} (${escapeHtml(inviteeEmail)})\n` +
          `📅 ${escapeHtml(formatDateIT(startTime))}\n` +
          (payload.cancellation?.reason
            ? `📝 Motivo: ${escapeHtml(payload.cancellation.reason)}\n`
            : '');
      } else {
        // invitee.created (o qualsiasi altro evento positivo)
        message =
          `🎉 <b>Nuova call prenotata!</b>\n\n` +
          `👤 <b>${escapeHtml(inviteeName)}</b>\n` +
          `📧 ${escapeHtml(inviteeEmail)}\n` +
          `📅 ${escapeHtml(formatDateIT(startTime))}` +
          (endTime
            ? ` → ${escapeHtml(new Date(endTime).toLocaleTimeString('it-IT', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit' }))}\n`
            : '\n') +
          `📌 <i>${escapeHtml(eventName)}</i>\n` +
          (sourceLabel ? `📍 Fonte: <b>${escapeHtml(sourceLabel)}</b>\n` : '') +
          (joinUrl ? `\n🔗 <a href="${joinUrl}">Entra nella call</a>\n` : '') +
          (calendlyEventUrl ? `🗓 <a href="${calendlyEventUrl}">Apri su Calendly</a>\n` : '') +
          (answersBlock ? `\n<b>Risposte sondaggio</b>\n${answersBlock}` : '');
      }

      // Smistamento destinatari: le call che arrivano dalla LP Ranger
      // (utm_source=ranger-prop-pass) vanno SOLO ai chat ID elencati in
      // TELEGRAM_CHAT_IDS_RANGER (se configurata). Tutte le altre call
      // continuano ad andare ai destinatari globali TELEGRAM_CHAT_IDS.
      const rangerIds = (process.env.TELEGRAM_CHAT_IDS_RANGER || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      const isRangerBooking = utmSource === 'ranger-prop-pass';

      const results = await notifyTelegram(message, {
        disablePreview: true,
        ...(isRangerBooking && rangerIds.length > 0 ? { chatIds: rangerIds } : {}),
      });

      // Rispondi 200 a Calendly (importante: timeout breve, altrimenti riprova)
      res.json({ received: true, telegram: results });
    } catch (err) {
      console.error('❌ Errore webhook Calendly:', err);
      res.status(500).json({ error: 'Internal error' });
    }
  }
);

export default router;
