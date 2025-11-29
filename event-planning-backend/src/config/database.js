import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Gérer la déconnexion proprement
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
