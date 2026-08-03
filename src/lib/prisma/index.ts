// lib/prisma/index.ts

import { PrismaClient } from "@prisma/client";

declare global {
  // Prevent multiple Prisma instances in dev
  // (Next.js hot reload spawns many)
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["query", "info", "warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

