import { PrismaClient } from '@prisma/client';

// This pattern prevents creating multiple instances of PrismaClient in development
// due to hot-reloading. In production, it will only ever be created once.

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;