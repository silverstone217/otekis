"use server";

import { CurrencyType } from "@/components/admins/finances/transfert/ChangeCurenncyComponent";
import { prisma } from "@/lib/prisma";
import { getUser } from "./actions";
import { PERMITED_ROLES } from "@/utils/dataAdd";

// set up company prefs
export const setupCompanyPrefs = async () => {
  try {
    const companyPrefs = await prisma.otekisPreferences.findFirst();
    if (!companyPrefs) {
      await prisma.otekisPreferences.create({
        data: {
          cinetPayPercentage: "3",
          socialEmail: "marketstore.oteki@gmail.com",
          exchangeRate: 2900,
          socialPhone: "813350706",
        },
      });
    }
    const otekisBenefitAmount = await prisma.otekisBenefitAmount.findFirst();
    if (!otekisBenefitAmount) {
      await prisma.otekisBenefitAmount.create({
        data: {
          amount: 0,
          amountCDF: 0,
          benefit: 0,
          benefitCDF: 0,
        },
      });
    }

    // delivery for otekis delivery
    const delivery = await prisma.deliveryCompany.findMany({});
    const isOtekisDeliveryExist = delivery.find((delivery) =>
      delivery.name.includes("otekis")
    );

    if (!isOtekisDeliveryExist) {
      await prisma.deliveryCompany.create({
        data: {
          name: "otekis delivery",
          phone: "813350706",
          address: "6529, tshanga, bandalungwa, kinshasa, rdc",
        },
      });
    }
    // console.log("Company prefs setup perfectly");
  } catch (error) {
    console.error("Error setting up company prefs", error);
  }
};

// get company preference
export const getCompanyPreference = async () => {
  const prefs = await prisma.otekisPreferences.findFirst();
  return prefs ?? null;
};

// change currency
type ChangeCurrencyParams = {
  productCurrency: CurrencyType;
  exchangeRate: number;
  prefId: string;
  cinetPayPercentage: number;
  delayTransferableMoney: number;
  delayRefund: number;
};
export const changeCurrencies = async ({
  productCurrency,
  exchangeRate,
  prefId,
  cinetPayPercentage,
  delayRefund,
  delayTransferableMoney,
}: ChangeCurrencyParams) => {
  const user = await getUser();
  const isPermited = user ? PERMITED_ROLES.includes(user?.role) : false;
  if (!isPermited) {
    return {
      error: true,
      message: "Non authorisé!",
      data: null,
    };
  }

  const prefs = await prisma.otekisPreferences.update({
    where: { id: prefId },
    data: {
      productCurrency,
      exchangeRate: exchangeRate,
      currency: productCurrency,
      transfertCurrency: productCurrency,
      cinetPayPercentage: cinetPayPercentage.toString(),
      delayRefund,
      delayTransferableMoney,
    },
  });

  if (!prefs) {
    return {
      error: true,
      message: "Erreur de mise à jour des devises !",
      data: null,
    };
  }
  return {
    error: false,
    message: "Les Devises ont été mise à jour avec succès",
    data: prefs,
  };
};

// All shops money made
export const getShopsWithAmountToTransfer = async () => {
  const prefs = await prisma.otekisPreferences.findFirst();
  if (!prefs) return [];

  const currency = prefs.currency;

  if (currency === "CDF") {
    const shops = await prisma.shop.findMany({
      where: {
        benefitCDF: {
          gt: 0,
          // benefitCDF with currency
        },
      },
    });

    return shops;
  }

  const shops = await prisma.shop.findMany({
    where: {
      benefit: {
        gt: 0,
        // benefit with currency
      },
    },
  });

  return shops;
};

// All  money made
export const TotalAmountCompany = async () => {
  const prefs = await prisma.otekisPreferences.findFirst();
  if (!prefs) return 1;

  const companyAmountBenefice = await prisma.otekisBenefitAmount.findFirst({});
  if (!companyAmountBenefice) return 0;

  const totalBenefit =
    prefs.currency === "USD"
      ? companyAmountBenefice.amount
      : companyAmountBenefice.amountCDF;

  return totalBenefit;
};

