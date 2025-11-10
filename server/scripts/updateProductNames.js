#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USERS_FILE = path.join(__dirname, '../database/data/users.json');

// Mapping dei vecchi nomi ai nuovi nomi
const nameUpdates = {
  'SPARTAN FURY BOT': 'FURY OF SPARTA',
  'SPARTAN ACADEMY': 'SPARTAN CODEX ACADEMY',
  // Aggiungi altri aggiornamenti se necessario
};

// Mapping completo dei productId ai nomi corretti
const productNameMap = {
  'spartan_fury_bot': 'FURY OF SPARTA',
  'leonidas_scalper': 'LEONIDAS SCALPER',
  'thermopylae_defender': 'THERMOPYLAE DEFENDER',
  'spartan_academy': 'SPARTAN CODEX ACADEMY',
  'spartan_signals': 'SPARTAN SIGNALS VIP',
  'xerxes_crusher_indicator': 'XERXES CRUSHER INDICATOR',
  'oracle_predictor': 'ORACLE PREDICTOR AI',
  'hoplite_guardian': 'HOPLITE GUARDIAN SYSTEM'
};

async function updateProductNames() {
  console.log('🔧 Aggiornamento e ripristino nomi prodotti nei trial...\n');
  
  try {
    // Leggi gli utenti
    const usersData = fs.readFileSync(USERS_FILE, 'utf-8');
    const users = JSON.parse(usersData);
    
    let updatedCount = 0;
    let fixedCount = 0;
    let totalTrials = 0;
    
    // Per ogni utente
    users.forEach(user => {
      if (user.trials && user.trials.length > 0) {
        console.log(`\n👤 Utente: ${user.email}`);
        
        // Per ogni trial dell'utente
        user.trials.forEach((trial, index) => {
          totalTrials++;
          
          // Prima controlla se manca il productName
          if (!trial.productName || trial.productName === 'undefined') {
            const correctName = productNameMap[trial.productId];
            if (correctName) {
              console.log(`  ❌ Trial ${trial.id}: productName mancante!`);
              console.log(`     ProductId: ${trial.productId}`);
              console.log(`     ✅ Ripristinato: ${correctName}`);
              user.trials[index].productName = correctName;
              fixedCount++;
            }
          }
          // Poi controlla se il nome deve essere aggiornato
          else if (nameUpdates[trial.productName]) {
            const oldName = trial.productName;
            const newName = nameUpdates[trial.productName];
            
            console.log(`  📝 Trial ${trial.id}:`);
            console.log(`     Vecchio nome: ${oldName}`);
            console.log(`     ✅ Nuovo nome: ${newName}`);
            
            // Aggiorna il productName
            user.trials[index].productName = newName;
            updatedCount++;
          } else {
            console.log(`  ✅ Trial ${trial.id}: ${trial.productName} (OK)`);
          }
        });
      }
    });
    
    // Salva il file aggiornato
    if (updatedCount > 0 || fixedCount > 0) {
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
      console.log(`\n✅ COMPLETATO!`);
      console.log(`   Trial totali: ${totalTrials}`);
      console.log(`   Trial aggiornati: ${updatedCount}`);
      console.log(`   Trial ripristinati: ${fixedCount}`);
      console.log(`   File salvato: ${USERS_FILE}`);
    } else {
      console.log(`\n✅ Tutti i trial hanno già i nomi corretti. Nessuna modifica necessaria.`);
    }
    
  } catch (error) {
    console.error('\n❌ Errore:', error.message);
    process.exit(1);
  }
}

// Esegui lo script
updateProductNames().catch(error => {
  console.error('❌ Errore fatale:', error);
  process.exit(1);
});
