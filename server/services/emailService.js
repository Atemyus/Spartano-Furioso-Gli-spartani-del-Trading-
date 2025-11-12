import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configurazione del trasportatore email
// Per sviluppo, useremo Ethereal Email (servizio di test gratuito)
// In produzione, usa un servizio reale come Gmail, SendGrid, etc.
const createTransporter = async () => {
  let transporter;
  
  // Se sono configurate le credenziali email, usale (production)
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log('📧 Usando servizio email configurato:', process.env.EMAIL_HOST);
    
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true', // true per 465, false per altre porte
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
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
      console.log('Controlla le tue credenziali nel file .env');
    }
    
  } else {
    // Per sviluppo: usa Ethereal Email
    console.log('📧 Usando Ethereal Email per test (modalità development)');
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

// Template email di verifica
const getVerificationEmailTemplate = (userName, verificationLink) => {
  return {
    subject: '✅ Conferma la tua registrazione - Trading Falange',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: 'Arial', sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 20px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              margin-top: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
              color: white;
            }
            .logo {
              font-size: 32px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .content {
              padding: 30px;
              color: #333;
              line-height: 1.6;
            }
            .button {
              display: inline-block;
              padding: 15px 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
              text-align: center;
            }
            .button:hover {
              opacity: 0.9;
            }
            .footer {
              background-color: #f8f9fa;
              padding: 20px;
              text-align: center;
              color: #666;
              font-size: 12px;
              border-radius: 0 0 10px 10px;
            }
            .warning {
              background-color: #fff3cd;
              border: 1px solid #ffc107;
              padding: 10px;
              border-radius: 5px;
              margin: 20px 0;
              color: #856404;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">⚔️ Trading Falange</div>
              <p>Benvenuto nella nostra community di trading!</p>
            </div>
            
            <div class="content">
              <h2>Ciao ${userName || 'Trader'},</h2>
              
              <p>
                Grazie per esserti registrato su Trading Falange! 
                Sei a un passo dal completare la tua registrazione.
              </p>
              
              <p>
                Per attivare il tuo account e accedere a tutte le funzionalità della piattaforma,
                clicca sul pulsante qui sotto:
              </p>
              
              <div style="text-align: center;">
                <a href="${verificationLink}" class="button">
                  ✅ CONFERMA LA TUA EMAIL
                </a>
              </div>
              
              <div class="warning">
                <strong>⚠️ Importante:</strong> Questo link di verifica scadrà tra 24 ore.
                Se non hai richiesto questa registrazione, puoi ignorare questa email.
              </div>
              
              <p>
                Se il pulsante non funziona, puoi copiare e incollare questo link nel tuo browser:
              </p>
              <p style="word-break: break-all; color: #667eea;">
                ${verificationLink}
              </p>
              
              <h3>Cosa potrai fare con Trading Falange?</h3>
              <ul>
                <li>📊 Accedere a segnali di trading professionali</li>
                <li>📚 Formazione completa sul trading</li>
                <li>👥 Entrare nella community esclusiva</li>
                <li>🎯 Strategie testate e ottimizzate</li>
                <li>💬 Supporto diretto dal team</li>
              </ul>
              
              <p>
                Se hai domande o bisogno di assistenza, non esitare a contattarci 
                rispondendo a questa email.
              </p>
              
              <p>
                Buon trading!<br>
                <strong>Il Team di Trading Falange</strong>
              </p>
            </div>
            
            <div class="footer">
              <p>
                © ${new Date().getFullYear()} Trading Falange. Tutti i diritti riservati.
              </p>
              <p>
                Questa email è stata inviata a ${userName ? userName + ' ' : ''}
                perché è stata richiesta una registrazione sul nostro sito.
              </p>
              <p style="margin-top: 10px;">
                <a href="${process.env.FRONTEND_URL}/privacy" style="color: #667eea; margin: 0 10px;">Privacy Policy</a> |
                <a href="${process.env.FRONTEND_URL}/terms" style="color: #667eea; margin: 0 10px;">Termini di Servizio</a> |
                <a href="${process.env.FRONTEND_URL}/contact" style="color: #667eea; margin: 0 10px;">Contattaci</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Ciao ${userName || 'Trader'},
      
      Grazie per esserti registrato su Trading Falange!
      
      Per confermare la tua email e attivare il tuo account, clicca sul link seguente:
      ${verificationLink}
      
      Questo link scadrà tra 24 ore.
      
      Se non hai richiesto questa registrazione, puoi ignorare questa email.
      
      Buon trading!
      Il Team di Trading Falange
    `
  };
};

// Template email di benvenuto (dopo la verifica)
const getWelcomeEmailTemplate = (userName) => {
  return {
    subject: '🎉 Benvenuto in Trading Falange!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            /* Stessi stili della email di verifica */
            body {
              font-family: 'Arial', sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 20px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              margin-top: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
              color: white;
            }
            .content {
              padding: 30px;
              color: #333;
              line-height: 1.6;
            }
            .button {
              display: inline-block;
              padding: 15px 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              background-color: #f8f9fa;
              padding: 20px;
              text-align: center;
              color: #666;
              font-size: 12px;
              border-radius: 0 0 10px 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Account Attivato!</h1>
            </div>
            
            <div class="content">
              <h2>Benvenuto ${userName}!</h2>
              
              <p>
                Il tuo account è stato verificato con successo! 
                Ora fai parte della community di Trading Falange.
              </p>
              
              <h3>I tuoi prossimi passi:</h3>
              <ol>
                <li><strong>Completa il tuo profilo:</strong> Aggiungi informazioni per personalizzare la tua esperienza</li>
                <li><strong>Esplora i nostri servizi:</strong> Scopri tutti gli strumenti a tua disposizione</li>
                <li><strong>Scegli un piano:</strong> Seleziona l'abbonamento più adatto alle tue esigenze</li>
                <li><strong>Unisciti alla community:</strong> Connettiti con altri trader</li>
              </ol>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/dashboard" class="button">
                  Vai alla Dashboard
                </a>
              </div>
              
              <p>
                Se hai bisogno di aiuto, il nostro team di supporto è sempre disponibile.
              </p>
              
              <p>
                A presto!<br>
                <strong>Il Team di Trading Falange</strong>
              </p>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} Trading Falange. Tutti i diritti riservati.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Benvenuto ${userName}!
      
      Il tuo account è stato verificato con successo!
      
      Ora puoi accedere a tutte le funzionalità di Trading Falange.
      
      Visita la tua dashboard: ${process.env.FRONTEND_URL}/dashboard
      
      A presto!
      Il Team di Trading Falange
    `
  };
};

// Template email di reset password
const getPasswordResetTemplate = (userName, resetLink) => {
  return {
    subject: '🔐 Richiesta di Reset Password - Trading Falange',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: 'Arial', sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 20px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              margin-top: 20px;
            }
            .header {
              background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
              color: white;
            }
            .logo {
              font-size: 32px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .content {
              padding: 30px;
              color: #333;
              line-height: 1.6;
            }
            .button {
              display: inline-block;
              padding: 15px 30px;
              background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
              text-align: center;
            }
            .warning {
              background-color: #fff3cd;
              border: 1px solid #ffc107;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
              color: #856404;
            }
            .footer {
              background-color: #f8f9fa;
              padding: 20px;
              text-align: center;
              color: #666;
              font-size: 12px;
              border-radius: 0 0 10px 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🔐 RESET PASSWORD</div>
              <p>Trading Falange - Sicurezza Account</p>
            </div>
            
            <div class="content">
              <h2>Ciao ${userName || 'Trader'},</h2>
              
              <p>
                Abbiamo ricevuto una richiesta di reset password per il tuo account.
              </p>
              
              <p>
                Per reimpostare la tua password, clicca sul pulsante qui sotto:
              </p>
              
              <div style="text-align: center;">
                <a href="${resetLink}" class="button">
                  🔑 REIMPOSTA PASSWORD
                </a>
              </div>
              
              <div class="warning">
                <strong>⚠️ Importante:</strong>
                <ul style="margin: 10px 0;">
                  <li>Questo link scadrà tra <strong>1 ora</strong></li>
                  <li>Se non hai richiesto il reset, ignora questa email</li>
                  <li>La tua password attuale rimarrà invariata finché non la cambierai</li>
                </ul>
              </div>
              
              <p>
                Se il pulsante non funziona, copia e incolla questo link nel browser:
              </p>
              <p style="word-break: break-all; color: #dc2626; background: #f4f4f4; padding: 10px; border-radius: 5px;">
                ${resetLink}
              </p>
              
              <h3>🔒 Consigli per la sicurezza:</h3>
              <ul>
                <li>Usa una password lunga almeno 8 caratteri</li>
                <li>Includi maiuscole, minuscole, numeri e simboli</li>
                <li>Non usare la stessa password su altri siti</li>
                <li>Attiva l'autenticazione a due fattori quando disponibile</li>
              </ul>
              
              <p style="margin-top: 30px;">
                Se non hai richiesto questo reset o hai bisogno di assistenza,
                contatta immediatamente il nostro supporto.
              </p>
              
              <p>
                Cordiali saluti,<br>
                <strong>Il Team di Sicurezza di Trading Falange</strong>
              </p>
            </div>
            
            <div class="footer">
              <p>
                © ${new Date().getFullYear()} Trading Falange. Tutti i diritti riservati.
              </p>
              <p style="margin-top: 10px; color: #999;">
                Questa email è stata inviata perché è stato richiesto un reset password
                per l'account associato a questo indirizzo email.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Ciao ${userName || 'Trader'},
      
      Abbiamo ricevuto una richiesta di reset password per il tuo account.
      
      Per reimpostare la tua password, clicca sul link seguente:
      ${resetLink}
      
      Questo link scadrà tra 1 ora.
      
      Se non hai richiesto questo reset, puoi ignorare questa email.
      La tua password attuale rimarrà invariata.
      
      Cordiali saluti,
      Il Team di Trading Falange
    `
  };
};

// Template email di conferma cambio password
const getPasswordChangedTemplate = (userName) => {
  return {
    subject: '✅ Password Modificata con Successo - Trading Falange',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: 'Arial', sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 20px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              margin-top: 20px;
            }
            .header {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
              color: white;
            }
            .content {
              padding: 30px;
              color: #333;
              line-height: 1.6;
            }
            .alert {
              background-color: #d4edda;
              border: 1px solid #28a745;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
              color: #155724;
            }
            .footer {
              background-color: #f8f9fa;
              padding: 20px;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Password Modificata!</h1>
            </div>
            
            <div class="content">
              <h2>Ciao ${userName || 'Trader'},</h2>
              
              <div class="alert">
                <strong>✅ La tua password è stata modificata con successo!</strong>
              </div>
              
              <p>
                Questa email ti conferma che la password del tuo account Trading Falange
                è stata reimpostata correttamente.
              </p>
              
              <p>
                <strong>Data e ora del cambio:</strong><br>
                ${new Date().toLocaleString('it-IT', { 
                  dateStyle: 'full', 
                  timeStyle: 'short',
                  timeZone: 'Europe/Rome'
                })}
              </p>
              
              <h3>⚠️ Non sei stato tu?</h3>
              <p>
                Se non hai effettuato tu questa modifica, contatta immediatamente
                il nostro supporto per proteggere il tuo account.
              </p>
              
              <p style="margin-top: 30px;">
                Ora puoi accedere con la tua nuova password.
              </p>
              
              <p>
                Cordiali saluti,<br>
                <strong>Il Team di Trading Falange</strong>
              </p>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} Trading Falange. Tutti i diritti riservati.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Ciao ${userName || 'Trader'},
      
      La tua password è stata modificata con successo!
      
      Data e ora: ${new Date().toLocaleString('it-IT')}
      
      Se non sei stato tu, contatta immediatamente il supporto.
      
      Cordiali saluti,
      Il Team di Trading Falange
    `
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
    const transporter = await createTransporter();
    
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
      default:
        throw new Error('Tipo di email non valido');
    }
    
    const mailOptions = {
      from: `"Trading Falange" <${process.env.EMAIL_FROM || 'noreply@tradingfalange.com'}>`,
      to,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
    };
    
    const info = await transporter.sendMail(mailOptions);
    
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
    const transporter = await createTransporter();

    const formattedAmount = formatCurrency(amount, currency);
    const formattedDate = date
      ? new Date(date).toLocaleString('it-IT', {
          dateStyle: 'full',
          timeStyle: 'short'
        })
      : new Date().toLocaleString('it-IT');

    // Determina colore e titolo in base allo stato
    const headerColor = isCancelled ? '#dc2626' : '#10b981';
    const headerTitle = isCancelled ? 'Ordine Annullato' : 'Grazie per il tuo ordine!';
    const statusMessage = isCancelled 
      ? `<p style="color: #dc2626; font-weight: bold;">Il tuo ordine è stato annullato.</p>${cancellationReason ? `<p>Motivo: ${cancellationReason}</p>` : ''}`
      : isPending 
        ? '<p style="color: #f59e0b; font-weight: bold;">Il tuo ordine è in attesa di conferma.</p>'
        : '<p style="color: #10b981; font-weight: bold;">Il tuo ordine è stato confermato!</p>';

    const mailOptions = {
      from: `"Trading Falange" <${process.env.EMAIL_FROM || 'ordini@tradingfalange.com'}>` ,
      to: customerEmail,
      subject: isCancelled ? `Ordine Annullato ${orderNumber}` : `Conferma Ordine ${orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; }
              .header { background: linear-gradient(135deg, ${headerColor} 0%, ${headerColor}dd 100%); color: #ffffff; padding: 25px; border-radius: 10px 10px 0 0; text-align: center; }
              .details { margin-top: 30px; }
              .details table { width: 100%; border-collapse: collapse; }
              .details td { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
              .footer { margin-top: 30px; text-align: center; color: #6b7280; font-size: 12px; }
              .button { display: inline-block; margin-top: 20px; padding: 12px 25px; background: #10b981; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${headerTitle}</h1>
              </div>
              <p>Ciao ${customerName || 'Studente'},</p>
              ${statusMessage}
              <p>${isCancelled ? 'Dettagli dell\'ordine annullato' : 'Abbiamo ricevuto il tuo ordine'} con numero <strong>${orderNumber}</strong>.</p>
              <div class="details">
                <table>
                  <tr><td><strong>Prodotto</strong></td><td>${productName}</td></tr>
                  <tr><td><strong>Importo</strong></td><td>${formattedAmount}</td></tr>
                  <tr><td><strong>Data</strong></td><td>${formattedDate}</td></tr>
                  ${isCancelled ? `<tr><td><strong>Stato</strong></td><td style="color: #dc2626;">Annullato</td></tr>` : ''}
                </table>
              </div>
              ${!isCancelled ? `<a class="button" href="${process.env.FRONTEND_URL || '#'}">Accedi alla tua area</a>` : ''}
              ${!isCancelled && !isPending ? '<p style="margin-top: 25px;">Riceverai un\'ulteriore email con le istruzioni di accesso ai contenuti.</p>' : ''}
              ${isCancelled ? '<p style="margin-top: 25px;">Se hai domande, contatta il nostro supporto.</p>' : ''}
              <div class="footer">
                <p>© ${new Date().getFullYear()} Trading Falange. Tutti i diritti riservati.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
        Ciao ${customerName || 'Studente'},

        ${isCancelled ? `Il tuo ordine ${orderNumber} è stato annullato.` : `Abbiamo ricevuto il tuo ordine ${orderNumber} per ${productName}.`}
        ${isCancelled && cancellationReason ? `Motivo: ${cancellationReason}` : ''}
        
        Importo: ${formattedAmount}
        Data: ${formattedDate}

        ${!isCancelled ? `Accedi all'area riservata: ${process.env.FRONTEND_URL || '#'}` : ''}
        ${!isCancelled && !isPending ? 'Riceverai un\'altra email con le istruzioni di accesso.' : ''}
        ${isCancelled ? 'Se hai domande, contatta il nostro supporto.' : ''}

        Il Team di Trading Falange
      `
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('\n✅ EMAIL CONFERMA ORDINE INVIATA');
    console.log('📨 Destinatario:', customerEmail);
    console.log('📝 Oggetto:', mailOptions.subject);
    console.log('🆔 Message ID:', info.messageId);

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('\n🔗 ANTEPRIMA EMAIL (solo per test):');
      console.log('🌐', previewUrl);
      console.log('\n');
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('\n❌ ERRORE EMAIL CONFERMA ORDINE:');
    console.error('Errore:', error.message);
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
    const transporter = await createTransporter();

    const mailOptions = {
      from: `"Trading Falange" <${process.env.EMAIL_FROM || 'support@tradingfalange.com'}>` ,
      to: customerEmail,
      subject: `Accesso ai contenuti: ${productName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 25px; border-radius: 10px 10px 0 0; text-align: center; }
              .section { margin-top: 25px; }
              .badge { display: inline-block; padding: 6px 12px; background: #e0e7ff; color: #3730a3; border-radius: 9999px; font-size: 12px; font-weight: bold; }
              .box { background: #f9fafb; border-radius: 8px; padding: 15px 20px; margin-top: 15px; }
              .footer { margin-top: 30px; text-align: center; color: #6b7280; font-size: 12px; }
              a { color: #4f46e5; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Benvenuto nel tuo percorso!</h1>
              </div>
              <p>Ciao ${customerName || 'Studente'},</p>
              <p>Qui trovi tutte le informazioni per accedere al corso <strong>${productName}</strong>.</p>
              <div class="section">
                <span class="badge">Accesso Vimeo</span>
                <div class="box">
                  <p>Link: <a href="${vimeoLink}" target="_blank">${vimeoLink}</a></p>
                  <p>Password: <strong>${vimeoPassword}</strong></p>
                </div>
              </div>
              ${telegramLink ? `
                <div class="section">
                  <span class="badge">Community Telegram</span>
                  <div class="box">
                    <p>Entra nella community: <a href="${telegramLink}" target="_blank">${telegramLink}</a></p>
                  </div>
                </div>
              ` : ''}
              <p style="margin-top: 25px;">Se hai domande rispondi a questa email, siamo qui per aiutarti.</p>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Trading Falange. Tutti i diritti riservati.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
        Ciao ${customerName || 'Studente'},

        Accedi al corso ${productName} su Vimeo:
        Link: ${vimeoLink}
        Password: ${vimeoPassword}

        ${telegramLink ? `Unisciti alla community Telegram: ${telegramLink}\n\n` : ''}Se hai bisogno di assistenza rispondi a questa email.

        Il Team di Trading Falange
      `
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('\n✅ EMAIL ACCESSO VIMEO INVIATA');
    console.log('📨 Destinatario:', customerEmail);
    console.log('📝 Oggetto:', mailOptions.subject);
    console.log('🆔 Message ID:', info.messageId);

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('\n🔗 ANTEPRIMA EMAIL (solo per test):');
      console.log('🌐', previewUrl);
      console.log('\n');
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('\n❌ ERRORE EMAIL ACCESSO VIMEO:');
    console.error('Errore:', error.message);
    return { success: false, error: error.message };
  }
};

export default {
  sendEmail,
  sendOrderConfirmation,
  sendVimeoAccessInstructions
};
