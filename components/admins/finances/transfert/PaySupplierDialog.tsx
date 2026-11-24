"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type Currency = "USD" | "CDF";

export type PayableSupplier = {
  id: string;
  name: string | null;
  tel?: string | null;
  /** Montant dû dans la devise courante. */
  amount: number;
};

/** Réponse de la server action : en cas d'échec, le message est affiché dans le pop-up. */
export type PaymentResult =
  | { success: true }
  | { success: false; error: string };

/** Données envoyées à la server action. */
export type PaymentInput = {
  supplierId: string;
  /** Montant à retrancher du solde du fournisseur. */
  amount: number;
  /** Numéro vers lequel l'argent est envoyé. */
  phone: string;
  currency: Currency;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suppliers: PayableSupplier[];
  currency: Currency;
  /** Fournisseur présélectionné (clic sur « Payer » d'une ligne). */
  initialSupplierId?: string;
  formatAmount: (amount: number) => string;
  onSubmit?: (payment: PaymentInput) => Promise<PaymentResult | void> | void;
};

const digitsOnly = (value: string) => value.replace(/\D/g, "");

export default function PaySupplierDialog({
  open,
  onOpenChange,
  ...formProps
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payer un fournisseur</DialogTitle>
          <DialogDescription>
            Le montant saisi sera retranché du solde dû en {formProps.currency}.
          </DialogDescription>
        </DialogHeader>
        {/* Monté seulement à l'ouverture : le formulaire repart à zéro à chaque fois */}
        <PayForm {...formProps} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function PayForm({
  suppliers,
  currency,
  initialSupplierId,
  formatAmount,
  onSubmit,
  onDone,
}: Omit<Props, "open" | "onOpenChange"> & { onDone: () => void }) {
  const initial = suppliers.find((s) => s.id === initialSupplierId);

  const [supplierId, setSupplierId] = useState(initial?.id ?? "");
  const [phone, setPhone] = useState(initial?.tel ?? "");
  const [amountText, setAmountText] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = suppliers.find((s) => s.id === supplierId);
  const decimals = currency === "USD" ? 3 : 2;

  const amount = Number(amountText.replace(",", "."));
  const hasAmount = amountText.trim() !== "" && Number.isFinite(amount);
  const exceeds = !!selected && hasAmount && amount > selected.amount + 1e-9;
  const amountValid = !!selected && hasAmount && amount > 0 && !exceeds;
  const phoneValid = digitsOnly(phone).length >= 9;
  const canSubmit = amountValid && phoneValid && !pending;

  const remaining =
    selected && amountValid ? Math.max(0, selected.amount - amount) : null;

  function handleSelect(id: string) {
    const supplier = suppliers.find((s) => s.id === id);
    setSupplierId(id);
    setPhone(supplier?.tel ?? "");
    setAmountText("");
    setError(null);
  }

  function payAll() {
    if (!selected) return;
    const factor = 10 ** decimals;
    setAmountText(String(Math.floor(selected.amount * factor) / factor));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !canSubmit) return;

    setPending(true);
    setError(null);
    try {
      const result = await onSubmit?.({
        supplierId: selected.id,
        amount,
        phone: phone.trim(),
        currency,
      });
      if (result && !result.success) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      onDone();
      toast.success("Paiement effectué avec succès.");
    } catch {
      setError("Le paiement a échoué. Vérifiez les informations et réessayez.");
      toast.error(
        "Le paiement a échoué. Vérifiez les informations et réessayez.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      {/* Fournisseur */}
      <div className="grid gap-2">
        <Label htmlFor="pay-supplier">Fournisseur</Label>
        <Select value={supplierId} onValueChange={handleSelect}>
          <SelectTrigger id="pay-supplier" className="w-full">
            <SelectValue placeholder="Choisir un fournisseur" />
          </SelectTrigger>
          <SelectContent>
            {suppliers.map((supplier) => (
              <SelectItem key={supplier.id} value={supplier.id}>
                {supplier.name ?? "Sans nom"} · {formatAmount(supplier.amount)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Montant dû */}
      {selected && (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-200 ring-inset">
          <div className="min-w-0">
            <p className="truncate font-medium text-stone-900">
              {selected.name ?? "Sans nom"}
            </p>
            <p className="text-xs text-stone-500">Montant dû</p>
          </div>
          <p className="text-lg font-semibold tabular-nums text-emerald-700">
            {formatAmount(selected.amount)}
          </p>
        </div>
      )}

      {/* Montant à retrancher */}
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="pay-amount">Montant à retrancher ({currency})</Label>
          <button
            type="button"
            onClick={payAll}
            disabled={!selected}
            className="rounded text-xs font-medium text-emerald-700 hover:underline focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
          >
            Tout payer
          </button>
        </div>
        <Input
          id="pay-amount"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0"
          value={amountText}
          disabled={!selected}
          aria-invalid={exceeds}
          onChange={(e) => setAmountText(e.target.value)}
        />
        {exceeds ? (
          <p className="text-xs text-red-600">
            Le montant dépasse le solde dû ({formatAmount(selected!.amount)}).
          </p>
        ) : remaining !== null ? (
          <p className="text-xs text-stone-500">
            Solde restant après paiement :{" "}
            <span className="font-medium tabular-nums text-stone-700">
              {formatAmount(remaining)}
            </span>
          </p>
        ) : null}
      </div>

      {/* Numéro destinataire */}
      <div className="grid gap-2">
        <Label htmlFor="pay-phone">Numéro à créditer</Label>
        <Input
          id="pay-phone"
          type="tel"
          inputMode="tel"
          autoComplete="off"
          placeholder="+243 8X XXX XXXX"
          value={phone}
          disabled={!selected}
          aria-invalid={phone.length > 0 && !phoneValid}
          onChange={(e) => setPhone(e.target.value)}
        />
        {phone.length > 0 && !phoneValid && (
          <p className="text-xs text-red-600">
            Saisissez un numéro d’au moins 9 chiffres.
          </p>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <DialogFooter className="gap-2 sm:gap-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={!canSubmit}
          className="bg-emerald-600 text-white hover:bg-emerald-700"
        >
          {pending ? "Paiement en cours…" : "Valider le paiement"}
        </Button>
      </DialogFooter>
    </form>
  );
}
