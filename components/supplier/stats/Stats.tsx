"use client";

import { useEffect, useState, type ReactNode } from "react";

import {
  getSupplierStats,
  type SupplierStatsResult,
} from "@/actions/supplierAction";
import type { SupplierCurrency } from "@/lib/generated/prisma/client";

type Withdrawal = SupplierStatsResult["transactions"][number];

const CURRENCIES = ["USD", "CDF"] as const;

/* -------------------------------------------------------------------------- */
/*  Formatage                                                                 */
/* -------------------------------------------------------------------------- */

const numberFormats = {
  USD: new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  }),
  CDF: new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }),
};

function formatMoney(amount: string | number, currency: string) {
  const format = currency === "USD" ? numberFormats.USD : numberFormats.CDF;
  return `${format.format(Number(amount))} ${currency}`;
}

/** Équivalent dans l'autre devise, au taux enregistré lors du paiement. */
function formatEquivalent(withdrawal: Withdrawal) {
  const rate = withdrawal.exchange;
  if (!rate || rate <= 0) return null;

  const amount = Number(withdrawal.amount);
  return withdrawal.currency === "USD"
    ? formatMoney(amount * rate, "CDF")
    : formatMoney(amount / rate, "USD");
}

function formatDateParts(iso: string) {
  const date = new Date(iso);
  return {
    day: new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date),
    time: new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date),
  };
}

/* -------------------------------------------------------------------------- */
/*  Données                                                                   */
/* -------------------------------------------------------------------------- */

