// Script per vedere tutti gli utenti nel database
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listUsers() {
  try {
    console.log('\n📋 UTENTI REGISTRATI NEL DATABASE\n');
    console.log('='.repeat(60));
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (users.length === 0) {
      console.log('\n⚠️  NESSUN UTENTE TROVATO!\n');
      console.log('Devi prima registrarti al sito:\n');
      console.log('1. Vai su: http://localhost:5173/register');
      console.log('2. Compila il form di registrazione');
      console.log('3. Poi prova ad iscriverti alla newsletter\n');
      return;
    }

    console.log(`\n✅ Trovati ${users.length} utenti:\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. 📧 ${user.email}`);
      console.log(`   👤 Nome: ${user.name || 'Non specificato'}`);
      console.log(`   🎖️  Ruolo: ${user.role}`);
      console.log(`   📅 Registrato: ${new Date(user.createdAt).toLocaleString('it-IT')}`);
      console.log('');
    });

    console.log('='.repeat(60));
    console.log('\n💡 USA UNA DI QUESTE EMAIL per iscriverti alla newsletter!\n');

  } catch (error) {
    console.error('❌ Errore:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
