"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
// import { PieChart, Pie, Cell } from "recharts";
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  ShoppingBasket,
} from "lucide-react";
import { Shop } from "@prisma/client";
import { ShopDefaultSelect } from "../SelectWIthOptionsDefaultShop";
import useSelectDefaultShop from "../SelectDefaultShop";
import { useEffect, useState } from "react";
import {
  get_sales_week_shop,
  get_today_sales,
  get_total_products_shop,
  get_total_sales,
  get_weekly_benefits,
} from "@/actions/shopStatsActions";

// const salesData = [
//   { name: "Lun", sales: 120 },
//   { name: "Mar", sales: 200 },
//   { name: "Mer", sales: 150 },
//   { name: "Jeu", sales: 300 },
//   { name: "Ven", sales: 280 },
//   { name: "Sam", sales: 500 },
//   { name: "Dim", sales: 400 },
// ];

// const revenueByCategory = [
//   { name: "Cosmétiques", value: 400 },
//   { name: "Vêtements", value: 300 },
//   { name: "Accessoires", value: 200 },
// ];

type SalesType = { total: number | string; change: string };

// const COLORS = ["#2b6cb0", "#38a169", "#e53e3e"];

type Props = {
  shops: Shop[];
};

export default function OverviewMainComponent({ shops }: Props) {
  const defaultShopId = useSelectDefaultShop({ shops });
  const [total_sales, setTotal_sales] = useState<SalesType | null>(null);
  const [today_sales, setToday_sales] = useState<SalesType | null>(null);
  const [weekly_benefit, setWeekly_benefit] = useState<SalesType | null>(null);
  const [total_productShop, setTotal_productShop] = useState<SalesType | null>(
    null
  );
  const [weekly_sales, setWeekly_sales] = useState<
    | {
        name: string;
        sales: number;
      }[]
    | null
  >(null);

  useEffect(() => {
    if (!defaultShopId) return;

    const fetchStats = async () => {
      const [
        totalSalesRes,
        todaySalesRes,
        weeklyBenefitRes,
        totalProductRes,
        weeklySalesRes,
      ] = await Promise.all([
        get_total_sales({ shopId: defaultShopId }),
        get_today_sales({ shopId: defaultShopId }),
        get_weekly_benefits({ shopId: defaultShopId }),
        get_total_products_shop({ shopId: defaultShopId }),
        get_sales_week_shop({ shopId: defaultShopId }),
      ]);

      setTotal_sales(totalSalesRes.total_sales);
      setToday_sales(todaySalesRes.today_sales);
      setWeekly_benefit(weeklyBenefitRes.weekly_benefits);
      setTotal_productShop(totalProductRes.total_products);
      setWeekly_sales(weeklySalesRes);
    };

    fetchStats();
  }, [defaultShopId]);

  if (!defaultShopId) return null;

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        {/* <Button variant="outline">Exporter</Button> */}
        <ShopDefaultSelect shops={shops} />
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {total_sales ? (
          <StatCard
            title="Ventes totales"
            value={total_sales.total.toString()}
            icon={<ShoppingBag />}
            change={total_sales.change}
          />
        ) : (
          <StatCardSkeleton />
        )}

        {today_sales ? (
          <StatCard
            title="Ventes aujourd'hui"
            value={today_sales.total.toString()}
            icon={<TrendingUp />}
            change={today_sales.change}
          />
        ) : (
          <StatCardSkeleton />
        )}

        {weekly_benefit ? (
          <StatCard
            title="Bénéfices (hebdo)"
            value={weekly_benefit.total.toString()}
            icon={<DollarSign />}
            change={weekly_benefit.change}
          />
        ) : (
          <StatCardSkeleton />
        )}

        {total_productShop ? (
          <StatCard
            title="Produits disponibles"
            value={total_productShop.total.toString()}
            icon={<ShoppingBasket />}
            change={total_productShop.change}
          />
        ) : (
          <StatCardSkeleton />
        )}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Line chart ventes */}
        {weekly_sales && (
          <Card>
            <CardHeader>
              <CardTitle>Ventes cette semaine</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weekly_sales}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#6366f1"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Pie chart répartition */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Répartition par catégorie</CardTitle>
          </CardHeader>
          <CardContent className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {revenueByCategory.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card> */}
      </div>
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
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader
        className="flex flex-row items-center justify-between 
      space-y-0 pb-2"
      >
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{change}</p>
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
