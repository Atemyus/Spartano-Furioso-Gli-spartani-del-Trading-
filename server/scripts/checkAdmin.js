#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';
import readline from 'readline';

const prisma = new PrismaClient();

// Colori per output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

async function main() {
  console.log(colors.cyan + '\n🔍 VERIFICA UTENTI ADMIN 🔍' + colors.reset);
  console.log('=====================================\n');

  try {
    // Trova tutti gli admin
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        emailVerified: true,
        isActive: true,
        createdAt: true,
        lastLogin: true
      }
    });

    if (admins.length === 0) {
      console.log(colors.yellow + '⚠️  Nessun admin trovato nel database!' + colors.reset);
      console.log('\nEsegui: npm run admin:create per creare un admin.\n');
    } else {
      console.log(colors.green + `✅ Trovati ${admins.length} admin nel database:\n` + colors.reset);
      
      admins.forEach((admin, index) => {
        console.log(colors.blue + `\n${index + 1}. ${admin.name}` + colors.reset);
        console.log(`   Email: ${admin.email}`);
        console.log(`   ID: ${admin.id}`);
        console.log(`   Status: ${admin.status}`);
        console.log(`   Email verificata: ${admin.emailVerified ? '✅' : '❌'}`);
        console.log(`   Attivo: ${admin.isActive ? '✅' : '❌'}`);
        console.log(`   Creato: ${admin.createdAt.toLocaleString('it-IT')}`);
        console.log(`   Ultimo login: ${admin.lastLogin ? admin.lastLogin.toLocaleString('it-IT') : 'Mai'}`);
      });

      console.log(colors.green + '\n✅ Tutti questi utenti possono accedere al pannello admin.' + colors.reset);
    }

    // Conta tutti gli utenti
    const totalUsers = await prisma.user.count();
    const regularUsers = await prisma.user.count({
      where: { role: 'USER' }
    });

    console.log(colors.cyan + '\n📊 Statistiche database:' + colors.reset);
    console.log(`   Totale utenti: ${totalUsers}`);
    console.log(`   Admin: ${admins.length}`);
    console.log(`   Utenti normali: ${regularUsers}`);

  } catch (error) {
    console.error(colors.red + '\n❌ Errore:', error.message + colors.reset);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Avvia lo script
main().catch(error => {
  console.error(colors.red + '❌ Errore fatale:', error + colors.reset);
  process.exit(1);
});
