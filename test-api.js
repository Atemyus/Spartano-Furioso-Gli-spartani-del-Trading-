// Test API prodotti
fetch('http://localhost:3001/api/products')
  .then(res => res.json())
  .then(products => {
    console.log('=== Prodotti dal server ===');
    console.log(`Totale prodotti: ${products.length}`);
    products.forEach(p => {
      console.log(`- ${p.name}`);
    });
    
    // Verifica se Oracle Signals Pro è presente
    const hasOracle = products.some(p => p.id === 'oracle_signals_pro');
    if (hasOracle) {
      console.log('\n⚠️ ATTENZIONE: Oracle Signals Pro è ancora presente!');
    } else {
      console.log('\n✅ Oracle Signals Pro è stato rimosso correttamente');
    }
  })
  .catch(err => {
    console.error('Errore nel testare l\'API:', err.message);
    console.log('Il server potrebbe non essere in esecuzione su http://localhost:3001');
  });
