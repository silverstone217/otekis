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
import { FileText, ChevronRight, Download } from "lucide-react";
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

const PERMIT_STATUS = [
  "livré",
  //   "annulé",
  // "refusé",
  //   "reporté",
  //   "en cours d'annulation",
  "en attente de livraison",
  "en cours de livraison",
  // "en attente de retour",
  // "en cours de retour",
  // "retourné",
];

const FactureOrderView = ({
  factureOrder,
  currency,
  shop,
  myOrder,
}: FactureProps) => {
  const canDownloadFacture = useMemo(() => {
    if (!factureOrder) return false;
    if (!PERMIT_STATUS.includes(myOrder.status)) return false;

    return true;
  }, [factureOrder, myOrder.status]);

  // DOwnload pdf
  const handleDownloadPdf = async () => {
    if (!factureOrder) return;

    // Import dynamique pour éviter SSR issues
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    // ✅ Crée le document AVANT d’utiliser autoTable
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();

    // --- HEADER ---
    const companyName = "Otekis par SERVI Group";
    const companyAddress = "Kinshasa, République démocratique du Congo";
    const companyPhone = "+243 831 718 338";
    const invoiceNumber = factureOrder.id ?? `INV-${Date.now()}`;
    const invoiceDate = factureOrder.createdAt
      ? new Date(factureOrder.createdAt).toLocaleDateString("fr-FR")
      : new Date().toLocaleDateString("fr-FR");

    const leftX = 40;
    let y = 40;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(companyName, leftX, y);
    y += 18;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(companyAddress, leftX, y);
    y += 14;
    doc.text(`Tél : ${companyPhone}`, leftX, y);

    // Invoice meta (right aligned)
    const metaX = pageWidth - 40;
    doc.setFont("helvetica", "bold");
    doc.text(`Facture N°: ${invoiceNumber}`, metaX, 40, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${invoiceDate}`, metaX, 56, { align: "right" });

    y += 38;

    // --- VENDEUR / ACHETEUR ---
    doc.setDrawColor(220);
    doc.setLineWidth(0.5);
    doc.line(leftX, y, pageWidth - 40, y);
    y += 14;

    doc.setFont("helvetica", "bold");
    doc.text("Vendeur :", leftX, y);
    doc.setFont("helvetica", "normal");
    doc.text(capitalizeText(shop.name), leftX + 70, y);
    y += 14;

    if (myOrder.receiverName) {
      doc.setFont("helvetica", "bold");
      doc.text("Acheteur :", leftX, y);
      doc.setFont("helvetica", "normal");
      doc.text(myOrder.receiverName, leftX + 70, y);
      y += 14;
    }

    y += 8;

    // --- TABLEAU DES PRODUITS ---
    const tableColumns = [
      { header: "Description", dataKey: "desc" },
      { header: "Qté", dataKey: "qty" },
      { header: "PU", dataKey: "unit" },
      { header: "Sous-total", dataKey: "subtotal" },
    ];

    const rows = factureOrder.productFactures.map((p) => {
      const unitPrice = p.price * (p.exchange ?? 1);
      const subtotal = unitPrice * p.quantity;
      return {
        desc: `${p.productName}${p.productInfo ? " — " + p.productInfo : ""}`,
        qty: `${p.quantity}`,
        unit: `${unitPrice} ${factureOrder.currency}`,
        subtotal: `${subtotal} ${factureOrder.currency}`,
      };
    });

    // ✅ Appel correct
    autoTable(doc, {
      startY: y,
      head: [tableColumns.map((c) => c.header)],
      body: rows.map((r) => [r.desc, r.qty, r.unit, r.subtotal]),
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: 20,
        halign: "left",
        fontStyle: "bold",
      },
    });

    const finalY = (doc as any).lastAutoTable?.finalY || y + 10;
    let totalsY = finalY + 20;

    // --- TOTAUX ---
    const deliveryAmount =
      (factureOrder.deliveryPrice ?? 0) * (factureOrder.exchange ?? 1);
    const sumProducts = factureOrder.totalAmount;

    const tvaAmount = factureOrder.TVA;
    const grandTotal = sumProducts + deliveryAmount;

    const labelX = pageWidth - 240;
    const valueX = pageWidth - 40;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    doc.text("Sous-total :", labelX, totalsY);
    doc.text(`${sumProducts} ${factureOrder.currency}`, valueX, totalsY, {
      align: "right",
    });
    totalsY += 14;

    doc.text("Livraison :", labelX, totalsY);
    doc.text(`${deliveryAmount} ${factureOrder.currency}`, valueX, totalsY, {
      align: "right",
    });
    totalsY += 14;

    doc.text(`TVA :`, labelX, totalsY);
    doc.text(`${tvaAmount}%`, valueX, totalsY, { align: "right" });
    totalsY += 16;

    doc.line(labelX, totalsY, valueX, totalsY);
    totalsY += 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Total à payer :", labelX, totalsY);
    doc.text(`${grandTotal} ${factureOrder.currency}`, valueX, totalsY, {
      align: "right",
    });

    totalsY += 24;

    // --- PIED DE PAGE ---
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const footerText = `Merci pour votre achat. Pour toute réclamation, contactez ${companyName} au ${companyPhone}.`;
    doc.text(footerText, leftX, Math.max(totalsY + 20, 720), {
      maxWidth: pageWidth - 80,
    });

    // ✅ Téléchargement
    doc.save(`${invoiceNumber}-${shop.slug ?? "shop"}-${invoiceDate}.pdf`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild disabled={!canDownloadFacture}>
        <button
          type="button"
          className="flex items-center justify-between p-4 text-sm hover:bg-gray-50 transition"
        >
          <FileText className="w-5 h-5 text-muted-foreground" />
          <span className="font-medium">Facture</span>

          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-bold text-xl text-center">
            🧾 Détail de la facture
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground">
            Résumé complet de votre commande. Vous pouvez télécharger la facture
            ou la présenter en cas de litige.
          </DialogDescription>
        </DialogHeader>

        {factureOrder ? (
          <ScrollArea className="max-h-[65vh] mt-4 pr-2">
            <Card className="border-none shadow-none bg-transparent">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-muted-foreground">
                  Produits achetés
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {factureOrder.productFactures.map((prod) => (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between text-sm capitalize"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800">
                        {prod.productName}
                      </span>
                      <span className="text-xs opacity-70">
                        {prod.productInfo}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs opacity-70">
                        Q/{prod.quantity}
                      </span>
                      <span className="font-semibold tabular-nums">
                        {returnFormatedMoney(prod.price * prod.exchange)}{" "}
                        <span className="text-xs">{currency}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Separator className="my-4" />

            {/* Détails financiers */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-muted-foreground">
                  Livraison
                </span>
                <span className="font-medium">
                  {returnFormatedMoney(
                    factureOrder.deliveryPrice * factureOrder.exchange
                  )}{" "}
                  <span className="text-xs">{factureOrder.currency}</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium text-muted-foreground">TVA</span>
                <span className="font-medium">
                  {factureOrder.TVA} <span className="text-xs">%</span>
                </span>
              </div>

              <Separator className="my-2" />

              <div className="flex items-center justify-between">
                <span className="font-bold text-base">Prix total</span>
                <span className="font-bold text-base text-primary">
                  {returnFormatedMoney(factureOrder.totalAmount)}{" "}
                  <span className="text-xs">{factureOrder.currency}</span>
                </span>
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-6 text-muted-foreground text-sm">
            Aucune facture disponible pour cette commande.
          </div>
        )}

        <DialogFooter className="pt-6 flex justify-between gap-4 w-full">
          <DialogClose asChild>
            <Button variant="outline" className="">
              Annuler
            </Button>
          </DialogClose>

          <Button
            className=""
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

export default FactureOrderView;
