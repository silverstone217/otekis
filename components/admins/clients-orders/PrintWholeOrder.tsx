"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { OrderWithPropsType } from "./MainViewOrder";
import { DeliveryManStats } from "@/actions/deliverymenActions";
import { Printer } from "lucide-react"; // Optionnel : pour l'icône

export type OrderProps = {
  order: OrderWithPropsType;
  agents: DeliveryManStats[];
  currency?: "$" | "CDF";
  exchange?: number;
};

const PrintWholeOrder = ({ order }: OrderProps) => {
  const [loading, setLoading] = useState(false);
  const currencySimbol = order.currency === "USD" ? "$" : "CDF";
  const exChangeRate = order.currency !== "USD" ? order.exchange || 1 : 1;

  const handlePrint = () => {
    if (!order) return;
    setLoading(true);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Facture #${order.id}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            
            body { 
              font-family: 'Inter', sans-serif; 
              color: #1a1a1a; 
              line-height: 1.5; 
              margin: 0; 
              padding: 40px;
              background-color: #fff;
            }

            .header { 
              display: flex; 
              justify-content: space-between; 
              align-items: start; 
              margin-bottom: 40px; 
              border-bottom: 2px solid #f4f4f5;
              padding-bottom: 20px;
            }

            .shop-name { font-size: 24px; font-weight: 700; color: #000; text-transform: uppercase; }
            .invoice-label { font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 1px; }
            .invoice-number { font-size: 16px; font-weight: 600; }

            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            .section-title { font-size: 12px; font-weight: 700; color: #71717a; text-transform: uppercase; margin-bottom: 8px; border-bottom: 1px solid #e4e4e7; padding-bottom: 4px; }
            .info-text { font-size: 14px; margin: 2px 0; }

            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; font-size: 12px; color: #71717a; text-transform: uppercase; padding: 12px 8px; border-bottom: 2px solid #f4f4f5; }
            td { padding: 16px 8px; font-size: 14px; border-bottom: 1px solid #f4f4f5; }
            
            .total-section { margin-top: 30px; display: flex; justify-content: flex-end; }
            .total-box { width: 250px; }
            .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
            .total-grand { font-size: 18px; font-weight: 700; border-top: 2px solid #000; margin-top: 8px; padding-top: 12px; }

            .footer { margin-top: 50px; font-size: 12px; color: #a1a1aa; text-align: center; }

            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="shop-name">${order.shop.name}</div>
              <div class="info-text">${order.shop.category}</div>
            </div>
            <div style="text-align: right">
              <div class="invoice-label">Facture</div>
              <div class="invoice-number">#${order.id.slice(-8).toUpperCase()}</div>
              <div class="info-text">${new Date().toLocaleDateString()}</div>
            </div>
          </div>

          <div class="grid">
            <div>
              <div class="section-title">Client</div>
              <p class="info-text"><strong>${order.user.name ?? "Client Anonyme"}</strong></p>
              <p class="info-text">${order.user.email ?? ""}</p>
              <p class="info-text">${order.user.tel ?? ""}</p>
            </div>
            <div>
              <div class="section-title">Livraison</div>
              <p class="info-text">${order.receiverName}</p>
              <p class="info-text">${order.receiverAddress}</p>
              <p class="info-text">${order.receiverTel}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: center">Qté</th>
                <th style="text-align: right">Prix Unitaire</th>
                <th style="text-align: right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.orderItems
                .map(
                  (item) => `
                <tr>
                  <td>
                    <div style="font-weight: 600">${item.productName}</div>
                    <div style="font-size: 12px; color: #71717a">${item.articleInfo ?? ""}</div>
                  </td>
                  <td style="text-align: center">${item.quantity}</td>
                  <td style="text-align: right">${(item.price * exChangeRate).toFixed(2)} ${currencySimbol}</td>
                  <td style="text-align: right; font-weight: 600">${(item.price * item.quantity * exChangeRate).toFixed(2)} ${currencySimbol}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-box">
              <div class="total-row">
                <span>Sous-total</span>
                <span>${order.totalAmount.toFixed(2)} ${currencySimbol}</span>
              </div>
              <div class="total-row">
                <span>Livraison</span>
                <span>${(order.deliveryPrice ?? 0).toFixed(2)} ${currencySimbol}</span>
              </div>
                <div class="total-row">
                <span>Taxe</span>
                <span>16%</span>
              </div>
              <div class="total-row total-grand">
                <span>Total</span>
                <span>${(order.totalAmount + order.deliveryPrice).toFixed(2)} ${currencySimbol}</span>
              </div>
            
            </div>
          </div>

          <div class="footer">
            <p>Merci pour votre confiance.</p>
            <p>Mode de paiement : ${order.paymentMethod} | Statut : ${order.paymentStatus}</p>
             <p><strong>OTEKIS by Servi Group </strong>© — Tous
          droits réservés.</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(html);
    printWindow.document.close();

    // On attend que les polices soient chargées avant d'imprimer
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      setLoading(false);
    };
  };

  return (
    <Button
      variant="outline"
      className="flex gap-2 items-center"
      onClick={handlePrint}
      disabled={loading || !order}
    >
      <Printer size={16} />
      {loading ? "Chargement..." : "Imprimer la facture"}
    </Button>
  );
};

export default PrintWholeOrder;
