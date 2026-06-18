import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { Resend } from 'resend';

dotenv.config();

// Indirizzo mittente, coerente col provider in uso:
// - Resend: usa MAIL_FROM (dominio VERIFICATO su Resend) o un default
// - Gmail/SMTP: usa l'indirizzo autenticato (EMAIL_USER/SMTP_USER), perché
//   Gmail riscrive/rifiuta un from di dominio diverso
const getFromEmail = () => {
  if (process.env.MAIL_FROM) return process.env.MAIL_FROM;
  if (!process.env.RESEND_API_KEY) {
    // Provider SMTP/Gmail: mittente = utente autenticato
    return process.env.EMAIL_FROM || process.env.EMAIL_USER || process.env.SMTP_USER || 'noreply@nexoralab.solutions';
  }
  return 'noreply@nexoralab.solutions';
};

const getFrom = (name = 'Nexora Lab') => `"${name}" <${getFromEmail()}>`;

// Configurazione del trasportatore email
// Per sviluppo, useremo Ethereal Email (servizio di test gratuito)
// In produzione, usa un servizio reale come Gmail, SendGrid, etc.
const createTransporter = async () => {
  let transporter;
  
  // DEBUG: Stampa TUTTE le variabili d'ambiente email
  console.log('🔧 DEBUG VARIABILI D\'AMBIENTE:');
  console.log('  RESEND_API_KEY:', process.env.RESEND_API_KEY ? '***PRESENTE***' : 'MANCANTE');
  console.log('  SMTP_HOST:', process.env.SMTP_HOST || 'MANCANTE');
  console.log('  SMTP_PORT:', process.env.SMTP_PORT || 'MANCANTE');
  console.log('  SMTP_USER:', process.env.SMTP_USER || 'MANCANTE');
  console.log('  SMTP_PASS:', process.env.SMTP_PASS ? '***PRESENTE***' : 'MANCANTE');
  console.log('  MAIL_FROM:', process.env.MAIL_FROM || 'MANCANTE');
  console.log('  EMAIL_HOST:', process.env.EMAIL_HOST || 'MANCANTE');
  console.log('  EMAIL_USER:', process.env.EMAIL_USER || 'MANCANTE');
  console.log('  EMAIL_PASS:', process.env.EMAIL_PASS ? '***PRESENTE***' : 'MANCANTE');
  
  // Prova Resend prima (più affidabile su Railway)
  if (process.env.RESEND_API_KEY) {
    console.log('✅ Usando Resend per le email...');
    const resend = new Resend(process.env.RESEND_API_KEY);
    return { resend, isResend: true };
  }
  
  // Se sono configurate le credenziali email, usale (production)
  // Supporta sia SMTP_* sia EMAIL_* (Gmail), così funziona con qualunque
  // convenzione di variabili già impostata su Railway.
  const smtpHost = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;
  const smtpPort = process.env.SMTP_PORT || process.env.EMAIL_PORT || '587';
  const smtpSecure = (process.env.SMTP_SECURE || process.env.EMAIL_SECURE) === 'true';

  if (smtpHost && smtpUser && smtpPass) {
    console.log('📧 Usando servizio email SMTP:', smtpHost);

    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: smtpSecure, // true per 465, false per altre porte
      auth: {
        user: smtpUser,
        pass: smtpPass
      },
      // Opzioni aggiuntive per migliorare la compatibilità
      tls: {
        rejectUnauthorized: false // Per evitare problemi con certificati self-signed
      }
    });

    // Verifica la connessione
    try {
      await transporter.verify();
      console.log('✅ Connessione email verificata con successo!');
    } catch (error) {
      console.error('❌ Errore verifica connessione email:', error.message);
      console.log('Controlla le credenziali email nelle variabili d\'ambiente');
    }

  } else {
    // Nessun provider configurato: Ethereal (le email NON arrivano davvero!)
    console.warn('⚠️  NESSUN PROVIDER EMAIL CONFIGURATO (Resend/SMTP/EMAIL_*).');
    console.warn('⚠️  Uso Ethereal: le email NON verranno recapitate ai destinatari reali!');
    console.warn('⚠️  Imposta RESEND_API_KEY oppure EMAIL_HOST/EMAIL_USER/EMAIL_PASS su Railway.');
    const testAccount = await nodemailer.createTestAccount();
    
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    
    console.log('📧 Test account creato:', testAccount.user);
  }
  
  return transporter;
};

