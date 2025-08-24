"use server";

import { transfertShopArraySchema } from "@/schema/transfertSchema";
import { z } from "zod";
import { getUser } from "./actions";
import { PERMITED_ROLES } from "@/utils/dataAdd";
import { prisma } from "@/lib/prisma";
import { WithdrawalHistory } from "@prisma/client";

export type TransfertShopType = z.infer<typeof transfertShopArraySchema>;

export const transfertShop = async (data: TransfertShopType) => {
  try {
    const user = await getUser();

    if (!user) {
      return {
        error: true,
        message: "Non authorisé!",
        data: [],
      };
    }

    const isPermitted = PERMITED_ROLES.some(
      (r) => r !== "employee" && r === user.role
    );

    if (!isPermitted) {
      return {
        error: true,
        message: "Non authorisé!",
        data: [],
      };
    }

    // Validation synchronisée suffit
    const validationResult = transfertShopArraySchema.safeParse(data);
    if (!validationResult.success) {
      console.error(
        "Erreur validation transfertShop:",
        validationResult.error.issues
      );
      return {
        error: true,
        message: "Erreur de validation des informations",
        errors: validationResult.error.issues,
        data: [],
      };
    }

    const validated = validationResult.data;

    const prefs = await prisma.otekisPreferences.findFirst();
    if (!prefs) {
      return {
        error: true,
        message:
          "Aucune préférence de devise n'a été configurée pour l'instant",
      };
    }
    const currency = prefs.currency;

    const companyPrefs = await prisma.otekisBenefitAmount.findFirst();
    if (!companyPrefs) {
      return {
        error: true,
        message: "Aucune valeur de bénéfice n'a été configurée pour l'instant",
      };
    }

    // find if we have enough money
    const totalMoneyToPay = validated.reduce((acc, item) => {
      return acc + item.amount;
    }, 0);

    const companyAmount =
      currency === "USD" ? companyPrefs.amount : companyPrefs.amountCDF;
    const hasEnoughMoney = totalMoneyToPay <= companyAmount;

    if (!hasEnoughMoney) {
      return {
        error: true,
        message: "Fonds insuffisants pour effectuer le transfert",
        data: [],
      };
    }

    // Création des transferts en base
    const withdrawalHistory = await prisma.withdrawalHistory.createMany({
      data: validated,
    });

    // Récupérer en batch les shops concernés
    const shopIds = Array.from(new Set(validated.map((item) => item.shopId)));
    const shopsMap = new Map(
      (
        await prisma.shop.findMany({
          where: { id: { in: shopIds } },
        })
      ).map((shop) => [shop.id, shop])
    );

    // Met à jour les shops en parallèle (fire and forget les erreurs)
    await Promise.all(
      validated.map(async (item) => {
        const shop = shopsMap.get(item.shopId);
        if (!shop) return;

        try {
          const updateData =
            item.currency === "USD"
              ? { benefit: shop.benefit - item.amount }
              : { benefitCDF: shop.benefitCDF - item.amount };

          await prisma.shop.update({
            where: { id: item.shopId },
            data: updateData,
          });

          // cut money otekis
          const reducedTotalAmountCompanyData =
            item.currency === "USD"
              ? { amount: companyPrefs.amount - item.amount }
              : { amountCDF: companyPrefs.amountCDF - item.amount };

          await prisma.otekisBenefitAmount.update({
            where: { id: companyPrefs.id },
            data: reducedTotalAmountCompanyData,
          });
        } catch (e) {
          console.error(`Erreur mise à jour shop ${item.shopId}:`, e);
        }
      })
    );

    return {
      error: false,
      message: "Transfert effectué avec succès",
      data: withdrawalHistory,
    };
  } catch (error) {
    console.error("Erreur lors du transfert:", error);
    return {
      error: true,
      message: "Erreur de transfert! Veuillez réessayer plus tard!",
      data: [],
    };
  }
};

