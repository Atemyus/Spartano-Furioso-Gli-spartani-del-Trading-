const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function updateAdminCredentials() {
  try {
    console.log('\n🔐 AGGIORNA CREDENZIALI ADMIN - Spartano Furioso\n');

    // Trova admin esistente
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    if (!existingAdmin) {
      console.log('❌ Nessun admin trovato nel database!');
      console.log('💡 Esegui prima: npm run admin:create\n');
      rl.close();
      await prisma.$disconnect();
      return;
    }

    console.log('📋 Admin attuale:');
    console.log(`   Nome: ${existingAdmin.name}`);
    console.log(`   Email: ${existingAdmin.email}`);
    console.log(`   ID: ${existingAdmin.id}\n`);

    // Chiedi nuova email
    const newEmail = await question('📧 Nuova email (lascia vuoto per mantenere attuale): ');
    
    // Chiedi nuova password
    const newPassword = await question('🔑 Nuova password (minimo 8 caratteri): ');

    if (!newPassword || newPassword.length < 8) {
      console.log('\n❌ Password troppo corta! Minimo 8 caratteri.\n');
      rl.close();
      await prisma.$disconnect();
      return;
    }

    // Conferma
    console.log('\n📝 RIEPILOGO MODIFICHE:');
    if (newEmail && newEmail.trim()) {
      console.log(`   Email: ${existingAdmin.email} → ${newEmail.trim()}`);
    } else {
      console.log(`   Email: ${existingAdmin.email} (invariata)`);
    }
    console.log(`   Password: ******** → ${newPassword.replace(/./g, '*')}`);
    
    const confirm = await question('\n❓ Confermi le modifiche? (s/n): ');

    if (confirm.toLowerCase() !== 's' && confirm.toLowerCase() !== 'si') {
      console.log('\n❌ Operazione annullata.\n');
      rl.close();
      await prisma.$disconnect();
      return;
    }

    // Hash nuova password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Aggiorna database
    const updateData = {
      password: hashedPassword
    };

    if (newEmail && newEmail.trim()) {
      updateData.email = newEmail.trim();
    }

    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: updateData
    });

    console.log('\n✅ CREDENZIALI AGGIORNATE CON SUCCESSO!\n');
    console.log('📋 NUOVE CREDENZIALI:');
    console.log(`   Email: ${newEmail && newEmail.trim() ? newEmail.trim() : existingAdmin.email}`);
    console.log(`   Password: ${newPassword}`);
    console.log('\n💡 IMPORTANTE:');
    console.log('   1. Salva queste credenziali in un posto sicuro');
    console.log('   2. Non condividerle con nessuno');
    console.log('   3. Usa un password manager (1Password, Bitwarden)');
    console.log('\n🎯 Accedi al pannello admin:');
    console.log('   http://localhost:5173/admin\n');

  } catch (error) {
    console.error('\n❌ Errore:', error.message);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

updateAdminCredentials();