// ============================================================
//  TEMPLATE EMAIL — NEXORA LAB
//  Design unificato (header navy/blu, accenti cyan, layout a tabelle
//  per la massima compatibilità con i client di posta).
// ============================================================

const BRAND = {
  name: 'Nexora Lab',
  get site() { return process.env.FRONTEND_URL || 'https://nexoralab.solutions'; }
};

// Scocca base dell'email (header + contenuto + footer)
// IMPORTANTE: i client email (Gmail/Outlook) rimuovono gli sfondi `gradient`.
// Per questo usiamo COLORI SOLIDI + attributo bgcolor (sempre rispettato),
// altrimenti header e pulsanti diventano bianchi e il testo bianco sparisce.
const emailShell = ({ preheader = '', tagline = 'TRADING · CREATOR · LAB', contentHtml = '' }) => `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
</head>
<body style="margin:0;padding:0;background-color:#eef2f7;-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#eef2f7;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#eef2f7" style="background-color:#eef2f7;padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
        <!-- Header (sfondo navy SOLIDO) -->
        <tr>
          <td bgcolor="#0b1e3f" align="center" style="background-color:#0b1e3f;padding:38px 40px 34px;text-align:center;">
            <div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:32px;font-weight:800;letter-spacing:-0.5px;color:#ffffff;line-height:1;">
              Nexora<span style="color:#38bdf8;">Lab</span>
            </div>
            <div style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:3px;color:#7dd3fc;margin-top:10px;">${tagline}</div>
          </td>
        </tr>
        <!-- Barra accento cyan SOLIDA -->
        <tr><td bgcolor="#38bdf8" style="background-color:#38bdf8;height:4px;line-height:4px;font-size:0;">&nbsp;</td></tr>
        <!-- Contenuto -->
        <tr>
          <td style="padding:40px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;line-height:1.65;font-size:16px;">
            ${contentHtml}
          </td>
        </tr>
        <!-- Footer (sfondo navy SOLIDO) -->
        <tr>
          <td bgcolor="#0b1e3f" align="center" style="background-color:#0b1e3f;padding:28px 40px;text-align:center;font-family:Arial,sans-serif;">
            <div style="font-size:18px;font-weight:800;color:#ffffff;margin-bottom:8px;">Nexora<span style="color:#38bdf8;">Lab</span></div>
            <div style="color:#94a3b8;font-size:12px;line-height:1.7;">
              © ${new Date().getFullYear()} Nexora Lab — Trading &amp; Creator economy<br>
              <a href="${BRAND.site}" style="color:#38bdf8;text-decoration:none;">${BRAND.site.replace(/^https?:\/\//, '')}</a>
            </div>
          </td>
        </tr>
      </table>
      <div style="font-family:Arial,sans-serif;font-size:11px;color:#94a3b8;margin-top:16px;max-width:600px;">
        Hai ricevuto questa email perché ti sei registrato a Nexora Lab.
      </div>
    </td></tr>
  </table>
</body>
</html>`;

// Bottone call-to-action — colore SOLIDO + bgcolor (visibile in tutti i client)
const emailButton = (label, href) => `
<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:30px auto;">
  <tr>
    <td align="center" bgcolor="#2563eb" style="background-color:#2563eb;border-radius:10px;">
      <a href="${href}" target="_blank" style="display:inline-block;padding:15px 40px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;border:1px solid #2563eb;">${label}</a>
    </td>
  </tr>
</table>`;

// Riquadro link di fallback
const linkFallback = (href) => `
<p style="font-family:Arial,sans-serif;font-size:13px;color:#64748b;margin:8px 0 0;">
  Se il pulsante non funziona, copia e incolla questo link nel browser:<br>
  <a href="${href}" style="color:#0ea5e9;word-break:break-all;">${href}</a>
</p>`;

