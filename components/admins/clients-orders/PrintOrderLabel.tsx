"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

type PrintLabelProps = {
  order: {
    id: string;
    receiverName: string;
    receiverAddress: string;
    receiverTel: string;
  };
};

export default function PrintOrderLabel({ order }: PrintLabelProps) {
  const printRef = useRef<HTMLDivElement>(null);
  

  const handlePrint = () => {
    if (!printRef.current) return;
    const printContents = printRef.current.innerHTML;

    const html = `
      <html>
        <head>
          <title>Étiquette-de-commande-${order.id}</title>
          <style>
            body {
              font-family: 'Inter', Arial, sans-serif;
              margin: 0;
              padding: 0;
              background: #fff;
            }
            .label-container {
              width: 320px;
              margin: 24px auto;
              border: 2px dashed #333;
              border-radius: 12px;
              padding: 24px 16px;
              text-align: center;
            }
            .label-title {
              font-size: 1.25rem;
              font-weight: bold;
              margin-bottom: 16px;
              letter-spacing: 1px;
            }
            .label-row {
              margin: 10px 0;
              font-size: 1.05rem;
              word-break: break-all;
              text-transform: capitalize;
            }
            .label-id {
              font-size: 0.95rem;
              color: #666;
              margin-top: 18px;
              letter-spacing: 1px;
            }
          </style>
        </head>
        <body>
          <div class="label-container">
            ${printContents}
          </div>
        </body>
      </html>
    `;
    // 2. Crée un élément DOM temporaire
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    // 3. Ouvre une nouvelle fenêtre
    const printWindow = window.open("", "_blank", "width=400,height=600");
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
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        onClick={handlePrint}
        variant="outline"
        className="flex items-center gap-2 px-4 py-2 rounded-md text-base"
      >
        <Printer className="w-5 h-5" />
        Imprimer l&apos;étiquette
      </Button>
      {/* Zone invisible pour l'impression */}
      <div ref={printRef} className="sr-only print:block">
        <div>
          <div className="label-title">Étiquette de livraison</div>
          <div className="label-row">
            <b>Destinataire :</b> {order.receiverName}
          </div>
          <div className="label-row">
            <b>Adresse :</b> {order.receiverAddress}
          </div>
          <div className="label-row">
            <b>Téléphone :</b> {order.receiverTel}
          </div>
          <div className="label-id">
            <b>ID commande :</b> {order.id}
          </div>
        </div>
      </div>
    </div>
  );
}
