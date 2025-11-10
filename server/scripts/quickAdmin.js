// Script rapido per creare admin
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createQuickAdmin() {
  try {
    console.log('🔍 Verifico admin esistenti...\n');
    
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      console.log('✅ Admin già esistente:');
      console.log('   Email:', existingAdmin.email);
      console.log('   Nome:', existingAdmin.name);
      console.log('\n📝 Credenziali di login:');
      console.log('   Email: admin@spartanofurioso.com');
      console.log('   Password: Admin123!');
      console.log('\n💡 Se non funziona, elimina e ricrea l\'admin.\n');
      return;
    }

    console.log('📝 Creo nuovo admin...\n');

    const hashedPassword = await bcrypt.hash('Admin123!', 10);

    const admin = await prisma.user.create({
      data: {
        email: 'admin@spartanofurioso.com',
        password: hashedPassword,
        name: 'Admin Spartano',
        role: 'ADMIN',
        isActive: true
      }
    });

    console.log('✅ Admin creato con successo!\n');
    console.log('📧 Email: admin@spartanofurioso.com');
    console.log('🔑 Password: Admin123!');
    console.log('\n🎯 Vai su: http://localhost:5173/admin/login');
    console.log('   Usa le credenziali sopra per accedere.\n');

  } catch (error) {
    console.error('❌ Errore:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createQuickAdmin();