// Template email di verifica
const getVerificationEmailTemplate = (userName, verificationLink) => {
  const name = userName || 'trader';
  const content = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#0b1e3f;">Conferma il tuo indirizzo email</h1>
    <p style="margin:0 0 18px;">Ciao <strong>${name}</strong>, benvenuto in <strong>Nexora Lab</strong> 👋</p>
    <p style="margin:0 0 8px;">Manca un solo passo per attivare il tuo account. Conferma la tua email cliccando qui sotto:</p>
    ${emailButton('Conferma la mia email', verificationLink)}
    <p style="margin:0 0 4px;font-size:14px;color:#64748b;">⏳ Il link è valido per <strong>24 ore</strong>.</p>
    ${linkFallback(verificationLink)}
    <p style="margin:22px 0 0;font-size:13px;color:#94a3b8;">Se non hai creato tu questo account, ignora pure questa email.</p>
  `;
  return {
    subject: '✅ Conferma la tua email · Nexora Lab',
    html: emailShell({ preheader: 'Conferma la tua email per attivare il tuo account Nexora Lab.', contentHtml: content }),
    text: `Ciao ${name}, benvenuto in Nexora Lab!\n\nConferma la tua email aprendo questo link (valido 24 ore):\n${verificationLink}\n\nSe non hai creato tu questo account, ignora questa email.\n\n— Nexora Lab`
  };
};

// Template email di benvenuto (dopo la verifica)
const getWelcomeEmailTemplate = (userName) => {
  const name = userName || 'trader';
  const dashboardLink = `${BRAND.site}/dashboard`;
  const featureCard = (emoji, title, desc) => `
    <td width="50%" valign="top" style="padding:8px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;">
        <tr><td style="padding:16px;font-family:'Segoe UI',Arial,sans-serif;">
          <div style="font-size:22px;">${emoji}</div>
          <div style="font-size:15px;font-weight:700;color:#0b1e3f;margin:6px 0 2px;">${title}</div>
          <div style="font-size:13px;color:#64748b;line-height:1.5;">${desc}</div>
        </td></tr>
      </table>
    </td>`;
  const content = `
    <div style="text-align:center;">
      <span style="display:inline-block;font-size:12px;letter-spacing:2px;color:#0ea5e9;font-weight:700;font-family:Arial,sans-serif;">// ACCOUNT ATTIVO</span>
      <h1 style="margin:8px 0 6px;font-size:26px;font-weight:800;color:#0b1e3f;">Benvenuto nel Lab, ${name}! 🚀</h1>
      <p style="margin:0 auto 6px;max-width:440px;color:#475569;">Il tuo account è attivo. Da oggi hai accesso all'ecosistema completo per costruire il tuo reddito digitale.</p>
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 6px;">
      <tr>
        ${featureCard('📈', 'Trading Lab', 'Bot, indicatori e analisi per i mercati.')}
        ${featureCard('🎓', 'Academy', 'Percorsi formativi step-by-step.')}
      </tr>
      <tr>
        ${featureCard('✨', 'Creator Studio', 'Brand, contenuti e monetizzazione.')}
        ${featureCard('⚙️', 'Operations', 'Segnali, copy e supporto operativo.')}
      </tr>
    </table>

    ${emailButton('Entra nella dashboard', dashboardLink)}

    <p style="text-align:center;margin:6px 0 0;font-family:Arial,sans-serif;font-size:12px;letter-spacing:1.5px;color:#94a3b8;">BUILD · LEARN · EARN · REPEAT</p>
  `;
  return {
    subject: '🚀 Benvenuto in Nexora Lab!',
    html: emailShell({ preheader: 'Il tuo account è attivo: ecco cosa puoi fare ora.', contentHtml: content }),
    text: `Benvenuto nel Lab, ${name}!\n\nIl tuo account è attivo. Hai accesso a: Trading Lab, Academy, Creator Studio e Operations.\n\nEntra nella dashboard: ${dashboardLink}\n\n— Nexora Lab`
  };
};

// Template email di reset password
const getPasswordResetTemplate = (userName, resetLink) => {
  const name = userName || 'trader';
  const content = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#0b1e3f;">Reimposta la tua password</h1>
    <p style="margin:0 0 8px;">Ciao <strong>${name}</strong>, abbiamo ricevuto una richiesta di reimpostazione della password per il tuo account Nexora Lab.</p>
    <p style="margin:0 0 4px;">Clicca sul pulsante per scegliere una nuova password:</p>
    ${emailButton('Reimposta password', resetLink)}
    <p style="margin:0 0 4px;font-size:14px;color:#64748b;">⏳ Il link è valido per <strong>1 ora</strong>.</p>
    ${linkFallback(resetLink)}
    <p style="margin:22px 0 0;font-size:13px;color:#94a3b8;">Se non hai richiesto tu il reset, ignora questa email: la tua password resterà invariata.</p>
  `;
  return {
    subject: '🔐 Reimposta la tua password · Nexora Lab',
    html: emailShell({ preheader: 'Richiesta di reset password per il tuo account Nexora Lab.', tagline: 'SICUREZZA ACCOUNT', contentHtml: content }),
    text: `Ciao ${name},\n\nHai richiesto di reimpostare la password. Apri questo link (valido 1 ora):\n${resetLink}\n\nSe non sei stato tu, ignora questa email.\n\n— Nexora Lab`
  };
};

