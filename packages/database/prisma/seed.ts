import { PrismaClient } from '@prisma/client';
import { hash } from 'crypto';

const prisma = new PrismaClient();

// Simple password hash (use bcrypt in production)
function hashPassword(password: string): string {
  return hash('sha256', password);
}

async function main() {
  console.log('🌱 Seeding database...');

  // Create default roles
  const ownerRole = await prisma.role.upsert({
    where: { name: 'owner' },
    update: {},
    create: {
      name: 'owner',
      description: 'Pemilik bisnis dengan akses penuh',
      permissions: {
        create: [
          { module: 'dashboard', action: 'read' },
          { module: 'pos', action: 'create' },
          { module: 'pos', action: 'read' },
          { module: 'pos', action: 'update' },
          { module: 'pos', action: 'delete' },
          { module: 'products', action: 'create' },
          { module: 'products', action: 'read' },
          { module: 'products', action: 'update' },
          { module: 'products', action: 'delete' },
          { module: 'sales', action: 'create' },
          { module: 'sales', action: 'read' },
          { module: 'sales', action: 'update' },
          { module: 'sales', action: 'delete' },
          { module: 'purchases', action: 'create' },
          { module: 'purchases', action: 'read' },
          { module: 'purchases', action: 'update' },
          { module: 'purchases', action: 'delete' },
          { module: 'inventory', action: 'create' },
          { module: 'inventory', action: 'read' },
          { module: 'inventory', action: 'update' },
          { module: 'inventory', action: 'delete' },
          { module: 'finance', action: 'create' },
          { module: 'finance', action: 'read' },
          { module: 'finance', action: 'update' },
          { module: 'finance', action: 'delete' },
          { module: 'reports', action: 'read' },
          { module: 'settings', action: 'create' },
          { module: 'settings', action: 'read' },
          { module: 'settings', action: 'update' },
          { module: 'settings', action: 'delete' },
          { module: 'users', action: 'create' },
          { module: 'users', action: 'read' },
          { module: 'users', action: 'update' },
          { module: 'users', action: 'delete' },
        ],
      },
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrator dengan akses manajemen',
      permissions: {
        create: [
          { module: 'dashboard', action: 'read' },
          { module: 'pos', action: 'create' },
          { module: 'pos', action: 'read' },
          { module: 'pos', action: 'update' },
          { module: 'products', action: 'create' },
          { module: 'products', action: 'read' },
          { module: 'products', action: 'update' },
          { module: 'sales', action: 'create' },
          { module: 'sales', action: 'read' },
          { module: 'sales', action: 'update' },
          { module: 'purchases', action: 'create' },
          { module: 'purchases', action: 'read' },
          { module: 'purchases', action: 'update' },
          { module: 'inventory', action: 'create' },
          { module: 'inventory', action: 'read' },
          { module: 'inventory', action: 'update' },
          { module: 'reports', action: 'read' },
          { module: 'users', action: 'read' },
        ],
      },
    },
  });

  const kasirRole = await prisma.role.upsert({
    where: { name: 'kasir' },
    update: {},
    create: {
      name: 'kasir',
      description: 'Kasir dengan akses POS',
      permissions: {
        create: [
          { module: 'dashboard', action: 'read' },
          { module: 'pos', action: 'create' },
          { module: 'pos', action: 'read' },
          { module: 'products', action: 'read' },
          { module: 'sales', action: 'read' },
        ],
      },
    },
  });

  const gudangRole = await prisma.role.upsert({
    where: { name: 'gudang' },
    update: {},
    create: {
      name: 'gudang',
      description: 'Staff gudang dengan akses inventory',
      permissions: {
        create: [
          { module: 'dashboard', action: 'read' },
          { module: 'products', action: 'read' },
          { module: 'inventory', action: 'create' },
          { module: 'inventory', action: 'read' },
          { module: 'inventory', action: 'update' },
          { module: 'purchases', action: 'read' },
        ],
      },
    },
  });

  console.log('✅ Roles created:', {
    ownerRole: ownerRole.name,
    adminRole: adminRole.name,
    kasirRole: kasirRole.name,
    gudangRole: gudangRole.name,
  });

  // Create default outlet
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

  // Create default admin user
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@bizflow.local',
      password: hashPassword('admin123'),
      pin: '1234',
      name: 'Administrator',
      roleId: ownerRole.id,
      isActive: true,
      outlets: {
        create: {
          outletId: mainOutlet.id,
        },
      },
    },
  });

  console.log('✅ Admin user created:', adminUser.username);

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

  // Create default account (Cash)
  const cashAccount = await prisma.account.upsert({
    where: { code: 'CASH' },
    update: {},
    create: {
      code: 'CASH',
      name: 'Kas',
      type: 'cash',
      balance: 0,
      isActive: true,
    },
  });

  console.log('✅ Account created:', cashAccount.name);

  // Create default unit of measure
  const pcsUnit = await prisma.unitOfMeasure.upsert({
    where: { id: 'pcs' },
    update: {},
    create: {
      id: 'pcs',
      name: 'Pieces',
      symbol: 'pcs',
    },
  });

  console.log('✅ Unit of measure created:', pcsUnit.name);

  // Create default category
  const generalCategory = await prisma.category.upsert({
    where: { id: 'general' },
    update: {},
    create: {
      id: 'general',
      name: 'Umum',
      description: 'Kategori umum',
      isActive: true,
    },
  });

  console.log('✅ Category created:', generalCategory.name);

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Default credentials:');
  console.log('   Username: admin');
  console.log('   Password: admin123');
  console.log('   PIN: 1234');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
