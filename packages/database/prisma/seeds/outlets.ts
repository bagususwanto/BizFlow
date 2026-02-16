import { PrismaClient } from '@prisma/client';

export async function seedOutlets(prisma: PrismaClient) {
  const mainOutlet = await prisma.outlet.upsert({
    where: { code: 'MAIN' },
    update: {},
    create: {
      code: 'MAIN',
      name: 'Outlet Utama',
      address: 'Jl. Contoh No. 123',
      phone: '021-12345678',
      isActive: true,
    },
  });

  console.log('✅ Outlet created:', mainOutlet.name);
  return mainOutlet;
}