// Template email di conferma cambio password
const getPasswordChangedTemplate = (userName) => {
  const name = userName || 'trader';
  const loginLink = `${BRAND.site}/login`;
  const content = `
    <div style="text-align:center;">
      <div style="font-size:40px;">✅</div>
      <h1 style="margin:8px 0 6px;font-size:24px;font-weight:800;color:#0b1e3f;">Password aggiornata</h1>
    </div>
    <p style="margin:0 0 8px;">Ciao <strong>${name}</strong>, la password del tuo account Nexora Lab è stata modificata con successo.</p>
    <p style="margin:0 0 4px;">Ora puoi accedere con la nuova password:</p>
    ${emailButton('Vai al login', loginLink)}
    <div style="margin:18px 0 0;padding:14px 16px;background:#fef2f2;border:1px solid #fecaca;border-radius:10px;font-size:13px;color:#b91c1c;">
      ⚠️ Non sei stato tu? Contatta subito il supporto: la sicurezza del tuo account potrebbe essere compromessa.
    </div>
  `;
  return {
    subject: '✅ Password aggiornata · Nexora Lab',
    html: emailShell({ preheader: 'La password del tuo account è stata modificata.', tagline: 'SICUREZZA ACCOUNT', contentHtml: content }),
    text: `Ciao ${name},\n\nLa password del tuo account Nexora Lab è stata modificata con successo.\nAccedi: ${loginLink}\n\nSe non sei stato tu, contatta subito il supporto.\n\n— Nexora Lab`
  };
};

// Template email di benvenuto NEWSLETTER (Lab Brief)
const getNewsletterWelcomeTemplate = (userName) => {
  const name = userName || 'trader';
  const content = `
    <div style="text-align:center;">
      <span style="display:inline-block;font-size:12px;letter-spacing:2px;color:#0ea5e9;font-weight:700;font-family:Arial,sans-serif;">// LAB BRIEF</span>
      <h1 style="margin:8px 0 6px;font-size:24px;font-weight:800;color:#0b1e3f;">Iscrizione confermata 📩</h1>
    </div>
    <p style="margin:0 0 8px;">Ciao <strong>${name}</strong>, sei ufficialmente iscritto al <strong>Lab Brief</strong> di Nexora Lab.</p>
    <p style="margin:0 0 8px;">Ogni settimana riceverai, senza spam:</p>
    <ul style="margin:0 0 8px;padding-left:20px;color:#475569;">
      <li style="margin-bottom:6px;">📈 1 setup operativo sui mercati</li>
      <li style="margin-bottom:6px;">✨ 1 framework di creator economy</li>
      <li style="margin-bottom:6px;">🧪 1 cosa che ha funzionato (o no), con i numeri</li>
    </ul>
    ${emailButton('Esplora la piattaforma', BRAND.site)}
    <p style="margin:18px 0 0;font-size:13px;color:#94a3b8;">Potrai disiscriverti in qualsiasi momento dal link in fondo a ogni email.</p>
  `;
  return {
    subject: '📩 Iscrizione confermata · Lab Brief di Nexora Lab',
    html: emailShell({ preheader: 'Sei iscritto al Lab Brief: insight settimanali su trading e creator economy.', contentHtml: content }),
    text: `Ciao ${name}, sei iscritto al Lab Brief di Nexora Lab.\n\nOgni settimana: 1 setup operativo, 1 framework creator, 1 caso reale con i numeri.\n\nEsplora la piattaforma: ${BRAND.site}\n\n— Nexora Lab`
  };
};

