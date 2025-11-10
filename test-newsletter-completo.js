// Test completo newsletter - verifica tutto il flusso
import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001';

// Colori per console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(type, message) {
  const color = type === 'success' ? colors.green : 
                type === 'error' ? colors.red : 
                type === 'info' ? colors.blue : colors.yellow;
  console.log(`${color}${message}${colors.reset}`);
}

async function testNewsletterFlow() {
  console.log('\n' + '='.repeat(60));
  log('info', '🧪 TEST NEWSLETTER COMPLETO');
  console.log('='.repeat(60) + '\n');

  try {
    // Test 1: Verifica utenti registrati
    log('info', '\n📋 STEP 1: Verifica utenti registrati nel database');
    console.log('-'.repeat(60));
    
    const usersResponse = await fetch(`${API_URL}/api/admin/users`, {
      headers: {
        'Authorization': 'Bearer fake-token-for-test'
      }
    });
    
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      log('success', `✅ Trovati ${usersData.users?.length || 0} utenti registrati`);
      
      if (usersData.users && usersData.users.length > 0) {
        console.log('\nPrimi 3 utenti:');
        usersData.users.slice(0, 3).forEach((user, i) => {
          console.log(`  ${i + 1}. ${user.email} - ${user.name || 'Senza nome'}`);
        });
      }
    } else {
      log('warning', '⚠️  Impossibile recuperare utenti (potrebbe richiedere autenticazione admin)');
    }

    // Test 2: Prova iscrizione con email NON registrata
    log('info', '\n📧 STEP 2: Test iscrizione con email NON registrata');
    console.log('-'.repeat(60));
    
    const fakeEmail = 'nonregistrato@test.com';
    const subscribeFailResponse = await fetch(`${API_URL}/api/newsletter/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: fakeEmail, source: 'test' })
    });
    
    const failData = await subscribeFailResponse.json();
    
    if (subscribeFailResponse.status === 403) {
      log('success', `✅ CORRETTO! Email non registrata rifiutata`);
      console.log(`   Messaggio: "${failData.error}"`);
    } else {
      log('error', `❌ ERRORE! Dovrebbe rifiutare email non registrate`);
      console.log(`   Status: ${subscribeFailResponse.status}`);
    }

    // Test 3: Verifica iscritti alla newsletter
    log('info', '\n📊 STEP 3: Verifica iscritti alla newsletter');
    console.log('-'.repeat(60));
    
    const subscribersResponse = await fetch(`${API_URL}/api/newsletter/admin/subscribers`);
    
    if (subscribersResponse.ok) {
      const subscribersData = await subscribersResponse.json();
      log('success', `✅ Trovati ${subscribersData.subscribers?.length || 0} iscritti alla newsletter`);
      
      if (subscribersData.subscribers && subscribersData.subscribers.length > 0) {
        console.log('\nIscritti alla newsletter:');
        subscribersData.subscribers.forEach((sub, i) => {
          console.log(`  ${i + 1}. ${sub.email} - Status: ${sub.status} - Fonte: ${sub.source}`);
        });
      } else {
        log('warning', '⚠️  Nessun iscritto ancora. Prova ad iscriverti dal sito!');
      }
    } else {
      const errorText = await subscribersResponse.text();
      log('error', `❌ Errore recupero iscritti: ${errorText}`);
    }

    // Test 4: Statistiche newsletter
    log('info', '\n📈 STEP 4: Statistiche newsletter');
    console.log('-'.repeat(60));
    
    const statsResponse = await fetch(`${API_URL}/api/newsletter/admin/stats`);
    
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      log('success', '✅ Statistiche recuperate:');
      console.log(`   📊 Iscritti attivi: ${stats.totalSubscribers}`);
      console.log(`   📉 Disiscritti: ${stats.totalUnsubscribed}`);
      console.log(`   📆 Nuovi questo mese: ${stats.subscribersThisMonth}`);
      console.log(`   📧 Newsletter inviate: ${stats.totalMessagesSent}`);
    } else {
      const errorText = await statsResponse.text();
      log('error', `❌ Errore statistiche: ${errorText}`);
    }

    // Riepilogo finale
    console.log('\n' + '='.repeat(60));
    log('success', '✅ TEST COMPLETATO!');
    console.log('='.repeat(60));
    
    console.log('\n📝 COME TESTARE MANUALMENTE:\n');
    console.log('1. Fai LOGIN al sito con un account esistente');
    console.log('2. Vai al FOOTER della homepage');
    console.log('3. Dovresti vedere il form con la tua EMAIL già inserita');
    console.log('4. Click "ARRUOLATI"');
    console.log('5. Vai su /admin/dashboard → Newsletter');
    console.log('6. Dovresti vedere il tuo account nella lista iscritti!\n');

  } catch (error) {
    log('error', `\n❌ ERRORE FATALE: ${error.message}`);
    console.error(error);
  }
}

// Esegui test
testNewsletterFlow().catch(console.error);
