// import jwt from 'jsonwebtoken';

// const token = 'asjdfdaslkfjlsdkddss00000ss';

// try {
//   const decoded = jwt.verify(token, 'asjdfdaslkfjlsdkddss00000ss');
//   console.log('OK:', decoded);
// } catch(e) {
//   console.log('Ошибка:', e.message);
// }
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const prisma = new PrismaClient({
  adapter: new PrismaLibSql({
    url: "file:./server/dev.db",
  }),
});

const tables = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table'`;
console.log(tables);