// lib/prisma.ts

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg"; // 💡 Importation de l'adaptateur
import { Pool } from "pg"; // 💡 Nécessite l'installation de la dépendance 'pg'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// 2. Création de l'adaptateur et du pool de connexions
const pool = new Pool({
  // 💡 CRUCIAL : Récupérer l'URL ici, directement du Node.js standard
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);

// 3. Création de l'instance unique
const prisma =
  global.prisma ||
  new PrismaClient({
    // 💡 NOUVEAU : On passe l'instance de l'adaptateur au lieu de l'URL
    adapter: adapter,
  });

// 4. Stockage et Exportation de l'instance
if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export { prisma };
