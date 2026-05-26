"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  MapPin,
  Phone,
  User,
  Store,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Receipt,
  AlertCircle,
  Info,
  Box,
  CalendarDays,
  CreditCard,
  BadgeCheck,
  ChevronRight,
  FileText,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { returnFormatedMoney } from "@/utils/functions";
import {
  Order,
  DeliveryOrder,
  DeliveryCompany,
} from "@/lib/generated/prisma/client";
import { useRouter } from "next/navigation";
import { capitalizeText } from "@/utils/shopFunctions";
import { OrderProductsType } from "@/actions/admins/orders/adminsOrders";
import { updateStatusSupplierOrder } from "@/actions/supplierOrderAction";
import { OrderStatusType } from "@/types/orders";
import { PDFDownloadLink } from "@react-pdf/renderer";
import {
  OtekisDeliveryInvoice,
  OtekisProductInvoice,
} from "./OtekisInvoiceTemplates";

type Props = {
  order: Order;
  shop: {
    id: string;
    name: string;
    logo: string;
    slug: string;
  };
  deliveryInfo: DeliveryOrder | null;
  deliveryCompany: {
    id: string;
    name: string;
    phone: string;
  } | null;
  products: OrderProductsType[];
};

const statusConfig: Record<
  string,
  { label: string; color: string; icon: any }
> = {
  "en cours de traitement": {
    label: "Nouveau",
    color: "bg-amber-500/10 text-amber-600 border-amber-200",
    icon: Clock,
  },
  "en attente de livraison": {
    label: "Prêt à livrer",
    color: "bg-blue-500/10 text-blue-600 border-blue-200",
    icon: Box,
  },
  "en cours de livraison": {
    label: "En chemin",
    color: "bg-violet-500/10 text-violet-600 border-violet-200",
    icon: Truck,
  },
  livrée: {
    label: "Terminée",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    icon: CheckCircle2,
  },
  annulée: {
    label: "Annulée",
    color: "bg-rose-500/10 text-rose-600 border-rose-200",
    icon: XCircle,
  },
};

