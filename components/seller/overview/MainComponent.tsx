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
import { BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, ShoppingBag, DollarSign, Users } from "lucide-react";
import { Shop } from "@prisma/client";
import { ShopDefaultSelect } from "../SelectWIthOptionsDefaultShop";

const salesData = [
  { name: "Lun", sales: 120 },
  { name: "Mar", sales: 200 },
  { name: "Mer", sales: 150 },
  { name: "Jeu", sales: 300 },
  { name: "Ven", sales: 280 },
  { name: "Sam", sales: 500 },
  { name: "Dim", sales: 400 },
];

const revenueByCategory = [
  { name: "Cosmétiques", value: 400 },
  { name: "Vêtements", value: 300 },
  { name: "Accessoires", value: 200 },
];

const COLORS = ["#2b6cb0", "#38a169", "#e53e3e"];

type Props = {
  shops: Shop[];
};

export default function OverviewMainComponent({ shops }: Props) {
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
        <StatCard
          title="Ventes totales"
          value="12,450"
          icon={<ShoppingBag />}
          change="+12% cette semaine"
        />
        <StatCard
          title="Ventes aujourd'hui"
          value="320"
          icon={<TrendingUp />}
          change="+5% vs hier"
        />
        <StatCard
          title="Bénéfices (hebdo)"
          value="4,500€"
          icon={<DollarSign />}
          change="+8% cette semaine"
        />
        <StatCard
          title="Clients actifs"
          value="1,240"
          icon={<Users />}
          change="+3% vs mois dernier"
        />
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
              <LineChart data={salesData}>
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
