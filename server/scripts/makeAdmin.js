#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USERS_FILE = path.join(__dirname, '../database/data/users.json');

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
  console.log(colors.magenta + '\n🛡️  SPARTAN ADMIN MANAGER 🛡️' + colors.reset);
  console.log('================================\n');

  try {
    // Leggi gli utenti esistenti
    const usersData = fs.readFileSync(USERS_FILE, 'utf-8');
    const users = JSON.parse(usersData);

    if (users.length === 0) {
      console.log(colors.yellow + '⚠️  Nessun utente trovato nel database.' + colors.reset);
      rl.close();
      return;
    }

    // Mostra lista utenti
    console.log(colors.blue + 'Utenti attuali:' + colors.reset);
    console.log('------------------------------------');
    users.forEach((user, index) => {
      const roleColor = user.role === 'admin' ? colors.green : colors.reset;
      const roleLabel = user.role === 'admin' ? ' [ADMIN]' : ' [USER]';
      console.log(`${index + 1}. ${user.email} - ${user.name}${roleColor}${roleLabel}${colors.reset}`);
    });
    console.log('------------------------------------\n');

    // Chiedi cosa fare
    console.log('Cosa vuoi fare?');
    console.log('1. Nominare un utente amministratore');
    console.log('2. Rimuovere privilegi admin');
    console.log('3. Vedere solo gli admin');
    console.log('4. Esci\n');

    const action = await question('Scegli un\'opzione (1-4): ');

    if (action === '4') {
      console.log(colors.yellow + '\n👋 Arrivederci!' + colors.reset);
      rl.close();
      return;
    }

    if (action === '3') {
      // Mostra solo admin
      const admins = users.filter(u => u.role === 'admin');
      if (admins.length === 0) {
        console.log(colors.yellow + '\n⚠️  Nessun amministratore trovato.' + colors.reset);
      } else {
        console.log(colors.green + '\n👑 Amministratori attuali:' + colors.reset);
        admins.forEach(admin => {
          console.log(`   • ${admin.email} (${admin.name})`);
        });
      }
      rl.close();
      return;
    }

    if (action === '1' || action === '2') {
      const email = await question('\nInserisci l\'email dell\'utente: ');
      
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        console.log(colors.red + `\n❌ Utente con email "${email}" non trovato.` + colors.reset);
        rl.close();
        return;
      }

      if (action === '1') {
        // Nomina admin
        if (user.role === 'admin') {
          console.log(colors.yellow + `\n⚠️  ${user.name} è già un amministratore!` + colors.reset);
        } else {
          user.role = 'admin';
          user.updatedAt = new Date().toISOString();
          
          // Salva modifiche
          fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
          
          console.log(colors.green + `\n✅ ${user.name} è ora un AMMINISTRATORE!` + colors.reset);
          console.log(colors.blue + `   Email: ${user.email}` + colors.reset);
          console.log(colors.blue + `   Ruolo: ${user.role}` + colors.reset);
          console.log('\n🔑 L\'utente può ora accedere al pannello admin su:');
          console.log('   http://localhost:5173/admin\n');
        }
      } else {
        // Rimuovi admin
        if (user.role !== 'admin') {
          console.log(colors.yellow + `\n⚠️  ${user.name} non è un amministratore.` + colors.reset);
        } else {
          // Controlla se è l'ultimo admin
          const adminCount = users.filter(u => u.role === 'admin').length;
          if (adminCount === 1) {
            console.log(colors.red + '\n❌ Non puoi rimuovere l\'ultimo amministratore!' + colors.reset);
            console.log('    Nomina prima un altro admin.');
          } else {
            user.role = 'user';
            user.updatedAt = new Date().toISOString();
            
            // Salva modifiche
            fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
            
            console.log(colors.green + `\n✅ Privilegi admin rimossi da ${user.name}.` + colors.reset);
            console.log(colors.blue + `   Email: ${user.email}` + colors.reset);
            console.log(colors.blue + `   Ruolo: ${user.role}` + colors.reset);
          }
        }
      }
    } else {
      console.log(colors.red + '\n❌ Opzione non valida.' + colors.reset);
    }

  } catch (error) {
    console.error(colors.red + '\n❌ Errore:', error.message + colors.reset);
  } finally {
    rl.close();
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
