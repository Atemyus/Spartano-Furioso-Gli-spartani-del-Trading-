import express from 'express';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const router = express.Router();
const prisma = new PrismaClient();

// Configurazione email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

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
router.get('/admin/subscribers', async (req, res) => {
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
router.get('/admin/stats', async (req, res) => {
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
router.post('/admin/messages', async (req, res) => {
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
router.get('/admin/messages', async (req, res) => {
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
router.post('/admin/messages/:id/send', async (req, res) => {
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

    // Invia email a tutti gli iscritti
    const transporter = createTransporter();
    let sentCount = 0;

    for (const subscriber of subscribers) {
      try {
        await transporter.sendMail({
          from: `"Spartano Furioso" <${process.env.EMAIL_USER}>`,
          to: subscriber.email,
          subject: message.subject,
          html: buildEmailHTML(message.content, subscriber.email)
        });
        sentCount++;
      } catch (error) {
        console.error(`Errore invio a ${subscriber.email}:`, error);
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
router.delete('/admin/messages/:id', async (req, res) => {
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
router.put('/admin/messages/:id', async (req, res) => {
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

// Funzione per inviare email di benvenuto
async function sendWelcomeEmail(email, name) {
  try {
    const transporter = createTransporter();

    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #000; color: #fff; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #DC2626 0%, #7F1D1D 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .logo { font-size: 32px; font-weight: bold; color: #FCD34D; }
          .content { background-color: #1F2937; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #9CA3AF; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">⚔️ SPARTANO FURIOSO ⚔️</div>
            <h1 style="margin: 10px 0 0 0;">BENVENUTO NELLA FALANGE!</h1>
          </div>
          <div class="content">
            <h2>Ciao ${name || 'Guerriero'}! 🛡️</h2>
            <p>Hai fatto la scelta giusta unendoti alla Falange di Spartano Furioso!</p>
            
            <p>Da oggi riceverai:</p>
            <ul>
              <li>📊 Segnali di trading esclusivi</li>
              <li>💰 Strategie vincenti per massimizzare i profitti</li>
              <li>🎯 Analisi di mercato approfondite</li>
              <li>🔥 Offerte speciali riservate ai membri</li>
              <li>📚 Contenuti formativi di alto livello</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/products" class="button">
                SCOPRI I NOSTRI PRODOTTI
              </a>
            </div>
            
            <p style="margin-top: 30px;">Preparati a dominare i mercati con la disciplina spartana! 💪</p>
            
            <p style="color: #FCD34D; font-style: italic; text-align: center; margin-top: 30px;">
              "Μολὼν λαβέ - Vieni a prenderli"<br>
              - Re Leonida I di Sparta -
            </p>
          </div>
          <div class="footer">
            <p>Hai ricevuto questa email perché ti sei iscritto alla newsletter di Spartano Furioso.</p>
            <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/unsubscribe?email=${email}" style="color: #9CA3AF;">Disiscriviti</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Spartano Furioso" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '⚔️ Benvenuto nella Falange, Guerriero! 🛡️',
      html: emailHTML
    });
  } catch (error) {
    console.error('Errore invio email benvenuto:', error);
  }
}

// Funzione per costruire HTML email con link disiscrizione
function buildEmailHTML(content, email) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background-color: #000; color: #fff; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #DC2626 0%, #7F1D1D 100%); padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .logo { font-size: 28px; font-weight: bold; color: #FCD34D; }
        .content { background-color: #1F2937; padding: 30px; border-radius: 0 0 10px 10px; }
        .footer { text-align: center; padding: 20px; color: #9CA3AF; font-size: 12px; }
        a { color: #FCD34D; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">⚔️ SPARTANO FURIOSO ⚔️</div>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/unsubscribe?email=${email}" style="color: #9CA3AF;">Disiscriviti dalla newsletter</a></p>
          <p>© 2025 Spartano Furioso Trading. Tutti i diritti riservati.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export default router;
