"use server";
import { prisma } from "@/lib/prisma";
import { getUser } from "../actions/actions";
import {
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { returnFormatedMoney } from "@/utils/functions";
import { fr } from "date-fns/locale";

// GET AMOUNT OF SALES IN GENERAL
export const get_total_sales = async ({ shopId }: { shopId: string }) => {
  const user = await getUser();

  if (!user) {
    return {
      total_sales: {
        total: 0,
        change: "0% cette semaine",
      },
    };
  }

  // total global
  const totalSales = await prisma.shopProfitWaited.count({
    where: { isProcessed: true },
  });

  // période actuelle (semaine en cours)
  const now = new Date();
  const startThisWeek = startOfWeek(now, { weekStartsOn: 1 }); // lundi
  const endThisWeek = endOfWeek(now, { weekStartsOn: 1 });

  const salesThisWeek = await prisma.shopProfitWaited.count({
    where: {
      isProcessed: true,
      shopId,
      createdAt: { gte: startThisWeek, lte: endThisWeek },
    },
  });

  // période précédente (semaine d’avant)
  const startLastWeek = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  const endLastWeek = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

  const salesLastWeek = await prisma.shopProfitWaited.count({
    where: {
      isProcessed: true,
      createdAt: { gte: startLastWeek, lte: endLastWeek },
    },
  });

  // calcul du % de variation
  let percentChange = 0;
  if (salesLastWeek === 0 && salesThisWeek > 0) {
    percentChange = 100; // croissance infinie (on considère 100%)
  } else if (salesLastWeek > 0) {
    percentChange = ((salesThisWeek - salesLastWeek) / salesLastWeek) * 100;
  }

  const change =
    (percentChange >= 0 ? "+" : "") +
    `${percentChange.toFixed(1)}% cette semaine`;

  return {
    total_sales: {
      total: totalSales,
      change,
    },
  };
};

// GET TODAY SALES
export const get_today_sales = async ({ shopId }: { shopId: string }) => {
  const now = new Date();

  // Aujourd'hui
  const startToday = startOfDay(now);
  const endToday = endOfDay(now);

  const salesToday = await prisma.shopProfitWaited.count({
    where: {
      isProcessed: true,
      shopId,
      createdAt: { gte: startToday, lte: endToday },
    },
  });

  // Hier
  const yesterday = subDays(now, 1);
  const startYesterday = startOfDay(yesterday);
  const endYesterday = endOfDay(yesterday);

  const salesYesterday = await prisma.shopProfitWaited.count({
    where: {
      isProcessed: true,
      shopId,
      createdAt: { gte: startYesterday, lte: endYesterday },
    },
  });

  // Calcul du % de variation
  let percentChange = 0;
  if (salesYesterday === 0 && salesToday > 0) {
    percentChange = 100; // croissance infinie → 100%
  } else if (salesYesterday > 0) {
    percentChange = ((salesToday - salesYesterday) / salesYesterday) * 100;
  }

  const change =
    (percentChange >= 0 ? "+" : "") +
    `${percentChange.toFixed(0)}% aujourd'hui`;

  return {
    today_sales: {
      total: salesToday,
      change,
    },
  };
};

// GET WEEKLY BENEFIT
export const get_weekly_benefits = async ({ shopId }: { shopId: string }) => {
  const now = new Date();

  // 📌 Devise générale
  const preferences = await prisma.otekisPreferences.findFirst();
  const generalCurrency = preferences?.currency ?? "USD";

  // 📌 Cette semaine
  const startWeek = startOfWeek(now, { weekStartsOn: 1 });
  const endWeek = endOfWeek(now, { weekStartsOn: 1 });

  const salesThisWeek = await prisma.shopProfitWaited.findMany({
    where: {
      isProcessed: true,
      shopId,
      createdAt: { gte: startWeek, lte: endWeek },
    },
    select: { amount: true, currency: true, exchange: true },
  });

  // 📌 Semaine précédente
  const startLastWeek = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  const endLastWeek = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

  const salesLastWeek = await prisma.shopProfitWaited.findMany({
    where: {
      isProcessed: true,
      shopId,
      createdAt: { gte: startLastWeek, lte: endLastWeek },
    },
    select: { amount: true, currency: true, exchange: true },
  });

  // 📌 Helper pour convertir en devise générale
  const convert = (amount: number, currency: string, exchange: number) => {
    if (currency === generalCurrency) return amount;
    if (currency === "USD" && generalCurrency === "CDF")
      return amount * exchange;
    if (currency === "CDF" && generalCurrency === "USD")
      return amount / exchange;
    return amount;
  };

  // 📌 Total semaine actuelle
  const totalThisWeek = salesThisWeek.reduce(
    (sum, s) => sum + convert(s.amount, s.currency, s.exchange),
    0
  );

  // 📌 Total semaine précédente
  const totalLastWeek = salesLastWeek.reduce(
    (sum, s) => sum + convert(s.amount, s.currency, s.exchange),
    0
  );

  // 📌 Variation %
  let percentChange = 0;
  if (totalLastWeek === 0 && totalThisWeek > 0) {
    percentChange = 100;
  } else if (totalLastWeek > 0) {
    percentChange = ((totalThisWeek - totalLastWeek) / totalLastWeek) * 100;
  }

  const change =
    (percentChange >= 0 ? "+" : "") +
    `${percentChange.toFixed(0)}% cette semaine`;

  return {
    weekly_benefits: {
      total: returnFormatedMoney(totalThisWeek) + " " + generalCurrency,
      change,
    },
  };
};

// GET TOTAL PRODUCTSHOP WITH MSG
export const get_total_products_shop = async ({
  shopId,
}: {
  shopId: string;
}) => {
  const now = new Date();

  // Total produits dans la boutique (tous les temps)
  const totalProducts = await prisma.productShop.count({
    where: { shopId },
  });

  // Total produits ajoutés ce mois-ci
  const startCurrentMonth = startOfMonth(now);
  const endCurrentMonth = endOfMonth(now);

  const currentMonthCount = await prisma.productShop.count({
    where: {
      shopId,
      createdAt: { gte: startCurrentMonth, lte: endCurrentMonth },
    },
  });

  // Total produits ajoutés le mois précédent
  const startLastMonth = startOfMonth(subMonths(now, 1));
  const endLastMonth = endOfMonth(subMonths(now, 1));

  const lastMonthCount = await prisma.productShop.count({
    where: {
      shopId,
      createdAt: { gte: startLastMonth, lte: endLastMonth },
    },
  });

  // Calcul de l'évolution
  let changeMessage = "";
  if (currentMonthCount > lastMonthCount) {
    changeMessage = `+${
      currentMonthCount - lastMonthCount
    } par rapport au mois dernier`;
  } else if (currentMonthCount < lastMonthCount) {
    changeMessage = `-${
      lastMonthCount - currentMonthCount
    } par rapport au mois dernier`;
  } else {
    changeMessage = `Aucun changement par rapport au mois dernier`;
  }

  return {
    total_products: {
      total: totalProducts,
      change: changeMessage,
    },
  };
};

// GET TOTAL SALES BY WEEK WITH DAY
export const get_sales_week_shop = async ({ shopId }: { shopId: string }) => {
  const now = new Date();

  // Début et fin de la semaine (Lundi → Dimanche)
  const startWeek = startOfWeek(now, { weekStartsOn: 1 });
  const endWeek = endOfWeek(now, { weekStartsOn: 1 });

  // Chaque jour de la semaine
  const days = eachDayOfInterval({ start: startWeek, end: endWeek });

  // Récupérer les ventes pour chaque jour
  const salesData = await Promise.all(
    days.map(async (day) => {
      const start = startOfDay(day);
      const end = endOfDay(day);

      const sales = await prisma.shopProfitWaited.findMany({
        where: {
          isProcessed: true,
          shopId,
          createdAt: { gte: start, lte: end },
        },
        select: { id: true, amount: true, createdAt: true }, // récupère uniquement les champs nécessaires
      });

      return {
        name: format(day, "EEE", { locale: fr }), // Lun, Mar, Mer ...
        sales: sales.length || 0, // nombre de ventes pour le jour
        // tu peux aussi récupérer les bénéfices par jour si besoin :
        // totalBenefit: sales.reduce((sum, s) => sum + s.amount, 0)
      };
    })
  );

  return salesData;
};
