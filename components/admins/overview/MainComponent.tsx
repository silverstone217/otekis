"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PieChart, Pie, Cell } from "recharts";
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Users,
  Store,
  ArrowRight,
  Clock,
} from "lucide-react";
import { ProductsByCategoryType } from "@/actions/adminsActions";
import { capitalizeText } from "@/utils/shopFunctions";

const COLORS = ["#2b6cb0", "#38a169", "#e53e3e"];

interface OverViewProps {
  total_sales: {
    total: number;
    change: string;
  };
  today_sales: {
    total: number;
    change: string;
  };
  weekly_benefit: {
    total: string;
    change: string;
  };
  total_users: { total: number; change: string };
  total_product: ProductsByCategoryType[];
  sales_Week: {
    name: string;
    sales: number;
  }[];

  total_shopsPerMonths: {
    total: number;
    change: string;
  };

  total_shops: {
    total: number;
    lateset: {
      id: string;
      name: string;
      createdAt: string;
      ownerId: string;
    }[];
  };
}

export default function OverviewMainComponent({
  total_sales,
  today_sales,
  weekly_benefit,
  total_users,
  total_product,
  sales_Week,
  total_shopsPerMonths,
  total_shops,
}: OverViewProps) {
  const totals = total_product.reduce((arr, prod) => {
    return arr + prod.value;
  }, 0);
  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <Button variant="outline">Exporter</Button>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Ventes totales"
          value={total_sales.total.toString()}
          icon={<ShoppingBag />}
          change={total_sales.change}
        />
        <StatCard
          title="Ventes aujourd'hui"
          value={today_sales.total.toString()}
          icon={<TrendingUp />}
          change={today_sales.change}
        />
        <StatCard
          title="Bénéfices (hebdo)"
          value={weekly_benefit.total}
          icon={<DollarSign />}
          change={weekly_benefit.change}
        />
        <StatCard
          title="Clients actifs"
          value={total_users.total.toString()}
          icon={<Users />}
          change={total_users.change}
        />
      </div>

      {/* shops */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* new shops */}
        <StatCard
          title="Nouveaux magasins ce mois"
          value={total_shopsPerMonths.total.toString()}
          icon={<Store />}
          change={total_shopsPerMonths.change}
        />

        {/* total shops & latest shops */}
        <div className="grid gap-6">
          {/* Total shops */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Magasins total
              </CardTitle>
              <Store className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {total_shops.total.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Magasins enregistrés sur la plateforme
              </p>
            </CardContent>
          </Card>

          {/* Latest shops */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  Derniers magasins créés
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {total_shops.lateset.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Aucun magasin récent.
                </p>
              )}

              <ul className="space-y-3">
                {total_shops.lateset.slice(0, 5).map((shop) => (
                  <li
                    key={shop.id}
                    className="flex items-center justify-between rounded-lg 
                    border p-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Store className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-sm">
                          {capitalizeText(shop.name)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Créé le {shop.createdAt}
                        </p>
                      </div>
                    </div>

                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Line chart ventes */}
        <Card>
          <CardHeader>
            <CardTitle>Ventes cette semaine</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sales_Week}>
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

        {/* Pie chart répartition */}
        <Card>
          <CardHeader>
            <CardTitle>Produits par catégorie</CardTitle>
          </CardHeader>
          <CardContent className="h-72 flex items-center justify-center flex-col">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={total_product}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {total_product.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            {totals > 0 && (
              <h2 className="flex items-center gap-1 text-lg font-bold">
                <span>{totals}</span>
                <span>{totals > 1 ? "produits" : "produit"}</span>
              </h2>
            )}
          </CardContent>
        </Card>
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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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
