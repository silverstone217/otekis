/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useMemo } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, Download, DollarSign, BadgeInfo } from "lucide-react";
import { FactureOrderWithProductsDetailsType } from "@/actions/factureActions";
import { OrderWithProductDetails } from "@/actions/myOrderAction";
import { Preferences, Shop } from "@prisma/client";
import { returnFormatedMoney } from "@/utils/functions";
import { capitalizeText } from "@/utils/shopFunctions";

interface FactureProps {
  myOrder: OrderWithProductDetails;
  factureOrder: FactureOrderWithProductsDetailsType | null;
  shopPreferences: Preferences;
  shop: Shop;
  currency: "$" | "CDF";
  exchange: number;
  deliveryInfo: {
    delivery: string;
    phone?: string;
    isOtekisDelivery: boolean;
  } | null;
}

const PERMIT_STATUS = ["annulé", "retourné"];

const FactureRefundOrder = ({
  factureOrder,
  currency,
  shop,
  myOrder,
}: FactureProps) => {
  const canDownloadFacture = useMemo(() => {
    if (!factureOrder) return false;
    return PERMIT_STATUS.includes(myOrder.status);
  }, [factureOrder, myOrder.status]);

  // --- Téléchargement PDF ---
  const handleDownloadPdf = async () => {
    if (!factureOrder) return;

    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const leftX = 40;

    // --- INFOS ENTREPRISE ---
    const companyName = "Otekis par SERVI Group";
    const companyAddress = "Kinshasa, République démocratique du Congo";
    const companyPhone = "+243 831 718 338";

    // --- INFOS FACTURE ---
    const invoiceNumber = factureOrder.id ?? `REM-${Date.now()}`;
    const invoiceDate = factureOrder.createdAt
      ? new Date(factureOrder.createdAt).toLocaleDateString("fr-FR")
      : new Date().toLocaleDateString("fr-FR");

    let y = 40;

    // --- TITRE ---
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(200, 0, 0);
    doc.text("FACTURE DE REMBOURSEMENT", pageWidth / 2, y, {
      align: "center",
    });
    y += 50;

    // --- INFOS SOCIÉTÉ ---
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(50);
    doc.text(companyName, leftX, y);
    y += 12;
    doc.setFont("helvetica", "normal");
    doc.text(companyAddress, leftX, y);
    y += 12;
    doc.text(`Tél : ${companyPhone}`, leftX, y);

    // --- INFOS FACTURE (à droite) ---
    const metaX = pageWidth - 40;
    doc.setFont("helvetica", "bold");
    doc.text(`Facture N° : ${invoiceNumber}`, metaX, 50, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.text(`Date : ${invoiceDate}`, metaX, 64, { align: "right" });

    y += 35;

    // --- LIGNE DE SÉPARATION ---
    doc.setDrawColor(220);
    doc.setLineWidth(0.5);
    doc.line(leftX, y, pageWidth - 40, y);
    y += 20;

    // --- INFOS BOUTIQUE (VENDEUR) ---
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80, 20, 20);
    doc.text("Vendeur :", leftX, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50);
    doc.text(capitalizeText(shop.name), leftX + 70, y);
    y += 14;

    // --- SÉPARATEUR AVANT TABLEAU ---
    doc.setDrawColor(220);
    doc.line(leftX, y, pageWidth - 40, y);
    y += 20;

    // --- TABLEAU PRODUITS ---
    const rows = factureOrder.productFactures.map((p) => ({
      desc: `${capitalizeText(p.productName)}${
        p.productInfo ? " — " + p.productInfo : ""
      }`,
      qty: `${p.quantity}`,
      unit: `${p.price * (p.exchange ?? 1)} ${factureOrder.currency}`,
      subtotal: `${p.price * (p.exchange ?? 1) * p.quantity} ${
        factureOrder.currency
      }`,
    }));

    autoTable(doc, {
      startY: y,
      head: [["Produit", "Qté", "PU", "Sous-total"]],
      body: rows.map((r) => [r.desc, r.qty, r.unit, r.subtotal]),
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0] },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 30;

    // --- TOTAL ---
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Montant remboursé :", leftX, finalY);
    doc.text(
      `${factureOrder.totalAmount} ${factureOrder.currency}`,
      pageWidth - 40,
      finalY,
      { align: "right" }
    );

    // --- SAUVEGARDE ---
    doc.save(`${invoiceNumber}-${shop.slug}-refund.pdf`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild disabled={!canDownloadFacture}>
        <button
          type="button"
          className="flex items-center justify-between p-4 text-sm hover:bg-muted/50 transition rounded-b-md"
        >
          <DollarSign className="w-5 h-5 text-primary" />
          <span>Facture de remboursement</span>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl border-2 border-rose-200 shadow-lg">
        <DialogHeader className="text-center space-y-1">
          <DialogTitle className="font-extrabold text-2xl text-rose-600 flex justify-center items-center gap-2">
            <DollarSign className="w-6 h-6 text-rose-600" />
            Facture de remboursement
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Détails du remboursement suite à une commande annulée ou retournée.
          </DialogDescription>
        </DialogHeader>

        {factureOrder ? (
          <ScrollArea className="max-h-[65vh] mt-4 pr-2">
            <Card className="border-rose-100 shadow-sm bg-rose-50/40">
              <CardHeader className="pb-1">
                <CardTitle className="text-sm font-semibold text-rose-800">
                  Articles remboursés
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {factureOrder.productFactures.map((prod) => (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800">
                        {capitalizeText(prod.productName)}
                      </span>
                      {prod.productInfo && (
                        <span className="text-xs opacity-70 capitalize">
                          {prod.productInfo}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs opacity-70">x{prod.quantity}</p>
                      <p className="font-semibold text-rose-700">
                        {returnFormatedMoney(prod.price * prod.exchange)}{" "}
                        <span className="text-xs">{currency}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="mt-4 p-3 bg-white border rounded-md space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">
                  Livraison
                </span>
                <span className="font-medium">
                  {returnFormatedMoney(
                    factureOrder.deliveryPrice * factureOrder.exchange
                  )}{" "}
                  {factureOrder.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">TVA</span>
                <span className="font-medium">{factureOrder.TVA}%</span>
              </div>

              <Separator className="my-2" />

              <div className="flex justify-between items-center">
                <span className="font-bold text-base text-rose-700">
                  Montant remboursé
                </span>
                <span className="font-bold text-base text-rose-700">
                  {returnFormatedMoney(factureOrder.totalAmount)}{" "}
                  <span className="text-xs">{factureOrder.currency}</span>
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
              <BadgeInfo className="w-4 h-4 text-rose-500 flex-shrink-0 mt-[2px]" />
              <p>
                Cette facture confirme le remboursement des montants payés.
                Conservez-la comme preuve de transaction.
              </p>
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-6 text-muted-foreground text-sm">
            Aucune facture de remboursement disponible.
          </div>
        )}

        <DialogFooter className="pt-6 flex justify-between gap-4 w-full">
          <DialogClose asChild>
            <Button variant="outline">Fermer</Button>
          </DialogClose>

          <Button
            className="bg-rose-600 hover:bg-rose-700 text-white"
            disabled={!canDownloadFacture}
            onClick={handleDownloadPdf}
          >
            <Download className="w-5 h-5 mr-2" />
            Télécharger
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FactureRefundOrder;
