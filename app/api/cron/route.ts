import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Récupérer tous les shopProfitWaited non traités liés à des commandes livrées
    const shopProfitsWaited = await prisma.shopProfitWaited.findMany({
      where: {
        isProcessed: false,
        order: {
          status: "livré",
        },
      },
      include: {
        shop: true,
      },
    });

    // Mettre à jour les shops et marquer les profits comme traités
    await Promise.all(
      shopProfitsWaited.map(async (profit) => {
        if (profit.shop) {
          // const currencyAmount =
          //   profit.currency === "USD"
          //     ? {
          //         benefit: { increment: profit.amount },
          //         benefitCDF: profit.shop.benefitCDF,
          //       }
          //     : {
          //         benefitCDF: { increment: profit.amount },
          //         benefit: profit.shop.benefit,
          //       };

          await prisma.shop.update({
            where: { id: profit.shopId },
            data:
              profit.currency === "USD"
                ? {
                    benefit: {
                      increment: profit.amount,
                    },
                  }
                : {
                    benefitCDF: {
                      increment: profit.amount,
                    },
                  },
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
        order: {
          status: "livré",
        },
      },
    });

    await Promise.all(
      otekisProfitsWaited.map(async (profit) => {
        const companyPrefs = await prisma.otekisBenefitAmount.findFirst();

        if (companyPrefs) {
          await prisma.otekisBenefitAmount.update({
            where: { id: companyPrefs.id },
            data:
              profit.currency === "USD"
                ? {
                    amount: { increment: profit.amount + profit.deliveryPrice },
                    deliveryPrice: {
                      increment: profit.deliveryPrice,
                    },
                    benefit: { increment: profit.benefit },
                  }
                : {
                    amountCDF: {
                      increment: profit.amount + profit.deliveryPrice,
                    },
                    deliveryPriceCDF: {
                      increment: profit.deliveryPrice,
                    },
                    benefitCDF: { increment: profit.benefit },
                  },
          });

          await prisma.otekisProfitWaited.update({
            where: { id: profit.id },
            data: { isProcessed: true },
          });
        }
      })
    );

    if (otekisProfitsWaited.length > 0 || shopProfitsWaited.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const cronJobWorks = await prisma.testCronJob.create({
        data: {
          isWorking: true,
        },
      });
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
