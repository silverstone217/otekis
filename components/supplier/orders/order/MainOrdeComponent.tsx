"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
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
  PackageCheck,
  Download,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { returnFormatedMoney } from "@/utils/functions";
import {
  DeliveryCompany,
  SupplierArticle,
  SupplierEarning,
  SupplierOrder,
  SupplierProduct,
} from "@/lib/generated/prisma/client";
import { useRouter } from "next/navigation";
import { capitalizeText } from "@/utils/shopFunctions";
import { updateStatusSupplierOrder } from "@/actions/supplierOrderAction";
import { OrderStatusType } from "@/types/orders";
import { PDFDownloadLink } from "@react-pdf/renderer";
import {
  DeliveryInvoice,
  ProductInvoice,
} from "@/components/admins/orders/supplier/InvoiceTemplates";

// Types mis à jour avec tes nouveaux gains
type Props = {
  order: SupplierOrder & {
    supplierEarning: SupplierEarning | null;
    deliveryCompany: DeliveryCompany | null;
  };
  product: SupplierProduct;
  article: SupplierArticle;
  shop: { name: string; id: string; logo: string };
};

const statusConfig: Record<
  string,
  { label: string; color: string; icon: any }
> = {
  "en cours de traitement": {
    label: "À préparer",
    color: "bg-amber-500/10 text-amber-600 border-amber-200",
    icon: Clock,
  },
  "en attente de livraison": {
    label: "À Livrer",
    color: "bg-amber-600/10 text-amber-700 border-amber-400",
    icon: PackageCheck,
  },
  "En cours de livraison": {
    label: "En cours de livraison",
    color: "bg-blue-500/10 text-blue-600 border-blue-200",
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

const MainOrdeComponent = ({ article, order, product, shop }: Props) => {
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
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6 w-full">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground text-sm uppercase font-bold tracking-widest">
            <Receipt className="w-4 h-4" /> Commande
          </div>
          <h2 className="text-2xl font-black italic tracking-tighter wrap-break-word">
            #{order.id.toUpperCase()}
          </h2>
          <p className="text-xs text-muted-foreground">
            Reçue le {new Date(order.createdAt).toLocaleString()}
          </p>
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
              <ProductInvoice
                order={order}
                product={product}
                article={article}
                shop={shop}
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
              <DeliveryInvoice
                order={order}
                product={product}
                article={article}
                shop={shop}
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

      {/* ACTIONS */}
      {!isFinal && (
        <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm border-b pb-2 uppercase tracking-tighter">
            <AlertCircle className="w-4 h-4 text-orange-500" /> Mise à jour
          </div>
          <div className="flex flex-col gap-2">
            {order.status === "en cours de traitement" && (
              <Button
                onClick={() => handleUpdateStatus("en attente de livraison")}
                disabled={loading}
                className="w-full h-11 rounded-xl shadow-md shadow-blue-200 font-bold"
              >
                Valider & Prêt à livrer
              </Button>
            )}

            {order.status === "en attente de livraison" && (
              <Button
                onClick={() => handleUpdateStatus("en cours de livraison")}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 rounded-xl shadow-md shadow-indigo-200 font-bold"
              >
                Remettre au livreur ou livrer
              </Button>
            )}

            {order.status === "en cours de livraison" &&
              product.isDelivering && (
                <Button
                  onClick={() => handleUpdateStatus("livrée")}
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 h-11 rounded-xl shadow-md shadow-emerald-200 font-bold"
                >
                  Confirmer la livraison
                </Button>
              )}
            {order.status !== "livrée" && order.status !== "annulée" && (
              <Button
                variant="ghost"
                onClick={() => handleUpdateStatus("annulée")}
                disabled={loading}
                className="w-full text-rose-600 hover:bg-rose-50 hover:text-rose-700 text-xs font-semibold"
              >
                Annuler la commande
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- COLONNE GAUCHE: PRODUIT & CLIENT --- */}
        <div className="lg:col-span-2 space-y-6">
          {/* PRODUCT CARD */}
          <div
            className="bg-card border rounded-2xl 
          overflow-hidden shadow-sm"
          >
            <div
              className="p-1 bg-muted/30 border-b 
            flex items-center justify-between px-4 py-2"
            >
              <span
                className="text-[10px] font-bold 
              uppercase text-muted-foreground tracking-widest"
              >
                Détails de l'article
              </span>
              <span
                className="text-[10px] font-mono 
              bg-background px-2 py-0.5 rounded border"
              >
                {article.commandNumber}
              </span>
            </div>
            <div className="p-4 flex gap-5">
              <div
                className="relative w-24 h-24 rounded-xl 
              overflow-hidden border bg-muted shadow-inner shrink-0"
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col justify-center">
                <h3
                  className="text-lg font-bold leading-tight mb-1
                line-clamp-2 md:line-clamp-3
                "
                >
                  {capitalizeText(product.name)}
                </h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {article.color && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] uppercase"
                    >
                      {article.color}
                    </Badge>
                  )}
                  {article.size && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] uppercase"
                    >
                      {article.size}
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className="text-[10px] uppercase border-primary/20 text-primary"
                  >
                    {order.quantity} Unité(s)
                  </Badge>
                </div>
                <div
                  className="text-sm font-medium text-emerald-600 
                bg-emerald-50 self-start px-2 py-0.5 rounded
                flex items-center gap-x-2 gap-y-0.5 flex-wrap
                "
                >
                  <span className="text-xs">Prix Unitaire:</span>
                  <span>
                    {product.price *
                      (order.currency === "CDF" ? order.exchange : 1)}{" "}
                    <span className="text-xs">{order.currency}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SHIPPING INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-sm border-b pb-2">
                <User className="w-4 h-4 text-primary" /> Destination
              </div>
              <div className="space-y-3">
                <p className="font-bold text-base capitalize">
                  {order.receiverName}
                </p>
                <div className="space-y-1.5">
                  <a
                    href={`tel:${order.receiverTel}`}
                    className="flex items-center gap-2 text-sm 
                    text-blue-600 hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" /> +243{" "}
                    {order.receiverTel}
                  </a>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span className="capitalize">{order.receiverAddress}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-sm border-b pb-2">
                <Truck className="w-4 h-4 text-primary" /> Expédition
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Transporteur</span>
                  <span
                    className="px-2 py-0.5 bg-white/10 rounded-full 
                  text-[9px] font-bold uppercase tracking-wider"
                  >
                    {order.deliveryCompany?.name || order.deliverName || "N/A"}{" "}
                    - +(243){" "}
                    {order.deliveryCompany?.phone ||
                      order.deliverPhone ||
                      "N/A"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Frais Livraison</span>
                  <span className="font-bold text-amber-400">
                    {order.deliveryPrice} {order.currency}
                  </span>
                </div>

                {product.isDelivering && (
                  <p className="text-xs">
                    <Info className="w-3.5 h-3.5 text-blue-500 inline-block text-xs mr-1.5" />{" "}
                    Les frais de livraison sont perçus à la livraison.
                  </p>
                )}

                {order.ShipmentNumber && (
                  <p
                    className="text-xs font-mono bg-primary/5 p-2 rounded 
                  border border-primary/10"
                  >
                    Suivi: {order.ShipmentNumber}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- COLONNE DROITE: FINANCE & ACTIONS --- */}
        <div className="space-y-6">
          {/* FINANCIAL SUMMARY */}
          <div
            className="bg-slate-900 text-white rounded-2xl p-5 
          shadow-lg relative overflow-hidden group"
          >
            <TrendingUp
              className="absolute -right-4 -top-4 w-24 h-24 
            text-white/5 rotate-12 group-hover:rotate-0 transition-transform 
            duration-500"
            />
            <p
              className="text-[10px] uppercase tracking-widest font-bold 
            text-slate-400 mb-4"
            >
              Votre Revenu Net
            </p>
            <div className="space-y-4">
              <div>
                <h4
                  className={`text-3xl font-black 
                    ${
                      order.supplierEarning?.amount
                        ? "text-emerald-600"
                        : "text-pink-700"
                    }`}
                >
                  {order.supplierEarning?.amount
                    ? returnFormatedMoney(order.supplierEarning.amount)
                    : "0.00"}
                  <span className="text-xs ml-1 text-slate-300 font-normal">
                    {order.currency}
                  </span>
                </h4>
                <p className="text-[10px] text-slate-400 mt-1 italic">
                  Calculé sur le prix minimum fournisseur
                </p>
              </div>
              <div className="pt-4 border-t border-white/10 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Paiement Client</span>
                  <span className="font-medium">
                    {returnFormatedMoney(order.totalAmount)} {order.currency}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Statut Paiement</span>
                  <Badge
                    className="h-4 text-[9px] bg-emerald-500/20 
                  text-emerald-400 border-none"
                  >
                    {order.paymentStatus}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* SHOP ORIGIN */}
          <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-2xl border border-dashed">
            <div className="h-10 w-10 rounded-full border bg-background flex items-center justify-center p-1 overflow-hidden">
              <Image
                src={shop.logo}
                alt={shop.name}
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider leading-none">
                Vendu par
              </p>
              <p className="text-sm font-bold truncate max-w-[150px]">
                {capitalizeText(shop.name)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainOrdeComponent;