function useSupplierStats(currency: SupplierCurrency, page: number) {
  const [stats, setStats] = useState<SupplierStatsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getSupplierStats(currency, page);
        if (!active) return;

        if (!result.success) {
          setError(result.message ?? "Impossible de charger vos finances.");
          return;
        }
        setStats(result);
      } catch (err) {
        console.error("Erreur récupération statistiques :", err);
        if (active) setError("Une erreur est survenue. Veuillez réessayer.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [currency, page, reloadKey]);

  return {
    stats,
    loading,
    error,
    reload: () => setReloadKey((key) => key + 1),
  };
}

/* -------------------------------------------------------------------------- */
/*  Composant principal                                                       */
/* -------------------------------------------------------------------------- */

export default function SupplierFinances() {
  const [page, setPage] = useState(1);
  const [currency, setCurrency] = useState<SupplierCurrency>("CDF");
  const { stats, loading, error, reload } = useSupplierStats(currency, page);

  if (!stats) {
    return loading ? (
      <FinancesSkeleton />
    ) : (
      <ErrorNotice
        message={error ?? "Impossible de charger vos finances."}
        onRetry={reload}
      />
    );
  }

  const count = stats.totalTransactions;

  return (
    <div className="w-full space-y-8" aria-busy={loading}>
      {/* En-tête */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl dark:text-white">
            Mes finances
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Suivez vos gains et l’historique de vos paiements.
          </p>
        </div>

        <CurrencyToggle
          value={currency}
          disabled={loading}
          onChange={setCurrency}
        />
      </header>

      {error && <ErrorNotice message={error} onRetry={reload} compact />}

      {/* Totaux */}
      <section
        aria-label={`Totaux en ${stats.currency}`}
        className={`grid grid-cols-1 gap-4 transition-opacity sm:grid-cols-2 xl:grid-cols-3 ${
          loading ? "opacity-60" : ""
        }`}
      >
        <StatCard
          tone="primary"
          label="Disponible à retirer"
          value={formatMoney(stats.balance, stats.currency)}
          hint="Solde en attente de paiement"
          className="sm:col-span-2 xl:col-span-1"
        />
        <StatCard
          label="Déjà reçu"
          value={formatMoney(stats.totalReceived, stats.currency)}
          hint="Paiements effectués"
        />
        <StatCard
          label="Gains cumulés"
          value={formatMoney(stats.totalEarnings, stats.currency)}
          hint="Solde + paiements reçus"
        />
      </section>

      {/* Historique */}
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 sm:px-6 dark:border-neutral-800">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Historique des paiements
            </h3>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Chaque paiement garde sa devise d’origine.
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 tabular-nums dark:bg-neutral-800 dark:text-gray-300">
            {count} paiement{count > 1 ? "s" : ""}
          </span>
        </div>

        {stats.transactions.length === 0 ? (
          <EmptyHistory />
        ) : (
          <div className={loading ? "opacity-60 transition-opacity" : ""}>
            <WithdrawalsTable withdrawals={stats.transactions} />
            <WithdrawalsList withdrawals={stats.transactions} />
            <p className="border-t border-gray-100 px-5 py-3 text-xs text-gray-500 sm:px-6 dark:border-neutral-800 dark:text-gray-400">
              Les paiements annulés ne sont pas comptés dans « Déjà reçu ».
            </p>
          </div>
        )}

        {stats.totalPages > 1 && (
          <Pagination
            page={stats.currentPage}
            totalPages={stats.totalPages}
            disabled={loading}
            onChange={setPage}
          />
        )}
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sous-composants                                                           */
/* -------------------------------------------------------------------------- */

function CurrencyToggle({
  value,
  disabled,
  onChange,
}: {
  value: SupplierCurrency;
  disabled: boolean;
  onChange: (currency: SupplierCurrency) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5 sm:items-end">
      <span
        id="currency-label"
        className="text-xs font-medium text-gray-500 dark:text-gray-400"
      >
        Totaux affichés en
      </span>
      <div
        role="group"
        aria-labelledby="currency-label"
        className="inline-flex w-full rounded-xl border border-gray-200 bg-gray-50 p-1 sm:w-auto dark:border-neutral-800 dark:bg-neutral-900"
      >
        {CURRENCIES.map((option) => {
          const selected = option === value;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              disabled={disabled && !selected}
              onClick={() => !selected && onChange(option)}
              className={`flex-1 rounded-lg px-5 py-1.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none disabled:cursor-wait sm:flex-none ${
                selected
                  ? "bg-white text-gray-900 shadow-sm dark:bg-neutral-700 dark:text-white"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  tone = "default",
  className = "",
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "default" | "primary";
  className?: string;
}) {
  const primary = tone === "primary";
  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 ${
        primary
          ? "border-emerald-600 bg-emerald-600 text-white"
          : "border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
      } ${className}`}
    >
      <p
        className={`text-sm font-medium ${
          primary ? "text-emerald-50" : "text-gray-500 dark:text-gray-400"
        }`}
      >
        {label}
      </p>
      <p
        className={`mt-2 text-2xl font-bold tracking-tight tabular-nums sm:text-3xl ${
          primary ? "text-white" : "text-gray-900 dark:text-white"
        }`}
      >
        {value}
      </p>
      <p
        className={`mt-2 text-xs ${
          primary ? "text-emerald-100" : "text-gray-400 dark:text-gray-500"
        }`}
      >
        {hint}
      </p>
    </div>
  );
}

const STATUS_STYLES: Record<
  string,
  { label: string; dot: string; chip: string }
> = {
  traité: {
    label: "Payé",
    dot: "bg-emerald-500",
    chip: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  "non-traité": {
    label: "En attente",
    dot: "bg-amber-500",
    chip: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  },
  annulé: {
    label: "Annulé",
    dot: "bg-red-500",
    chip: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  },
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status.toLowerCase()] ?? {
    label: status,
    dot: "bg-gray-400",
    chip: "bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-gray-300",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${style.chip}`}
    >
      <span
        aria-hidden="true"
        className={`size-1.5 rounded-full ${style.dot}`}
      />
      {style.label}
    </span>
  );
}

function Amount({
  withdrawal,
  align = "right",
}: {
  withdrawal: Withdrawal;
  align?: "left" | "right";
}) {
  const equivalent = formatEquivalent(withdrawal);
  return (
    <div className={align === "right" ? "text-right" : "text-left"}>
      <p className="font-semibold tabular-nums text-gray-900 dark:text-white">
        {formatMoney(withdrawal.amount, withdrawal.currency)}
      </p>
      {equivalent && (
        <p
          className="mt-0.5 text-xs tabular-nums text-gray-400 dark:text-gray-500"
          title={`Taux au moment du paiement : 1 USD = ${numberFormats.CDF.format(
            withdrawal.exchange,
          )} CDF`}
        >
          ≈ {equivalent}
        </p>
      )}
    </div>
  );
}

function WithdrawalsTable({ withdrawals }: { withdrawals: Withdrawal[] }) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-xs text-gray-500 dark:bg-neutral-800/50 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3 font-medium">
              Date
            </th>
            <th scope="col" className="px-6 py-3 font-medium">
              Envoyé à
            </th>
            <th scope="col" className="px-6 py-3 font-medium">
              Référence
            </th>
            <th scope="col" className="px-6 py-3 text-right font-medium">
              Montant
            </th>
            <th scope="col" className="px-6 py-3 text-right font-medium">
              Statut
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
          {withdrawals.map((withdrawal) => {
            const { day, time } = formatDateParts(withdrawal.date);
            return (
              <tr
                key={withdrawal.id}
                className="hover:bg-gray-50/70 dark:hover:bg-neutral-800/30"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-gray-900 dark:text-gray-200">{day}</p>
                  <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                    {time}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900 dark:text-gray-200">
                    {withdrawal.paymentName}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {withdrawal.paymentPhone}
                  </p>
                </td>
                <td className="px-6 py-4">
                  {withdrawal.transfertID ? (
                    <span className="font-mono text-xs text-gray-600 dark:text-gray-300">
                      {withdrawal.transfertID}
                    </span>
                  ) : (
                    <span className="text-gray-300 dark:text-neutral-600">
                      —
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <Amount withdrawal={withdrawal} />
                </td>
                <td className="px-6 py-4 text-right">
                  <StatusBadge status={withdrawal.status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function WithdrawalsList({ withdrawals }: { withdrawals: Withdrawal[] }) {
  return (
    <ul className="divide-y divide-gray-100 md:hidden dark:divide-neutral-800">
      {withdrawals.map((withdrawal) => {
        const { day, time } = formatDateParts(withdrawal.date);
        return (
          <li key={withdrawal.id} className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {withdrawal.paymentName}
                </p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {withdrawal.paymentPhone}
                </p>
              </div>
              <Amount withdrawal={withdrawal} />
            </div>

            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {day} · {time}
              </p>
              <StatusBadge status={withdrawal.status} />
            </div>

            {withdrawal.transfertID && (
              <p className="text-xs break-all text-gray-400 dark:text-gray-500">
                Réf. <span className="font-mono">{withdrawal.transfertID}</span>
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function EmptyHistory() {
  return (
    <div className="px-6 py-14 text-center">
      <p className="font-medium text-gray-900 dark:text-white">
        Aucun paiement pour le moment
      </p>
      <p className="mx-auto mt-1 max-w-xs text-sm text-gray-500 dark:text-gray-400">
        Vos paiements apparaîtront ici dès qu’un retrait aura été effectué.
      </p>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  disabled,
  onChange,
}: {
  page: number;
  totalPages: number;
  disabled: boolean;
  onChange: (page: number) => void;
}) {
  const buttonClass =
    "rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-800";

  return (
    <nav
      aria-label="Pagination de l’historique"
      className="flex items-center justify-between gap-3 border-t border-gray-100 px-5 py-4 sm:px-6 dark:border-neutral-800"
    >
      <p className="text-xs text-gray-500 tabular-nums dark:text-gray-400">
        Page {page} sur {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1 || disabled}
          onClick={() => onChange(Math.max(1, page - 1))}
          className={buttonClass}
        >
          Précédent
        </button>
        <button
          type="button"
          disabled={page >= totalPages || disabled}
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          className={buttonClass}
        >
          Suivant
        </button>
      </div>
    </nav>
  );
}

function ErrorNotice({
  message,
  onRetry,
  compact = false,
}: {
  message: string;
  onRetry: () => void;
  compact?: boolean;
}): ReactNode {
  return (
    <div
      role="alert"
      className={`flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400 ${
        compact ? "px-4 py-3" : "p-6"
      }`}
    >
      <p>{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="self-start rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium hover:bg-red-100 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none sm:self-auto dark:border-red-800 dark:hover:bg-red-950/40"
      >
        Réessayer
      </button>
    </div>
  );
}

function FinancesSkeleton() {
  return (
    <div className="animate-pulse space-y-8" aria-hidden="true">
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <div className="h-7 w-40 rounded bg-gray-200 dark:bg-neutral-800" />
          <div className="h-4 w-64 rounded bg-gray-100 dark:bg-neutral-900" />
        </div>
        <div className="h-10 w-32 rounded-xl bg-gray-100 dark:bg-neutral-900" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-32 rounded-2xl bg-gray-100 dark:bg-neutral-900"
          />
        ))}
      </div>
      <div className="h-72 rounded-2xl bg-gray-100 dark:bg-neutral-900" />
    </div>
  );
}
