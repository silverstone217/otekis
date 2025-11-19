"use client";

import * as React from "react";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, DownloadCloud, Loader } from "lucide-react";
import { Checkbox } from "./CheckBoxTransfertPopUp";
import { capitalizeText } from "@/utils/shopFunctions";
import cuid from "cuid";
import { transfertShop, TransfertShopType } from "@/actions/transfertAction";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { returnFormatedMoney } from "@/utils/functions";

// Type du shop
type ShopItem = {
  description: string;
  name: string;
  id: string;
  userId: string;
  paymentPhone: string;
  paymentName: string;
  slug: string;
  logo: string;
  cover: string | null;
  category: string;
  benefit: number;
  benefitCDF: number;
};

interface ShopsTableProps {
  shops: ShopItem[];
  currency: "USD" | "CDF";
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
}

export default function ShopsTableToPay({
  shops,
  currency,
  loading,
  setLoading,
}: ShopsTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const router = useRouter();

  // Gère la sélection d'une boutique
  const toggleShop = (id: string) => {
    setSelectedIds((selected) =>
      selected.includes(id)
        ? selected.filter((sid) => sid !== id)
        : [...selected, id]
    );
  };

  const transactionId = cuid();

  // Gère la sélection globale
  const allChecked = selectedIds.length === shops.length && shops.length > 0;
  const someChecked = selectedIds.length > 0 && !allChecked;

  const toggleAll = () => {
    setSelectedIds(allChecked ? [] : shops.map((shop) => shop.id));
  };

  // Générer le fichier Excel à partir des boutiques cochées
  const handlePayAndExport = async () => {
    if (selectedIds.length === 0) {
      toast.error("Veuillez sélectionner au moins une boutique.");
      return;
    }

    setLoading(true);

    const selectedShops = shops.filter((shop) => selectedIds.includes(shop.id));

    try {
      const formData: TransfertShopType = selectedShops.map((item) => {
        return {
          shopId: item.id,
          transfertID: transactionId,
          amount: currency === "USD" ? item.benefit : item.benefitCDF,
          currency,
          paymentName: item.paymentName,
          paymentPhone: item.paymentPhone,
        };
      });

      const result = await transfertShop(formData);

      if (result.error) {
        toast.error(result.message);
        return;
      }

      toast.success("Paiement effectué avec succès");

      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'export ou du paiement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-xl border border-muted py-4 px-2 bg-background shadow-md">
      <div className="flex justify-between items-center mb-4 w-full flex-wrap gap-y-2">
        <h2 className="text-lg font-bold">Paiement des boutiques</h2>
        <Button
          size="sm"
          variant="outline"
          onClick={handlePayAndExport}
          disabled={selectedIds.length === 0 || loading}
          className="flex items-center gap-2 ml-auto"
        >
          {loading ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowRightLeft className="w-4 h-4" />
          )}
          Payer
        </Button>
      </div>
      <div className="overflow-auto overflow-x-auto w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Checkbox
                  checked={allChecked}
                  indeterminate={someChecked || undefined}
                  onChange={toggleAll}
                  aria-label="Tout sélectionner"
                />
              </TableHead>
              <TableHead>Boutique</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Destinataire</TableHead>
              <TableHead>Téléphone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shops.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-8"
                >
                  Aucun résultat.
                </TableCell>
              </TableRow>
            )}
            {shops.map((shop) => {
              const amount =
                currency === "USD" ? shop.benefit : shop.benefitCDF;
              return (
                <TableRow
                  key={shop.id}
                  className={
                    selectedIds.includes(shop.id) ? "bg-accent/30" : ""
                  }
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(shop.id)}
                      onChange={() => toggleShop(shop.id)}
                      aria-label={`Sélectionner ${shop.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {capitalizeText(shop.name)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono  font-medium">
                      {returnFormatedMoney(amount)}{" "}
                      <span className="text-xs">{currency}</span>
                    </span>
                  </TableCell>
                  <TableCell>
                    <span>{capitalizeText(shop.paymentName)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono">{shop.paymentPhone}</span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {selectedIds.length > 0 && (
          <p className="mt-4 text-gray-500 transition-all duration-500 ease-in-out text-sm">
            <span className="font-medium">Selectionnée:</span>{" "}
            <span className="font-mono">
              {selectedIds.length.toString().padStart(2, "0")}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
