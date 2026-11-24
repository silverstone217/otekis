"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import PaySupplierDialog, {
  type PaymentInput,
  type PaymentResult,
} from "./PaySupplierDialog";

export type Currency = "USD" | "CDF";

/** Sous-ensemble du modèle User nécessaire à la liste. */
export type SupplierToPay = {
  id: string;
  name: string | null;
  tel?: string | null;
  // Les Decimal Prisma ne passent pas aux Client Components : convertissez-les
  // en number ou string côté serveur (ex. user.supplierBenefitAmount.toString()).
  supplierBenefitAmount?: number | string | null;
  supplierBenefitAmountCDF?: number | string | null;
};

type Props = {
  suppliers: SupplierToPay[];
  currency: Currency;
  pageSize?: number;
  /** Appelé à la validation du pop-up de paiement (server action à brancher). */
  onPay?: (payment: PaymentInput) => Promise<PaymentResult | void> | void;
  exchange: number;
};

const MIN_AMOUNT: Record<Currency, number> = { USD: 0.001, CDF: 0.001 };

const formatters: Record<Currency, Intl.NumberFormat> = {
  USD: new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  }),
  CDF: new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "CDF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }),
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const digitsOnly = (value: string) => value.replace(/\D/g, "");

const initials = (name: string | null) =>
  (name ?? "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

export default function SuppliersToPayList({
  suppliers,
  currency,
  pageSize = 10,
  onPay,
  exchange,
}: Props) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [payOpen, setPayOpen] = useState(false);
  const [payFor, setPayFor] = useState<string | undefined>();

  const openPay = (supplierId?: string) => {
    setPayFor(supplierId);
    setPayOpen(true);
  };

  // 1. Montant selon la devise + seuil minimal
  const payable = useMemo(() => {
    return suppliers
      .map((supplier) => {
        const raw =
          currency === "USD"
            ? supplier.supplierBenefitAmount
            : supplier.supplierBenefitAmountCDF;
        return { supplier, amount: Number(raw ?? 0) || 0 };
      })
      .filter(({ amount }) => amount > MIN_AMOUNT[currency])
      .sort((a, b) => b.amount - a.amount);
  }, [suppliers, currency]);

  // 2. Filtre nom / numéro
  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return payable;
    const nameQuery = normalize(q);
    const telQuery = digitsOnly(q);

    return payable.filter(({ supplier }) => {
      const nameMatch = normalize(supplier.name ?? "").includes(nameQuery);
      const telMatch =
        telQuery.length > 0 &&
        digitsOnly(supplier.tel ?? "").includes(telQuery);
      return nameMatch || telMatch;
    });
  }, [payable, query]);

  // 3. Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const rows = filtered.slice(start, start + pageSize);

  const total = useMemo(
    () => filtered.reduce((sum, row) => sum + row.amount, 0),
    [filtered],
  );

  const format = (amount: number) => formatters[currency].format(amount);

  return (
    <section className="w-full rounded-2xl border border-stone-200 bg-white shadow-sm">
      {/* En-tête */}
      <header className="flex flex-col gap-4 border-b border-stone-200 p-4 sm:p-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-stone-900 sm:text-xl">
            Fournisseurs à payer
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            {filtered.length} fournisseur{filtered.length > 1 ? "s" : ""} en
            attente de paiement en {currency}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="rounded-xl bg-emerald-50 px-4 py-2 text-emerald-900 ring-1 ring-emerald-200 ring-inset">
            <p className="text-xs text-emerald-700">Total à payer</p>
            <p className="text-lg font-semibold tabular-nums">
              {format(total)}
            </p>
          </div>

          <label className="relative block sm:w-72">
            <span className="sr-only">Rechercher un fournisseur</span>
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400"
            >
              <circle cx="9" cy="9" r="6" />
              <path d="m14 14 3.5 3.5" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Nom ou numéro de téléphone"
              className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pr-3 pl-9 text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/30 focus:outline-none"
            />
          </label>

          <Button
            type="button"
            onClick={() => openPay()}
            className="h-10 rounded-xl bg-emerald-600 px-4 text-white hover:bg-emerald-700"
          >
            Payer un fournisseur
          </Button>
        </div>
      </header>

      {/* Contenu */}
      {rows.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="font-medium text-stone-800">
            {query
              ? "Aucun fournisseur ne correspond à cette recherche"
              : `Aucun paiement en attente en ${currency}`}
          </p>
          <p className="mt-1 text-sm text-stone-500">
            {query
              ? "Vérifiez l’orthographe du nom ou le numéro saisi."
              : "Les fournisseurs apparaissent ici dès qu’ils ont un solde à recevoir."}
          </p>
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="mt-4 rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
            >
              Effacer la recherche
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Mobile : cartes */}
          <ul className="divide-y divide-stone-100 md:hidden">
            {rows.map(({ supplier, amount }) => (
              <li key={supplier.id} className="flex items-center gap-3 p-4">
                <Avatar name={supplier.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-stone-900">
                    {supplier.name ?? "Sans nom"}
                  </p>
                  <Phone tel={supplier.tel} />
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <p className="font-semibold tabular-nums text-emerald-700">
                    {format(amount)}
                  </p>
                  <PayButton onClick={() => openPay(supplier.id)} />
                </div>
              </li>
            ))}
          </ul>

          {/* Grand écran : tableau */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-500">
                <tr>
                  <th scope="col" className="px-6 py-3 font-medium">
                    Fournisseur
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium">
                    Téléphone
                  </th>
                  <th scope="col" className="px-6 py-3 text-right font-medium">
                    Montant dû
                  </th>
                  <th scope="col" className="px-6 py-3">
                    <span className="sr-only">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {rows.map(({ supplier, amount }) => (
                  <tr key={supplier.id} className="hover:bg-stone-50/70">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={supplier.name} />
                        <span className="font-medium text-stone-900">
                          {supplier.name ?? "Sans nom"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <Phone tel={supplier.tel} />
                    </td>
                    <td className="px-6 py-3.5 text-right font-semibold tabular-nums text-emerald-700">
                      {format(amount)}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <PayButton onClick={() => openPay(supplier.id)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <footer className="flex flex-col items-center justify-between gap-3 border-t border-stone-200 p-4 sm:flex-row sm:px-6">
            <p className="text-sm text-stone-500">
              {start + 1}–{Math.min(start + pageSize, filtered.length)} sur{" "}
              {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
              >
                Précédent
              </button>
              <span className="min-w-24 text-center text-sm text-stone-600 tabular-nums">
                Page {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
              >
                Suivant
              </button>
            </div>
          </footer>
        </>
      )}

      <PaySupplierDialog
        open={payOpen}
        onOpenChange={setPayOpen}
        currency={currency}
        suppliers={payable.map(({ supplier, amount }) => ({
          id: supplier.id,
          name: supplier.name,
          tel: supplier.tel,
          amount,
        }))}
        initialSupplierId={payFor}
        formatAmount={format}
        onSubmit={onPay}
      />
    </section>
  );
}

function Avatar({ name }: { name: string | null }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-stone-100 text-sm font-semibold text-stone-600"
    >
      {initials(name)}
    </span>
  );
}

function Phone({ tel }: { tel?: string | null }) {
  if (!tel)
    return <span className="text-sm text-stone-400">Non renseigné</span>;
  return (
    <a
      href={`tel:${tel.replace(/\s/g, "")}`}
      className="text-sm text-stone-600 hover:text-emerald-700 hover:underline focus-visible:rounded focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
    >
      {tel}
    </a>
  );
}

function PayButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:outline-none sm:text-sm"
    >
      Payer
    </button>
  );
}
