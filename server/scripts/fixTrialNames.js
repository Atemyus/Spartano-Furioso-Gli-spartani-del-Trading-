#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USERS_FILE = path.join(__dirname, '../database/data/users.json');
const PRODUCTS_FILE = path.join(__dirname, '../database/data/products.json');

// Mapping dei product ID ai loro nomi
const productNameMap = {
  'spartan_fury_bot': 'SPARTAN FURY BOT',
  'leonidas_scalper': 'LEONIDAS SCALPER',
  'thermopylae_defender': 'THERMOPYLAE DEFENDER',
  'spartan_academy': 'SPARTAN ACADEMY',
  'spartan_signals': 'SPARTAN SIGNALS VIP',
  'xerxes_crusher_indicator': 'XERXES CRUSHER INDICATOR',
  'oracle_predictor': 'ORACLE PREDICTOR AI',
  'hoplite_guardian': 'HOPLITE GUARDIAN SYSTEM'
};

async function fixTrialNames() {
  console.log('🔧 Correzione nomi dei trial mancanti...\n');
  
  try {
    // Leggi gli utenti
    const usersData = fs.readFileSync(USERS_FILE, 'utf-8');
    const users = JSON.parse(usersData);
    
    let fixedCount = 0;
    let totalTrials = 0;
    
    // Per ogni utente
    users.forEach(user => {
      if (user.trials && user.trials.length > 0) {
        console.log(`\n👤 Utente: ${user.email}`);
        
        // Per ogni trial dell'utente
        user.trials.forEach((trial, index) => {
          totalTrials++;
          
          // Se manca il productName
          if (!trial.productName) {
            // Trova il nome dal mapping o genera uno di default
            const productName = productNameMap[trial.productId] || 
                               trial.productId.replace(/_/g, ' ').toUpperCase();
            
            console.log(`  ❌ Trial ${trial.id}: manca productName`);
            console.log(`     ProductId: ${trial.productId}`);
            console.log(`     ✅ Aggiunto: ${productName}`);
            
            // Aggiungi il productName
            user.trials[index].productName = productName;
            fixedCount++;
          } else {
            console.log(`  ✅ Trial ${trial.id}: ${trial.productName} (OK)`);
          }
        });
      }
    });
    
    // Salva il file aggiornato
    if (fixedCount > 0) {
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
      console.log(`\n✅ COMPLETATO!`);
      console.log(`   Trial totali: ${totalTrials}`);
      console.log(`   Trial corretti: ${fixedCount}`);
      console.log(`   File salvato: ${USERS_FILE}`);
    } else {
      console.log(`\n✅ Tutti i trial hanno già il productName. Nessuna modifica necessaria.`);
    }
    
  } catch (error) {
    console.error('\n❌ Errore:', error.message);
    process.exit(1);
  }
}

// Esegui lo script
fixTrialNames().catch(error => {
  console.error('❌ Errore fatale:', error);
  process.exit(1);
});
