import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Reuse a single PrismaClient (and its connection pool) across the whole
// process — in production too. Without this, module re-evaluation can spin up
// extra clients/pools, so queries pay fresh TCP+TLS handshakes (slow).
globalForPrisma.prisma = prisma;

export default prisma;
