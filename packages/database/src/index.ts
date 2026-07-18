/**
 * @invincible/database — Prisma client + generated types for the platform.
 * All persistence access flows through this package.
 */

export { prisma, createPrismaClient } from './client';

// Re-export the generated Prisma namespace + model types and enums so
// consumers depend on a single package rather than @prisma/client directly.
export * from '@prisma/client';
export { Prisma, PrismaClient } from '@prisma/client';
