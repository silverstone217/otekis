"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  User,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  CreditCard,
  ChevronRight,
  Search,
  Truck,
  Box,
} from "lucide-react";
import { capitalizeText } from "@/utils/shopFunctions";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SupplierEarning, SupplierOrder } from "@/lib/generated/prisma/client";
import { returnFormatedMoney } from "@/utils/functions";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaymentMethod } from "@/utils/supplier";

type OrdersWIthSupplierEarning = SupplierOrder & {
  supplierEarning: SupplierEarning;
};

const statusConfig: Record<
  string,
  { label: string; color: string; icon: any }
> = {
  "en cours de traitement": {
    label: "En cours",
    color: "bg-amber-500/10 text-amber-600 border-amber-200/50",
    icon: Clock,
  },
  "en attente de livraison": {
    label: "Confirmée",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-200/50",
    icon: Box,
  },
  "en cours de livraison": {
    label: "Confirmée",
    color: "bg-emerald-700/10 text-emerald-800 border-emerald-400/50",
    icon: Truck,
  },
  livré: {
    label: "Livrée",
    color: "bg-indingo-400/10 text-indingo-500 border-indingo-200/50",
    icon: CheckCircle2,
  },
  annulé: {
    label: "Annulée",
    color: "bg-rose-500/10 text-rose-600 border-rose-200/50",
    icon: XCircle,
  },
};

const STATUS_DATA = [
  {
    label: "Toutes",
    value: "all",
  },
  {
    label: "En cours",
    value: "en cours de traitement",
  },
  {
    label: "Confirmée",
    value: "en attente de livraison",
  },
  {
    label: "Annulée",
    value: "annulé",
  },
  {
    label: "Livrée",
    value: "livré",
  },
];

const Orders = () => {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<OrdersWIthSupplierEarning[]>([]);
  const [status, setStatus] = useState("all");

  useEffect(() => {
    const getOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/supplier/orders/list");
        const data = await res.json();
        setOrders(data);
      } finally {
        setLoading(false);
      }
    };
    getOrders();
  }, []);

  const filteredOrders = useMemo(
    () =>
      orders.filter((o) => {
        if (status === "all") {
          return true;
        }

        return o.status.includes(status);
      }),
    [status, orders],
  );

  return (
    <div className="space-y-6 pt-4 pb-10">
      {/* HEADER AVEC STATS RAPIDES */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-2xl font-bold tracking-tight">Commandes</h2>
            <Badge variant="secondary" className="rounded-full px-2 py-0">
              {filteredOrders.length}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Gérez vos expéditions et suivez vos gains en temps réel.
          </p>
        </div>

        <div className="relative w-full md:w-64">
          {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une commande..."
            className="pl-9 bg-muted/20 border-none rounded-xl"
          /> */}
          <Select
            disabled={!orders || orders.length < 1}
            value={status}
            onValueChange={(val) => {
              setStatus(val);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filtrer par status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {STATUS_DATA.map((s) => {
                  return (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* LOADING SKELETON */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-48 border rounded-2xl animate-pulse bg-muted/20"
            />
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && orders.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-20 
        border-2 border-dashed rounded-3xl bg-muted/10"
        >
          <Package className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground font-medium">
            Aucune commande enregistrée
          </p>
        </div>
      )}

      {/* GRID LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {!loading &&
          filteredOrders.length > 0 &&
          filteredOrders.map((order) => {
            const config =
              statusConfig[order.status] ||
              statusConfig["en cours de traitement"];
            const Icon = config.icon;

            return (
              <Link
                href={`/fournisseurs/commandes/${order.id}`}
                key={order.id}
                className="group relative flex flex-col p-5 bg-card border 
                rounded-2xl hover:border-primary/40 hover:shadow-xl 
                hover:shadow-primary/5 transition-all duration-300"
              >
                {/* TOP: Status & ID */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 justify-center">
                    <div
                      className="h-8 w-8 rounded-lg bg-primary/5 flex items-center 
                    justify-center shrink-0"
                    >
                      <Package className="h-4 w-4 text-primary" />
                    </div>
                    <span
                      className="text-xs font-bold text-muted-foreground 
                    uppercase tracking-wider"
                    >
                      #{order.id.slice(-6)}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "px-2.5 py-0.5 rounded-full border shadow-none",
                      config.color,
                      "flex items-center justify-center",
                    )}
                  >
                    <Icon className="w-3 h-3 mr-1.5" strokeWidth={3} />
                    {config.label}
                  </Badge>
                </div>

                {/* CLIENT INFO BOX */}
                <div
                  className="space-y-2.5 mb-5 p-3 rounded-xl bg-muted/30 
                border border-muted/20 group-hover:bg-background transition-colors"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <User className="h-3.5 w-3.5 text-muted-foreground capitalize" />
                    <span className="capitalize">
                      {capitalizeText(order.receiverName)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="line-clamp-1 truncate capitalize">
                      {order.receiverAddress}
                    </span>
                  </div>
                </div>

                {/* EARNINGS SECTION (NOUVEAU) */}
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex flex-col">
                    <span
                      className="text-[10px] text-muted-foreground 
                    uppercase font-bold tracking-tighter"
                    >
                      Votre Gain
                    </span>
                    <div
                      className={`flex items-center gap-1.5 
                    ${order.supplierEarning?.amount ? "text-emerald-600" : "text-pink-700"} font-bold`}
                    >
                      <TrendingUp className="h-3 w-3" />
                      <span className="text-lg">
                        {(order.supplierEarning?.amount &&
                          returnFormatedMoney(order.supplierEarning?.amount)) ||
                          0}{" "}
                        {order.currency}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                      Qté
                    </span>
                    <p className="text-sm font-medium">{order.quantity} pcs</p>
                  </div>
                </div>

                {/* BOTTOM: Payment & Date */}
                <div className="mt-auto pt-4 border-t border-dashed flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full",
                        order.paymentStatus === "paye"
                          ? "bg-emerald-500"
                          : "bg-amber-500",
                      )}
                    />
                    <span className="text-[11px] font-medium text-muted-foreground uppercase">
                      {PaymentMethod[order.paymentMethod].label}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground font-medium italic">
                    {new Date(order.createdAt).toLocaleDateString()}
                    <ChevronRight className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            );
          })}

        {!loading && filteredOrders.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-20 border-2
           border-dashed rounded-3xl bg-muted/10 md:col-span-2 lg:col-span-3"
          >
            <Package className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">
              Aucune commande trourée, corrigez vos filtres
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
