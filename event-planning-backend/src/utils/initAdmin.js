import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Crée le compte admin par défaut s'il n'existe pas
 * Email: admin (sans @ca-ts.fr)
 * Password: admin
 */
export async function initAdminAccount() {
  try {
    const adminEmail = 'admin';

    // Vérifier si le compte admin existe déjà
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      console.log('✅ Compte admin déjà existant');
      return;
    }

    // Créer le compte admin
    const hashedPassword = await bcrypt.hash('admin', 10);

    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'System',
        themePreference: 'light'
      }
    });

    console.log('✅ Compte admin créé avec succès');
    console.log('   Email: admin');
    console.log('   Password: admin');
  } catch (error) {
    console.error('❌ Erreur lors de la création du compte admin:', error);
  }
}