const formatCurrency = (amount, currency) => {
  try {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency
    }).format(amount);
  } catch (error) {
    return `${amount} ${currency}`;
  }
};

// Funzione principale per inviare email
export const sendEmail = async (to, emailType, data) => {
  try {
    const transportResult = await createTransporter();
    
    // Se è Resend, usa l'API Resend
    if (transportResult.isResend) {
      console.log('📧 Invio email con Resend...');
      
      let emailTemplate;
      switch (emailType) {
        case 'verification':
          emailTemplate = getVerificationEmailTemplate(data.userName, data.verificationLink);
          break;
        case 'welcome':
          emailTemplate = getWelcomeEmailTemplate(data.userName);
          break;
        case 'passwordReset':
          emailTemplate = getPasswordResetTemplate(data.userName, data.resetLink);
          break;
        case 'passwordChanged':
          emailTemplate = getPasswordChangedTemplate(data.userName);
          break;
        case 'newsletterWelcome':
          emailTemplate = getNewsletterWelcomeTemplate(data.userName);
          break;
        default:
          throw new Error('Tipo di email non valido');
      }
      
      const result = await transportResult.resend.emails.send({
        from: getFrom(),
        to: [to],
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });

      // Resend ritorna { data: { id }, error: null } in caso di successo,
      // { data: null, error: { message, name } } in caso di rifiuto.
      if (result?.error) {
        console.error('\n❌ RESEND HA RIFIUTATO L\'EMAIL!');
        console.error('📨 Destinatario:', to);
        console.error('📝 Oggetto:', emailTemplate.subject);
        console.error('🔻 Errore Resend:', result.error.name || '', '-', result.error.message || result.error);
        console.error('💡 Causa tipica: il dominio nel from non è verificato su Resend.');
        console.error('   Mittente usato:', getFrom());
        console.error('   Domini verificati: Resend -> Dashboard -> Domains');
        return { success: false, error: result.error.message || 'Resend rejected the email' };
      }

      const messageId = result?.data?.id || result?.id;
      console.log('\n✅ EMAIL INVIATA CON SUCCESSO (Resend)!');
      console.log('📨 Destinatario:', to);
      console.log('📝 Oggetto:', emailTemplate.subject);
      console.log('🆔 Message ID:', messageId || '(senza id)');

      return { success: true, messageId };
    }
    
    // Altrimenti usa il transporter SMTP tradizionale
    let emailTemplate;
    
    switch (emailType) {
      case 'verification':
        emailTemplate = getVerificationEmailTemplate(data.userName, data.verificationLink);
        break;
      case 'welcome':
        emailTemplate = getWelcomeEmailTemplate(data.userName);
        break;
      case 'passwordReset':
        emailTemplate = getPasswordResetTemplate(data.userName, data.resetLink);
        break;
      case 'passwordChanged':
        emailTemplate = getPasswordChangedTemplate(data.userName);
        break;
      case 'newsletterWelcome':
        emailTemplate = getNewsletterWelcomeTemplate(data.userName);
        break;
      default:
        throw new Error('Tipo di email non valido');
    }
    
    const mailOptions = {
      from: getFrom(),
      to,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
    };
    
    const info = await transportResult.sendMail(mailOptions);
    
    console.log('\n✅ EMAIL INVIATA CON SUCCESSO!');
    console.log('📨 Destinatario:', to);
    console.log('📝 Oggetto:', emailTemplate.subject);
    console.log('🆔 Message ID:', info.messageId);
    
    // Se stiamo usando Ethereal Email (test), mostra il link per vedere l'email
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('\n🔗 ANTEPRIMA EMAIL (solo per test):');
      console.log('🌐', previewUrl);
      console.log('\n');
    } else {
      console.log('\n🚀 Email inviata realmente a:', to);
      console.log('Controlla la tua casella di posta (anche SPAM)!\n');
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('\n❌ ERRORE INVIO EMAIL:');
    console.error('Errore:', error.message);
    console.error('\nSuggerimenti:');
    console.error('1. Controlla le credenziali nel file .env');
    console.error('2. Se usi Gmail, assicurati di usare una Password App');
    console.error('3. Verifica che la 2FA sia attiva su Gmail');
    console.error('4. Controlla la connessione internet\n');
    
    return { success: false, error: error.message };
  }
};