const MainAdminOrder = ({
  order,
  shop,
  deliveryInfo,
  deliveryCompany,
  products,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const config =
    statusConfig[order.status] || statusConfig["en cours de traitement"];
  const Icon = config.icon;
  const isFinal = order.status === "annulée" || order.status === "livrée";

  // Note: Tu devras créer cette action ou adapter celle du fournisseur
  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setLoading(true);

      const result = await updateStatusSupplierOrder({
        orderId: order.id,
        status: newStatus as OrderStatusType,
      });

      if (result.error) {
        throw new Error(result.message);
      }

      toast.success(result.message || "Statut mis à jour");
      //   location.reload();
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-6 w-full">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground text-[10px] uppercase font-bold tracking-[0.2em]">
            <Receipt className="w-3.5 h-3.5" /> Otekis Admin • Commande
          </div>
          <h2 className="text-2xl font-black italic tracking-tighter">
            #{order.id.toUpperCase().slice(0, 12)}
          </h2>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5" />
              {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "px-4 py-1.5 rounded-xl text-sm font-bold shadow-sm",
            config.color,
          )}
        >
          <Icon className="w-4 h-4 mr-2" strokeWidth={2.5} />
          {config.label}
        </Badge>
      </div>

      {/* INVOICES */}
      {isClient && order.status === "livrée" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/20 p-4 rounded-2xl border border-dashed">
          {/* Bouton Facture Commande */}
          <PDFDownloadLink
            document={
              <OtekisProductInvoice
                order={order}
                deliveryInfo={deliveryInfo}
                shop={shop}
                products={products}
              />
            }
            fileName={`facture_commande_${order.id}.pdf`}
          >
            {({ loading }) => (
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-white shadow-sm border font-bold text-xs"
                disabled={loading}
              >
                <FileText className="w-4 h-4 text-emerald-500" />
                {loading ? "Génération..." : "Télécharger Facture Commande"}
                <Download className="w-3.5 h-3.5 ml-auto text-muted-foreground" />
              </Button>
            )}
          </PDFDownloadLink>

          {/* Bouton Facture Livraison */}
          <PDFDownloadLink
            document={
              <OtekisDeliveryInvoice
                order={order}
                deliveryInfo={deliveryInfo}
                shop={shop}
                products={products}
                deliveryCompany={deliveryCompany}
              />
            }
            fileName={`facture_livraison_${order.id}.pdf`}
          >
            {({ loading }) => (
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-white shadow-sm border font-bold text-xs"
                disabled={loading}
              >
                <Truck className="w-4 h-4 text-indigo-500" />
                {loading ? "Génération..." : "Télécharger Facture Livraison"}
                <Download className="w-3.5 h-3.5 ml-auto text-muted-foreground" />
              </Button>
            )}
          </PDFDownloadLink>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- COLONNE GAUCHE: PRODUITS & CLIENT --- */}
        <div className="lg:col-span-2 space-y-6">
          {/* LISTE DES PRODUITS */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest px-1">
              Articles ({products.length})
            </h3>
            {products.map((item) => (
              <div
                key={item.orderItemId}
                className="bg-card border rounded-2xl overflow-hidden shadow-sm hover:border-primary/20 transition-colors"
              >
                <div className="p-4 flex gap-4">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden border bg-muted shrink-0">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm truncate pr-2">
                        {capitalizeText(item.product.name)}
                      </h4>
                      <span className="text-xs font-mono font-bold">
                        {returnFormatedMoney(item.price * order.exchange)}{" "}
                        {item.currency}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {item.article.color && (
                        <Badge
                          variant="secondary"
                          className="text-[9px] px-1.5 py-0"
                        >
                          COULEUR: {item.article.color}
                        </Badge>
                      )}
                      {item.article.size && (
                        <Badge
                          variant="secondary"
                          className="text-[9px] px-1.5 py-0"
                        >
                          TAILLE: {item.article.size}
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className="text-[9px] px-1.5 py-0"
                      >
                        QTÉ: {item.quantity}
                      </Badge>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-[10px] text-muted-foreground">
                        ID Article: {item.article.id.slice(-6)}
                      </p>
                      <Link
                        href={`/produits/${item.product.id}`}
                        className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline"
                      >
                        Gérer le stock <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* SHIPPING & PAYMENT INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-sm border-b pb-2 italic">
                <User className="w-4 h-4 text-primary" /> Client & Livraison
              </div>
              <div className="flex flex-col items-start">
                <p className="font-bold text-base capitalize">
                  {order.receiverName}
                </p>
                <a
                  href={`tel:${order.receiverTel}`}
                  className="text-sm text-blue-600 font-medium hover:underline 
                    flex items-center gap-2 mt-1"
                >
                  <Phone className="w-3.5 h-3.5" /> +243 {order.receiverTel}
                </a>

                <div
                  className="flex items-start gap-2 text-sm text-muted-foreground
                 bg-muted/30 py-2 rounded-xl"
                >
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                  <span className="capitalize">{order.receiverAddress}</span>
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-sm border-b pb-2 italic">
                <CreditCard className="w-4 h-4 text-primary" /> Paiement
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Méthode</span>
                  <span className="text-sm font-bold uppercase">
                    {order.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Statut</span>
                  <BadgeCheck
                    className={cn(
                      "w-5 h-5",
                      order.paymentStatus === "payé"
                        ? "text-emerald-500"
                        : "text-amber-500",
                    )}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    numero de transaction
                  </span>
                  <span
                    className="text-sm font-mono text-muted-foreground 
                  break-all"
                  >
                    {order.paymentRef || "N/A"}
                  </span>
                </div>

                <div className="bg-primary/5 p-3 rounded-xl border border-primary/10">
                  <p className="text-[10px] font-bold uppercase text-primary mb-1">
                    Résumé financier
                  </p>
                  <div className="flex justify-between text-xs font-bold">
                    <span>Total + FDP</span>
                    <span>
                      {returnFormatedMoney(
                        order.totalAmount + order.deliveryPrice,
                      )}{" "}
                      {order.currency}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- COLONNE DROITE: ADMIN ACTIONS & SHOP --- */}
        <div className="space-y-6">
          {/* NET EARNINGS CARD (Version Dark comme ton exemple) */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden group">
            <TrendingUp className="absolute -right-4 -top-4 w-24 h-24 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-6">
              Encaissement Total
            </p>

            <div className="space-y-6">
              <div>
                <h4 className="text-4xl font-black text-emerald-400 tracking-tighter">
                  {returnFormatedMoney(order.totalAmount)}
                  <span className="text-xs ml-1 text-slate-400 font-normal">
                    {order.currency}
                  </span>
                </h4>
                <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1 italic">
                  <Info className="w-3 h-3" /> Hors frais de livraison
                  plateforme
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Frais Livraison</span>
                  <span className="font-bold text-amber-400">
                    +{order.deliveryPrice} {order.currency}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Status Admin</span>
                  <span
                    className="px-2 py-0.5 bg-white/10 rounded-full 
                  text-[9px] font-bold uppercase tracking-wider"
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SHOP ORIGIN */}
          <div className="p-4 bg-card border rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="h-12 w-12 rounded-xl border bg-background 
              flex items-center justify-center p-1.5 overflow-hidden shrink-0 
              shadow-inner"
              >
                <Image
                  src={shop.logo}
                  alt={shop.name}
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div className="min-w-0">
                <p
                  className="text-[9px] text-muted-foreground uppercase 
                font-black tracking-widest leading-none mb-1"
                >
                  Boutique d'origine
                </p>
                <p className="text-sm font-bold truncate">
                  {capitalizeText(shop.name)}
                </p>
              </div>
            </div>
            <Button
              asChild
              variant="outline"
              className="w-full h-9 text-xs font-bold rounded-xl border-dashed"
            >
              <Link href={`/${shop.slug}`}>Voir la boutique</Link>
            </Button>
          </div>

          {/* ACTIONS ADMIN */}
          {!isFinal && (
            <div
              className="bg-card border rounded-2xl p-5 shadow-sm space-y-4 
            border-t-4 border-t-primary"
            >
              <div
                className="flex items-center gap-2 font-black text-[10px] 
              uppercase tracking-widest"
              >
                <AlertCircle className="w-3.5 h-3.5 text-primary" /> Management
                Statut
              </div>
              <div className="flex flex-col gap-2">
                {order.status === "en cours de traitement" && (
                  <Button
                    onClick={() =>
                      handleUpdateStatus("en attente de livraison")
                    }
                    disabled={loading}
                    className="w-full h-11 rounded-xl shadow-lg shadow-primary/20 
                    font-bold"
                  >
                    Confirmer la préparation
                  </Button>
                )}

                {order.status === "en attente de livraison" && (
                  <Button
                    onClick={() => handleUpdateStatus("en cours de livraison")}
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 
                    rounded-xl shadow-lg shadow-indigo-200 font-bold"
                  >
                    Lancer l'expédition
                  </Button>
                )}

                {order.status === "en cours de livraison" && (
                  <Button
                    onClick={() => handleUpdateStatus("livrée")}
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 h-11 rounded-xl shadow-lg shadow-emerald-200 font-bold"
                  >
                    Clôturer (Livrée)
                  </Button>
                )}

                <Button
                  variant="ghost"
                  onClick={() => handleUpdateStatus("annulée")}
                  disabled={loading}
                  className="w-full text-rose-500 hover:bg-rose-50 hover:text-rose-600 text-[10px] font-bold uppercase tracking-widest"
                >
                  Annuler la commande
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainAdminOrder;
