// Test Login Script
console.log('🔍 TEST LOGIN CON CREDENZIALI ERRATE\n');

async function testLogin() {
  const testCredentials = {
    email: 'nonregistrato@test.com',
    password: 'password123'
  };

  console.log('📧 Email:', testCredentials.email);
  console.log('🔑 Password:', testCredentials.password);
  console.log('\n📡 Invio richiesta al server...\n');

  try {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testCredentials)
    });

    console.log('📊 Status risposta:', response.status);
    
    const data = await response.json();
    console.log('📦 Dati risposta:', JSON.stringify(data, null, 2));

    if (response.ok && data.success) {
      console.log('\n⚠️ PROBLEMA: Il login è riuscito con credenziali non registrate!');
      console.log('Questo NON dovrebbe succedere!');
    } else {
      console.log('\n✅ CORRETTO: Il login è stato rifiutato');
      console.log('Messaggio errore:', data.error || 'Credenziali non valide');
    }

  } catch (error) {
    console.error('\n❌ Errore durante il test:', error.message);
  }
}

// Esegui il test
testLogin();
