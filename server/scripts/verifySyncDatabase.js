import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

/**
 * Script per verificare la sincronizzazione tra database Prisma e frontend
 */
async function verifySyncDatabase() {
  console.log('🔍 VERIFICA SINCRONIZZAZIONE DATABASE ↔ FRONTEND\n');
  console.log('═'.repeat(80));
  
  try {
    // 1. VERIFICA TRIAL
    console.log('\n📊 1. VERIFICA TRIAL\n');
    
    const trials = await prisma.trial.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`✅ Totale trial in Prisma: ${trials.length}\n`);
    
    trials.forEach(trial => {
      const now = new Date();
      const endDate = new Date(trial.endDate);
      const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      const isActive = now < endDate;
      
      console.log(`${isActive ? '✅' : '❌'} ${trial.productName}`);
      console.log(`   User: ${trial.user.email}`);
      console.log(`   Status DB: ${trial.status}`);
      console.log(`   Status Reale: ${isActive ? 'active' : 'expired'}`);
      console.log(`   Giorni rimanenti: ${daysRemaining}`);
      console.log(`   Inizio: ${trial.startDate.toLocaleDateString('it-IT')}`);
      console.log(`   Fine: ${trial.endDate.toLocaleDateString('it-IT')}`);
      console.log('');
    });
    
    // 2. VERIFICA PRODOTTI
    console.log('═'.repeat(80));
    console.log('\n📦 2. VERIFICA PRODOTTI\n');
    
    const productsFile = path.join(__dirname, '../database/data/products.json');
    const productsData = await fs.readFile(productsFile, 'utf-8');
    const products = JSON.parse(productsData);
    
    console.log(`✅ Totale prodotti: ${products.length}\n`);
    
    products.forEach(product => {
      console.log(`${product.active ? '✅' : '❌'} ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Categoria: ${product.category}`);
      console.log(`   Trial Days: ${product.trialDays} giorni`);
      console.log(`   Prezzo: €${product.price}`);
      console.log(`   Attivo: ${product.active ? 'Sì' : 'No'}`);
      console.log('');
    });
    
    // 3. VERIFICA CORSI
    console.log('═'.repeat(80));
    console.log('\n📚 3. VERIFICA CONTENUTI CORSI\n');
    
    const courseFile = path.join(__dirname, '../data/course-content.json');
    const courseData = await fs.readFile(courseFile, 'utf-8');
    const courses = JSON.parse(courseData);
    
    const courseIds = Object.keys(courses.courses);
    console.log(`✅ Totale corsi: ${courseIds.length}\n`);
    
    courseIds.forEach(courseId => {
      const course = courses.courses[courseId];
      const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
      const trialLessons = course.modules.reduce((sum, m) => 
        sum + m.lessons.filter(l => l.isTrialContent).length, 0
      );
      
      // Conta lezioni con download button
      const lessonsWithDownload = course.modules.reduce((sum, m) => 
        sum + m.lessons.filter(l => l.downloadButton?.enabled).length, 0
      );
      
      console.log(`✅ ${course.name}`);
      console.log(`   ID: ${courseId}`);
      console.log(`   Moduli: ${course.modules.length}`);
      console.log(`   Lezioni totali: ${totalLessons}`);
      console.log(`   Lezioni trial: ${trialLessons}`);
      console.log(`   Lezioni con download: ${lessonsWithDownload}`);
      console.log('');
      
      // Mostra lezioni con download button
      if (lessonsWithDownload > 0) {
        console.log('   📥 Lezioni con pulsante download:');
        course.modules.forEach(module => {
          module.lessons.forEach(lesson => {
            if (lesson.downloadButton?.enabled) {
              const hasFile = lesson.downloadButton.fileUrl ? '✅' : '⏳';
              console.log(`   ${hasFile} Modulo ${module.order} - ${lesson.title}`);
              if (lesson.downloadButton.fileUrl) {
                console.log(`      File: ${lesson.downloadButton.fileName}`);
              } else {
                console.log(`      File: Non ancora caricato`);
              }
            }
          });
        });
        console.log('');
      }
    });
    
    // 4. VERIFICA UTENTI
    console.log('═'.repeat(80));
    console.log('\n👥 4. VERIFICA UTENTI\n');
    
    const users = await prisma.user.findMany({
      include: {
        trials: true
      }
    });
    
    console.log(`✅ Totale utenti in Prisma: ${users.length}\n`);
    
    users.forEach(user => {
      const activeTrials = user.trials.filter(t => {
        const now = new Date();
        const endDate = new Date(t.endDate);
        return now < endDate && t.status === 'active';
      });
      
      console.log(`${user.isActive ? '✅' : '❌'} ${user.email}`);
      console.log(`   Nome: ${user.name || 'N/A'}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Status: ${user.status}`);
      console.log(`   Email verificata: ${user.emailVerified ? 'Sì' : 'No'}`);
      console.log(`   Trial attivi: ${activeTrials.length}`);
      console.log(`   Trial totali: ${user.trials.length}`);
      console.log('');
    });
    
    // 5. RIEPILOGO SINCRONIZZAZIONE
    console.log('═'.repeat(80));
    console.log('\n📋 5. RIEPILOGO SINCRONIZZAZIONE\n');
    
    const activeTrialsCount = trials.filter(t => {
      const now = new Date();
      const endDate = new Date(t.endDate);
      return now < endDate && t.status === 'active';
    }).length;
    
    const expiredTrialsCount = trials.filter(t => {
      const now = new Date();
      const endDate = new Date(t.endDate);
      return now >= endDate || t.status === 'expired';
    }).length;
    
    const wrongStatusCount = trials.filter(t => {
      const now = new Date();
      const endDate = new Date(t.endDate);
      const isActuallyActive = now < endDate;
      const statusInDB = t.status;
      const correctStatus = isActuallyActive ? 'active' : 'expired';
      return statusInDB !== correctStatus;
    }).length;
    
    console.log('📊 STATISTICHE:');
    console.log(`   Utenti totali: ${users.length}`);
    console.log(`   Prodotti totali: ${products.length}`);
    console.log(`   Prodotti attivi: ${products.filter(p => p.active).length}`);
    console.log(`   Corsi totali: ${courseIds.length}`);
    console.log(`   Trial totali: ${trials.length}`);
    console.log(`   Trial attivi: ${activeTrialsCount}`);
    console.log(`   Trial scaduti: ${expiredTrialsCount}`);
    console.log('');
    
    console.log('🔄 SINCRONIZZAZIONE:');
    if (wrongStatusCount === 0) {
      console.log('   ✅ Tutti i trial hanno lo status corretto');
    } else {
      console.log(`   ⚠️  ${wrongStatusCount} trial con status errato`);
    }
    
    // Verifica corrispondenza prodotti-corsi
    const formationProducts = products.filter(p => p.category === 'Formazione');
    const coursesInDB = courseIds.length;
    
    if (formationProducts.length === coursesInDB) {
      console.log('   ✅ Prodotti formazione sincronizzati con corsi');
    } else {
      console.log(`   ⚠️  Disallineamento: ${formationProducts.length} prodotti formazione vs ${coursesInDB} corsi`);
    }
    
    // Verifica trial per ogni prodotto
    console.log('');
    console.log('📦 TRIAL PER PRODOTTO:');
    products.forEach(product => {
      const productTrials = trials.filter(t => t.productId === product.id);
      const activeProductTrials = productTrials.filter(t => {
        const now = new Date();
        const endDate = new Date(t.endDate);
        return now < endDate && t.status === 'active';
      });
      console.log(`   ${product.name}: ${activeProductTrials.length} attivi / ${productTrials.length} totali`);
    });
    
    console.log('');
    console.log('═'.repeat(80));
    console.log('\n✅ VERIFICA COMPLETATA!\n');
    
    // 6. RACCOMANDAZIONI
    if (wrongStatusCount > 0) {
      console.log('💡 RACCOMANDAZIONI:');
      console.log('   - Esegui: npm run trials:verify per correggere gli status');
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Errore durante la verifica:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Esegui lo script
verifySyncDatabase()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Errore fatale:', error);
    process.exit(1);
  });
