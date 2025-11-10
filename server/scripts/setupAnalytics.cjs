const fs = require('fs');
const path = require('path');
const https = require('https');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🎯 SETUP ANALYTICS - Spartano Furioso\n');
console.log('Questo script configurerà le analytics per il lancio:\n');
console.log('1. Scopre il tuo IP');
console.log('2. Configura esclusione IP');
console.log('3. Azzera analytics attuali');
console.log('4. Crea backup\n');

// Step 1: Scopri IP
console.log('📍 STEP 1: Scoperta IP...\n');

https.get('https://api.ipify.org?format=json', (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const myIP = json.ip;
      
      console.log(`✅ Il tuo IP pubblico è: ${myIP}\n`);
      
      // Step 2: Configura .env
      rl.question('📝 Vuoi configurare questo IP nel file .env? (s/n): ', (answer) => {
        if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'si') {
          
          const envPath = path.join(__dirname, '../.env');
          let envContent = '';
          
          // Leggi .env esistente
          try {
            envContent = fs.readFileSync(envPath, 'utf8');
          } catch (error) {
            console.log('⚠️  File .env non trovato, ne creo uno nuovo');
          }
          
          // Aggiungi o aggiorna EXCLUDED_IPS
          if (envContent.includes('EXCLUDED_IPS=')) {
            // Aggiorna esistente
            envContent = envContent.replace(
              /EXCLUDED_IPS=.*/,
              `EXCLUDED_IPS=${myIP}`
            );
            console.log('✅ EXCLUDED_IPS aggiornato in .env');
          } else {
            // Aggiungi nuovo
            envContent += `\n# IP da escludere dalle analytics\nEXCLUDED_IPS=${myIP}\n`;
            console.log('✅ EXCLUDED_IPS aggiunto a .env');
          }
          
          // Salva .env
          fs.writeFileSync(envPath, envContent);
          
          // Step 3: Reset analytics
          console.log('\n📊 STEP 2: Reset Analytics...\n');
          
          rl.question('🔄 Vuoi azzerare le analytics attuali? (s/n): ', (resetAnswer) => {
            if (resetAnswer.toLowerCase() === 's' || resetAnswer.toLowerCase() === 'si') {
              
              const analyticsPath = path.join(__dirname, '../database/data/analytics.json');
              const backupPath = path.join(__dirname, '../database/data/analytics.backup.json');
              
              // Leggi analytics attuali
              let currentData = [];
              try {
                const data = fs.readFileSync(analyticsPath, 'utf8');
                currentData = JSON.parse(data);
                console.log(`📊 Analytics attuali: ${currentData.length} visite\n`);
              } catch (error) {
                console.log('⚠️  File analytics non trovato\n');
              }
              
              // Backup
              if (currentData.length > 0) {
                fs.writeFileSync(backupPath, JSON.stringify(currentData, null, 2));
                console.log(`✅ Backup creato: ${backupPath}`);
              }
              
              // Reset
              fs.writeFileSync(analyticsPath, JSON.stringify([], null, 2));
              console.log('✅ Analytics azzerate!\n');
              
              // Riepilogo finale
              console.log('═══════════════════════════════════════');
              console.log('✨ SETUP COMPLETATO!');
              console.log('═══════════════════════════════════════\n');
              console.log('📋 RIEPILOGO:');
              console.log(`   • Il tuo IP: ${myIP}`);
              console.log('   • IP configurato in .env ✅');
              console.log('   • Analytics azzerate ✅');
              console.log('   • Backup creato ✅\n');
              console.log('🚀 PROSSIMI PASSI:');
              console.log('   1. Riavvia il server: npm start');
              console.log('   2. Visita il sito');
              console.log('   3. Verifica che le tue visite NON siano conteggiate');
              console.log('   4. Testa con IP esterno (smartphone 4G)\n');
              console.log('💡 Le tue visite non saranno più conteggiate!');
              console.log('📊 Solo visite reali degli utenti saranno tracciate.\n');
              
            } else {
              console.log('\n❌ Reset analytics annullato.');
              console.log('✅ IP configurato in .env');
              console.log('🔄 Riavvia il server per applicare le modifiche.\n');
            }
            
            rl.close();
          });
          
        } else {
          console.log('\n❌ Configurazione annullata.');
          console.log(`💡 Per configurare manualmente, aggiungi a .env:`);
          console.log(`   EXCLUDED_IPS=${myIP}\n`);
          rl.close();
        }
      });
      
    } catch (error) {
      console.error('❌ Errore:', error.message);
      console.log('\n💡 Scopri il tuo IP manualmente su:');
      console.log('   https://whatismyipaddress.com/\n');
      rl.close();
    }
  });
}).on('error', (error) => {
  console.error('❌ Errore connessione:', error.message);
  console.log('\n💡 Scopri il tuo IP manualmente su:');
  console.log('   https://whatismyipaddress.com/\n');
  rl.close();
});
