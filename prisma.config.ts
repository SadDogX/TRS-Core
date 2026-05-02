import 'dotenv/config';
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: 'server/prisma',
  migrations: {
    path: 'server/prisma/migrations',
    seed: "server/prisma/seed.ts",
  },
  datasource: {
    url: "file:./server/dev.db",
  },
});