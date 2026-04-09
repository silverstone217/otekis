/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { OrderWithProductDetails } from "@/actions/myOrderAction";
import {
  FactureDeliverOrder,
  Preferences,
  Shop,
} from "@/lib/generated/prisma/client";
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
import { ChevronRight, Download, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { returnFormatedMoney } from "@/utils/functions";
import { capitalizeText } from "@/utils/shopFunctions";

interface FactureProps {
  myOrder: OrderWithProductDetails;
  factureDelivery: FactureDeliverOrder | null;
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

const FactureDeliveryView = ({
  deliveryInfo,
  factureDelivery,
  myOrder,
  shop,
}: FactureProps) => {
  const canDownloadFacture = useMemo(() => {
    if (!factureDelivery) return false;
    if (!PERMIT_STATUS.includes(myOrder.status)) return false;

    return true;
  }, [factureDelivery, myOrder.status]);

  const handleDownloadPdf = async () => {
    if (!factureDelivery) return;

    // Import dynamique
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    // ✅ Crée le document
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();

    // --- INFOS ENTREPRISE ---
    const companyName = "Otekis par SERVI Group";
    const companyAddress = "Kinshasa, République Démocratique du Congo";
    const companyPhone = "+243 831 718 338";
    const invoiceNumber = factureDelivery.id ?? `LIV-${Date.now()}`;
    const invoiceDate = factureDelivery.createdAt
      ? new Date(factureDelivery.createdAt).toLocaleDateString("fr-FR")
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

    // Infos facture (à droite)
    const metaX = pageWidth - 40;
    doc.setFont("helvetica", "bold");
    doc.text(`Facture de livraison N°: ${invoiceNumber}`, metaX, 40, {
      align: "right",
    });
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${invoiceDate}`, metaX, 56, { align: "right" });

    y += 40;

    // --- VENDEUR / CLIENT ---
    doc.setDrawColor(220);
    doc.setLineWidth(0.5);
    doc.line(leftX, y, pageWidth - 40, y);
    y += 14;

    doc.setFont("helvetica", "bold");
    doc.text("Vendeur :", leftX, y);
    doc.setFont("helvetica", "normal");
    doc.text(capitalizeText(shop.name), leftX + 80, y);
    y += 14;

    doc.setFont("helvetica", "bold");
    doc.text("Livreur :", leftX, y);
    doc.setFont("helvetica", "normal");
    doc.text(
      deliveryInfo?.isOtekisDelivery
        ? `Otekis delivery - agent ${capitalizeText(
            factureDelivery.deliverBy,
          )} `
        : capitalizeText(factureDelivery.deliverBy),
      leftX + 80,
      y,
    );
    y += 14;

    doc.setFont("helvetica", "bold");
    doc.text("Client :", leftX, y);
    doc.setFont("helvetica", "normal");
    doc.text(capitalizeText(factureDelivery.receiverName), leftX + 80, y);
    y += 14;

    doc.setFont("helvetica", "bold");
    doc.text("Adresse :", leftX, y);
    doc.setFont("helvetica", "normal");
    doc.text(factureDelivery.receiverAddress, leftX + 80, y);
    y += 14;

    doc.setFont("helvetica", "bold");
    doc.text("Téléphone :", leftX, y);
    doc.setFont("helvetica", "normal");
    doc.text("(+243)" + "-" + factureDelivery.receiverTel, leftX + 80, y);

    y += 30;

    // --- TABLEAU RÉCAPITULATIF ---
    // const percentage = parseFloat(factureDelivery.percentage);
    const totalUSD = factureDelivery.amount;
    const totalCDF = factureDelivery.amount * factureDelivery.exchange;

    const tableData = [
      ["Montant livraison", `${returnFormatedMoney(totalUSD)} USD`],
      [
        `Taux de change (${factureDelivery.exchange})`,
        `${returnFormatedMoney(totalCDF)} CDF`,
      ],
      //   ["Pourcentage", `${percentage}%`],
    ];

    autoTable(doc, {
      startY: y,
      head: [["Détails", "Valeurs"]],
      body: tableData,
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [240, 240, 240], textColor: 20 },
      columnStyles: {
        0: { cellWidth: 240 },
        1: { halign: "right" },
      },
    });

    const finalY = (doc as any).lastAutoTable?.finalY ?? y + 10;
    let totalsY = finalY + 30;

    // --- TOTAL GÉNÉRAL ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("TOTAL À PAYER :", leftX, totalsY);
    doc.text(`${returnFormatedMoney(totalUSD)} USD`, pageWidth - 40, totalsY, {
      align: "right",
    });

    totalsY += 24;

    // --- SIGNATURES ---
    const signY = totalsY + 40;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Signature du livreur", leftX, signY);
    doc.text("Signature du client", pageWidth - 200, signY);
    doc.line(leftX, signY + 20, leftX + 150, signY + 20);
    doc.line(pageWidth - 200, signY + 20, pageWidth - 40, signY + 20);

    // --- PIED DE PAGE ---
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const footerText = `Merci pour votre confiance. Pour toute réclamation, contactez ${companyName} au ${companyPhone}.`;
    doc.text(footerText, leftX, 780, { maxWidth: pageWidth - 80 });

    // --- TÉLÉCHARGEMENT ---
    doc.save(`facture-livraison-${invoiceNumber}.pdf`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild disabled={!canDownloadFacture}>
        <button
          type="button"
          className="flex items-center justify-between p-4 text-sm hover:bg-gray-50 transition"
        >
          <Truck className="w-5 h-5 text-muted-foreground" />
          <span>Document sur la livraison</span>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-bold text-xl text-center">
            🧾 Détail de la facture de livraison
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground">
            Résumé complet de la livraison. Vous pouvez télécharger la facture
            ou la présenter en cas de litige.
          </DialogDescription>
        </DialogHeader>

        {factureDelivery ? (
          <div className="text-sm mt-4 border rounded-lg p-4 bg-gray-50">
            <p>
              <strong>Livreur :</strong> {factureDelivery.deliverBy}
            </p>
            <p>
              <strong>Client :</strong> {factureDelivery.receiverName}
            </p>
            <p>
              <strong>Adresse :</strong> {factureDelivery.receiverAddress}
            </p>
            <p>
              <strong>Téléphone :</strong> {factureDelivery.receiverTel}
            </p>
            <p>
              <strong>Montant :</strong>{" "}
              {returnFormatedMoney(factureDelivery.amount)}{" "}
              {factureDelivery.currency}
            </p>
            <p>
              <strong>Taux de change :</strong> {factureDelivery.exchange}
            </p>
            <p>
              <strong>Pourcentage :</strong> {factureDelivery.percentage}%
            </p>
          </div>
        ) : (
          <p className="text-center text-muted-foreground text-sm mt-4">
            Aucune facture de livraison disponible.
          </p>
        )}

        <DialogFooter className="pt-6 flex justify-between gap-4 w-full">
          <DialogClose asChild>
            <Button variant="outline">Fermer</Button>
          </DialogClose>

          <Button
            className="bg-primary text-white"
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

export default FactureDeliveryView;