// exchange rate usd ===> CDF
export const exChangeRate = async () => {
  const prefs = await prisma.otekisPreferences.findFirst();
  if (!prefs) return 1;
  return prefs.currency === "USD" ? 1 : prefs.exchangeRate;
};

// currency symbol
export const getCurrencySymbol = async () => {
  const prefs = await prisma.otekisPreferences.findFirst();
  if (!prefs) return "$";
  return prefs.currency === "USD" ? "$" : "CDF";
};

export const getCompanyWithdrawHistory = async () => {
  const user = await getUser();
  if (!user || !["admin", "super_admin"].includes(user.role)) {
    return [];
  }
  const companyWithdrawHistory = await prisma.otekisWithdrawalHistory.findMany({
    orderBy: {
      date: "desc",
    },
  });
  return companyWithdrawHistory;
};

// company bemefit
export const getCompanyBenefit = async () => {
  const user = await getUser();
  if (!user || !["admin", "super_admin"].includes(user.role)) {
    return null;
  }

  const companyBenefit = await prisma.otekisBenefitAmount.findFirst({
    orderBy: {
      createdAt: "desc",
    },
  });
  return companyBenefit;
};

// product sold
export const getAllProductSoldAmount = async () => {
  // Étape 1 : récupère tous les shopProfitWaited validés
  const shopWaited = await prisma.shopProfitWaited.findMany({
    where: {
      isProcessed: true,
    },
    select: { orderId: true },
  });

  const orderIds = shopWaited.map((item) => item.orderId);

  if (orderIds.length === 0) return 0;

  // Étape 2 : charge toutes les commandes concernées, avec leurs items d'un coup
  const orders = await prisma.order.findMany({
    where: { id: { in: orderIds } },
    include: { orderItems: true },
  });

  // Étape 3 : somme des quantities de tous les orderItems de toutes les commandes
  const amount = orders.reduce(
    (sum, order) =>
      sum + order.orderItems.reduce((acc, item) => acc + item.quantity, 0),
    0
  );

  return amount;
};

// retrieve company benefit and make transaction
type MakeTransactionCompanyBenefitType = {
  amount: number;
  currency: "USD" | "CDF";
};
export const makeTransactionCompanyBenefit = async ({
  amount,
  currency,
}: MakeTransactionCompanyBenefitType) => {
  try {
    const user = await getUser();
    if (!user) {
      return {
        error: true,
        message: "Connectez-vous pour continuer",
      };
    }

    const isPermited = user.role === "super_admin";
    if (!isPermited) {
      return {
        error: true,
        message: "Vous n'avez pas les droits pour effectuer cette action",
      };
    }

    const companyBenefit = await prisma.otekisBenefitAmount.findFirst();
    if (!companyBenefit) {
      return {
        error: true,
        message:
          "Erreur de configuration: impossible de trouver le solde de l'entreprise.",
      };
    }
    const actuelAmount =
      currency === "USD" ? companyBenefit.benefit : companyBenefit.benefitCDF;

    const isCanCompanyAffordIt = actuelAmount >= amount;
    if (!isCanCompanyAffordIt) {
      return {
        error: true,
        message:
          "L'entreprise n'a pas les fonds nécessaires pour effectuer cette transaction",
      };
    }
    // const newAmount = actuelAmount - amount;
    const generatedTransfertID =
      Date.now().toString() + Math.random().toString(36).substring(2, 9);

    // create transaction
    await prisma.otekisWithdrawalHistory.create({
      data: {
        amount: amount,
        currency,
        transfertID: generatedTransfertID,
        paymentPhone: "813350706",
        paymentName: "Otekis",
      },
    });

    // reduced money company benefit
    if (currency === "USD") {
      await prisma.otekisBenefitAmount.update({
        where: {
          id: companyBenefit.id,
        },
        data: {
          benefit: {
            decrement: amount,
          },
          amount: {
            decrement: amount,
          },
        },
      });
    } else {
      // reduced money company benefit cdf
      await prisma.otekisBenefitAmount.update({
        where: {
          id: companyBenefit.id,
        },
        data: {
          benefitCDF: {
            decrement: amount,
          },
          amountCDF: {
            decrement: amount,
          },
        },
      });
    }
    return {
      error: false,
      message: "Transaction effectuée avec succès",
    };
  } catch (error) {
    console.log(error);
    return {
      error: true,
      message: "Impossible de continuer cette action!",
    };
  }
};

