import { PrismaClient } from '@prisma/client';

export async function seedAccounts(prisma: PrismaClient) {
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
  return cashAccount;
}
