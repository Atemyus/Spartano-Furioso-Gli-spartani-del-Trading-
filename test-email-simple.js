import fetch from 'node-fetch';

console.log('\n\n===============================================');
console.log('    🚀 TEST RAPIDO VERIFICA EMAIL');
console.log('===============================================\n');

const testEmail = `test${Date.now()}@example.com`;

async function test() {
  try {
    console.log('📝 Creo un nuovo utente di test...');
    console.log(`   Email: ${testEmail}\n`);
    
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: testEmail,
        password: 'Test123!'
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ UTENTE CREATO CON SUCCESSO!\n');
      console.log('===============================================\n');
      
      if (data.verificationLink) {
        console.log('🔗 CLICCA QUESTO LINK PER VERIFICARE L\'EMAIL:\n');
        console.log(`   ${data.verificationLink}\n`);
        console.log('===============================================\n');
        console.log('📋 COPIA E INCOLLA IL LINK NEL BROWSER\n');
      }
      
      console.log('📊 VERIFICA NEL PANNELLO ADMIN:');
      console.log('   1. Vai su: http://localhost:5173/admin/login');
      console.log('   2. Email: admin@tradingfalange.com');
      console.log('   3. Password: Admin123!@#');
      console.log('   4. Clicca su "Utenti"');
      console.log(`   5. Cerca: ${testEmail}`);
      console.log('   6. Stato attuale: "pending" 🟡');
      console.log('   7. Dopo verifica: "active" 🟢\n');
      console.log('===============================================\n');
      
    } else {
      console.log('❌ Errore:', data.error);
    }
    
  } catch (error) {
    console.log('🚨 ERRORE: Il server non è raggiungibile');
    console.log('   Assicurati che il server sia attivo con:');
    console.log('   npm run dev:server\n');
  }
}

test();
