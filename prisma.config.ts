import 'dotenv/config';
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: 'server/prisma',
  migrations: {
    path: 'server/prisma/migrations',
    seed: "tsx server/prisma/models/seed.ts",
  },
  datasource: {
    url: "file:./server/dev.db",
  },
});
