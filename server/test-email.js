import dotenv from 'dotenv';
import { sendEmail } from './services/emailService.js';

// Carica le variabili d'ambiente
dotenv.config();

console.log('🧪 TEST INVIO EMAIL\n');
console.log('Configurazione attuale:');
console.log('- HOST:', process.env.EMAIL_HOST || '(non configurato - userà Ethereal)');
console.log('- USER:', process.env.EMAIL_USER || '(non configurato)');
console.log('- FROM:', process.env.EMAIL_FROM);
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('\n');

// Chiedi l'email di destinazione
const testEmail = process.argv[2];

if (!testEmail) {
  console.log('❌ Uso: node test-email.js tua@email.com');
  process.exit(1);
}

console.log(`📧 Invio email di test a: ${testEmail}\n`);

// Invia email di test
async function testEmailSending() {
  try {
    // Test email di verifica
    const verificationResult = await sendEmail(testEmail, 'verification', {
      userName: 'Test User',
      verificationLink: 'http://localhost:5173/verify-email?token=TEST123'
    });
    
    if (verificationResult.success) {
      console.log('✅ Email di verifica inviata con successo!');
    } else {
      console.log('❌ Errore invio email:', verificationResult.error);
    }
    
    // Test email di benvenuto
    const welcomeResult = await sendEmail(testEmail, 'welcome', {
      userName: 'Test User'
    });
    
    if (welcomeResult.success) {
      console.log('✅ Email di benvenuto inviata con successo!');
    } else {
      console.log('❌ Errore invio email:', welcomeResult.error);
    }
    
  } catch (error) {
    console.error('❌ Errore durante il test:', error);
  }
  
  process.exit(0);
}

testEmailSending();