// validate company benefit and transaction
export const validateCompanyBenefitAndTransaction = async ({
  transactionId,
}: {
  transactionId: string;
}) => {
  try {
    const user = await getUser();
    if (!user) {
      return {
        error: true,
        message: "Connectez-vous pour continuer",
      };
    }

    const isPermited = user.role === "super_admin";
    if (!isPermited) {
      return {
        error: true,
        message: "Vous n'avez pas les droits pour effectuer cette action",
      };
    }

    const companyBenefit = await prisma.otekisBenefitAmount.findFirst();
    if (!companyBenefit) {
      return {
        error: true,
        message:
          "Erreur de configuration: impossible de trouver le solde de l'entreprise.",
      };
    }

    const transaction = await prisma.otekisWithdrawalHistory.findUnique({
      where: {
        id: transactionId,
      },
    });

    if (!transaction) {
      return {
        error: true,
        message: "Transaction non trouvée",
      };
    }

    if (transaction.status !== "non-traité") {
      return {
        error: true,
        message: "Cette transaction a déjà été traitée", // or "Cette transaction a déjà été traitée"
      };
    }

    await prisma.otekisWithdrawalHistory.update({
      where: {
        id: transactionId,
      },
      data: {
        status: "traité",
      },
    });

    return { error: false, message: "Transaction traitée avec succès" };
  } catch (error) {
    console.log(error);
    return {
      error: true,
      message: "Impossible de continuer cette action!",
    };
  }
};

// cancel company benefit and transaction
export const cancelCompanyBenefitAndTransaction = async ({
  transactionId,
}: {
  transactionId: string;
}) => {
  try {
    const user = await getUser();
    if (!user) {
      return {
        error: true,
        message: "Connectez-vous pour continuer",
      };
    }

    const isPermited = user.role === "super_admin";
    if (!isPermited) {
      return {
        error: true,
        message: "Vous n'avez pas les droits pour effectuer cette action",
      };
    }

    const companyBenefit = await prisma.otekisBenefitAmount.findFirst();
    if (!companyBenefit) {
      return {
        error: true,
        message:
          "Erreur de configuration: impossible de trouver le solde de l'entreprise.",
      };
    }

    const transaction = await prisma.otekisWithdrawalHistory.findUnique({
      where: {
        id: transactionId,
      },
    });

    if (!transaction) {
      return {
        error: true,
        message: "Transaction non trouvée",
      };
    }

    if (transaction.status !== "non-traité") {
      return {
        error: true,
        message: "Cette transaction a déjà été traitée", // or "Cette transaction a déjà été traitée"
      };
    }

    // return money
    const currency = transaction.currency;
    const amount = transaction.amount;

    if (currency === "USD") {
      await prisma.otekisBenefitAmount.update({
        where: {
          id: companyBenefit.id,
        },
        data: {
          benefit: {
            increment: amount,
          },
          amount: {
            increment: amount,
          },
        },
      });
    } else {
      await prisma.otekisBenefitAmount.update({
        where: {
          id: companyBenefit.id,
        },
        data: {
          benefitCDF: {
            increment: amount,
          },
          amountCDF: {
            increment: amount,
          },
        },
      });
    }

    await prisma.otekisWithdrawalHistory.update({
      where: {
        id: transactionId,
      },
      data: {
        status: "annulé",
      },
    });

    return { error: false, message: "Transaction annulée avec succès" };
  } catch (error) {
    console.log(error);
    return {
      error: true,
      message: "Impossible de continuer cette action!",
    };
  }
};
