import { PrismaClient } from '@prisma/client';

export async function seedCustomers(prisma: PrismaClient) {
  const customer1 = await prisma.customer.upsert({
    where: { code: 'CUST-0001' },
    update: {},
    create: {
      code: 'CUST-0001',
      name: 'Budi Santoso',
      phone: '081234567890',
      email: 'budi@example.com',
      address: 'Jl. Merdeka No. 1, Jakarta',
      creditLimit: 5000000,
      isActive: true,
    },
  });

  const customer2 = await prisma.customer.upsert({
    where: { code: 'CUST-0002' },
    update: {},
    create: {
      code: 'CUST-0002',
      name: 'Siti Aminah',
      phone: '081223344556',
      email: 'siti@example.com',
      address: 'Jl. Sudirman No. 10, Bandung',
      creditLimit: 2000000,
      isActive: true,
    },
  });

  const customer3 = await prisma.customer.upsert({
    where: { code: 'CUST-0003' },
    update: {},
    create: {
      code: 'CUST-0003',
      name: 'Toko Berkah (Retail)',
      phone: '021-9876543',
      email: 'berkah@toko.com',
      address: 'Pasar Baru, Jakarta Pusat',
      creditLimit: 15000000,
      isActive: true,
    },
  });

  console.log(
    '✅ Dummy customers created:',
    [customer1.name, customer2.name, customer3.name].join(', '),
  );

  return { customer1, customer2, customer3 };
}
