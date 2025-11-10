// Verifica configurazione .env
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carica .env
dotenv.config();

console.log('\n🔍 VERIFICA CONFIGURAZIONE .env\n');
console.log('📁 Directory corrente:', __dirname);
console.log('📄 File .env path:', join(__dirname, '.env'));
console.log('\n📋 Variabili caricate:\n');
console.log('DATABASE_URL:', process.env.DATABASE_URL || '❌ NON TROVATA');
console.log('PORT:', process.env.PORT || '❌ NON TROVATA');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || '❌ NON TROVATA');

if (!process.env.DATABASE_URL) {
  console.log('\n❌ ERRORE: DATABASE_URL non trovata!');
  console.log('📝 Assicurati che server/.env contenga:');
  console.log('   DATABASE_URL="file:./dev.db"');
} else if (!process.env.DATABASE_URL.startsWith('file:')) {
  console.log('\n⚠️  WARNING: DATABASE_URL non inizia con "file:"');
  console.log('   Valore attuale:', process.env.DATABASE_URL);
  console.log('   Dovrebbe essere: "file:./dev.db"');
} else {
  console.log('\n✅ Configurazione corretta!');
}

console.log('\n');
