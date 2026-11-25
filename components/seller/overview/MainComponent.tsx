"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  ShoppingBasket,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shop } from "@/lib/generated/prisma/client";
import { ShopDefaultSelect } from "../SelectWIthOptionsDefaultShop";
import useSelectDefaultShop from "../SelectDefaultShop";
import {
  get_sales_week_shop,
  get_today_sales,
  get_total_products_shop,
  get_total_sales,
  get_weekly_benefits,
} from "@/actions/shopStatsActions";

type SalesType = { total: number | string; change: string };
type WeeklySale = { name: string; fullName: string; sales: number | null };

type Stats = {
  totalSales: SalesType;
  todaySales: SalesType;
  weeklyBenefit: SalesType;
  totalProducts: SalesType;
  weeklySales: WeeklySale[];
};

type Props = {
  shops: Shop[];
};

export default function OverviewMainComponent({ shops }: Props) {
  const defaultShopId = useSelectDefaultShop({ shops });
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!defaultShopId) return;

    let active = true; // évite qu'une ancienne réponse écrase la nouvelle boutique

    // On vide les anciens chiffres : sinon ceux de la boutique précédente restent affichés
    setStats(null);
    setError(null);

    (async () => {
      try {
        const [totalSales, todaySales, weeklyBenefit, totalProducts, weekly] =
          await Promise.all([
            get_total_sales({ shopId: defaultShopId }),
            get_today_sales({ shopId: defaultShopId }),
            get_weekly_benefits({ shopId: defaultShopId }),
            get_total_products_shop({ shopId: defaultShopId }),
            get_sales_week_shop({ shopId: defaultShopId }),
          ]);

        if (!active) return;

        setStats({
          totalSales: totalSales.total_sales,
          todaySales: todaySales.today_sales,
          weeklyBenefit: weeklyBenefit.weekly_benefits,
          totalProducts: totalProducts.total_products,
          weeklySales: weekly,
        });
      } catch (err) {
        console.error("[Overview] chargement des statistiques :", err);
        if (active) {
          setError("Impossible de charger les statistiques de cette boutique.");
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [defaultShopId, reloadKey]);

  return (
    <div className="p-6 space-y-8">
      {/* Header : toujours affiché, pour pouvoir choisir une boutique */}
      <div className="flex items-center justify-between flex-wrap gap-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <ShopDefaultSelect shops={shops} />
      </div>

      {!defaultShopId ? (
        <p className="text-sm text-muted-foreground">
          Sélectionnez une boutique pour afficher ses statistiques.
        </p>
      ) : error ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            Réessayer
          </Button>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats ? (
              <>
                <StatCard
                  title="Ventes totales"
                  value={stats.totalSales.total.toString()}
                  icon={<ShoppingBag />}
                  change={stats.totalSales.change}
                />
                <StatCard
                  title="Ventes aujourd’hui"
                  value={stats.todaySales.total.toString()}
                  icon={<TrendingUp />}
                  change={stats.todaySales.change}
                />
                <StatCard
                  title="Bénéfices (hebdo)"
                  value={stats.weeklyBenefit.total.toString()}
                  icon={<DollarSign />}
                  change={stats.weeklyBenefit.change}
                />
                <StatCard
                  title="Produits disponibles"
                  value={stats.totalProducts.total.toString()}
                  icon={<ShoppingBasket />}
                  change={stats.totalProducts.change}
                />
              </>
            ) : (
              [1, 2, 3, 4].map((item) => <StatCardSkeleton key={item} />)
            )}
          </div>

          {/* Courbe des ventes */}
          <Card>
            <CardHeader>
              <CardTitle>Ventes cette semaine</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              {stats ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.weeklySales}>
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} width={32} />
                    <Tooltip
                      labelFormatter={(_, payload) =>
                        payload?.[0]?.payload?.fullName ?? ""
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      name="Ventes"
                      stroke="#6366f1"
                      strokeWidth={3}
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full animate-pulse rounded-lg bg-gray-100" />
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  change,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  change: string;
}) {
  const tone = change.startsWith("+")
    ? "text-emerald-600"
    : change.startsWith("-")
      ? "text-red-600"
      : "text-muted-foreground";

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs ${tone}`}>{change}</p>
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card className="animate-pulse h-40">
      <CardHeader className="flex justify-between pb-2">
        <div className="h-4 w-24 bg-gray-300 rounded"></div>
        <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
      </CardHeader>
      <CardContent>
        <div className="h-8 w-16 bg-gray-300 rounded mb-2"></div>
        <div className="h-3 w-20 bg-gray-300 rounded"></div>
      </CardContent>
    </Card>
  );
}
