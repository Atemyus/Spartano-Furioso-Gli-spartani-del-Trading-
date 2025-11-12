import nodemailer from 'nodemailer';
import { config } from '../config';
import { Resend } from 'resend';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private resend: Resend | null = null;

  constructor() {
    console.log('🔧 EmailService - Configurazione:');
    console.log('  RESEND_API_KEY:', process.env.RESEND_API_KEY ? '***PRESENTE***' : 'MANCANTE');
    console.log('  SMTP_HOST:', config.smtp.host);
    console.log('  SMTP_PORT:', config.smtp.port);
    console.log('  SMTP_USER:', config.smtp.user);
    console.log('  SMTP_PASS:', config.smtp.pass ? '***PRESENTE***' : 'MANCANTE');
    console.log('  MAIL_FROM:', config.smtp.from);
    
    // Prova Resend prima (più affidabile su Railway)
    if (process.env.RESEND_API_KEY) {
      console.log('✅ Usando Resend per le email...');
      this.resend = new Resend(process.env.RESEND_API_KEY);
    } else if (config.smtp.host) {
      console.log('✅ Creazione transporter SMTP...');
      this.transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port || 587,
        secure: false,
        auth: {
          user: config.smtp.user,
          pass: config.smtp.pass,
        },
        connectionTimeout: 60000, // 60 secondi
        greetingTimeout: 30000,   // 30 secondi
        socketTimeout: 60000,     // 60 secondi
      });
      console.log('✅ Transporter creato con successo!');
    } else {
      console.log('❌ Nessuna configurazione email trovata - modalità dev attiva');
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    console.log('🚀 sendEmail chiamato con:', options.to);
    console.log('🔍 this.resend esiste?', !!this.resend);
    console.log('🔍 this.transporter esiste?', !!this.transporter);
    
    // Prova Resend prima
    if (this.resend) {
      console.log('📧 Invio email con Resend...');
      console.log('📧 From:', config.smtp.from);
      console.log('📧 To:', options.to);
      console.log('📧 Subject:', options.subject);
      try {
        const result = await this.resend.emails.send({
          from: config.smtp.from,
          to: [options.to],
          subject: options.subject,
          html: options.html,
        });
        console.log('✅ Email inviata con Resend!', result);
        return;
      } catch (error: any) {
        console.error('❌ Errore Resend:', error.message);
        console.error('❌ Dettagli errore:', error);
        throw error;
      }
    }
    
    // Fallback su SMTP
    if (this.transporter) {
      console.log('📧 Invio email con SMTP...');
      try {
        await this.transporter.sendMail({
          from: config.smtp.from,
          ...options,
        });
        console.log('✅ Email inviata con SMTP!');
        return;
      } catch (error: any) {
        console.error('❌ Errore SMTP:', error.message);
        throw error;
      }
    }
    
    // Modalità dev
    console.log('📧 EMAIL (dev mode):', {
      from: config.smtp.from,
      ...options,
    });
    return;
  }

  async sendTrialActivation(email: string, name: string | null, endDate: Date): Promise<void> {
    const subject = '⚔️ SPARTANO FURIOSO - Prova di 50 Giorni Attivata!';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #000; color: #fff; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #111; border: 2px solid #DAA520; border-radius: 10px; padding: 30px; }
          h1 { color: #DAA520; text-align: center; font-size: 36px; margin-bottom: 20px; }
          .subtitle { color: #DC143C; text-align: center; font-size: 20px; margin-bottom: 30px; }
          .content { line-height: 1.8; color: #ccc; }
          .highlight { color: #DAA520; font-weight: bold; }
          .cta { background: linear-gradient(90deg, #8B0000, #DC143C); color: #fff; padding: 15px 30px; text-decoration: none; display: inline-block; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; text-align: center; color: #888; font-size: 12px; }
          .war-cry { color: #DAA520; font-style: italic; text-align: center; margin: 20px 0; font-size: 18px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>⚔️ SPARTANO FURIOSO ⚔️</h1>
          <div class="subtitle">LA TUA PROVA DI 50 GIORNI È ATTIVA!</div>
          
          <div class="content">
            <p>Salve <span class="highlight">${name || 'Guerriero'}</span>,</p>
            
            <p>La tua richiesta è stata accolta! Hai ora accesso completo a <strong>Fury Of Sparta</strong> per i prossimi 50 giorni.</p>
            
            <p><strong>🔥 Dettagli della tua prova:</strong></p>
            <ul>
              <li>Data di inizio: <span class="highlight">${new Date().toLocaleDateString('it-IT')}</span></li>
              <li>Data di scadenza: <span class="highlight">${endDate.toLocaleDateString('it-IT')}</span></li>
              <li>Accesso: <span class="highlight">COMPLETO</span></li>
            </ul>
            
            <p><strong>💪 Cosa puoi fare ora:</strong></p>
            <ul>
              <li>Scarica il bot Fury Of Sparta</li>
              <li>Configura i tuoi parametri di trading</li>
              <li>Inizia a dominare i mercati con disciplina spartana</li>
              <li>Accedi alla community esclusiva su Telegram</li>
            </ul>
            
            <div class="war-cry">"MOLON LABE - VIENI A PRENDERLE"</div>
            
            <p>Ricorda: come i 300 alle Termopili, la disciplina e la strategia sono le tue armi più potenti.</p>
            
            <p style="text-align: center;">
              <a href="http://localhost:5173" class="cta">INIZIA LA BATTAGLIA</a>
            </p>
          </div>
          
          <div class="footer">
            <p>© 2025 Spartano Furioso - Fury Of Sparta</p>
            <p>Questo è un sistema automatico. Per supporto, contatta il nostro team spartano.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({ to: email, subject, html });
  }

  async sendTrialExpiring(email: string, name: string | null, daysLeft: number): Promise<void> {
    const subject = `⚠️ La tua prova spartana scade tra ${daysLeft} giorni!`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #000; color: #fff; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #111; border: 2px solid #DC143C; border-radius: 10px; padding: 30px; }
          h1 { color: #DC143C; text-align: center; font-size: 32px; }
          .content { line-height: 1.8; color: #ccc; }
          .warning { background: #8B0000; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .cta { background: linear-gradient(90deg, #DAA520, #FFD700); color: #000; padding: 15px 30px; text-decoration: none; display: inline-block; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>⚠️ ATTENZIONE SPARTANO!</h1>
          
          <div class="content">
            <p>Salve <strong>${name || 'Guerriero'}</strong>,</p>
            
            <div class="warning">
              <p><strong>La tua prova di Fury Of Sparta scadrà tra ${daysLeft} giorni!</strong></p>
            </div>
            
            <p>Non lasciare che la tua battaglia si interrompa. Unisciti definitivamente alla falange spartana e continua a dominare i mercati con disciplina e strategia.</p>
            
            <p style="text-align: center;">
              <a href="http://localhost:5173" class="cta">DIVENTA SPARTANO PER SEMPRE</a>
            </p>
            
            <p>La vittoria appartiene a chi persevera!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({ to: email, subject, html });
  }
}

export const emailService = new EmailService();
