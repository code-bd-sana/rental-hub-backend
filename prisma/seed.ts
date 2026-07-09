import bcrypt from 'bcryptjs';
import config from '../src/app/config';
import prisma from '../src/app/utils/prisma';

async function seedSuperAdmin() {
  try {
    const adminEmail = config.admin.email;
    const adminPassword = config.admin.password;
    const hashedPassword = await bcrypt.hash(adminPassword, config.bcryptSaltRounds);

    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    });

    if (existingAdmin) {
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: 'Super Admin'
        }
      });
      console.log('✅ Super Admin overridden/updated successfully!');
    } else {
      await prisma.user.create({
        data: {
          name: 'Super Admin',
          email: adminEmail,
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          phone: '+1234567890'
        }
      });
      console.log('🚀 Super Admin created successfully!');
    }

    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
  } catch (error) {
    console.error('❌ Failed to seed Super Admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedSuperAdmin();
