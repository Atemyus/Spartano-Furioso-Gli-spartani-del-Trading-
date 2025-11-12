import nodemailer from 'nodemailer';
import { config } from 'dotenv';

config();

async function testEmailConfirmation() {
  console.log('🔧 Test configurazione email...');
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('SMTP_PORT:', process.env.SMTP_PORT);
  console.log('MAIL_FROM:', process.env.MAIL_FROM);

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ Mancano le credenziali SMTP!');
    return;
  }

  try {
    // Crea il transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verifica la connessione
    console.log('🔍 Verifica connessione SMTP...');
    await transporter.verify();
    console.log('✅ Connessione SMTP stabilita con successo!');

    // Simula email di conferma registrazione
    const verificationToken = 'test-token-1234567890abcdef';
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    const emailContent = {
      from: process.env.MAIL_FROM,
      to: process.env.SMTP_USER, // Invia a te stesso per test
      subject: 'Benvenuto in Spartano Furioso - Verifica la tua email (TEST)',
      html: `
        <h1>Benvenuto Test!</h1>
        <p>Grazie per esserti registrato a Spartano Furioso.</p>
        <p>Per completare la registrazione, verifica la tua email cliccando sul link sottostante:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 8px;">Verifica Email</a>
        <p>Il link scadrà tra 24 ore.</p>
        <p>Se non hai richiesto questa registrazione, ignora questa email.</p>
        <br>
        <p>Forza e Onore,<br>Il Team Spartano Furioso</p>
        <hr>
        <p><small>Questo è un email di test per verificare che il sistema funzioni correttamente.</small></p>
      `
    };

    console.log('📧 Invio email di test...');
    const result = await transporter.sendMail(emailContent);
    console.log('✅ Email inviata con successo!');
    console.log('📬 Message ID:', result.messageId);
    console.log('🔍 Controlla la tua casella email (incluso spam/promozioni)');
    
  } catch (error) {
    console.error('❌ Errore durante il test email:', error.message);
    if (error.code === 'EAUTH') {
      console.error('💡 Suggerimento: Controlla che la password app Gmail sia corretta e senza spazi');
    } else if (error.code === 'ECONNECTION') {
      console.error('💡 Suggerimento: Controlla la connessione a internet e le impostazioni SMTP');
    }
  }
}

testEmailConfirmation();
