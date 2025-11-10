const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProducts() {
  console.log('🔍 Verifica prodotti nel database...\n');
  
  try {
    // Conta tutti i prodotti
    const count = await prisma.product.count();
    console.log(`📊 Totale prodotti nel database: ${count}\n`);

    if (count === 0) {
      console.log('❌ Nessun prodotto trovato nel database!');
      console.log('💡 Suggerimento: Devi prima popolare il database con i prodotti.\n');
      return;
    }

    // Elenca tutti i prodotti
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        platforms: true
      }
    });

    console.log('📋 Lista prodotti:\n');
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Piattaforme: ${JSON.stringify(product.platforms)}`);
      console.log('');
    });

    // Cerca specificamente Fury of Sparta
    const fury = products.find(p => 
      p.id === 'spartan_fury_bot' || 
      p.name.toLowerCase().includes('fury')
    );

    if (fury) {
      console.log('✅ Fury of Sparta trovato!');
      console.log(`   ID: ${fury.id}`);
      console.log(`   Nome: ${fury.name}`);
      console.log(`   Piattaforme: ${JSON.stringify(fury.platforms)}`);
    } else {
      console.log('❌ Fury of Sparta NON trovato nel database');
    }
    
  } catch (error) {
    console.error('❌ Errore durante la verifica:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProducts()
  .then(() => {
    console.log('\n🎉 Verifica completata!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Errore fatale:', error);
    process.exit(1);
  });
