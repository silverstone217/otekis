"use client";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { OrderWithPropsType } from "./MainViewOrder";
import { DeliveryManStats } from "@/actions/deliverymenActions";

export type OrderProps = {
  order: OrderWithPropsType;
  agents: DeliveryManStats[];
  currency?: "$" | "CDF";
  exchange?: number;
};

const PrintWholeOrder = ({ order }: OrderProps) => {
  const [loading, setLoading] = useState(false);
  const currencySimbol = order.currency === "USD" ? "$" : "CDF";
  //   print order
  const handlePrint = () => {
    if (!order) return;
    setLoading(true);

    // 1. Génère le contenu à imprimer (HTML string)
    const html = `
      <div style="font-family: Arial, sans-serif; color: #333; margin: 20px;">
        <h1>Commande #${order.id}</h1>
        
        <h2>Client</h2>
        <p><strong>Nom :</strong> ${order.user.name ?? "N/A"}</p>
        <p><strong>Email :</strong> ${order.user.email ?? "N/A"}</p>
        <p><strong>Téléphone :</strong> ${order.user.tel ?? "N/A"}</p>
        
        <h2>Livraison</h2>
        <p><strong>Adresse :</strong> ${order.receiverAddress ?? "N/A"}</p>
        <p><strong>Destinataire :</strong> ${order.receiverName ?? "N/A"}</p>
        <p><strong>Téléphone :</strong> ${order.receiverTel ?? "N/A"}</p>
        <p><strong>Status :</strong> ${order.status}</p>
        <p><strong>Coût :</strong> ${
          order.deliveryPrice?.toFixed(2) ?? "0.00"
        } ${currencySimbol}</p>
        
        <h2>Articles commandés</h2>
        <table style="width:100%; border-collapse:collapse;">
          <thead>
            <tr>
              <th style="border:1px solid #ddd;padding:8px;">Produit</th>
              <th style="border:1px solid #ddd;padding:8px;">Article Info</th>
              <th style="border:1px solid #ddd;padding:8px;">Qté</th>
              <th style="border:1px solid #ddd;padding:8px;">PU</th>
              <th style="border:1px solid #ddd;padding:8px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.orderItems
              .map(
                (item) => `
              <tr>
                <td style="border:1px solid #ddd;padding:8px;">${
                  item.productName
                }</td>
                <td style="border:1px solid #ddd;padding:8px;">${
                  item.articleInfo ?? ""
                }</td>
                <td style="border:1px solid #ddd;padding:8px;">${
                  item.quantity
                }</td>
                <td style="border:1px solid #ddd;padding:8px;">${item.price.toFixed(
                  2
                )} ${currencySimbol}</td>
                <td style="border:1px solid #ddd;padding:8px;">${(
                  item.price * item.quantity
                ).toFixed(2)} ${currencySimbol}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        <div style="text-align:right; font-weight:bold; margin-top:10px;">
          Total : ${order.totalAmount.toFixed(2)} ${currencySimbol}
        </div>
        
        <h2>Boutique</h2>
        <p><strong>Nom :</strong> ${order.shop.name}</p>
        <p><strong>Catégorie :</strong> ${order.shop.category}</p>
        <p><strong>Créée le :</strong> ${new Date(
          order.shop.createdAt
        ).toLocaleDateString()}</p>
        
        <h2>Paiement</h2>
        <p><strong>Méthode :</strong> ${order.paymentMethod}</p>
        <p><strong>Statut :</strong> ${order.paymentStatus}</p>
        <p><strong>Montant :</strong> ${order.totalAmount.toFixed(
          2
        )} ${currencySimbol}</p>
        <p><strong>Référence :</strong> ${order.paymentRef ?? "N/A"}</p>
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
      disabled={loading || !order}
    >
      Imprimer
    </Button>
  );
};

export default PrintWholeOrder;