// get all getAllWithdrawalHistory
export const getAllWithdrawalHistory = async () => {
  const user = await getUser();
  if (!user) return [];

  const isPermitted = PERMITED_ROLES.filter((r) => r !== "employee ").includes(
    user.role
  );
  if (!isPermitted) return [];

  const withdrawalHistory = await prisma.withdrawalHistory.findMany({
    orderBy: {
      date: "desc",
    },
  });
  return withdrawalHistory;
};

// validate all withdraw his
export const updateAllWithdrawHistory = async (
  data: string[],
  status: "annulé" | "traité"
) => {
  try {
    const user = await getUser();
    if (!user) {
      return {
        error: true,
        message: "Non authorisé!",
        data: [],
      };
    }
    const isPermitted = PERMITED_ROLES.filter((r) => r !== "employee").includes(
      user.role
    );

    if (!isPermitted) {
      return {
        error: true,
        message: "Non authorisé!",
        data: [],
      };
    }

    const otekisBenefit = await prisma.otekisBenefitAmount.findFirst();
    if (!otekisBenefit) {
      return {
        error: true,
        message: "Le systeme de transfert-retrait n'est pas bien configuré",
        data: [],
      };
    }

    if (!Array.isArray(data) || data.length === 0) {
      return {
        error: true,
        message: "Aucun retrait à annuler",
        data: [],
      };
    }

    for (const item of data) {
      const singleWithraw = await prisma.withdrawalHistory.findUnique({
        where: {
          id: item,
        },
        include: {
          shop: true,
        },
      });

      if (!singleWithraw) {
        return {
          error: true,
          message: "Non trouvé!",
          data: [],
        };
      }
      const shop = singleWithraw.shop;

      const withdrawalHistory = await prisma.withdrawalHistory.update({
        where: {
          id: singleWithraw.id,
        },
        data: {
          status: status,
        },
      });
    }
    return {
      error: false,
      message: "Tous les retraits ont été mis à jour avec succès!",
      data: [],
    };
  } catch (error) {
    console.log(error);
    return {
      error: true,
      message: "Erreur de transfert! Veuillez reessayer plus tard!",
      data: [],
    };
  }
};

export const cancelWithdrawHistory = async (
  data: WithdrawalHistory[],
  status: "annulé"
) => {
  try {
    const user = await getUser();
    if (!user) {
      return {
        error: true,
        message: "Non authorisé!",
        data: [],
      };
    }
    const isPermitted = PERMITED_ROLES.filter((r) => r !== "employee").includes(
      user.role
    );
    if (!isPermitted) {
      return {
        error: true,
        message: "Non authorisé!",
        data: [],
      };
    }

    if (!Array.isArray(data) || data.length === 0) {
      return {
        error: true,
        message: "Aucun retrait à annuler",
        data: [],
      };
    }

    const otekisBenefit = await prisma.otekisBenefitAmount.findFirst();
    if (!otekisBenefit) {
      return {
        error: true,
        message: "Le systeme de transfert-retrait n'est pas bien configuré",
        data: [],
      };
    }

    await prisma.withdrawalHistory.updateMany({
      data: {
        status: status,
      },
    });

    for (const item of data) {
      const currency = item.currency;
      const shopId = item.shopId;
      const amount = item.amount;

      if (currency === "USD") {
        await prisma.shop.update({
          where: {
            id: shopId,
          },
          data: {
            benefit: {
              increment: amount,
            },
          },
        });

        await prisma.otekisBenefitAmount.update({
          where: {
            id: otekisBenefit.id,
          },
          data: {
            amount: otekisBenefit.amount + amount,
          },
        });
      } else {
        await prisma.shop.update({
          where: {
            id: shopId,
          },
          data: {
            benefitCDF: {
              increment: amount,
            },
          },
        });

        await prisma.otekisBenefitAmount.update({
          where: {
            id: otekisBenefit.id,
          },
          data: {
            amountCDF: otekisBenefit.amountCDF + amount,
          },
        });
      }
    }

    return {
      error: false,
      message: "Tous les retraits ont été mis à jour avec succès!",
      data: [],
    };
  } catch (error) {
    console.error("Erreur dans cancelWithdrawHistory:", error);
    return {
      error: true,
      message: "Erreur de transfert! Veuillez reessayer plus tard!",
      data: [],
    };
  }
};
