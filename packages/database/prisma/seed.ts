import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Hash password using bcrypt
function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12);
}

// Hash PIN using bcrypt
function hashPin(pin: string): string {
  return bcrypt.hashSync(pin, 12);
}

async function main() {
  console.log('🌱 Seeding database...');

  // Create default roles
  const ownerRole = await prisma.role.upsert({
    where: { name: 'owner' },
    update: {
      permissions: {
        deleteMany: {},
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
          { module: 'categories', action: 'create' },
          { module: 'categories', action: 'read' },
          { module: 'categories', action: 'update' },
          { module: 'categories', action: 'delete' },
          { module: 'audit-log', action: 'read' },
        ],
      },
    },
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
          { module: 'categories', action: 'create' },
          { module: 'categories', action: 'read' },
          { module: 'categories', action: 'update' },
          { module: 'categories', action: 'delete' },
          { module: 'audit-log', action: 'read' },
        ],
      },
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {
      permissions: {
        deleteMany: {},
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
          { module: 'categories', action: 'create' },
          { module: 'categories', action: 'read' },
          { module: 'categories', action: 'update' },
          { module: 'categories', action: 'delete' },
          { module: 'audit-log', action: 'read' },
        ],
      },
    },
    create: {
      name: 'admin',
      description: 'Administrator dengan akses manajemen',
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
          { module: 'categories', action: 'create' },
          { module: 'categories', action: 'read' },
          { module: 'categories', action: 'update' },
          { module: 'categories', action: 'delete' },
          { module: 'audit-log', action: 'read' },
        ],
      },
    },
  });

  const kasirRole = await prisma.role.upsert({
    where: { name: 'kasir' },
    update: {
      permissions: {
        deleteMany: {},
        create: [
          { module: 'dashboard', action: 'read' },
          { module: 'pos', action: 'create' },
          { module: 'pos', action: 'read' },
          { module: 'products', action: 'read' },
          { module: 'categories', action: 'read' },
          { module: 'sales', action: 'read' },
        ],
      },
    },
    create: {
      name: 'kasir',
      description: 'Kasir dengan akses POS',
      permissions: {
        create: [
          { module: 'dashboard', action: 'read' },
          { module: 'pos', action: 'create' },
          { module: 'pos', action: 'read' },
          { module: 'products', action: 'read' },
          { module: 'categories', action: 'read' },
          { module: 'sales', action: 'read' },
        ],
      },
    },
  });

  const gudangRole = await prisma.role.upsert({
    where: { name: 'gudang' },
    update: {
      permissions: {
        deleteMany: {},
        create: [
          { module: 'dashboard', action: 'read' },
          { module: 'products', action: 'read' },
          { module: 'categories', action: 'read' },
          { module: 'inventory', action: 'create' },
          { module: 'inventory', action: 'read' },
          { module: 'inventory', action: 'update' },
          { module: 'purchases', action: 'read' },
        ],
      },
    },
    create: {
      name: 'gudang',
      description: 'Staff gudang dengan akses inventory',
      permissions: {
        create: [
          { module: 'dashboard', action: 'read' },
          { module: 'products', action: 'read' },
          { module: 'categories', action: 'read' },
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
    update: {
      pin: hashPin('123456'),
    },
    create: {
      username: 'admin',
      email: 'admin@bizflow.local',
      password: hashPassword('Admin123'),
      pin: hashPin('123456'),
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

  // Create categories (Hierarchical)
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

  const electronicsCategory = await prisma.category.upsert({
    where: { id: 'electronics' },
    update: {},
    create: {
      id: 'electronics',
      name: 'Elektronik',
      description: 'Barang elektronik dan gadget',
      isActive: true,
    },
  });

  const computersCategory = await prisma.category.upsert({
    where: { id: 'computers' },
    update: {},
    create: {
      id: 'computers',
      name: 'Komputer & Laptop',
      parentId: electronicsCategory.id,
      isActive: true,
    },
  });

  const phonesCategory = await prisma.category.upsert({
    where: { id: 'phones' },
    update: {},
    create: {
      id: 'phones',
      name: 'Handphone & Tablet',
      parentId: electronicsCategory.id,
      isActive: true,
    },
  });

  const foodCategory = await prisma.category.upsert({
    where: { id: 'food-beverage' },
    update: {},
    create: {
      id: 'food-beverage',
      name: 'Makanan & Minuman',
      isActive: true,
    },
  });

  const snacksCategory = await prisma.category.upsert({
    where: { id: 'snacks' },
    update: {},
    create: {
      id: 'snacks',
      name: 'Makanan Ringan',
      parentId: foodCategory.id,
      isActive: true,
    },
  });

  const drinksCategory = await prisma.category.upsert({
    where: { id: 'drinks' },
    update: {},
    create: {
      id: 'drinks',
      name: 'Minuman',
      parentId: foodCategory.id,
      isActive: true,
    },
  });

  console.log('✅ Categories created:', {
    general: generalCategory.name,
    electronics: electronicsCategory.name,
    computers: computersCategory.name,
    food: foodCategory.name,
  });

  // Create default app settings
  const defaultSettings = [
    // Company settings
    {
      key: 'company_name',
      value: '',
      type: 'string',
      category: 'company',
      label: 'Nama Perusahaan',
    },
    {
      key: 'company_address',
      value: '',
      type: 'string',
      category: 'company',
      label: 'Alamat Perusahaan',
    },
    {
      key: 'company_phone',
      value: '',
      type: 'string',
      category: 'company',
      label: 'Telepon',
    },
    {
      key: 'company_email',
      value: '',
      type: 'string',
      category: 'company',
      label: 'Email',
    },
    {
      key: 'company_tax_id',
      value: '',
      type: 'string',
      category: 'company',
      label: 'NPWP',
    },
    {
      key: 'company_logo',
      value: '',
      type: 'string',
      category: 'company',
      label: 'Logo URL',
    },

    // Tax settings
    {
      key: 'default_tax_rate',
      value: '11',
      type: 'number',
      category: 'tax',
      label: 'Tarif Pajak Default (%)',
    },
    {
      key: 'tax_inclusive',
      value: 'false',
      type: 'boolean',
      category: 'tax',
      label: 'Harga Termasuk Pajak',
    },

    // Receipt settings
    {
      key: 'receipt_header',
      value: '',
      type: 'string',
      category: 'receipt',
      label: 'Header Struk',
    },
    {
      key: 'receipt_footer',
      value: 'Terima kasih atas kunjungan Anda',
      type: 'string',
      category: 'receipt',
      label: 'Footer Struk',
    },
    {
      key: 'receipt_show_logo',
      value: 'true',
      type: 'boolean',
      category: 'receipt',
      label: 'Tampilkan Logo',
    },

    // Display settings
    {
      key: 'currency_code',
      value: 'IDR',
      type: 'string',
      category: 'display',
      label: 'Kode Mata Uang',
    },
    {
      key: 'currency_symbol',
      value: 'Rp',
      type: 'string',
      category: 'display',
      label: 'Simbol Mata Uang',
    },
    {
      key: 'date_format',
      value: 'DD/MM/YYYY',
      type: 'string',
      category: 'display',
      label: 'Format Tanggal',
    },
    {
      key: 'timezone',
      value: 'Asia/Jakarta',
      type: 'string',
      category: 'display',
      label: 'Zona Waktu',
    },

    // General settings
    {
      key: 'language',
      value: 'id',
      type: 'string',
      category: 'general',
      label: 'Bahasa',
    },
    {
      key: 'session_timeout',
      value: '30',
      type: 'number',
      category: 'general',
      label: 'Session Timeout (menit)',
    },
  ];

  for (const setting of defaultSettings) {
    await prisma.appSettings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log('✅ App settings created:', defaultSettings.length, 'settings');

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
