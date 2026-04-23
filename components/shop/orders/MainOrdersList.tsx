"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { UnifiedOrder } from "@/app/(shop)/[slug]/commandes/page";
import { Preferences, Shop } from "@/lib/generated/prisma/client";
import {
  Search,
  Filter,
  Package,
  ChevronRight,
  Calendar,
  CircleDollarSign,
  SearchX,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { luminanceColor } from "@/utils/shopFunctions";

type Props = {
  shop: Shop;
  orders: UnifiedOrder[];
  preferences: Preferences;
};

const statusColors: Record<string, string> = {
  "en cours de traitement": "bg-amber-100 text-amber-700 border-amber-200",
  "en attente de livraison": "bg-slate-100 text-slate-700 border-slate-200",
  "en cours de livraison": "bg-blue-100 text-blue-700 border-blue-200",
  livré: "bg-emerald-100 text-emerald-700 border-emerald-200",
  annulé: "bg-rose-100 text-rose-700 border-rose-200",
};

const MainOrdersList = ({ shop, orders, preferences }: Props) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Logique de filtrage
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch = order.id
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, orders]);

  // Extraction des status uniques pour le filtre
  const uniqueStatuses = useMemo(() => {
    return ["all", ...Array.from(new Set(orders.map((o) => o.status)))];
  }, [orders]);

  const luminance = luminanceColor(preferences.background);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* HEADER & FILTERS */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Mes Commandes</h1>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Numéro de commande (ex: clx...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-muted/30 border-none rounded-xl"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger
              className="w-full sm:w-[180px] rounded-xl 
            bg-muted/30 border-none capitalize"
            >
              <Filter className="w-4 h-4 mr-2 opacity-50" />
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              {uniqueStatuses.map((status) => (
                <SelectItem key={status} value={status} className="capitalize">
                  {status === "all" ? "Tous les statuts" : status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ORDERS LIST */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => {
              // Redirection dynamique selon l'origine
              const detailsPath =
                order.product?.origin === "otekis"
                  ? `/${shop.slug}/commandes/${order.id}`
                  : `/${shop.slug}/commandes/fournisseurs/${order.id}`;

              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Link
                    href={detailsPath}
                    className="group block bg-card border rounded-2xl p-4 
                    hover:shadow-lg hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      {/* IMAGE PRODUIT */}
                      <div
                        className="relative h-16 w-16 rounded-xl 
                      overflow-hidden border bg-muted shrink-0"
                      >
                        {order.product?.image ? (
                          <Image
                            src={order.product.image}
                            alt={order.product.name}
                            fill
                            className="object-cover group-hover:scale-110 
                            transition-transform duration-500"
                          />
                        ) : (
                          <div
                            className="h-full w-full flex items-center 
                          justify-center"
                          >
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* INFOS CENTRALES */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <span
                            className="text-[10px] font-mono font-bold 
                          text-muted-foreground uppercase tracking-wider"
                          >
                            #{order.id.slice(-8)}
                          </span>
                          <span
                            className="text-[10px] flex items-center gap-1 
                          text-muted-foreground"
                          >
                            <Calendar className="h-3" />
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h3 className="font-bold text-sm truncate capitalize line-clamp-2">
                          {order.product?.name || "Produit inconnu"}
                        </h3>

                        <div className="flex items-center gap-3">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[9px] uppercase px-2 py-0 border-none shadow-none",
                              statusColors[order.status] || "bg-slate-100",
                            )}
                          >
                            {order.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {order.quantity} article(s)
                          </span>
                        </div>
                      </div>

                      {/* MONTANT & CHEVRON */}
                      <div
                        className="text-right flex flex-col items-end gap-2 pl-2"
                        style={{
                          color: "black",
                        }}
                      >
                        <div className="flex items-center gap-1 font-black text-sm">
                          {order.totalAmount.toLocaleString()}
                          <span className="text-[10px] font-normal">
                            {order.currency}
                          </span>
                        </div>
                        <ChevronRight
                          className="h-5 w-5 text-muted-foreground 
                        group-hover:translate-x-1 transition-transform"
                        />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })
          ) : (
            /* EMPTY STATE */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 flex flex-col items-center justify-center border-2 border-dashed rounded-3xl bg-muted/10"
            >
              <SearchX className="h-12 w-12 text-muted-foreground/20 mb-4" />
              <p className="text-muted-foreground font-medium text-sm">
                Aucune commande trouvée pour cette recherche
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
                className="mt-2 text-xs text-primary font-bold hover:underline"
              >
                Réinitialiser les filtres
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MainOrdersList;
