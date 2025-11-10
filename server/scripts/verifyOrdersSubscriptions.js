import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

/**
 * Script per verificare ordini e subscriptions
 */
async function verifyOrdersSubscriptions() {
  console.log('🔍 VERIFICA ORDINI E ABBONAMENTI\n');
  console.log('═'.repeat(80));
  
  try {
    // 1. VERIFICA ORDINI
    console.log('\n📦 1. VERIFICA ORDINI\n');
    
    // Ordini nel file JSON
    const ordersFile = path.join(__dirname, '../data/orders.json');
    let ordersJSON = [];
    try {
      const ordersData = await fs.readFile(ordersFile, 'utf-8');
      ordersJSON = JSON.parse(ordersData);
    } catch (error) {
      console.log('⚠️  File orders.json non trovato o vuoto');
    }
    
    console.log(`📊 Ordini nel file JSON: ${ordersJSON.length}`);
    
    if (ordersJSON.length === 0) {
      console.log('   ℹ️  Nessun ordine registrato nel sistema');
    } else {
      ordersJSON.forEach((order, index) => {
        console.log(`\n   Ordine ${index + 1}:`);
        console.log(`   - ID: ${order.id}`);
        console.log(`   - Prodotto: ${order.productName || order.productId}`);
        console.log(`   - Prezzo: €${order.amount || order.price}`);
        console.log(`   - Status: ${order.status}`);
        console.log(`   - Data: ${new Date(order.createdAt).toLocaleDateString('it-IT')}`);
      });
    }
    
    // 2. VERIFICA SUBSCRIPTIONS
    console.log('\n═'.repeat(80));
    console.log('\n💳 2. VERIFICA ABBONAMENTI (SUBSCRIPTIONS)\n');
    
    // Subscriptions negli utenti (vecchio DB JSON)
    const usersFile = path.join(__dirname, '../database/data/users.json');
    let usersJSON = [];
    try {
      const usersData = await fs.readFile(usersFile, 'utf-8');
      usersJSON = JSON.parse(usersData);
    } catch (error) {
      console.log('⚠️  File users.json non trovato');
    }
    
    let totalSubscriptions = 0;
    let activeSubscriptions = 0;
    
    console.log(`📊 Utenti nel sistema: ${usersJSON.length}\n`);
    
    usersJSON.forEach(user => {
      const userSubs = user.subscriptions || [];
      totalSubscriptions += userSubs.length;
      
      if (userSubs.length > 0) {
        console.log(`👤 ${user.email}`);
        userSubs.forEach(sub => {
          const isActive = sub.status === 'active' || sub.active === true;
          if (isActive) activeSubscriptions++;
          
          console.log(`   ${isActive ? '✅' : '❌'} ${sub.productName || sub.productId}`);
          console.log(`      Status: ${sub.status || (sub.active ? 'active' : 'inactive')}`);
          if (sub.startDate) console.log(`      Inizio: ${new Date(sub.startDate).toLocaleDateString('it-IT')}`);
          if (sub.endDate) console.log(`      Fine: ${new Date(sub.endDate).toLocaleDateString('it-IT')}`);
          if (sub.interval) console.log(`      Intervallo: ${sub.interval}`);
        });
        console.log('');
      }
    });
    
    if (totalSubscriptions === 0) {
      console.log('   ℹ️  Nessun abbonamento registrato nel sistema\n');
    }
    
    // 3. VERIFICA SCHEMA PRISMA
    console.log('═'.repeat(80));
    console.log('\n🗄️  3. VERIFICA SCHEMA DATABASE PRISMA\n');
    
    const schemaFile = path.join(__dirname, '../prisma/schema.prisma');
    const schemaContent = await fs.readFile(schemaFile, 'utf-8');
    
    const hasOrderModel = schemaContent.includes('model Order');
    const hasSubscriptionModel = schemaContent.includes('model Subscription');
    
    console.log(`${hasOrderModel ? '✅' : '❌'} Model Order nel schema Prisma: ${hasOrderModel ? 'Presente' : 'Assente'}`);
    console.log(`${hasSubscriptionModel ? '✅' : '❌'} Model Subscription nel schema Prisma: ${hasSubscriptionModel ? 'Presente' : 'Assente'}`);
    
    if (!hasOrderModel) {
      console.log('\n   ⚠️  ATTENZIONE: Model Order non presente nello schema Prisma');
      console.log('   📝 Gli ordini sono gestiti solo tramite file JSON');
    }
    
    if (!hasSubscriptionModel) {
      console.log('\n   ⚠️  ATTENZIONE: Model Subscription non presente nello schema Prisma');
      console.log('   📝 Gli abbonamenti sono gestiti solo tramite file JSON (campo subscriptions negli utenti)');
    }
    
    // 4. VERIFICA PRODOTTI CON SUBSCRIPTION
    console.log('\n═'.repeat(80));
    console.log('\n📦 4. PRODOTTI CON ABBONAMENTO\n');
    
    const productsFile = path.join(__dirname, '../database/data/products.json');
    const productsData = await fs.readFile(productsFile, 'utf-8');
    const products = JSON.parse(productsData);
    
    const subscriptionProducts = products.filter(p => p.type === 'subscription');
    const oneTimeProducts = products.filter(p => p.type === 'one-time');
    
    console.log(`✅ Prodotti con abbonamento: ${subscriptionProducts.length}`);
    subscriptionProducts.forEach(p => {
      console.log(`   - ${p.name} (${p.id})`);
      console.log(`     Prezzo: €${p.price}/${p.interval}`);
      if (p.pricingPlans) {
        const plans = Object.keys(p.pricingPlans);
        console.log(`     Piani: ${plans.join(', ')}`);
      }
    });
    
    console.log(`\n✅ Prodotti one-time: ${oneTimeProducts.length}`);
    oneTimeProducts.forEach(p => {
      console.log(`   - ${p.name} (${p.id})`);
      console.log(`     Prezzo: €${p.price}`);
    });
    
    // 5. RIEPILOGO SINCRONIZZAZIONE
    console.log('\n═'.repeat(80));
    console.log('\n📋 5. RIEPILOGO SINCRONIZZAZIONE\n');
    
    console.log('📊 STATISTICHE:');
    console.log(`   Ordini totali: ${ordersJSON.length}`);
    console.log(`   Abbonamenti totali: ${totalSubscriptions}`);
    console.log(`   Abbonamenti attivi: ${activeSubscriptions}`);
    console.log(`   Prodotti subscription: ${subscriptionProducts.length}`);
    console.log(`   Prodotti one-time: ${oneTimeProducts.length}`);
    console.log('');
    
    console.log('🗄️  DATABASE:');
    console.log(`   ${hasOrderModel ? '✅' : '❌'} Model Order in Prisma: ${hasOrderModel ? 'Sì' : 'No'}`);
    console.log(`   ${hasSubscriptionModel ? '✅' : '❌'} Model Subscription in Prisma: ${hasSubscriptionModel ? 'Sì' : 'No'}`);
    console.log(`   ✅ Ordini in JSON: Sì (${ordersJSON.length})`);
    console.log(`   ✅ Subscriptions in JSON: Sì (${totalSubscriptions})`);
    console.log('');
    
    console.log('🔄 SINCRONIZZAZIONE:');
    if (ordersJSON.length === 0 && totalSubscriptions === 0) {
      console.log('   ✅ Sistema pulito: nessun ordine o abbonamento da sincronizzare');
    } else if (!hasOrderModel && !hasSubscriptionModel) {
      console.log('   ⚠️  Ordini e abbonamenti gestiti solo tramite JSON');
      console.log('   💡 Considera di aggiungere i model Order e Subscription a Prisma');
    } else {
      console.log('   ℹ️  Sistema ibrido: alcuni dati in JSON, alcuni in Prisma');
    }
    
    // 6. RACCOMANDAZIONI
    console.log('\n═'.repeat(80));
    console.log('\n💡 6. RACCOMANDAZIONI\n');
    
    if (!hasOrderModel) {
      console.log('📝 ORDINI:');
      console.log('   - Attualmente gestiti tramite file JSON (data/orders.json)');
      console.log('   - Funziona correttamente per volumi bassi');
      console.log('   - Per produzione: considera di aggiungere model Order a Prisma');
      console.log('');
    }
    
    if (!hasSubscriptionModel) {
      console.log('📝 ABBONAMENTI:');
      console.log('   - Attualmente gestiti nel campo "subscriptions" degli utenti (JSON)');
      console.log('   - Funziona per gestione base');
      console.log('   - Per produzione: considera di aggiungere model Subscription a Prisma');
      console.log('   - Vantaggi: query più efficienti, relazioni, validazione');
      console.log('');
    }
    
    if (ordersJSON.length === 0 && totalSubscriptions === 0) {
      console.log('✅ STATO ATTUALE:');
      console.log('   - Sistema pronto per ricevere ordini e abbonamenti');
      console.log('   - Nessuna migrazione necessaria (nessun dato esistente)');
      console.log('   - Puoi procedere con l\'implementazione attuale');
      console.log('');
    }
    
    console.log('═'.repeat(80));
    console.log('\n✅ VERIFICA COMPLETATA!\n');
    
  } catch (error) {
    console.error('❌ Errore durante la verifica:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Esegui lo script
verifyOrdersSubscriptions()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Errore fatale:', error);
    process.exit(1);
  });
