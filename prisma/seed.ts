import bcrypt from 'bcryptjs';
import config from '../src/app/config';
import prisma from '../src/app/utils/prisma';

async function seedSuperAdmin() {
  try {
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    });

    if (existingAdmin) {
      console.log('✅ Super Admin already exists!');
      return;
    }

    const hashedPassword = await bcrypt.hash('admin@123', config.bcryptSaltRounds);

    await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: 'admin@gmail.com',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        phone: '+1234567890'
      }
    });

    console.log('🚀 Super Admin created successfully!');
    console.log('Email: superadmin@rentalhub.com');
    console.log('Password: superadmin123');
  } catch (error) {
    console.error('❌ Failed to seed Super Admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedSuperAdmin();
