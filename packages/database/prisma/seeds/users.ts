import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

// Hash functions
function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12);
}

function hashPin(pin: string): string {
  return bcrypt.hashSync(pin, 12);
}

export async function seedUsers(
  prisma: PrismaClient,
  ownerRoleId: string,
  outletId: string,
) {
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
      roleId: ownerRoleId,
      isActive: true,
      outlets: {
        create: {
          outletId: outletId,
        },
      },
    },
  });

  console.log('✅ Admin user created:', adminUser.username);
  return adminUser;
}
