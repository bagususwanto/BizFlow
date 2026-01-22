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
          { module: 'units', action: 'create' },
          { module: 'units', action: 'read' },
          { module: 'units', action: 'update' },
          { module: 'units', action: 'delete' },
          { module: 'outlets', action: 'create' },
          { module: 'outlets', action: 'read' },
          { module: 'outlets', action: 'update' },
          { module: 'outlets', action: 'delete' },
          { module: 'roles', action: 'create' },
          { module: 'roles', action: 'read' },
          { module: 'roles', action: 'update' },
          { module: 'roles', action: 'delete' },
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
          { module: 'units', action: 'create' },
          { module: 'units', action: 'read' },
          { module: 'units', action: 'update' },
          { module: 'units', action: 'delete' },
          { module: 'outlets', action: 'create' },
          { module: 'outlets', action: 'read' },
          { module: 'outlets', action: 'update' },
          { module: 'outlets', action: 'delete' },
          { module: 'roles', action: 'create' },
          { module: 'roles', action: 'read' },
          { module: 'roles', action: 'update' },
          { module: 'roles', action: 'delete' },
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
          { module: 'units', action: 'create' },
          { module: 'units', action: 'read' },
          { module: 'units', action: 'update' },
          { module: 'units', action: 'delete' },
          { module: 'outlets', action: 'create' },
          { module: 'outlets', action: 'read' },
          { module: 'outlets', action: 'update' },
          { module: 'outlets', action: 'delete' },
          { module: 'roles', action: 'create' },
          { module: 'roles', action: 'read' },
          { module: 'roles', action: 'update' },
          { module: 'roles', action: 'delete' },
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
          { module: 'units', action: 'create' },
          { module: 'units', action: 'read' },
          { module: 'units', action: 'update' },
          { module: 'units', action: 'delete' },
          { module: 'outlets', action: 'create' },
          { module: 'outlets', action: 'read' },
          { module: 'outlets', action: 'update' },
          { module: 'outlets', action: 'delete' },
          { module: 'roles', action: 'create' },
          { module: 'roles', action: 'read' },
          { module: 'roles', action: 'update' },
          { module: 'roles', action: 'delete' },
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
          { module: 'units', action: 'read' },
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
          { module: 'units', action: 'read' },
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
          { module: 'units', action: 'read' },
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
          { module: 'units', action: 'read' },
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
  // Create Base units first
  const pcsUnit = await prisma.unitOfMeasure.upsert({
    where: { id: 'pcs' },
    update: {},
    create: {
      id: 'pcs',
      name: 'Pieces',
      symbol: 'pcs',
    },
  });

  const kgUnit = await prisma.unitOfMeasure.upsert({
    where: { id: 'kg' },
    update: {},
    create: {
      id: 'kg',
      name: 'Kilogram',
      symbol: 'kg',
    },
  });

  const literUnit = await prisma.unitOfMeasure.upsert({
    where: { id: 'liter' },
    update: {},
    create: {
      id: 'liter',
      name: 'Liter',
      symbol: 'L',
    },
  });

  // Create derived units
  const lusinUnit = await prisma.unitOfMeasure.upsert({
    where: { id: 'lusin' },
    update: {
      baseUnitId: pcsUnit.id,
      conversionRate: 12,
    },
    create: {
      id: 'lusin',
      name: 'Lusin',
      symbol: 'lsn',
      baseUnitId: pcsUnit.id,
      conversionRate: 12,
    },
  });

  const boxUnit = await prisma.unitOfMeasure.upsert({
    where: { id: 'box' },
    update: {
      baseUnitId: pcsUnit.id,
      conversionRate: 24, // Assuming 24 as example, or 12
    },
    create: {
      id: 'box',
      name: 'Box',
      symbol: 'box',
      baseUnitId: pcsUnit.id,
      conversionRate: 24,
    },
  });

  const gramUnit = await prisma.unitOfMeasure.upsert({
    where: { id: 'gram' },
    update: {
      baseUnitId: kgUnit.id,
      conversionRate: 0.001,
    },
    create: {
      id: 'gram',
      name: 'Gram',
      symbol: 'gr',
      baseUnitId: kgUnit.id,
      conversionRate: 0.001,
    },
  });

  const mlUnit = await prisma.unitOfMeasure.upsert({
    where: { id: 'ml' },
    update: {
      baseUnitId: literUnit.id,
      conversionRate: 0.001,
    },
    create: {
      id: 'ml',
      name: 'Milliliter',
      symbol: 'mL',
      baseUnitId: literUnit.id,
      conversionRate: 0.001,
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

  // ============================
  // Create dummy products
  // ============================
  const productMouse = await prisma.product.upsert({
    where: { sku: 'PRD-001' },
    update: {},
    create: {
      sku: 'PRD-001',
      barcode: '899000000001',
      name: 'Mouse Wireless Logitech M185',
      description: 'Mouse wireless 2.4GHz',
      categoryId: 'computers',
      unitId: 'pcs',
      costPrice: 85000,
      sellPrice: 120000,
      minStock: 5,
      isActive: true,
      isService: false,
      imageUrl: null,
    },
  });

  const productKeyboard = await prisma.product.upsert({
    where: { sku: 'PRD-002' },
    update: {},
    create: {
      sku: 'PRD-002',
      barcode: '899000000002',
      name: 'Keyboard Mechanical RGB',
      description: 'Keyboard mechanical blue switch',
      categoryId: 'computers',
      unitId: 'pcs',
      costPrice: 250000,
      sellPrice: 350000,
      minStock: 3,
      isActive: true,
      isService: false,
      imageUrl: null,
    },
  });

  const productAirMineral = await prisma.product.upsert({
    where: { sku: 'PRD-003' },
    update: {},
    create: {
      sku: 'PRD-003',
      barcode: '899000000003',
      name: 'Air Mineral 600ml',
      description: 'Air mineral botol',
      categoryId: 'drinks',
      unitId: 'pcs',
      costPrice: 2000,
      sellPrice: 4000,
      minStock: 24,
      isActive: true,
      isService: false,
      imageUrl: null,
    },
  });

  const productSnack = await prisma.product.upsert({
    where: { sku: 'PRD-004' },
    update: {},
    create: {
      sku: 'PRD-004',
      barcode: '899000000004',
      name: 'Snack Kentang 75gr',
      description: 'Makanan ringan',
      categoryId: 'snacks',
      unitId: 'pcs',
      costPrice: 6000,
      sellPrice: 10000,
      minStock: 12,
      isActive: true,
      isService: false,
      imageUrl: null,
    },
  });

  const serviceInstall = await prisma.product.upsert({
    where: { sku: 'SRV-001' },
    update: {},
    create: {
      sku: 'SRV-001',
      barcode: null,
      name: 'Jasa Instal Ulang Laptop',
      description: 'Install ulang Windows + driver',
      categoryId: 'general',
      unitId: 'pcs',
      costPrice: 0,
      sellPrice: 150000,
      minStock: 0,
      isActive: true,
      isService: true,
      imageUrl: null,
    },
  });

  console.log('✅ Dummy products created', {
    mouse: productMouse.name,
    keyboard: productKeyboard.name,
    airMineral: productAirMineral.name,
    snack: productSnack.name,
    serviceInstall: serviceInstall.name,
  });

  // ============================
  // Create dummy variants
  // ============================
  const mouseBlack = await prisma.productVariant.upsert({
    where: { sku: 'PRD-001-BLK' },
    update: {},
    create: {
      productId: productMouse.id,
      sku: 'PRD-001-BLK',
      barcode: '899000000001-B',
      name: 'Black',
      attributes: JSON.stringify({ Warna: 'Hitam' }),
      costPrice: 85000,
      sellPrice: 120000,
      isActive: true,
    },
  });

  const mouseGrey = await prisma.productVariant.upsert({
    where: { sku: 'PRD-001-GRY' },
    update: {},
    create: {
      productId: productMouse.id,
      sku: 'PRD-001-GRY',
      barcode: '899000000001-G',
      name: 'Grey',
      attributes: JSON.stringify({ Warna: 'Abu-abu' }),
      costPrice: 85000,
      sellPrice: 120000,
      isActive: true,
    },
  });

  const keyboardBlue = await prisma.productVariant.upsert({
    where: { sku: 'PRD-002-BLU' },
    update: {},
    create: {
      productId: productKeyboard.id,
      sku: 'PRD-002-BLU',
      barcode: '899000000002-B',
      name: 'Blue Switch',
      attributes: JSON.stringify({ Switch: 'Blue' }),
      costPrice: 250000,
      sellPrice: 350000,
      isActive: true,
    },
  });

  const keyboardRed = await prisma.productVariant.upsert({
    where: { sku: 'PRD-002-RED' },
    update: {},
    create: {
      productId: productKeyboard.id,
      sku: 'PRD-002-RED',
      barcode: '899000000002-R',
      name: 'Red Switch',
      attributes: JSON.stringify({ Switch: 'Red' }),
      costPrice: 250000,
      sellPrice: 355000,
      isActive: true,
    },
  });

  console.log('✅ Dummy variants created');

  // ============================
  // Create dummy price levels
  // ============================
  await prisma.priceLevel.upsert({
    where: {
      productId_name: { productId: productMouse.id, name: 'Grosir 1' },
    },
    update: {},
    create: {
      productId: productMouse.id,
      name: 'Grosir 1',
      minQty: 10,
      price: 110000,
    },
  });

  await prisma.priceLevel.upsert({
    where: {
      productId_name: { productId: productMouse.id, name: 'Grosir 2' },
    },
    update: {},
    create: {
      productId: productMouse.id,
      name: 'Grosir 2',
      minQty: 50,
      price: 100000,
    },
  });

  await prisma.priceLevel.upsert({
    where: {
      productId_name: { productId: productKeyboard.id, name: 'Wholesale' },
    },
    update: {},
    create: {
      productId: productKeyboard.id,
      name: 'Wholesale',
      minQty: 5,
      price: 330000,
    },
  });

  console.log('✅ Dummy price levels created');

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
