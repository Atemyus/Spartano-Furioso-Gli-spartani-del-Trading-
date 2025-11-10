const fs = require('fs');
const path = require('path');

console.log('🔍 Verifica Piattaforme FURY OF SPARTA\n');

// 1. Verifica products.json
const productsPath = path.join(__dirname, '../database/data/products.json');
const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
const fury = productsData.find(p => p.id === 'spartan_fury_bot');

console.log('📦 products.json:');
if (fury) {
  console.log('   Piattaforme:', fury.platforms);
  const hasMT5 = fury.platforms && fury.platforms.includes('MetaTrader 5');
  console.log('   MT5 presente:', hasMT5 ? '✅ SÌ' : '❌ NO');
} else {
  console.log('   ❌ Prodotto non trovato');
}

// 2. Verifica product-configs.json
const configPath = path.join(__dirname, '../data/product-configs.json');
const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const furyConfig = configData.products.spartan_fury_bot;

console.log('\n⚙️  product-configs.json:');
if (furyConfig) {
  console.log('   Piattaforme:', furyConfig.platforms);
  const hasMT5 = furyConfig.platforms && furyConfig.platforms.includes('MetaTrader 5');
  console.log('   MT5 presente:', hasMT5 ? '✅ SÌ' : '❌ NO');
} else {
  console.log('   ❌ Configurazione non trovata');
}

console.log('\n✅ Verifica completata!');
console.log('💡 Se hai modificato i file, riavvia il server backend per applicare le modifiche.');
