"use server";
import { AdminsPermitData, PERMITED_ROLES } from "@/utils/dataAdd";
import { getUser } from "./actions";
import { prisma } from "@/lib/prisma";
import {
  startOfWeek,
  endOfWeek,
  subWeeks,
  startOfDay,
  endOfDay,
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
} from "date-fns";
import { formatMoney } from "@/app/(admin)/finances/retrait/WithdrawTable";
import { returnFormatedMoney } from "@/utils/functions";

// AUTHORIZE ACTION
export const isAuthorizedToContinue = async ({
  permissions,
  permit,
}: {
  permissions: string[];
  permit: string;
}) => {
  for (const permission of permissions) {
    if (permission.includes(permit)) {
      return true;
    }
  }
  return false;
};

// GET HISTORY ORDERS DATA
export const getAllHistoryOrders = async () => {
  const user = await getUser();

  if (!user) {
    return {
      error: true,
      data: [],
      message: "Non connecté pour acceder à ces informations",
    };
  }

  const isPermit = isAuthorizedToContinue({
    permissions: AdminsPermitData,
    permit: user.role,
  });

  if (!isPermit) {
    return {
      error: true,
      data: [],
      message: "Accès refusé!",
    };
  }

  const getAllHisOrders = await prisma.historyOrder.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  const allHisOrdersWithArticles = getAllHisOrders
    ? getAllHisOrders.map((his) => ({
        id: his.articleId ? his.articleId : "Supprimé recemment",
        orderId: his.id,
        productId: his.productId,
        name: his.productName,
        stock: his.stock,
        createdAt: his.createdAt,
        orderNumber: his.commandNumber,
      }))
    : [];

  return {
    data: allHisOrdersWithArticles ?? [],
    error: false,
    message: "Données recupeérées",
  };
};

// GET AMOUNT OF SALES IN GENERAL
export const get_total_sales = async () => {
  const user = await getUser();
  const isPermit = user && PERMITED_ROLES.includes(user?.role);

  if (!isPermit) {
    return {
      total_sales: {
        total: 0,
        change: "0% cette semaine",
      },
    };
  }

  // total global
  const totalSales = await prisma.otekisProfitWaited.count({
    where: { isProcessed: true },
  });

  // période actuelle (semaine en cours)
  const now = new Date();
  const startThisWeek = startOfWeek(now, { weekStartsOn: 1 }); // lundi
  const endThisWeek = endOfWeek(now, { weekStartsOn: 1 });

  const salesThisWeek = await prisma.otekisProfitWaited.count({
    where: {
      isProcessed: true,
      createdAt: { gte: startThisWeek, lte: endThisWeek },
    },
  });

  // période précédente (semaine d’avant)
  const startLastWeek = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  const endLastWeek = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

  const salesLastWeek = await prisma.otekisProfitWaited.count({
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

// GET AMOUNT SALE TODAY
export const get_today_sales = async () => {
  const user = await getUser();
  const isPermit = user && PERMITED_ROLES.includes(user?.role);

  if (!isPermit) {
    return {
      today_sales: {
        total: 0,
        change: "0% aujourd'hui",
      },
    };
  }

  const now = new Date();

  // aujourd'hui
  const startToday = startOfDay(now);
  const endToday = endOfDay(now);

  const salesToday = await prisma.otekisProfitWaited.count({
    where: {
      isProcessed: true,
      createdAt: { gte: startToday, lte: endToday },
    },
  });

  // hier
  const yesterday = subDays(now, 1);
  const startYesterday = startOfDay(yesterday);
  const endYesterday = endOfDay(yesterday);

  const salesYesterday = await prisma.otekisProfitWaited.count({
    where: {
      isProcessed: true,
      createdAt: { gte: startYesterday, lte: endYesterday },
    },
  });

  // calcul variation %
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

// BENEFIT FOR A WEEK
export const get_weekly_benefits = async () => {
  const user = await getUser();
  const isPermit = user && PERMITED_ROLES.includes(user?.role);

  if (!isPermit) {
    return {
      weekly_benefits: {
        total: formatMoney(0, "USD"),
        change: "0% cette semaine",
      },
    };
  }

  // 📌 Devise générale
  const preferences = await prisma.otekisPreferences.findFirst();
  const generalCurrency = preferences?.currency ?? "USD";

  const now = new Date();

  // 📌 Cette semaine
  const startWeek = startOfWeek(now, { weekStartsOn: 1 });
  const endWeek = endOfWeek(now, { weekStartsOn: 1 });

  const salesThisWeek = await prisma.otekisProfitWaited.findMany({
    where: {
      isProcessed: true,
      createdAt: { gte: startWeek, lte: endWeek },
    },
    select: { benefit: true, currency: true, exchange: true },
  });

  // 📌 Semaine précédente
  const startLastWeek = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  const endLastWeek = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

  const salesLastWeek = await prisma.otekisProfitWaited.findMany({
    where: {
      isProcessed: true,
      createdAt: { gte: startLastWeek, lte: endLastWeek },
    },
    select: { benefit: true, currency: true, exchange: true },
  });

  // 📌 Helper pour convertir en devise générale
  const convert = (benefit: number, currency: string, exchange: number) => {
    if (currency === generalCurrency) return benefit;
    if (currency === "USD" && generalCurrency === "CDF")
      return benefit * exchange;
    if (currency === "CDF" && generalCurrency === "USD")
      return benefit / exchange;
    return benefit;
  };

  // 📌 Total semaine actuelle
  const totalThisWeek = salesThisWeek.reduce(
    (sum, s) => sum + convert(s.benefit, s.currency, s.exchange),
    0
  );

  // 📌 Total semaine précédente
  const totalLastWeek = salesLastWeek.reduce(
    (sum, s) => sum + convert(s.benefit, s.currency, s.exchange),
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

// GET TOTAL CLIENT AND SELLER
export const get_total_users = async () => {
  const user = await getUser();
  const isPermit = user && PERMITED_ROLES.includes(user?.role);

  if (!isPermit) {
    return {
      total_users: {
        total: 0,
        change: "0% ce mois",
      },
    };
  }

  const now = new Date();

  // 📌 Ce mois
  const startThisMonth = startOfMonth(now);
  const endThisMonth = endOfMonth(now);

  const usersThisMonth = await prisma.user.count({
    where: {
      role: { notIn: ["admin", "super_admin_employe"] },
      createdAt: { gte: startThisMonth, lte: endThisMonth },
    },
  });

  // 📌 Mois précédent
  const lastMonth = subMonths(now, 1);
  const startLastMonth = startOfMonth(lastMonth);
  const endLastMonth = endOfMonth(lastMonth);

  const usersLastMonth = await prisma.user.count({
    where: {
      role: { in: ["admin", "super_admin", "employee"] },
      createdAt: { gte: startLastMonth, lte: endLastMonth },
    },
  });

  // 📌 Variation %
  let percentChange = 0;
  if (usersLastMonth === 0 && usersThisMonth > 0) {
    percentChange = 100;
  } else if (usersLastMonth > 0) {
    percentChange = ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100;
  }

  const change =
    (percentChange >= 0 ? "+" : "") + `${percentChange.toFixed(0)}% ce mois`;

  return {
    total_users: {
      total: usersThisMonth,
      change,
    },
  };
};
