"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shop } from "@/lib/generated/prisma/client";
import { returnDataValue } from "@/utils/functions";
import { CategoriesData } from "@/utils/data";
import { Printer } from "lucide-react";
import { capitalizeText } from "@/utils/shopFunctions";

type Props = {
  shops: Shop[];
  currencySymbol: "$" | "CDF";
};

const PrintWholeTransfertTable = ({ shops, currencySymbol }: Props) => {
  const [loading, setLoading] = useState(false);
  //   print shops
  const handlePrint = () => {
    if (shops.length === 0) return;
    setLoading(true);

    // 1. Génère le contenu à imprimer (HTML string)
    const html = `
      <div style="font-family: Arial, sans-serif; color: #333; margin: 20px;">
        <h1>Liste de paiement</h1>
        
        <table style="width:100%; border-collapse:collapse;">
          <thead>
            <tr>
              <th style="border:1px solid #ddd;padding:8px;">N</th>
              <th style="border:1px solid #ddd;padding:8px;">Boutique</th>
              <th style="border:1px solid #ddd;padding:8px;">Categorie</th>
              <th style="border:1px solid #ddd;padding:8px;">Numero</th>
              <th style="border:1px solid #ddd;padding:8px;">Nom</th>
              <th style="border:1px solid #ddd;padding:8px;">Montant</th>
            </tr>
          </thead>
          <tbody>
            ${shops
              .map(
                (shop, idx) => `
              <tr>
              <td style="border:1px solid #ddd;padding:8px;">${idx + 1}</td>
                <td style="border:1px solid #ddd;padding:8px;">${capitalizeText(
                  shop.name
                )}</td>
                <td style="border:1px solid #ddd;padding:8px;">${capitalizeText(
                  returnDataValue(shop.category, CategoriesData)
                )}</td>
                <td style="border:1px solid #ddd;padding:8px;">+234 ${
                  shop.paymentPhone
                }</td>
                 <td style="border:1px solid #ddd;padding:8px;">${capitalizeText(
                   shop.paymentName
                 )} $</td>
                <td style="border:1px solid #ddd;padding:8px;">${
                  currencySymbol === "$" ? shop.benefit : shop.benefitCDF
                } ${currencySymbol}</td>
         
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        
        
    
      </div>
    `;

    // 2. Crée un élément DOM temporaire
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    // 3. Ouvre une nouvelle fenêtre
    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) return;

    // 4. Ajoute le contenu à la fenêtre sans document.write
    printWindow.document.body.appendChild(tempDiv);

    // 5. Optionnel : Ajoute des styles globaux pour l'impression
    const style = printWindow.document.createElement("style");
    style.textContent = `
      body { margin: 0; padding: 0; }
      @media print { body { -webkit-print-color-adjust: exact; } }
    `;
    printWindow.document.head.appendChild(style);

    // 6. Imprime et ferme la fenêtre
    printWindow.focus();
    printWindow.print();
    // printWindow.close(); // décommente si tu veux fermer après impression
    setLoading(false);
  };

  return (
    <Button
      variant="outline"
      onClick={() => handlePrint()}
      disabled={loading || shops.length === 0}
    >
      <Printer />
    </Button>
  );
};

export default PrintWholeTransfertTable;
