// import { PrismaClient } from '../../../node_modules/.prisma/client/client';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const prisma = new PrismaClient({
  adapter: new PrismaLibSql({
    url: "file:./server/dev.db",
  }),
});

export default prisma;