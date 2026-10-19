"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  House,
  User,
  Truck,
  Package,
  ChevronRight,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  TrendingUp,
  CreditCard,
  Calendar,
  Download,
  FileText,
  FileArchive,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { returnFormatedMoney } from "@/utils/functions";
import { capitalizeText } from "@/utils/shopFunctions";
import { cn } from "@/lib/utils";
import {
  DeliveryCompany,
  Preferences,
  Shop,
  SupplierArticle,
  SupplierEarning,
  SupplierOrder,
  SupplierProduct,
} from "@/lib/generated/prisma/client";
import { PaymentMethod } from "@/utils/supplier";
import { useRouter } from "next/navigation";
import { updateStatusSupplierOrder } from "@/actions/supplierOrderAction";
import { OrderStatusType } from "@/types/orders";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import {
  DeliveryInvoice,
  ProductInvoice,
} from "@/components/admins/orders/supplier/InvoiceTemplates";
import DigitalDownloadCard from "./Digitaldownloadcard";

// Sous-composant pour l'ID copiable
const CopyableOrderId = ({ orderId }: { orderId: string }) => (
  <div className="flex items-center justify-center gap-2 text-xs font-mono text-muted-foreground bg-muted/50 py-1 px-3 rounded-full w-fit mx-auto">
    <span>ID: {orderId}</span>
  </div>
);

type Props = {
  order: SupplierOrder;
  article: SupplierArticle;
  shop: Shop;
  preferences: Preferences;
  deliveryCompany: DeliveryCompany | null;
  product: SupplierProduct;
  isDigitalProduct: boolean;
};

