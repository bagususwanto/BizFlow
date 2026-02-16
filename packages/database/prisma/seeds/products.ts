import { PrismaClient } from '@prisma/client';

export async function seedProducts(prisma: PrismaClient) {
  // Create dummy products
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
    },
  });

  console.log('✅ Dummy products created', {
    mouse: productMouse.name,
    keyboard: productKeyboard.name,
    airMineral: productAirMineral.name,
    snack: productSnack.name,
    serviceInstall: serviceInstall.name,
  });

  // Create dummy variants
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

  const airMineralDefault = await prisma.productVariant.upsert({
    where: { sku: 'PRD-003-DEFAULT' },
    update: {},
    create: {
      productId: productAirMineral.id,
      sku: 'PRD-003-DEFAULT',
      barcode: '899000000003',
      name: 'Default',
      attributes: JSON.stringify({}),
      costPrice: 2000,
      sellPrice: 4000,
      isActive: true,
    },
  });

  const snackDefault = await prisma.productVariant.upsert({
    where: { sku: 'PRD-004-DEFAULT' },
    update: {},
    create: {
      productId: productSnack.id,
      sku: 'PRD-004-DEFAULT',
      barcode: '899000000004',
      name: 'Default',
      attributes: JSON.stringify({}),
      costPrice: 6000,
      sellPrice: 10000,
      isActive: true,
    },
  });

  const serviceInstallDefault = await prisma.productVariant.upsert({
    where: { sku: 'SRV-001-DEFAULT' },
    update: {},
    create: {
      productId: serviceInstall.id,
      sku: 'SRV-001-DEFAULT',
      barcode: null,
      name: 'Default',
      attributes: JSON.stringify({}),
      costPrice: 0,
      sellPrice: 150000,
      isActive: true,
    },
  });

  console.log('✅ Dummy variants created');

  // Create dummy price levels
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

  return {
    productMouse,
    productKeyboard,
    productAirMineral,
    productSnack,
    serviceInstall,
    variants: {
      mouseBlack,
      mouseGrey,
      keyboardBlue,
      keyboardRed,
      airMineralDefault,
      snackDefault,
      serviceInstallDefault,
    },
  };
}
