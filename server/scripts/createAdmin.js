#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import readline from 'readline';

const prisma = new PrismaClient();

// Crea interfaccia per input da terminale
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Funzione per leggere domande
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Colori per output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

async function main() {
  console.log(colors.magenta + '\n🛡️  CREA NUOVO ADMIN DIRETTAMENTE 🛡️' + colors.reset);
  console.log('=====================================\n');
  console.log(colors.yellow + 'Questo script crea un nuovo utente amministratore nel database Prisma.' + colors.reset);
  console.log('L\'admin potrà accedere immediatamente al pannello admin.\n');

  try {
    // Raccogli informazioni
    const name = await question('Nome completo: ');
    const email = await question('Email: ');
    const password = await question('Password (minimo 6 caratteri): ');

    // Validazione base
    if (!name || !email || !password) {
      console.log(colors.red + '\n❌ Tutti i campi sono obbligatori!' + colors.reset);
      rl.close();
      await prisma.$disconnect();
      return;
    }

    if (password.length < 6) {
      console.log(colors.red + '\n❌ La password deve essere almeno 6 caratteri!' + colors.reset);
      rl.close();
      await prisma.$disconnect();
      return;
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log(colors.red + '\n❌ Email non valida!' + colors.reset);
      rl.close();
      await prisma.$disconnect();
      return;
    }

    // Verifica se email già esiste nel database
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      console.log(colors.red + `\n❌ Un utente con email "${email}" esiste già!` + colors.reset);
      
      // Offri di aggiornare il ruolo a ADMIN
      const upgrade = await question('\nVuoi aggiornare questo utente a ADMIN? (s/n): ');
      
      if (upgrade.toLowerCase() === 's' || upgrade.toLowerCase() === 'si') {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { 
            role: 'ADMIN',
            emailVerified: true,
            status: 'active'
          }
        });
        
        console.log(colors.green + '\n✅ UTENTE AGGIORNATO A ADMIN CON SUCCESSO!' + colors.reset);
        console.log(colors.blue + `Email: ${email}` + colors.reset);
        console.log(colors.yellow + 'L\'utente può ora accedere al pannello admin con la sua password esistente.' + colors.reset);
      }
      
      rl.close();
      await prisma.$disconnect();
      return;
    }

    // Conferma creazione
    console.log(colors.blue + '\n📋 Riepilogo nuovo admin:' + colors.reset);
    console.log(`   Nome: ${name}`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Ruolo: ADMIN`);
    
    const confirm = await question('\nConfermi creazione? (s/n): ');
    
    if (confirm.toLowerCase() !== 's' && confirm.toLowerCase() !== 'si') {
      console.log(colors.yellow + '\n❌ Creazione annullata.' + colors.reset);
      rl.close();
      await prisma.$disconnect();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crea nuovo utente admin nel database Prisma
    const newAdmin = await prisma.user.create({
      data: {
        name: name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'ADMIN',
        status: 'active',
        emailVerified: true,
        isActive: true
      }
    });

    console.log(colors.green + '\n✅ ADMIN CREATO CON SUCCESSO NEL DATABASE!' + colors.reset);
    console.log('\n📝 Credenziali admin:');
    console.log('--------------------------------');
    console.log(colors.blue + `Email: ${email}` + colors.reset);
    console.log(colors.blue + `Password: ${password}` + colors.reset);
    console.log(colors.yellow + '\n⚠️  IMPORTANTE: Conserva queste credenziali in modo sicuro!' + colors.reset);
    console.log('\nL\'admin può ora accedere a:');
    console.log('   • Login Admin: POST /api/auth/admin/login');
    console.log('   • Admin Panel: /admin (dopo il login)');
    console.log('\n🔐 ID utente nel database:', newAdmin.id);

  } catch (error) {
    console.error(colors.red + '\n❌ Errore:', error.message + colors.reset);
    console.error(error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

// Gestisci chiusura pulita
rl.on('close', () => {
  process.exit(0);
});

// Avvia lo script
main().catch(error => {
  console.error(colors.red + '❌ Errore fatale:', error + colors.reset);
  process.exit(1);
});
