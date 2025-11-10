#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USERS_FILE = path.join(__dirname, '../database/data/users.json');
const PRODUCTS_FILE = path.join(__dirname, '../database/data/products.json');

async function syncProductNames() {
  console.log('🔄 SINCRONIZZAZIONE NOMI PRODOTTI CON TRIAL\n');
  console.log('==================================================\n');
  
  try {
    // Leggi i prodotti
    const productsData = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
    const products = JSON.parse(productsData);
    
    // Crea una mappa productId -> productName dai prodotti attuali
    const productNameMap = {};
    products.forEach(product => {
      productNameMap[product.id] = product.name;
      console.log(`📦 Prodotto: ${product.id} => "${product.name}"`);
    });
    
    console.log('\n--------------------------------------------------\n');
    
    // Leggi gli utenti
    const usersData = fs.readFileSync(USERS_FILE, 'utf-8');
    const users = JSON.parse(usersData);
    
    let totalTrials = 0;
    let updatedTrials = 0;
    let errors = 0;
    
    // Per ogni utente
    users.forEach(user => {
      if (user.trials && user.trials.length > 0) {
        console.log(`\n👤 Utente: ${user.email}`);
        
        // Per ogni trial dell'utente
        user.trials.forEach((trial, index) => {
          totalTrials++;
          
          const correctName = productNameMap[trial.productId];
          
          if (!correctName) {
            console.log(`  ⚠️ Trial ${trial.id}: Prodotto ${trial.productId} non trovato nel database!`);
            errors++;
          } else if (trial.productName !== correctName) {
            console.log(`  📝 Trial ${trial.id}:`);
            console.log(`     ProductId: ${trial.productId}`);
            console.log(`     Vecchio nome: ${trial.productName || '(vuoto)'}`);
            console.log(`     ✅ Nuovo nome: ${correctName}`);
            
            // Aggiorna il productName
            user.trials[index].productName = correctName;
            updatedTrials++;
          } else {
            console.log(`  ✅ Trial ${trial.id}: ${trial.productName} (corretto)`);
          }
        });
      }
    });
    
    // Salva il file aggiornato se ci sono modifiche
    if (updatedTrials > 0) {
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
      console.log(`\n==================================================`);
      console.log(`✅ SINCRONIZZAZIONE COMPLETATA!`);
      console.log(`   Trial totali: ${totalTrials}`);
      console.log(`   Trial aggiornati: ${updatedTrials}`);
      console.log(`   Errori: ${errors}`);
      console.log(`   File salvato: ${USERS_FILE}`);
    } else if (errors > 0) {
      console.log(`\n==================================================`);
      console.log(`⚠️ SINCRONIZZAZIONE COMPLETATA CON AVVISI`);
      console.log(`   Trial totali: ${totalTrials}`);
      console.log(`   Errori: ${errors}`);
      console.log(`   Alcuni trial fanno riferimento a prodotti non esistenti`);
    } else {
      console.log(`\n==================================================`);
      console.log(`✅ Tutti i trial hanno già i nomi corretti!`);
      console.log(`   Trial totali: ${totalTrials}`);
    }
    
  } catch (error) {
    console.error('\n❌ Errore:', error.message);
    process.exit(1);
  }
}

// Esegui lo script
syncProductNames().catch(error => {
  console.error('❌ Errore fatale:', error);
  process.exit(1);
});
