import prisma from '../../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const position = await prisma.position.upsert({
    where: { name: 'Admin' },
    update: {},
    create: { name: 'Admin' },
  });
  const hash = await bcrypt.hash('admin123', 10);

  await prisma.employee.create( {
    data:{
      id: 'E000001',
      fullName: 'Admin',
      email: 'admin@weatherford.ru',
      phone: '+70000000000',
      passwordHash: hash,
      role: 'admin',
      positionId: position.id,
    }
  });
  console.log('Admin ready: E000001 / admin123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
