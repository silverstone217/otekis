import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  // Préférences de l'entreprise
  const prefs = await prisma.otekisPreferences.findFirst();
  if (!prefs) {
    await prisma.otekisPreferences.create({
      data: {
        cinetPayPercentage: "5",
        socialEmail: "servigroup.social@gmail.com",
        exchangeRate: 2100,
        socialPhone: "822550150",
      },
    });
    console.log("✔ otekisPreferences créées");
  }

  // Montants et bénéfices
  const benefit = await prisma.otekisBenefitAmount.findFirst();
  if (!benefit) {
    await prisma.otekisBenefitAmount.create({
      data: { amount: 0, amountCDF: 0, benefit: 0, benefitCDF: 0 },
    });
    console.log("✔ otekisBenefitAmount créé");
  }

  // Livraison otekis
  const delivery = await prisma.deliveryCompany.findFirst({
    where: { name: { contains: "otekis", mode: "insensitive" } },
  });
  if (!delivery) {
    await prisma.deliveryCompany.create({
      data: {
        name: "otekis delivery",
        phone: "822550150",
        address: "6529, tshanga, bandalungwa, kinshasa, rdc",
      },
    });
    console.log("✔ deliveryCompany otekis créée");
  }
}

main()
  .then(() => console.log("Seed terminé"))
  .catch((e) => {
    console.error("Erreur seed :", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
