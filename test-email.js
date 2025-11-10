import fetch from 'node-fetch';

console.log('🚀 Test Sistema di Verifica Email\n');
console.log('==================================\n');

// Genera email e nome casuali per il test
const randomId = Date.now();
const testUser = {
  name: `Test User ${randomId}`,
  email: `test${randomId}@example.com`,
  password: 'TestPassword123!'
};

console.log('📝 Registrazione nuovo utente:');
console.log(`   Nome: ${testUser.name}`);
console.log(`   Email: ${testUser.email}`);
console.log(`   Password: ${testUser.password}\n`);

async function testEmailSystem() {
  try {
    // 1. Registra l'utente
    console.log('1️⃣ Invio richiesta di registrazione...\n');
    
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Registrazione completata con successo!\n');
      console.log('📬 Risposta del server:');
      console.log(`   Messaggio: ${data.message}`);
      console.log(`   User ID: ${data.user.id}`);
      console.log(`   Richiede verifica: ${data.requiresVerification ? 'Sì' : 'No'}\n`);
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('📧 EMAIL DI VERIFICA INVIATA!\n');
      console.log('⚠️  IMPORTANTE: Guarda nel terminale del server backend');
      console.log('    per trovare il link "Preview URL" dell\'email.\n');
      console.log('    Il link sarà simile a:');
      console.log('    🔗 https://ethereal.email/message/XXXXX\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      // 2. Verifica che l'utente appaia nel pannello admin
      console.log('2️⃣ Verifica nel pannello admin...\n');
      
      const adminToken = 'Il-tuo-token-admin'; // Dovresti prima fare login come admin
      
      console.log('📊 Per verificare nel pannello admin:');
      console.log('   1. Vai su: http://localhost:5173/admin/login');
      console.log('   2. Login con: admin@tradingfalange.com / Admin123!@#');
      console.log('   3. Vai nella sezione "Utenti"');
      console.log(`   4. Cerca l'utente: ${testUser.email}`);
      console.log('   5. Lo stato dovrebbe essere: "pending" (in attesa di verifica)\n');
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('🎯 PROSSIMI PASSI:\n');
      console.log('1. Apri il link dell\'email dal terminale del server');
      console.log('2. Clicca sul pulsante di verifica nell\'email');
      console.log('3. L\'utente verrà attivato automaticamente');
      console.log('4. Controlla di nuovo nel pannello admin: stato = "active"\n');
      
    } else {
      console.log('❌ Errore nella registrazione:\n');
      console.log(`   Codice: ${response.status}`);
      console.log(`   Errore: ${data.error || 'Errore sconosciuto'}\n`);
      
      if (data.error && data.error.includes('esiste già')) {
        console.log('💡 Suggerimento: L\'email è già registrata.');
        console.log('   Prova con un\'email diversa o usa il timestamp:');
        console.log(`   test${Date.now()}@example.com\n`);
      }
    }
    
  } catch (error) {
    console.error('🚨 Errore di connessione:', error.message);
    console.log('\n⚠️  Assicurati che:');
    console.log('   1. Il server backend sia in esecuzione (npm run dev:server)');
    console.log('   2. Il server sia raggiungibile su http://localhost:3001');
    console.log('   3. Non ci siano errori nel terminale del server\n');
  }
}

// Esegui il test
testEmailSystem();
