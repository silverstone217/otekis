"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { BanknoteArrowDown } from "lucide-react";
import { FaSpinner } from "react-icons/fa";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isEmptyString } from "@/utils/functions";
import { makeTransactionCompanyBenefit } from "@/actions/companyAction";
import { toast } from "sonner";

type RetrieveMoneyProps = {
  currency: "CDF" | "USD";
};

const RetrieveMoney = ({ currency }: RetrieveMoneyProps) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRetrieve = async () => {
    if (loading) return;
    setLoading(true);

    // Simule un appel API - remplacer par ta logique réelle
    try {
      // keep float number
      const raw = amount.trim();
      let val = parseFloat(raw);
      if (!Number.isNaN(val) && !Number.isInteger(val)) {
        val = Math.round(val * 100) / 100;
      }
      const formdata = { amount: val, currency };
      const result = await makeTransactionCompanyBenefit(formdata);

      if (result.error) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message); // success message

      // rafraichir la page / données si besoin
      router.refresh();
      setAmount("");
      // idéalement fermer modal ici si tu veux
    } catch (error) {
      console.error(error);
      // gérer l’erreur (toast, message, etc)
    } finally {
      setLoading(false);
    }
  };

  const isAmountValid = (() => {
    const num = Number(amount);
    return !isEmptyString(amount) && !isNaN(num) && num >= 0.1;
  })();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          aria-label="Retirer les gains"
        >
          <BanknoteArrowDown className="h-5 w-5 text-muted-foreground" />
          Retirer les gains
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-md w-full max-h-[70vh] overflow-y-auto rounded-lg p-6 sm:p-8
      [&>button]:hidden
      "
      >
        <DialogHeader className="mb-4">
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Fermer la fenêtre"
              className="absolute top-4 right-4 rounded-full"
              disabled={loading}
            >
              ✕
            </Button>
          </DialogClose>

          <DialogTitle className="text-lg font-semibold">
            Retirer les bénéfices
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            Vous pouvez retirer les bénéfices générés sur votre compte de{" "}
            <strong>l&apos;entreprise</strong>.
            <br />
            Vous utilisez un compte en{" "}
            <strong>{currency === "CDF" ? "Francs" : "Dollars"}</strong>.
            Spécifiez le montant à retirer ci-dessous.
          </DialogDescription>
        </DialogHeader>

        {/* Formulaire */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isAmountValid) handleRetrieve();
          }}
          className="space-y-6"
        >
          <div className="grid w-full gap-1">
            <Label htmlFor="amountInput" className="text-sm font-medium">
              Montant à retirer
            </Label>
            <Input
              id="amountInput"
              type="number"
              step="0.01"
              min="0"
              autoComplete="off"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={currency === "CDF" ? "0.00 CDF" : "0.00 USD"}
              className="text-lg font-semibold"
              disabled={loading}
              required
            />
          </div>

          <DialogFooter className="pt-0">
            <Button
              type="submit"
              disabled={!isAmountValid || loading}
              className="w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <FaSpinner
                  className="animate-spin h-5 w-5"
                  aria-label="Chargement"
                />
              ) : (
                <BanknoteArrowDown className="h-5 w-5" />
              )}
              Retirer le gain
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RetrieveMoney;
