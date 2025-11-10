// Test sincronizzazione Admin -> Homepage (Arsenale Spartano)
console.log('=== TEST SINCRONIZZAZIONE ADMIN -> ARSENALE SPARTANO ===\n');

async function testSync() {
  try {
    // Test API pubblica
    const response = await fetch('http://localhost:3001/api/products');
    if (!response.ok) {
      console.error('❌ Server non risponde. Assicurati che sia in esecuzione su porta 3001');
      console.log('\nPer avviare il server:');
      console.log('1. Apri un nuovo terminale');
      console.log('2. cd server');
      console.log('3. node index.js');
      return;
    }

    const products = await response.json();
    console.log('✅ API attiva - Prodotti trovati:', products.length);
    console.log('\nProdotti attuali:');
    products.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name} (${p.id})`);
    });

    console.log('\n📋 ISTRUZIONI PER TESTARE LA SINCRONIZZAZIONE:');
    console.log('================================================');
    console.log('1. Apri il browser su http://localhost:5173 (homepage)');
    console.log('2. Scorri fino alla sezione "ARSENALE SPARTANO"');
    console.log('3. Nota il numero di prodotti mostrato sotto il titolo');
    console.log('4. Apri una nuova scheda su http://localhost:5173/admin');
    console.log('5. Fai login (admin@spartano-trading.com / admin123)');
    console.log('6. Vai alla sezione "Gestione Prodotti"');
    console.log('7. Prova a:');
    console.log('   - Eliminare un prodotto');
    console.log('   - Modificare il nome di un prodotto');
    console.log('   - Aggiungere un nuovo prodotto');
    console.log('8. Torna alla homepage (Arsenale Spartano)');
    console.log('9. Entro 5 secondi vedrai le modifiche applicate!');
    console.log('\n✨ La sezione si aggiorna automaticamente ogni 5 secondi');
    console.log('✨ L\'ora dell\'ultimo aggiornamento è visibile sotto il titolo');
    
  } catch (error) {
    console.error('❌ Errore:', error.message);
  }
}

testSync();
