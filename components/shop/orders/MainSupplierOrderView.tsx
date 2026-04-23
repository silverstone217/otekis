"use client";

import React from "react";
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
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { returnFormatedMoney } from "@/utils/functions";
import { capitalizeText } from "@/utils/shopFunctions";
import { cn } from "@/lib/utils";

// Sous-composant pour l'ID copiable
const CopyableOrderId = ({ orderId }: { orderId: string }) => (
  <div className="flex items-center justify-center gap-2 text-xs font-mono text-muted-foreground bg-muted/50 py-1 px-3 rounded-full w-fit mx-auto">
    <span>ID: {orderId}</span>
  </div>
);

const MainSupplierOrderView = ({
  order,
  product,
  article,
  shop,
  preferences,
  deliveryCompany,
}: any) => {
  const { buttonColor: borderColor, buttonRadius: borderRadius } = preferences;

  const statusColors: Record<string, string> = {
    "en cours de traitement": "text-amber-600 bg-amber-50 border-amber-200",
    valide: "text-blue-600 bg-blue-50 border-blue-200",
    livre: "text-emerald-600 bg-emerald-50 border-emerald-200",
    annule: "text-rose-600 bg-rose-50 border-rose-200",
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

      {/* SECTION 2: INFOS CLIENT & LIVRAISON */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          style={{ borderColor, borderRadius }}
          className="shadow-sm border"
        >
          <CardContent className="p-6 space-y-6">
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

            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/5 rounded-lg">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
                  Destinataire
                </p>
                <p className="text-sm font-bold mt-1">
                  {capitalizeText(order.receiverName)}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Phone className="w-3 h-3" /> +243 {order.receiverTel}
                </p>
              </div>
            </div>
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
                {order.paymentMethod}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sous-total</span>
                <span>
                  {returnFormatedMoney(order.totalAmount)} {order.currency}
                </span>
              </div>
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
              <Separator className="my-2" />
              <div className="flex justify-between items-end">
                <span className="font-bold">Total payé</span>
                <div className="text-right">
                  <span className="text-2xl font-black text-primary">
                    {returnFormatedMoney(
                      order.totalAmount + order.deliveryPrice,
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
                {article.color && (
                  <Badge variant="secondary">Couleur: {article.color}</Badge>
                )}
                {article.size && (
                  <Badge variant="secondary">Taille: {article.size}</Badge>
                )}
                <Badge variant="outline">Qté: {order.quantity}</Badge>
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

      {/* SECTION 4: INFO LIVREUR SI DISPONIBLE */}
      {deliveryCompany && (
        <section>
          <Card
            style={{ borderColor, borderRadius }}
            className="border border-dashed bg-primary/5"
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Truck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Pris en charge par</h4>
                  <p className="text-lg font-black text-primary uppercase">
                    {deliveryCompany.name}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* SECTION 5: INFOS ADDITIONNELLES (Statique comme ton exemple) */}
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
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-500" />
            <p>
              Une fois validée, la commande ne peut plus être modifiée. Veuillez
              contacter le support en cas d'erreur.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MainSupplierOrderView;
