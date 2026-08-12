import { PrismaClient } from '@prisma/client'

// Reuse a single PrismaClient across hot reloads / lambda invocations.
// Neon's pooled connection string (DATABASE_URL, pgbouncer) should be used
// here; migrations should run against the DIRECT_URL instead.
const globalForPrisma = globalThis

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
