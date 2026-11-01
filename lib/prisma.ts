// lib/prisma.ts

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "./generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pgPool?: Pool;
};

// Réutilisation du pool PostgreSQL
const pool =
  globalForPrisma.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,

    // Limite de connexions par instance
    max: 3,

    // Fermeture des connexions inutilisées
    idleTimeoutMillis: 10000,

    connectionTimeoutMillis: 10000,
  });

// Création de l'adaptateur Prisma 7
const adapter = new PrismaPg(pool);

// Réutilisation du client Prisma
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

// Conservation des instances
globalForPrisma.pgPool = pool;
globalForPrisma.prisma = prisma;
