import { PrismaClient } from '@prisma/client';

export async function seedInventory(
  prisma: PrismaClient,
  variants: any,
  warehouses: { mainWarehouse: any; storeWarehouse: any },
) {
  const { mainWarehouse, storeWarehouse } = warehouses;
  const {
    mouseBlack,
    mouseGrey,
    keyboardBlue,
    keyboardRed,
    airMineralDefault,
    snackDefault,
  } = variants;

  // Stock for Main Warehouse
  const mainStocks = [
    { variantId: mouseBlack.id, quantity: 50 },
    { variantId: mouseGrey.id, quantity: 30 },
    { variantId: keyboardBlue.id, quantity: 20 },
    { variantId: keyboardRed.id, quantity: 15 },
    { variantId: airMineralDefault.id, quantity: 100 },
    { variantId: snackDefault.id, quantity: 50 },
  ];

  for (const stock of mainStocks) {
    await prisma.stock.upsert({
      where: {
        variantId_warehouseId: {
          variantId: stock.variantId,
          warehouseId: mainWarehouse.id,
        },
      },
      update: {
        quantity: stock.quantity,
      },
      create: {
        variantId: stock.variantId,
        warehouseId: mainWarehouse.id,
        quantity: stock.quantity,
      },
    });
  }

  // Stock for Store Warehouse
  const storeStocks = [
    { variantId: mouseBlack.id, quantity: 10 },
    { variantId: mouseGrey.id, quantity: 5 },
    { variantId: keyboardBlue.id, quantity: 5 },
    { variantId: airMineralDefault.id, quantity: 50 },
    { variantId: snackDefault.id, quantity: 20 },
  ];

  for (const stock of storeStocks) {
    await prisma.stock.upsert({
      where: {
        variantId_warehouseId: {
          variantId: stock.variantId,
          warehouseId: storeWarehouse.id,
        },
      },
      update: {
        quantity: stock.quantity,
      },
      create: {
        variantId: stock.variantId,
        warehouseId: storeWarehouse.id,
        quantity: stock.quantity,
      },
    });
  }

  console.log('✅ Dummy stocks created');
}
