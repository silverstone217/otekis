// lib/prisma.ts
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "./generated/prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

// 1. Initialisation du pool PG
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// 2. Création de l'adaptateur
const adapter = new PrismaPg(pool);

// 3. Instanciation du client Prisma 7
export const prisma =
  global.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
