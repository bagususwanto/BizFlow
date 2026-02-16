import { PrismaClient } from '@prisma/client';

export async function seedUnits(prisma: PrismaClient) {
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
      conversionRate: 24,
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
  return { pcsUnit, kgUnit, literUnit, lusinUnit, boxUnit, gramUnit, mlUnit };
}
