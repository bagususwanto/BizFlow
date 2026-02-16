import { PrismaClient } from '@prisma/client';

export async function seedCategories(prisma: PrismaClient) {
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

  return {
    generalCategory,
    electronicsCategory,
    computersCategory,
    phonesCategory,
    foodCategory,
    snacksCategory,
    drinksCategory,
  };
}
