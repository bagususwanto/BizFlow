import { PrismaClient } from '@prisma/client';

export async function seedSuppliers(prisma: PrismaClient) {
  const supplier1 = await prisma.supplier.upsert({
    where: { code: 'SUP-001' },
    update: {},
    create: {
      code: 'SUP-001',
      name: 'PT. Teknologi Maju',
      address: 'Jl. Industri No. 1, Cikarang',
      phone: '021-89898989',
      email: 'sales@tekmaju.com',
      taxId: '01.234.567.8-123.000',
      isActive: true,
      bankName: 'BCA',
      bankAccount: '1234567890',
    },
  });

  const supplier2 = await prisma.supplier.upsert({
    where: { code: 'SUP-002' },
    update: {},
    create: {
      code: 'SUP-002',
      name: 'CV. Berkah Abadi',
      address: 'Jl. Raya Bogor KM 30',
      phone: '08123456789',
      email: 'berkah@abadi.com',
      isActive: true,
      bankName: 'Mandiri',
      bankAccount: '9876543210',
    },
  });

  const supplier3 = await prisma.supplier.upsert({
    where: { code: 'SUP-003' },
    update: {},
    create: {
      code: 'SUP-003',
      name: 'UD. Sumber Rezeki',
      address: 'Pasar Induk Kramat Jati',
      phone: '08567890123',
      email: 'sumber@rezeki.com',
      isActive: false, // Inactive supplier
    },
  });

  console.log(
    '✅ Dummy suppliers created:',
    [supplier1.name, supplier2.name, supplier3.name].join(', '),
  );

  return { supplier1, supplier2, supplier3 };
}
