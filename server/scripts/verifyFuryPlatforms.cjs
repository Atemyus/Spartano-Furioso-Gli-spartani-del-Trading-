const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, '../database/data/products.json');

try {
  // Leggi il file products.json
  const productsData = fs.readFileSync(productsPath, 'utf8');
  const products = JSON.parse(productsData);

  // Trova FURY OF SPARTA
  const fury = products.find(p => p.id === 'spartan_fury_bot' || p.name.includes('FURY'));

  if (fury) {
    console.log('✅ FURY OF SPARTA trovato!');
    console.log('📋 Nome:', fury.name);
    console.log('🖥️  Piattaforme attuali:', fury.platforms);
    
    // Verifica se ha MT5
    const hasMT5 = fury.platforms && fury.platforms.some(p => p.includes('MetaTrader 5'));
    
    if (hasMT5) {
      console.log('✅ MT5 già presente!');
    } else {
      console.log('⚠️  MT5 NON presente, aggiungo...');
      
      // Assicurati che platforms sia un array
      if (!fury.platforms) {
        fury.platforms = [];
      }
      
      // Aggiungi MT5 se non c'è
      if (!fury.platforms.includes('MetaTrader 5')) {
        fury.platforms.push('MetaTrader 5');
      }
      
      // Salva il file aggiornato
      fs.writeFileSync(productsPath, JSON.stringify(products, null, 2), 'utf8');
      console.log('✅ MT5 aggiunto con successo!');
      console.log('🖥️  Piattaforme aggiornate:', fury.platforms);
    }
  } else {
    console.log('❌ FURY OF SPARTA non trovato nel database!');
  }
} catch (error) {
  console.error('❌ Errore:', error.message);
}
