import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Fonction utilitaire pour tronquer à 2 décimales sans arrondir
const truncateTwoDecimals = (value: number) => Math.trunc(value * 100) / 100;

export async function GET() {
  try {
    const companyPrefs = await prisma.otekisPreferences.findFirst();
    if (!companyPrefs) return;

    // Gestion des délais pour les profits à traiter
    const getDelayDayToUpdate = companyPrefs.delayTransferableMoney;
    const delayDate = new Date();
    delayDate.setDate(delayDate.getDate() - getDelayDayToUpdate);

    // Récupérer tous les shopProfitWaited non traités liés à des commandes livrées
    const shopProfitsWaited = await prisma.shopProfitWaited.findMany({
      where: {
        isProcessed: false,
        order: { status: "livré" },
        createdAt: { lte: delayDate },
      },
      include: { shop: true },
    });

    await Promise.all(
      shopProfitsWaited.map(async (profit) => {
        if (profit.shop) {
          const incrementValue = truncateTwoDecimals(profit.amount);
          await prisma.shop.update({
            where: { id: profit.shopId },
            data:
              profit.currency === "USD"
                ? { benefit: { increment: incrementValue } }
                : { benefitCDF: { increment: incrementValue } },
          });
        }
        await prisma.shopProfitWaited.update({
          where: { id: profit.id },
          data: { isProcessed: true },
        });
      })
    );

    // Même principe pour otekisProfitWaited
    const otekisProfitsWaited = await prisma.otekisProfitWaited.findMany({
      where: {
        isProcessed: false,
        order: { status: "livré" },
        createdAt: { lte: delayDate },
      },
    });

    await Promise.all(
      otekisProfitsWaited.map(async (profit) => {
        const company = await prisma.otekisBenefitAmount.findFirst();
        if (!company) return;

        const amountIncrement = truncateTwoDecimals(
          profit.amount + profit.deliveryPrice
        );
        const deliveryIncrement = truncateTwoDecimals(profit.deliveryPrice);
        const benefitIncrement = truncateTwoDecimals(profit.benefit);

        if (profit.currency === "USD") {
          await prisma.otekisBenefitAmount.update({
            where: { id: company.id },
            data: {
              amount: { increment: amountIncrement },
              deliveryPrice: { increment: deliveryIncrement },
              benefit: { increment: benefitIncrement },
            },
          });
        } else {
          await prisma.otekisBenefitAmount.update({
            where: { id: company.id },
            data: {
              amountCDF: { increment: amountIncrement },
              deliveryPriceCDF: { increment: deliveryIncrement },
              benefitCDF: { increment: benefitIncrement },
            },
          });
        }

        await prisma.otekisProfitWaited.update({
          where: { id: profit.id },
          data: { isProcessed: true },
        });
      })
    );

    // Logging si au moins une mise à jour a été faite
    if (otekisProfitsWaited.length > 0 || shopProfitsWaited.length > 0) {
      await prisma.testCronJob.create({ data: { isWorking: true } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors du cron:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
