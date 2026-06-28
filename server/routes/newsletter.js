import express from 'express';
import { PrismaClient } from '@prisma/client';
import { sendEmail, sendRawEmail } from '../services/emailService.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// ════════════════════════════════════════════════════════════════
// LEAD da landing page (NON richiede registrazione/account)
// Cattura l'email di un visitatore freddo, la salva tra gli iscritti
// (visibile in admin) e invia la guida PDF bonus via email.
// ════════════════════════════════════════════════════════════════
const GUIDE_URL = 'https://nexoralab.solutions/guida-codex-algo-academy.pdf';

router.post('/lead', async (req, res) => {
  try {
    const { email, source = 'lp-codex' } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Email non valida' });
    }
    const lower = email.toLowerCase().trim();

    // Salva/aggiorna il lead nella tabella newsletter (no account richiesto)
    const existing = await prisma.newsletter.findUnique({ where: { email: lower } });
    if (existing) {
      await prisma.newsletter.update({
        where: { email: lower },
        data: { status: 'ACTIVE', subscribedAt: new Date(), unsubscribedAt: null, source },
      });
    } else {
      await prisma.newsletter.create({
        data: { email: lower, source, status: 'ACTIVE' },
      });
    }

    // Invia la guida PDF bonus (link di download). Non blocca la risposta.
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#0f172a">
        <div style="background:linear-gradient(135deg,#0b1220,#05070d);padding:28px 24px;border-radius:14px 14px 0 0;text-align:center">
          <div style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px">NEXORA<span style="color:#22d3ee">LAB</span></div>
        </div>
        <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 14px 14px;padding:26px 24px">
          <h2 style="margin:0 0 10px;font-size:20px">🎁 Ecco la tua guida gratuita!</h2>
          <p style="font-size:14px;line-height:1.6;color:#475569">
            Grazie per esserti iscritto. Come promesso, ecco la guida
            <strong>"Trading Algoritmico: la panoramica per partire"</strong>.
          </p>
          <p style="text-align:center;margin:24px 0">
            <a href="${GUIDE_URL}" style="display:inline-block;background:linear-gradient(90deg,#2563eb,#06b6d4);color:#fff;font-weight:700;font-size:14px;padding:13px 30px;border-radius:10px;text-decoration:none">
              📄 Scarica la guida (PDF)
            </a>
          </p>
          <p style="font-size:14px;line-height:1.6;color:#475569">
            Intanto su Nexora Lab hai già sbloccato <strong>tutti i video gratuiti</strong>.
            Quando vuoi, prenota una <strong>call gratuita col fondatore</strong> per capire se l'academy fa per te.
          </p>
          <p style="text-align:center;margin:20px 0 0">
            <a href="https://nexoralab.solutions/lp/codex-algo-academy" style="color:#06b6d4;font-weight:600;font-size:14px;text-decoration:none">
              → Torna ai video e prenota la call
            </a>
          </p>
        </div>
        <p style="text-align:center;font-size:11px;color:#94a3b8;margin-top:16px">© Nexora Lab · Codex Algo Academy</p>
      </div>`;
    sendRawEmail(lower, '🎁 La tua guida gratuita — Codex Algo Academy', html)
      .then(() => console.log('📧 Guida inviata a:', lower))
      .catch((e) => console.warn('⚠️ Invio guida fallito (email non configurata?):', e.message));

    res.json({ success: true, message: 'Lead registrato. Guida in arrivo via email.' });
  } catch (error) {
    console.error('Errore lead LP:', error);
    res.status(500).json({ error: 'Errore durante la registrazione del lead' });
  }
});

// Iscriviti alla newsletter
router.post('/subscribe', async (req, res) => {
  try {
    const { email, name, source = 'footer' } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Email non valida' });
    }

    // VERIFICA CHE L'UTENTE SIA REGISTRATO AL SITO
    console.log('🔍 Verifica utente con email:', email.toLowerCase());
    
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    console.log('👤 Utente trovato:', user ? `✅ ${user.email}` : '❌ Nessun utente');

    if (!user) {
      console.log('⚠️ Email non registrata:', email.toLowerCase());
      return res.status(403).json({ 
        error: 'Devi essere registrato al sito per iscriverti alla newsletter!',
        requiresRegistration: true
      });
    }

    console.log('✅ Utente verificato, procedo con iscrizione newsletter');

    // Controlla se l'email è già iscritta alla newsletter
    const existing = await prisma.newsletter.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existing) {
      if (existing.status === 'UNSUBSCRIBED') {
        // Riattiva l'iscrizione
        await prisma.newsletter.update({
          where: { email: email.toLowerCase() },
          data: {
            status: 'ACTIVE',
            subscribedAt: new Date(),
            unsubscribedAt: null,
            source
          }
        });

        // Invia email di benvenuto (se configurata)
        try {
          await sendWelcomeEmail(email, name);
        } catch (emailError) {
          console.warn('Email non configurata, skipping email di benvenuto:', emailError.message);
        }

        return res.json({
          success: true,
          message: 'Bentornato nella Falange! La tua iscrizione è stata riattivata.'
        });
      } else {
        return res.status(400).json({
          error: 'Sei già iscritto alla newsletter!'
        });
      }
    }

    // Crea nuova iscrizione
    await prisma.newsletter.create({
      data: {
        email: email.toLowerCase(),
        name,
        source,
        status: 'ACTIVE'
      }
    });

    // Invia email di benvenuto (se configurata)
    try {
      await sendWelcomeEmail(email, name);
    } catch (emailError) {
      console.warn('Email non configurata, skipping email di benvenuto:', emailError.message);
    }

    res.json({
      success: true,
      message: 'Benvenuto nella Falange! La tua iscrizione è stata confermata.'
    });
  } catch (error) {
    console.error('Errore iscrizione newsletter:', error);
    res.status(500).json({ error: 'Errore durante l\'iscrizione: ' + error.message });
  }
});

// Disiscrizione dalla newsletter
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;

    await prisma.newsletter.update({
      where: { email: email.toLowerCase() },
      data: {
        status: 'UNSUBSCRIBED',
        unsubscribedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Ti sei disiscritto con successo dalla newsletter.'
    });
  } catch (error) {
    console.error('Errore disiscrizione newsletter:', error);
    res.status(500).json({ error: 'Errore durante la disiscrizione' });
  }
});

// Admin: Get tutti gli iscritti
router.get('/admin/subscribers', authenticateAdmin, async (req, res) => {
  try {
    console.log('📧 Fetching subscribers...');
    const { status, search, page = 1, limit = 50 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { name: { contains: search } }
      ];
    }

    const total = await prisma.newsletter.count({ where });
    console.log('✅ Total count:', total);
    
    const subscribers = await prisma.newsletter.findMany({
      where,
      orderBy: { subscribedAt: 'desc' },
      skip: (page - 1) * limit,
      take: parseInt(limit)
    });
    console.log('✅ Subscribers found:', subscribers.length);

    res.json({
      subscribers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Errore recupero iscritti:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ 
      error: 'Errore durante il recupero degli iscritti',
      details: error.message
    });
  }
});

// Admin: Get statistiche newsletter
router.get('/admin/stats', authenticateAdmin, async (req, res) => {
  try {
    console.log('📊 Fetching newsletter stats...');
    
    const totalSubscribers = await prisma.newsletter.count({
      where: { status: 'ACTIVE' }
    });
    console.log('✅ Total subscribers:', totalSubscribers);

    const totalUnsubscribed = await prisma.newsletter.count({
      where: { status: 'UNSUBSCRIBED' }
    });
    console.log('✅ Total unsubscribed:', totalUnsubscribed);

    const subscribersThisMonth = await prisma.newsletter.count({
      where: {
        status: 'ACTIVE',
        subscribedAt: {
          gte: new Date(new Date().setDate(1))
        }
      }
    });
    console.log('✅ Subscribers this month:', subscribersThisMonth);

    const totalMessagesSent = await prisma.newsletterMessage.count({
      where: { status: 'sent' }
    });
    console.log('✅ Total messages sent:', totalMessagesSent);

    const avgOpenRate = await prisma.newsletterMessage.aggregate({
      where: { status: 'sent', recipientCount: { gt: 0 } },
      _avg: {
        openCount: true
      }
    });
    console.log('✅ Avg open rate:', avgOpenRate);

    res.json({
      totalSubscribers,
      totalUnsubscribed,
      subscribersThisMonth,
      totalMessagesSent,
      avgOpenRate: avgOpenRate._avg?.openCount || 0
    });
  } catch (error) {
    console.error('❌ Errore recupero statistiche:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Errore durante il recupero delle statistiche',
      details: error.message
    });
  }
});

// Admin: Crea messaggio newsletter
router.post('/admin/messages', authenticateAdmin, async (req, res) => {
  try {
    const { subject, content, type, scheduledFor } = req.body;

    const message = await prisma.newsletterMessage.create({
      data: {
        subject,
        content,
        type: type || 'promotional',
        status: scheduledFor ? 'scheduled' : 'draft',
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null
      }
    });

    res.json({ success: true, message });
  } catch (error) {
    console.error('Errore creazione messaggio:', error);
    res.status(500).json({ error: 'Errore durante la creazione del messaggio' });
  }
});

// Admin: Get messaggi newsletter
router.get('/admin/messages', authenticateAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const where = status ? { status } : {};

    const total = await prisma.newsletterMessage.count({ where });
    const messages = await prisma.newsletterMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: parseInt(limit)
    });

    res.json({
      messages,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Errore recupero messaggi:', error);
    res.status(500).json({ error: 'Errore durante il recupero dei messaggi' });
  }
});

// Admin: Invia messaggio newsletter
router.post('/admin/messages/:id/send', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const message = await prisma.newsletterMessage.findUnique({
      where: { id }
    });

    if (!message) {
      return res.status(404).json({ error: 'Messaggio non trovato' });
    }

    // Get tutti gli iscritti attivi
    const subscribers = await prisma.newsletter.findMany({
      where: { status: 'ACTIVE' }
    });

    if (subscribers.length === 0) {
      return res.status(400).json({ error: 'Nessun iscritto attivo trovato' });
    }

    // Invia email a tutti gli iscritti tramite il servizio unificato (Resend/SMTP)
    let sentCount = 0;

    for (const subscriber of subscribers) {
      const result = await sendRawEmail(
        subscriber.email,
        message.subject,
        buildEmailHTML(message.content, subscriber.email)
      );
      if (result?.success) {
        sentCount++;
      } else {
        console.error(`Errore invio a ${subscriber.email}:`, result?.error);
      }
    }

    // Aggiorna il messaggio
    await prisma.newsletterMessage.update({
      where: { id },
      data: {
        status: 'sent',
        sentAt: new Date(),
        recipientCount: sentCount
      }
    });

    res.json({
      success: true,
      message: `Newsletter inviata a ${sentCount} iscritti`
    });
  } catch (error) {
    console.error('Errore invio newsletter:', error);
    res.status(500).json({ error: 'Errore durante l\'invio della newsletter' });
  }
});

// Admin: Elimina messaggio
router.delete('/admin/messages/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.newsletterMessage.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Messaggio eliminato' });
  } catch (error) {
    console.error('Errore eliminazione messaggio:', error);
    res.status(500).json({ error: 'Errore durante l\'eliminazione del messaggio' });
  }
});

// Admin: Aggiorna messaggio
router.put('/admin/messages/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, content, type, scheduledFor, status } = req.body;

    const message = await prisma.newsletterMessage.update({
      where: { id },
      data: {
        subject,
        content,
        type,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        status
      }
    });

    res.json({ success: true, message });
  } catch (error) {
    console.error('Errore aggiornamento messaggio:', error);
    res.status(500).json({ error: 'Errore durante l\'aggiornamento del messaggio' });
  }
});

// Funzione per inviare email di benvenuto newsletter.
// Usa il servizio email unificato (Resend o SMTP) invece di un transporter
// separato: così la mail arriva davvero anche se è configurato solo Resend.
async function sendWelcomeEmail(email, name) {
  try {
    const result = await sendEmail(email, 'newsletterWelcome', { userName: name });
    if (!result?.success) {
      console.warn('⚠️ Email benvenuto newsletter non inviata:', result?.error);
    }
  } catch (error) {
    console.error('Errore invio email benvenuto newsletter:', error);
  }
}

// Funzione per costruire HTML email newsletter con link disiscrizione (brand Nexora Lab)
function buildEmailHTML(content, email) {
  const site = process.env.FRONTEND_URL || 'https://nexoralab.solutions';
  return `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background:#f1f5f9;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 12px;">
        <tr><td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(2,6,23,0.08);">
            <tr>
              <td style="background:linear-gradient(135deg,#0b1e3f 0%,#1e3a8a 55%,#0ea5e9 140%);padding:30px 40px;text-align:center;">
                <div style="font-family:'Segoe UI',Arial,sans-serif;font-size:26px;font-weight:800;color:#ffffff;">Nexora<span style="color:#38bdf8;">Lab</span></div>
                <div style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:3px;color:#7dd3fc;margin-top:6px;">LAB BRIEF</div>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 40px;font-family:'Segoe UI',Arial,sans-serif;color:#1e293b;line-height:1.65;font-size:16px;">
                ${content}
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px;background:#0b1e3f;text-align:center;font-family:Arial,sans-serif;color:#94a3b8;font-size:12px;line-height:1.7;">
                © ${new Date().getFullYear()} Nexora Lab — Trading &amp; Creator economy<br>
                <a href="${site}/unsubscribe?email=${encodeURIComponent(email)}" style="color:#38bdf8;text-decoration:none;">Disiscriviti dalla newsletter</a>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;
}

export default router;