// Invio generico di un'email con HTML arbitrario (es. newsletter custom).
// Usa lo stesso transporter unificato (Resend o SMTP) di sendEmail.
export const sendRawEmail = async (to, subject, html, fromName = 'Nexora Lab') => {
  try {
    const transportResult = await createTransporter();
    const from = getFrom(fromName);

    if (transportResult.isResend) {
      const result = await transportResult.resend.emails.send({
        from,
        to: [to],
        subject,
        html
      });
      if (result?.error) {
        console.error('❌ Resend ha rifiutato (raw):', to, '-', result.error.message || result.error);
        return { success: false, error: result.error.message || 'Resend rejected' };
      }
      return { success: true, messageId: result?.data?.id || result?.id };
    }

    const info = await transportResult.sendMail({ from, to, subject, html });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Errore invio email (raw):', error.message);
    return { success: false, error: error.message };
  }
};

// Riga "dettaglio" per le tabelle email
const detailRow = (label, value) => `
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:#64748b;">${label}</td>
    <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:#0f172a;font-weight:600;text-align:right;">${value}</td>
  </tr>`;

export const sendOrderConfirmation = async ({
  customerName,
  customerEmail,
  orderNumber,
  productName,
  amount,
  currency = 'EUR',
  date,
  isPending = false,
  isCancelled = false,
  cancellationReason = ''
}) => {
  try {
    const formattedAmount = formatCurrency(amount, currency);
    const formattedDate = date
      ? new Date(date).toLocaleString('it-IT', { dateStyle: 'long', timeStyle: 'short' })
      : new Date().toLocaleString('it-IT');

    // Banner di stato con colore solido
    let statusBanner, heading, subject;
    if (isCancelled) {
      heading = 'Ordine annullato';
      subject = `Ordine annullato · ${orderNumber}`;
      statusBanner = `<div style="background-color:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:12px 16px;margin:0 0 18px;font-size:14px;color:#b91c1c;font-weight:600;">✖ Il tuo ordine è stato annullato.${cancellationReason ? `<br><span style="font-weight:400;">Motivo: ${cancellationReason}</span>` : ''}</div>`;
    } else if (isPending) {
      heading = 'Ordine ricevuto';
      subject = `Ordine ricevuto · ${orderNumber}`;
      statusBanner = `<div style="background-color:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:12px 16px;margin:0 0 18px;font-size:14px;color:#b45309;font-weight:600;">⏳ Il tuo ordine è in attesa di conferma.</div>`;
    } else {
      heading = 'Ordine confermato';
      subject = `Ordine confermato · ${orderNumber}`;
      statusBanner = `<div style="background-color:#ecfdf5;border:1px solid #a7f3d0;border-radius:10px;padding:12px 16px;margin:0 0 18px;font-size:14px;color:#047857;font-weight:600;">✓ Il tuo ordine è stato confermato!</div>`;
    }

    const content = `
      <h1 style="margin:0 0 6px;font-size:24px;font-weight:800;color:#0b1e3f;">${heading}</h1>
      <p style="margin:0 0 16px;">Ciao <strong>${customerName || 'trader'}</strong>,</p>
      ${statusBanner}
      <p style="margin:0 0 14px;">${isCancelled ? 'Dettagli dell\'ordine annullato' : 'Riepilogo del tuo ordine'} <strong>${orderNumber}</strong>:</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background-color:#f8fafc;border-radius:10px;padding:0 16px;">
        ${detailRow('Prodotto', productName || '-')}
        ${detailRow('Importo', formattedAmount)}
        ${detailRow('Data', formattedDate)}
        ${isCancelled ? detailRow('Stato', '<span style="color:#b91c1c;">Annullato</span>') : ''}
      </table>
      ${!isCancelled ? emailButton('Accedi alla tua area', `${BRAND.site}/dashboard`) : ''}
      ${!isCancelled && !isPending ? '<p style="margin:18px 0 0;font-size:14px;color:#64748b;">📩 Riceverai a breve un\'altra email con le istruzioni di accesso ai contenuti.</p>' : ''}
      ${isCancelled ? '<p style="margin:18px 0 0;font-size:14px;color:#64748b;">Per qualsiasi domanda rispondi pure a questa email.</p>' : ''}
    `;

    const html = emailShell({
      preheader: isCancelled ? 'Il tuo ordine è stato annullato.' : (isPending ? 'Abbiamo ricevuto il tuo ordine.' : 'Il tuo ordine è confermato!'),
      tagline: 'ORDINE',
      contentHtml: content
    });

    const result = await sendRawEmail(customerEmail, subject, html);
    if (result?.success) {
      console.log('✅ EMAIL CONFERMA ORDINE INVIATA a', customerEmail);
    } else {
      console.error('❌ Email conferma ordine NON inviata:', result?.error);
    }
    return result;
  } catch (error) {
    console.error('\n❌ ERRORE EMAIL CONFERMA ORDINE:', error.message);
    return { success: false, error: error.message };
  }
};

