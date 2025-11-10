import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script per verificare e correggere il sistema di scadenza dei trial
 */
async function verifyAndFixTrialExpiration() {
  console.log('🔍 Verifica sistema di scadenza trial...\n');
  
  try {
    // 1. Ottieni tutti i trial dal database
    const allTrials = await prisma.trial.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`📊 Totale trial nel database: ${allTrials.length}\n`);
    
    if (allTrials.length === 0) {
      console.log('⚠️  Nessun trial trovato nel database');
      return;
    }
    
    // 2. Analizza ogni trial
    const now = new Date();
    let activeCount = 0;
    let expiredCount = 0;
    let needsUpdate = 0;
    
    const trialsToUpdate = [];
    
    console.log('📋 Analisi trial:\n');
    console.log('─'.repeat(100));
    
    for (const trial of allTrials) {
      const endDate = new Date(trial.endDate);
      const isActuallyActive = now < endDate;
      const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const statusInDB = trial.status;
      const correctStatus = isActuallyActive ? 'active' : 'expired';
      
      const needsStatusUpdate = statusInDB !== correctStatus;
      
      if (isActuallyActive) {
        activeCount++;
      } else {
        expiredCount++;
      }
      
      if (needsStatusUpdate) {
        needsUpdate++;
        trialsToUpdate.push({
          id: trial.id,
          currentStatus: statusInDB,
          correctStatus: correctStatus
        });
      }
      
      const statusIcon = isActuallyActive ? '✅' : '❌';
      const updateIcon = needsStatusUpdate ? '⚠️  NEEDS UPDATE' : '✓';
      
      console.log(`${statusIcon} Trial: ${trial.productName}`);
      console.log(`   User: ${trial.user.email}`);
      console.log(`   Status DB: ${statusInDB} | Status Reale: ${correctStatus} ${updateIcon}`);
      console.log(`   Inizio: ${trial.startDate.toLocaleDateString('it-IT')}`);
      console.log(`   Fine: ${trial.endDate.toLocaleDateString('it-IT')}`);
      console.log(`   Giorni rimanenti: ${daysRemaining > 0 ? daysRemaining : 0}`);
      console.log('─'.repeat(100));
    }
    
    // 3. Riepilogo
    console.log('\n📊 RIEPILOGO:\n');
    console.log(`✅ Trial attivi: ${activeCount}`);
    console.log(`❌ Trial scaduti: ${expiredCount}`);
    console.log(`⚠️  Trial con status errato: ${needsUpdate}\n`);
    
    // 4. Correggi i trial con status errato
    if (needsUpdate > 0) {
      console.log('🔧 Correzione trial con status errato...\n');
      
      for (const trial of trialsToUpdate) {
        console.log(`   Aggiornamento trial ${trial.id}: ${trial.currentStatus} → ${trial.correctStatus}`);
        
        await prisma.trial.update({
          where: { id: trial.id },
          data: { status: trial.correctStatus }
        });
      }
      
      console.log(`\n✅ ${needsUpdate} trial aggiornati con successo!\n`);
    } else {
      console.log('✅ Tutti i trial hanno lo status corretto!\n');
    }
    
    // 5. Test calcolo giorni rimanenti
    console.log('🧪 TEST CALCOLO GIORNI RIMANENTI:\n');
    
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 5); // 5 giorni nel futuro
    testDate.setHours(14, 30, 0, 0); // Ore 14:30
    
    const diffMs = testDate.getTime() - now.getTime();
    const daysFloor = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const daysCeil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    console.log(`   Data test: ${testDate.toLocaleString('it-IT')}`);
    console.log(`   Ora corrente: ${now.toLocaleString('it-IT')}`);
    console.log(`   Math.floor: ${daysFloor} giorni`);
    console.log(`   Math.ceil: ${daysCeil} giorni`);
    console.log(`   ⚠️  Differenza: ${daysCeil - daysFloor} giorni\n`);
    console.log('   💡 Raccomandazione: Usare Math.ceil per mostrare giorni completi all\'utente\n');
    
    // 6. Verifica presenza cron job
    console.log('🔍 VERIFICA SISTEMA AUTOMATICO:\n');
    console.log('   ❌ PROBLEMA: Non esiste un cron job per aggiornare automaticamente i trial scaduti');
    console.log('   💡 SOLUZIONE: Implementare un job scheduler che esegue expireTrials() ogni giorno\n');
    
  } catch (error) {
    console.error('❌ Errore durante la verifica:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Esegui lo script
verifyAndFixTrialExpiration()
  .then(() => {
    console.log('✅ Verifica completata!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Errore fatale:', error);
    process.exit(1);
  });
