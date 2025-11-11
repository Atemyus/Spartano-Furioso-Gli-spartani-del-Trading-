import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

let prisma = null;
let isConnected = false;

// Inizializza Prisma con retry logic
async function initializePrisma() {
  if (prisma && isConnected) return prisma;
  
  try {
    if (!prisma) {
      prisma = new PrismaClient();
    }
    
    // Test connessione
    await prisma.$connect();
    isConnected = true;
    console.log('✅ [TRIAL SCHEDULER] Connesso al database');
    return prisma;
  } catch (error) {
    console.error('❌ [TRIAL SCHEDULER] Errore connessione database:', error.message);
    isConnected = false;
    return null;
  }
}

/**
 * Aggiorna automaticamente lo status dei trial scaduti
 */
async function expireTrials() {
  try {
    // Verifica connessione database
    const db = await initializePrisma();
    if (!db) {
      console.log('⚠️  [CRON] Database non disponibile, salto controllo trial scaduti');
      return;
    }
    
    console.log('🕒 [CRON] Controllo trial scaduti...');
    
    const now = new Date();
    
    // Trova tutti i trial con status 'active' ma con endDate nel passato
    const expiredTrials = await db.trial.findMany({
      where: {
        status: 'active',
        endDate: {
          lt: now
        }
      },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });
    
    if (expiredTrials.length === 0) {
      console.log('✅ [CRON] Nessun trial da aggiornare');
      return;
    }
    
    console.log(`⚠️  [CRON] Trovati ${expiredTrials.length} trial scaduti da aggiornare`);
    
    // Aggiorna tutti i trial scaduti
    const result = await db.trial.updateMany({
      where: {
        status: 'active',
        endDate: {
          lt: now
        }
      },
      data: {
        status: 'expired'
      }
    });
    
    console.log(`✅ [CRON] ${result.count} trial aggiornati a status 'expired'`);
    
    // Log dettagliato dei trial scaduti
    for (const trial of expiredTrials) {
      console.log(`   - ${trial.productName} per ${trial.user.email} (scaduto il ${trial.endDate.toLocaleDateString('it-IT')})`);
    }
    
  } catch (error) {
    console.error('❌ [CRON] Errore durante l\'aggiornamento dei trial scaduti:', error);
  }
}

/**
 * Invia promemoria per trial in scadenza (7, 3, 1 giorni prima)
 */
async function sendExpiringReminders() {
  try {
    // Verifica connessione database
    const db = await initializePrisma();
    if (!db) {
      console.log('⚠️  [CRON] Database non disponibile, salto controllo promemoria');
      return;
    }
    
    console.log('📧 [CRON] Controllo trial in scadenza per invio promemoria...');
    
    const now = new Date();
    
    // Trova trial che scadono tra 1, 3 o 7 giorni
    const expiringTrials = await db.trial.findMany({
      where: {
        status: 'active',
        endDate: {
          gte: now,
          lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // Prossimi 7 giorni
        }
      },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });
    
    if (expiringTrials.length === 0) {
      console.log('✅ [CRON] Nessun trial in scadenza nei prossimi 7 giorni');
      return;
    }
    
    console.log(`📧 [CRON] Trovati ${expiringTrials.length} trial in scadenza`);
    
    for (const trial of expiringTrials) {
      const daysRemaining = Math.ceil((trial.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // Invia promemoria solo a 7, 3 e 1 giorni
      if (daysRemaining === 7 || daysRemaining === 3 || daysRemaining === 1) {
        console.log(`   📧 Promemoria per ${trial.user.email}: ${trial.productName} scade tra ${daysRemaining} giorni`);
        
        // TODO: Implementare invio email
        // await emailService.sendTrialExpiring(trial.user.email, trial.user.name, daysRemaining);
      }
    }
    
  } catch (error) {
    console.error('❌ [CRON] Errore durante l\'invio dei promemoria:', error);
  }
}

/**
 * Inizializza i job schedulati
 */
export async function initializeTrialScheduler() {
  console.log('🚀 Inizializzazione Trial Scheduler...\n');
  
  // Job 1: Aggiorna trial scaduti ogni giorno alle 00:00
  cron.schedule('0 0 * * *', async () => {
    console.log('\n🕐 [CRON JOB] Esecuzione giornaliera - Aggiornamento trial scaduti');
    await expireTrials();
  }, {
    timezone: "Europe/Rome"
  });
  
  console.log('✅ Job schedulato: Aggiornamento trial scaduti (ogni giorno alle 00:00)');
  
  // Job 2: Controlla trial in scadenza ogni giorno alle 09:00
  cron.schedule('0 9 * * *', async () => {
    console.log('\n🕐 [CRON JOB] Esecuzione giornaliera - Promemoria trial in scadenza');
    await sendExpiringReminders();
  }, {
    timezone: "Europe/Rome"
  });
  
  console.log('✅ Job schedulato: Promemoria trial in scadenza (ogni giorno alle 09:00)');
  
  // Job 3: Controllo ogni ora per sicurezza (opzionale, per ambienti di sviluppo)
  if (process.env.NODE_ENV === 'development') {
    cron.schedule('0 * * * *', async () => {
      console.log('\n🕐 [CRON JOB] Controllo orario (dev mode)');
      await expireTrials();
    }, {
      timezone: "Europe/Rome"
    });
    
    console.log('✅ Job schedulato: Controllo orario trial (solo in development)');
  }
  
  console.log('\n🎯 Trial Scheduler attivo!\n');
  
  // Ritarda l'esecuzione iniziale di 5 secondi per dare tempo al database di connettersi
  console.log('🔄 Esecuzione iniziale dei job tra 5 secondi...\n');
  setTimeout(async () => {
    await expireTrials();
  }, 5000);
}

/**
 * Esporta funzioni per uso manuale
 */
export { expireTrials, sendExpiringReminders };
