import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { DownloadCloud, BanknoteArrowDown } from "lucide-react";
import ShopsTableToPay from "./ShopsTableToPay";
import { WithdrawalHistory } from "@prisma/client";
import ShopsTableToPrintExcel from "./ShopsTableToPrintExcel";

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

// to pay create withdraw history
export function PayShopsPopup({
  shops,
  currency,
}: {
  shops: ShopItem[];
  currency: "USD" | "CDF";
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <BanknoteArrowDown className="w-4 h-4" />
          Payer des boutiques
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-3xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden flex flex-col
      [&>button]:hidden
      "
      >
        <DialogHeader className="w-full flex items-center justify-between flex-row py-2">
          <DialogTitle hidden>Paiement des boutiques</DialogTitle>
          <DialogClose asChild className="">
            <Button variant="ghost" className="absolute top-4 right-2">
              Fermer
            </Button>
          </DialogClose>
        </DialogHeader>
        <ShopsTableToPay shops={shops} currency={currency} />
      </DialogContent>
    </Dialog>
  );
}

// to print as Excel
export function PayShopsPopupExcel({
  allWidithdraw,
  currency,
}: {
  allWidithdraw: WithdrawalHistory[];
  currency: "USD" | "CDF";
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <DownloadCloud className="w-4 h-4" />
          Valider ou importer en excel
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-3xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden flex flex-col
      [&>button]:hidden
      "
      >
        <DialogHeader className="w-full flex items-center justify-between flex-row py-4">
          <DialogTitle className="pt-4 md:pt-0">
            Importer en excel ou valider le transfert
          </DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" className="absolute top-4 right-2">
              Fermer
            </Button>
          </DialogClose>
        </DialogHeader>

        <ShopsTableToPrintExcel
          allWidithdraw={allWidithdraw}
          currency={currency}
        />
      </DialogContent>
    </Dialog>
  );
}