export const sendVimeoAccessInstructions = async ({
  customerName,
  customerEmail,
  productName,
  vimeoLink,
  vimeoPassword,
  telegramLink
}) => {
  try {
    const accessBox = (badge, rows) => `
      <div style="margin:0 0 16px;">
        <span style="display:inline-block;font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#0ea5e9;background-color:#e0f2fe;border-radius:999px;padding:5px 12px;">${badge}</span>
        <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 18px;margin-top:10px;font-size:14px;color:#1e293b;line-height:1.7;">
          ${rows}
        </div>
      </div>`;

    const content = `
      <h1 style="margin:0 0 6px;font-size:24px;font-weight:800;color:#0b1e3f;">Accesso ai contenuti 🎬</h1>
      <p style="margin:0 0 16px;">Ciao <strong>${customerName || 'trader'}</strong>, ecco come accedere a <strong>${productName}</strong>.</p>
      ${accessBox('Accesso video', `
        Link: <a href="${vimeoLink}" target="_blank" style="color:#2563eb;word-break:break-all;">${vimeoLink || '-'}</a><br>
        Password: <strong>${vimeoPassword || '-'}</strong>
      `)}
      ${telegramLink ? accessBox('Community Telegram', `
        Entra qui: <a href="${telegramLink}" target="_blank" style="color:#2563eb;word-break:break-all;">${telegramLink}</a>
      `) : ''}
      ${vimeoLink ? emailButton('Vai al corso', vimeoLink) : ''}
      <p style="margin:18px 0 0;font-size:14px;color:#64748b;">Per qualsiasi domanda rispondi pure a questa email: siamo qui per aiutarti.</p>
    `;

    const html = emailShell({
      preheader: `Le tue credenziali di accesso a ${productName}.`,
      tagline: 'ACCESSO CORSO',
      contentHtml: content
    });

    const result = await sendRawEmail(customerEmail, `Accesso ai contenuti · ${productName}`, html);
    if (result?.success) {
      console.log('✅ EMAIL ACCESSO CORSO INVIATA a', customerEmail);
    } else {
      console.error('❌ Email accesso corso NON inviata:', result?.error);
    }
    return result;
  } catch (error) {
    console.error('\n❌ ERRORE EMAIL ACCESSO CORSO:', error.message);
    return { success: false, error: error.message };
  }
};

export default {
  sendEmail,
  sendOrderConfirmation,
  sendVimeoAccessInstructions
};
