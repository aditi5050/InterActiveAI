import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool, PoolConfig } from 'pg';

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;

  const poolConfig: PoolConfig = {
    connectionString,
    max: 10, // Reduced pool size for better stability
    min: 2,  // Keep minimum connections alive
    idleTimeoutMillis: 30000, // 30 seconds idle timeout
    connectionTimeoutMillis: 10000, // 10 second connection timeout
    allowExitOnIdle: false, // Keep connections alive
  };

  const pool = new Pool(poolConfig);

  // Handle pool errors gracefully
  pool.on('error', (err) => {
    console.error('[Prisma Pool] Unexpected error on idle client:', err.message);
  });

  pool.on('connect', () => {
    console.log('[Prisma Pool] New client connected');
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: ['error'],
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

globalThis.prisma = prisma;
