const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateFuryPlatforms() {
  console.log('🔧 Aggiornamento piattaforme Fury of Sparta...\n');
  
  try {
    // Trova il prodotto Fury of Sparta
    const furyProduct = await prisma.product.findFirst({
      where: {
        OR: [
          { id: 'spartan_fury_bot' },
          { name: { contains: 'Fury of Sparta' } },
          { name: { contains: 'FURY OF SPARTA' } }
        ]
      }
    });

    if (!furyProduct) {
      console.log('❌ Prodotto Fury of Sparta non trovato nel database');
      return;
    }

    console.log('✅ Prodotto trovato:', furyProduct.name);
    console.log('📊 Piattaforme attuali:', furyProduct.platforms);

    // Aggiorna le piattaforme a solo MT4
    const updated = await prisma.product.update({
      where: { id: furyProduct.id },
      data: {
        platforms: ['MetaTrader 4']
      }
    });

    console.log('\n✅ Piattaforme aggiornate con successo!');
    console.log('📊 Nuove piattaforme:', updated.platforms);
    
  } catch (error) {
    console.error('❌ Errore durante l\'aggiornamento:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateFuryPlatforms()
  .then(() => {
    console.log('\n🎉 Script completato!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Errore fatale:', error);
    process.exit(1);
  });
