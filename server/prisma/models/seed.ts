import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.employee.findUnique({ where: { employeeId: 'E000001' } });
  if (existing) {
    console.log('Admin already exists');
    return;
  }

  const hash = await bcrypt.hash('admin123', 10);
  await prisma.employee.create({
    data: {
      employeeId: 'E000001',
      fullName: 'Admin',
      email: 'admin@weatherford.ru',
      phone: '+70000000000',
      passwordHash: hash,
      role: 'admin',
      positionId:0
    },
  });
  console.log('Admin created');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());