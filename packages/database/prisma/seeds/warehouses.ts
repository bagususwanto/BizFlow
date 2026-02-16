import { PrismaClient } from '@prisma/client';

export async function seedWarehouses(prisma: PrismaClient) {
  // Create default warehouse
  const mainWarehouse = await prisma.warehouse.upsert({
    where: { code: 'WH-MAIN' },
    update: {},
    create: {
      code: 'WH-MAIN',
      name: 'Gudang Utama',
      address: 'Jl. Contoh No. 123',
      isDefault: true,
      isActive: true,
    },
  });

  console.log('✅ Warehouse created:', mainWarehouse.name);

  // Create secondary warehouse
  const storeWarehouse = await prisma.warehouse.upsert({
    where: { code: 'WH-STORE' },
    update: {},
    create: {
      code: 'WH-STORE',
      name: 'Toko Cabang',
      address: 'Jl. Cabang No. 456',
      isDefault: false,
      isActive: true,
    },
  });

  console.log('✅ Secondary warehouse created:', storeWarehouse.name);

  return { mainWarehouse, storeWarehouse };
}
