const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const analyticsPath = path.join(__dirname, '../database/data/analytics.json');
const backupPath = path.join(__dirname, '../database/data/analytics.backup.json');

console.log('🔄 RESET ANALYTICS - Spartano Furioso\n');
console.log('Questo script ti permette di:');
console.log('1. Azzerare completamente le analytics');
console.log('2. Fare backup dei dati attuali');
console.log('3. Ripartire da zero per il lancio\n');

// Leggi file attuale
let currentData = [];
try {
  const data = fs.readFileSync(analyticsPath, 'utf8');
  currentData = JSON.parse(data);
  console.log(`📊 Analytics attuali: ${currentData.length} visite registrate\n`);
} catch (error) {
  console.log('⚠️  File analytics non trovato o vuoto\n');
}

rl.question('❓ Vuoi procedere con il reset? (s/n): ', (answer) => {
  if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'si') {
    
    // Backup
    if (currentData.length > 0) {
      console.log('\n📦 Creazione backup...');
      fs.writeFileSync(backupPath, JSON.stringify(currentData, null, 2));
      console.log(`✅ Backup salvato in: ${backupPath}`);
    }
    
    // Reset
    console.log('\n🔄 Azzeramento analytics...');
    fs.writeFileSync(analyticsPath, JSON.stringify([], null, 2));
    console.log('✅ Analytics azzerate!');
    
    console.log('\n✨ FATTO!');
    console.log('📊 Le analytics ora sono a ZERO');
    console.log('🚀 Pronto per il lancio in produzione!\n');
    
    console.log('💡 PROSSIMI PASSI:');
    console.log('1. Configura IP da escludere (vedi ANALYTICS_SETUP.md)');
    console.log('2. Riavvia il server');
    console.log('3. Le nuove visite saranno conteggiate correttamente\n');
    
  } else {
    console.log('\n❌ Reset annullato. Nessuna modifica effettuata.\n');
  }
  
  rl.close();
});
