"use client";

import React, { useEffect, useState } from "react";
import {
  getSupplierStats,
  type SupplierStatsResult,
} from "@/actions/supplierAction";
import type { SupplierCurrency } from "@/lib/generated/prisma/client";

const Stats = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [currency, setCurrency] = useState<SupplierCurrency>("CDF");
  const [stats, setStats] = useState<SupplierStatsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getSupplierStats(currency, currentPage);

        if (!active) return;

        if (!result.success) {
          setError(result.message ?? "Impossible de charger vos statistiques.");
          return;
        }

        setStats(result);
      } catch (err) {
        console.error("Erreur récupération statistiques :", err);

        if (active) {
          setError("Une erreur est survenue lors du chargement.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      active = false;
    };
  }, [currentPage, currency]);

  const formatMoney = (amount: string | number, currencyToDisplay: string) =>
    `${new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(Number(amount))} ${currencyToDisplay}`;

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "traité":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400";

      case "non-traité":
        return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400";

      case "annulé":
        return "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400";

      default:
        return "bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-gray-300";
    }
  };

  if (loading && !stats) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-7 w-40 rounded bg-gray-200 dark:bg-neutral-800" />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-40 rounded-xl bg-gray-100 dark:bg-neutral-900"
            />
          ))}
        </div>

        <div className="h-64 rounded-xl bg-gray-100 dark:bg-neutral-900" />
      </div>
    );
  }

  if (!stats && error) {
    return (
      <div className="rounded-xl border border-gray-200 p-6 text-sm text-gray-500 dark:border-neutral-800">
        {error}
      </div>
    );
  }

  if (!stats) return null;

  const transactions = stats.transactions;

  return (
    <div className="w-full space-y-6">
      {/* En-tête */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Mes finances
        </h2>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Consultez vos revenus et l'historique de vos retraits.
        </p>
      </div>

      {/* Sélection de devise : uniquement pour les totaux */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Devise des totaux
          </p>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            L'historique conserve la devise de chaque retrait.
          </p>
        </div>

        <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-neutral-800 dark:bg-neutral-900">
          {(["USD", "CDF"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setCurrency(value)}
              disabled={loading || currency === value}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition-all ${
                currency === value
                  ? "bg-white text-gray-900 shadow-sm dark:bg-neutral-700 dark:text-white"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {/* Actualisation */}
      {loading && (
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700 dark:border-neutral-700 dark:border-t-white" />
          Actualisation des statistiques...
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Totaux financiers */}
      <div
        className={`grid grid-cols-1 gap-4 transition-opacity sm:grid-cols-2 xl:grid-cols-3 ${
          loading ? "opacity-60" : ""
        }`}
      >
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Solde disponible à retirer
          </p>

          <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
            {formatMoney(stats.balance, stats.currency)}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total déjà reçu
          </p>

          <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
            {formatMoney(stats.totalReceived, stats.currency)}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 sm:col-span-2 xl:col-span-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total des gains
          </p>

          <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
            {formatMoney(stats.totalEarnings, stats.currency)}
          </p>
        </div>
      </div>

      {/* Historique des retraits */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 p-5 dark:border-neutral-800">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Historique des retraits
            </h3>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Consultez les sommes retirées et leur état de traitement.
            </p>
          </div>

          <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 dark:bg-neutral-800 dark:text-gray-300">
            {stats.totalTransactions} retraits
          </span>
        </div>

        {transactions.length > 0 ? (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 dark:bg-neutral-800/50 dark:text-gray-400">
                  <tr>
                    <th className="px-5 py-3 font-medium">Bénéficiaire</th>
                    <th className="px-5 py-3 font-medium">Téléphone</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    {/* <th className="px-5 py-3 font-medium">Transfert ID</th> */}
                    <th className="px-5 py-3 text-right font-medium">
                      Montant
                    </th>
                    <th className="px-5 py-3 text-right font-medium">Statut</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                  {transactions.map((withdrawal) => (
                    <tr key={withdrawal.id}>
                      <td className="px-5 py-4 font-medium text-gray-800 dark:text-gray-200">
                        {withdrawal.paymentName}
                      </td>

                      <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                        {withdrawal.paymentPhone}
                      </td>

                      <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                        {formatDate(withdrawal.date)}
                      </td>

                      {/* <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                        {withdrawal.transfertID ?? "—"}
                      </td> */}

                      <td className="px-5 py-4 text-right font-semibold text-gray-900 dark:text-white">
                        {formatMoney(withdrawal.amount, withdrawal.currency)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyle(
                            withdrawal.status,
                          )}`}
                        >
                          {withdrawal.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="divide-y divide-gray-100 sm:hidden dark:divide-neutral-800">
              {transactions.map((withdrawal) => (
                <div key={withdrawal.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                        {withdrawal.paymentName}
                      </p>

                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {withdrawal.paymentPhone}
                      </p>
                    </div>

                    <p className="shrink-0 text-sm font-bold text-gray-900 dark:text-white">
                      {formatMoney(withdrawal.amount, withdrawal.currency)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatDate(withdrawal.date)}</span>

                    <span
                      className={`rounded-full px-2.5 py-1 font-medium ${getStatusStyle(
                        withdrawal.status,
                      )}`}
                    >
                      {withdrawal.status}
                    </span>
                  </div>

                  {withdrawal.transfertID && (
                    <p className="break-all text-xs text-gray-500 dark:text-gray-400">
                      Transfert : {withdrawal.transfertID}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Aucun retrait enregistré pour le moment.
            </p>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Votre historique de retraits apparaîtra ici.
            </p>
          </div>
        )}

        {/* Pagination */}
        {stats.totalPages > 1 && (
          <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-5 py-4 dark:border-neutral-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Page {stats.currentPage} sur {stats.totalPages}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1 || loading}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:opacity-40 dark:border-neutral-700"
              >
                Précédent
              </button>

              <button
                type="button"
                disabled={currentPage >= stats.totalPages || loading}
                onClick={() =>
                  setCurrentPage((page) => Math.min(stats.totalPages, page + 1))
                }
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:opacity-40 dark:border-neutral-700"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stats;
