import { PrismaClient } from '@prisma/client';
import { seedRoles } from './seeds/roles';
import { seedUsers } from './seeds/users';
import { seedOutlets } from './seeds/outlets';
import { seedWarehouses } from './seeds/warehouses';
import { seedAccounts } from './seeds/accounts';
import { seedUnits } from './seeds/units';
import { seedCategories } from './seeds/categories';
import { seedProducts } from './seeds/products';
import { seedCustomers } from './seeds/customers';
import { seedSuppliers } from './seeds/suppliers';
import { seedSettings } from './seeds/settings';
import { seedInventory } from './seeds/inventory';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Core Data
  const { ownerRole } = await seedRoles(prisma);
  const mainOutlet = await seedOutlets(prisma);
  await seedUsers(prisma, ownerRole.id, mainOutlet.id);

  // 2. Master Data
  const warehouses = await seedWarehouses(prisma);
  await seedAccounts(prisma);
  await seedUnits(prisma);
  await seedCategories(prisma);
  await seedSettings(prisma);

  // 3. Entity Data
  const productData = await seedProducts(prisma);
  await seedCustomers(prisma);
  await seedSuppliers(prisma);

  // 4. Operational Data (Inventory)
  await seedInventory(prisma, productData.variants, warehouses);

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Default credentials:');
  console.log('   Username: admin');
  console.log('   Password: admin123');
  console.log('   PIN: 123456');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
