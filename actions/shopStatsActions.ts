"use server";

import { prisma } from "@/lib/prisma";
import { getUser } from "../actions/actions";
import {
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { fr } from "date-fns/locale";
import { returnFormatedMoney } from "@/utils/functions";

/* -------------------------------------------------------------------------- */
/*  Helpers (non exportés)                                                    */
/* -------------------------------------------------------------------------- */

type Range = { gte: Date; lte: Date };

const WEEK = { weekStartsOn: 1 } as const; // semaine du lundi au dimanche

const dayRange = (d: Date): Range => ({
  gte: startOfDay(d),
  lte: endOfDay(d),
});
const weekRange = (d: Date): Range => ({
  gte: startOfWeek(d, WEEK),
  lte: endOfWeek(d, WEEK),
});
const monthRange = (d: Date): Range => ({
  gte: startOfMonth(d),
  lte: endOfMonth(d),
});

/**
 * Ces actions sont appelables par n'importe qui avec n'importe quel shopId :
 * on vérifie donc que l'utilisateur est connecté ET propriétaire de la boutique.
 */
async function assertShopOwner(shopId: string) {
  const user = await getUser();
  if (!user) throw new Error("Accès non autorisé.");

  const shop = await prisma.shop.findFirst({
    where: { id: shopId, userId: user.id },
    select: { id: true },
  });
  if (!shop) throw new Error("Boutique introuvable ou accès refusé.");
}

function variation(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function formatChange(percent: number, digits: number, suffix: string) {
  const sign = percent >= 0 ? "+" : "";
  return `${sign}${percent.toFixed(digits).replace(".", ",")}% ${suffix}`;
}

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

/** Nombre de ventes (plateforme + fournisseurs) sur une période. */
async function countSales(shopId: string, range?: Range) {
  const where = {
    shopId,
    isProcessed: true,
    ...(range ? { createdAt: range } : {}),
  };

  const [platform, supplier] = await Promise.all([
    prisma.shopProfitWaited.count({ where }),
    prisma.supplierShopEarning.count({ where }),
  ]);
  return platform + supplier;
}

type Earning = { amount: number; currency: string; exchange: number };

/**
 * ⚠️ Les deux modèles n'ont pas le même nom de champ pour le taux :
 *  - ShopProfitWaited.exchange
 *  - SupplierShopEarning.exchangeRate
 * On les ramène à la même forme.
 */
async function getEarnings(shopId: string, range: Range): Promise<Earning[]> {
  const where = { shopId, isProcessed: true, createdAt: range };

  const [platform, supplier] = await Promise.all([
    prisma.shopProfitWaited.findMany({
      where,
      select: { amount: true, currency: true, exchange: true },
    }),
    prisma.supplierShopEarning.findMany({
      where,
      select: { amount: true, currency: true, exchangeRate: true },
    }),
  ]);

  return [
    ...platform,
    ...supplier.map(({ exchangeRate, ...rest }) => ({
      ...rest,
      exchange: exchangeRate,
    })),
  ];
}

/** Convertit vers la devise générale (taux = 1 USD en CDF au moment de la vente). */
function sumInCurrency(earnings: Earning[], target: string) {
  return earnings.reduce((sum, { amount, currency, exchange }) => {
    if (currency === target) return sum + amount;

    if (!Number.isFinite(exchange) || exchange <= 0) {
      console.warn("[shopStats] taux de change invalide, ligne ignorée");
      return sum;
    }
    if (currency === "USD" && target === "CDF") return sum + amount * exchange;
    if (currency === "CDF" && target === "USD") return sum + amount / exchange;
    return sum + amount;
  }, 0);
}

async function countProducts(shopId: string, range?: Range) {
  const where = { shopId, ...(range ? { createdAt: range } : {}) };

  const [platform, supplier] = await Promise.all([
    prisma.productShop.count({ where }),
    prisma.supplierProductShop.count({ where }),
  ]);
  return platform + supplier;
}

/* -------------------------------------------------------------------------- */
/*  Actions                                                                   */
/* -------------------------------------------------------------------------- */

// VENTES TOTALES (+ variation par rapport à la semaine dernière)
export const get_total_sales = async ({ shopId }: { shopId: string }) => {
  await assertShopOwner(shopId);

  const now = new Date();
  const [total, thisWeek, lastWeek] = await Promise.all([
    countSales(shopId),
    countSales(shopId, weekRange(now)),
    countSales(shopId, weekRange(subWeeks(now, 1))),
  ]);

  return {
    total_sales: {
      total,
      change: formatChange(
        variation(thisWeek, lastWeek),
        1,
        "vs semaine dernière",
      ),
    },
  };
};

// VENTES D'AUJOURD'HUI (+ variation par rapport à hier)
export const get_today_sales = async ({ shopId }: { shopId: string }) => {
  await assertShopOwner(shopId);

  const now = new Date();
  const [today, yesterday] = await Promise.all([
    countSales(shopId, dayRange(now)),
    countSales(shopId, dayRange(subDays(now, 1))),
  ]);

  return {
    today_sales: {
      total: today,
      change: formatChange(variation(today, yesterday), 0, "vs hier"),
    },
  };
};

// BÉNÉFICES DE LA SEMAINE (convertis dans la devise générale)
export const get_weekly_benefits = async ({ shopId }: { shopId: string }) => {
  await assertShopOwner(shopId);

  const now = new Date();

  const [preferences, thisWeek, lastWeek] = await Promise.all([
    prisma.otekisPreferences.findFirst(),
    getEarnings(shopId, weekRange(now)),
    getEarnings(shopId, weekRange(subWeeks(now, 1))),
  ]);

  const currency = preferences?.currency ?? "USD";
  const totalThisWeek = sumInCurrency(thisWeek, currency);
  const totalLastWeek = sumInCurrency(lastWeek, currency);

  return {
    weekly_benefits: {
      total: `${returnFormatedMoney(totalThisWeek)} ${currency}`,
      change: formatChange(
        variation(totalThisWeek, totalLastWeek),
        0,
        "vs semaine dernière",
      ),
    },
  };
};

// PRODUITS DE LA BOUTIQUE (+ ajouts du mois comparés au mois dernier)
export const get_total_products_shop = async ({
  shopId,
}: {
  shopId: string;
}) => {
  await assertShopOwner(shopId);

  const now = new Date();
  const [total, thisMonth, lastMonth] = await Promise.all([
    countProducts(shopId),
    countProducts(shopId, monthRange(now)),
    countProducts(shopId, monthRange(subMonths(now, 1))),
  ]);

  const diff = thisMonth - lastMonth;
  const change =
    diff === 0
      ? "Aucun changement par rapport au mois dernier"
      : `${diff > 0 ? "+" : "-"}${Math.abs(diff)} par rapport au mois dernier`;

  return { total_products: { total, change } };
};

// VENTES PAR JOUR (semaine en cours) — 2 requêtes au lieu de 14
export const get_sales_week_shop = async ({
  shopId,
}: {
  shopId: string;
}): Promise<{ name: string; fullName: string; sales: number | null }[]> => {
  await assertShopOwner(shopId);

  const now = new Date();
  const range = weekRange(now);
  const where = { shopId, isProcessed: true, createdAt: range };

  const [platform, supplier] = await Promise.all([
    prisma.shopProfitWaited.findMany({ where, select: { createdAt: true } }),
    prisma.supplierShopEarning.findMany({ where, select: { createdAt: true } }),
  ]);

  const perDay = new Map<string, number>();
  for (const { createdAt } of [...platform, ...supplier]) {
    const key = format(createdAt, "yyyy-MM-dd");
    perDay.set(key, (perDay.get(key) ?? 0) + 1);
  }

  const endOfToday = endOfDay(now);

  return eachDayOfInterval({ start: range.gte, end: range.lte }).map((day) => ({
    name: capitalize(format(day, "EEE", { locale: fr }).replace(".", "")),
    fullName: capitalize(format(day, "EEEE d MMMM", { locale: fr })),
    // jours à venir = null : la courbe s'arrête à aujourd'hui au lieu de retomber à 0
    sales: isAfter(day, endOfToday)
      ? null
      : (perDay.get(format(day, "yyyy-MM-dd")) ?? 0),
  }));
};
