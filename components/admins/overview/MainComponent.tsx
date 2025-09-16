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
}

export default function OverviewMainComponent({
  total_sales,
  today_sales,
  weekly_benefit,
  total_users,
}: OverViewProps) {
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
