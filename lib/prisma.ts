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
    max: 3,
    idleTimeoutMillis: 5000, // ferme plus vite les connexions inactives
    connectionTimeoutMillis: 15000,
  });

pool.on("error", (err) => {
  console.error(
    "Erreur du pool PostgreSQL (connexion inactive coupée):",
    err.message,
  );
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