const MainSupplierOrderView = ({
  order,
  product,
  article,
  shop,
  preferences,
  deliveryCompany,
  isDigitalProduct,
}: Props) => {
  const { buttonColor: borderColor, buttonRadius: borderRadius } = preferences;

  const statusColors: Record<string, string> = {
    "en cours de traitement": "text-amber-600 bg-amber-50 border-amber-200",
    "en attente de livraison": "text-blue-600 bg-blue-50 border-blue-200",
    "en cours de livraison": "text-indigo-600 bg-indigo-50 border-indigo-200",
    livrée: "text-emerald-600 bg-emerald-50 border-emerald-200",
    annulée: "text-rose-600 bg-rose-50 border-rose-200",
  };

  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
      {/* SECTION 1: HEADER & STATUT */}
      <div className="text-center space-y-3">
        <CopyableOrderId orderId={order.id} />
        <div className="space-y-1">
          <h2
            className={cn(
              "text-3xl font-black uppercase tracking-tight italic",
              statusColors[order.status]?.split(" ")[0],
            )}
          >
            {order.status}
          </h2>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>
              Passée le{" "}
              {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 2: INFOS CLIENT & LIVRAISON / TÉLÉCHARGEMENT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          style={{ borderColor, borderRadius }}
          className="shadow-sm border"
        >
          <CardContent className="p-6 space-y-6">
            {isDigitalProduct ? (
              // PRODUIT NUMÉRIQUE : mode de réception
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/5 rounded-lg">
                  <FileArchive className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
                    Mode de réception
                  </p>
                  <p className="text-sm font-medium mt-1 leading-relaxed">
                    Téléchargement numérique (fichier ZIP)
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {order.status === "en cours de traitement"
                      ? "Le téléchargement sera disponible dès que le fournisseur aura validé votre commande."
                      : order.status === "annulée" || order.status === "annulé"
                        ? "Cette commande a été annulée, le téléchargement n'est plus possible."
                        : "Votre fichier est prêt, vous pouvez le télécharger depuis cette page."}
                  </p>
                </div>
              </div>
            ) : (
              // PRODUIT PHYSIQUE : adresse de livraison
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/5 rounded-lg">
                  <House className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
                    Adresse de livraison
                  </p>
                  <p className="text-sm font-medium mt-1 leading-relaxed">
                    {order.receiverAddress}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/5 rounded-lg">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
                  {isDigitalProduct ? "Acheteur" : "Destinataire"}
                </p>
                <p className="text-sm font-bold mt-1">
                  {capitalizeText(order.receiverName)}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Phone className="w-3 h-3" /> +243 {order.receiverTel}
                </p>
              </div>
            </div>

            {/* CANCEL ORDER IF STILL on TRAITEMENT */}
            {order.status === "en cours de traitement" && (
              <CancelOrderComponent
                onClick={handleUpdateStatus}
                loading={loading}
                preferences={preferences}
                orderId={order.id}
              />
            )}
          </CardContent>
        </Card>

        {/* RÉSUMÉ FINANCIER */}
        <Card
          style={{ borderColor, borderRadius }}
          className="shadow-sm border"
        >
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <span className="text-sm font-medium">Mode de paiement</span>
              <Badge variant="outline" className="capitalize">
                {PaymentMethod[order.paymentMethod].label}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sous-total</span>
                <span>
                  {returnFormatedMoney(order.totalAmount)} {order.currency}
                </span>
              </div>

              {/* Frais de livraison : seulement pour les produits physiques */}
              {!isDigitalProduct && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Frais de livraison
                  </span>
                  <span>
                    {order.deliveryPrice > 0
                      ? `${returnFormatedMoney(order.deliveryPrice)} ${order.currency}`
                      : "Gratuit"}
                  </span>
                </div>
              )}

              <Separator className="my-2" />
              <div className="flex justify-between items-end">
                <span className="font-bold">Total payé</span>
                <div className="text-right">
                  <span className="text-2xl font-black text-primary">
                    {returnFormatedMoney(
                      order.totalAmount +
                        (isDigitalProduct ? 0 : order.deliveryPrice),
                    )}
                  </span>
                  <span className="text-xs ml-1 font-bold">
                    {order.currency}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 3: L'ARTICLE COMMANDÉ */}
      <section>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          Détails de l'article
        </h3>
        <Card
          style={{ borderRadius }}
          className="overflow-hidden border-none bg-muted/30"
        >
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4">
            <div
              className="relative w-32 h-32 rounded-xl overflow-hidden
             shadow-md bg-white shrink-0"
            >
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 text-center sm:text-left space-y-2 capitalize">
              <h4 className="text-xl font-bold">{product.name}</h4>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                {!isDigitalProduct && article.color && (
                  <Badge variant="secondary">Couleur: {article.color}</Badge>
                )}
                {!isDigitalProduct && article.size && (
                  <Badge variant="secondary">Taille: {article.size}</Badge>
                )}
                {isDigitalProduct ? (
                  <Badge variant="outline">Produit numérique</Badge>
                ) : (
                  <Badge variant="outline">Qté: {order.quantity}</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 italic">
                {product.description}
              </p>
            </div>
            <Link
              href={`/${shop.slug}/catalogues/${product.id}`}
              className="p-2 hover:bg-background rounded-full transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-muted-foreground" />
            </Link>
          </div>
        </Card>
      </section>

      {/* SECTION 4.1: TÉLÉCHARGEMENT DIGITAL */}
      {isDigitalProduct && (
        <DigitalDownloadCard
          product={product}
          article={article}
          orderId={order.id}
          orderStatus={order.status}
          preferences={preferences}
        />
      )}

      {/* SECTION 5.1: INFO LIVREUR SI DISPONIBLE */}
      {deliveryCompany && !product.isDelivering && (
        <section>
          <Card
            style={{ borderColor, borderRadius, color: preferences.textColor }}
            className="border border-dashed bg-primary/5"
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div
                  className="h-12 w-12 bg-white rounded-full 
                flex items-center justify-center shadow-sm"
                >
                  <Truck className="w-6 h-6 text-primary" />
                </div>
                <div style={{ color: preferences.textColor }}>
                  <h4 className="font-bold text-sm">Pris en charge par</h4>
                  <p
                    className={cn(
                      "text-sm font-medium capitalize mt-0.5",
                      preferences.textColor,
                    )}
                  >
                    {deliveryCompany.name}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* SECTION 5.1: INFO FOURNISSEUR - LIVREUR SI DISPONIBLE */}
      {product.isDelivering && (
        <section>
          <Card
            style={{ borderColor, borderRadius, color: preferences.textColor }}
            className="border border-dashed bg-primary/5"
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div
                  className="h-12 w-12 bg-white rounded-full 
                flex items-center justify-center shadow-sm"
                >
                  <Truck className="w-6 h-6 text-primary" />
                </div>
                <div style={{ color: preferences.textColor }}>
                  <h4 className="font-bold text-sm">Pris en charge par</h4>
                  <p
                    className={cn(
                      "text-sm font-medium capitalize mt-0.5",
                      preferences.textColor,
                    )}
                  >
                    {order.deliverName} - {order.deliverPhone}
                  </p>

                  <p>
                    {order.deliveryPrice} {order.currency}{" "}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* SECTION 6: INFOS ADDITIONNELLES (Statique comme ton exemple) */}
      <section className="pt-6 border-t">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-muted-foreground leading-relaxed">
          <div className="flex gap-3">
            <Clock className="w-5 h-5 shrink-0 text-primary" />
            <p>
              Le délai de traitement est généralement de 24h à 48h selon la
              disponibilité du fournisseur.
            </p>
          </div>
          <div className="flex gap-3">
            <Clock className="w-5 h-5 shrink-0 text-primary" />
            <p>
              {isDigitalProduct
                ? "Votre fichier est disponible en téléchargement dès que le fournisseur a validé votre commande, généralement sous 24h à 48h."
                : "Le délai de traitement est généralement de 24h à 48h selon la disponibilité du fournisseur."}
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 7: FACTURES SI DISPONIBLE */}
      <section className="pt-10 border-t">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <CreditCard className="w-5 h-5 text-primary" />
          <p>
            {isDigitalProduct
              ? "Votre facture est disponible ici une fois la commande validée ou annulée."
              : "Les factures sont générées une fois la commande expédiée ou annulée et sont disponibles ici."}
          </p>
        </div>

        {/* INVOICES */}
        {isClient && order.status === "livrée" && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 
          bg-muted/20 p-4 rounded-2xl border 
            mt-6
          "
          >
            {/* Bouton Facture Commande */}
            <PDFDownloadLink
              document={
                <ProductInvoice
                  order={
                    order as SupplierOrder & {
                      supplierEarning: SupplierEarning | null;
                      deliveryCompany: DeliveryCompany | null;
                    }
                  }
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
                  order={
                    order as SupplierOrder & {
                      supplierEarning: SupplierEarning | null;
                      deliveryCompany: DeliveryCompany | null;
                    }
                  }
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
      </section>
    </div>
  );
};

export default MainSupplierOrderView;

type CancelOrderComponentProps = {
  orderId: string;
  onClick: (newStatus: string) => void;
  loading: boolean;
  preferences: Preferences;
};

const CancelOrderComponent = async ({
  onClick,
  loading,
  preferences,
}: CancelOrderComponentProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          disabled={loading}
          className={`mt-4 w-full bg-rose-600 hover:bg-rose-700
                   text-white font-bold py-2 px-4 
                  rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          Annuler la commande
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Etes vous sur de vouloir annuler la commande?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irreversible, la commande sera annulée et le client
            en sera informé. Vous serez remboursé si le paiement a déjà été
            effectué, selon les modalités de remboursement de la plateforme. Si
            vous avez des questions, contactez le support avant de continuer.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* FORM */}

        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/70"
            onClick={() => onClick("annulée")}
            disabled={loading}
          >
            {loading ? "En cours..." : "Continuer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
