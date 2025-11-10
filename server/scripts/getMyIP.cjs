const https = require('https');
const os = require('os');

console.log('🌐 SCOPRI IL TUO IP - Spartano Furioso\n');

// IP Locali
console.log('📍 IP LOCALI (Rete):');
const interfaces = os.networkInterfaces();
for (const name of Object.keys(interfaces)) {
  for (const iface of interfaces[name]) {
    if (iface.family === 'IPv4' && !iface.internal) {
      console.log(`   ${name}: ${iface.address}`);
    }
  }
}

// IP Pubblico
console.log('\n🌍 IP PUBBLICO (Internet):');
https.get('https://api.ipify.org?format=json', (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log(`   ${json.ip}`);
      
      console.log('\n📝 COME USARLO:');
      console.log('1. Copia il tuo IP pubblico');
      console.log('2. Aggiungi al file .env del server:');
      console.log(`   EXCLUDED_IPS=${json.ip}`);
      console.log('3. Riavvia il server');
      console.log('4. ✅ Le tue visite non saranno più conteggiate!\n');
      
      console.log('💡 Per escludere più IP (es: ufficio + casa):');
      console.log(`   EXCLUDED_IPS=${json.ip},192.168.1.100,10.0.0.5\n`);
      
    } catch (error) {
      console.error('Errore parsing JSON:', error.message);
    }
  });
}).on('error', (error) => {
  console.error('❌ Errore connessione:', error.message);
  console.log('\n💡 Puoi anche scoprire il tuo IP visitando:');
  console.log('   https://whatismyipaddress.com/\n');
});
