import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12);
}

function hashPin(pin: string): string {
  return bcrypt.hashSync(pin, 12);
}

async function main() {
  console.log('🌱 Creating E2E Admin user...');

  // Get owner role
  const ownerRole = await prisma.role.findFirst({
    where: { name: 'owner' },
  });

  if (!ownerRole) {
    throw new Error('Owner role not found. Run seed first.');
  }

  // Get main outlet
  const mainOutlet = await prisma.outlet.findFirst({
    where: { code: 'MAIN' },
  });

  if (!mainOutlet) {
    throw new Error('Main outlet not found. Run seed first.');
  }

  const timestamp = Date.now();
  const username = `e2e_admin_${timestamp}`;

  const user = await prisma.user.create({
    data: {
      username: username,
      email: `e2e_admin_${timestamp}@bizflow.local`,
      password: hashPassword('password123'), // Known password
      pin: hashPin('123456'),
      name: 'E2E Administrator',
      roleId: ownerRole.id,
      isActive: true,
      outlets: {
        create: {
          outletId: mainOutlet.id,
        },
      },
    },
  });

  console.log('✅ Created user:', user.username);
  console.log('::set-output name=username::' + user.username);
  console.log('::set-output name=password::password123');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
