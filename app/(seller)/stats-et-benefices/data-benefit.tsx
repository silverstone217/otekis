"use client";

import { useState, useMemo } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  DollarSign,
  Wallet,
  ArrowUpRight,
  Clock,
  Banknote,
} from "lucide-react";
import { formatDate, returnFormatedMoney } from "@/utils/functions";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { BeneficiaryType } from "@/app/api/cinetpay/retrieve/route";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type Currency = "USD" | "CDF";

interface CurrencyRadioGroupProps {
  value: Currency;
  onChange: (value: Currency) => void;
}

function StatCard({
  title,
  value,
  icon,
  description,
  color = "text-indigo-600",
  currency,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  color?: string;
  currency?: "$" | "CDF";
}) {
  return (
    <Card className="flex flex-col items-start p-6 w-full max-w-xs shadow-md">
      <CardHeader className="flex items-center gap-4 p-0 mb-4">
        <div className={`p-3 rounded-md bg-indigo-100 ${color}`}>{icon}</div>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <p className="text-3xl font-bold text-gray-900">
          {value}{" "}
          {currency && (
            <span className="text-lg text-gray-600">{currency}</span>
          )}
        </p>
        {description && (
          <CardDescription className="mt-2 text-sm text-gray-500">
            {description}
          </CardDescription>
        )}
      </CardContent>
    </Card>
  );
}

interface Withdrawal {
  id: string;
  shopId: string;
  status?: string;
  amount: GLfloat;
  date: Date | string;
  currency: string;
}

export interface StatsAndBenefitsProps {
  id: string;
  salesCount: number;
  totalProfit: number;
  availableBalance: number;
  withdrawalHistory: Withdrawal[];
}

interface Props {
  defaultShopStats: StatsAndBenefitsProps;
  defaultShopStatsCDF: StatsAndBenefitsProps;
  setCurrency: React.Dispatch<React.SetStateAction<"USD" | "CDF">>;
  currency: "USD" | "CDF";
}

// const withdrawalHistory = [
//   { id: 1, amount: 1000, date: "2025-06-15", status: "Traitée" },
//   { id: 2, amount: 500, date: "2025-05-10", status: "Traitée" },
// ] as Withdrawal[];

export default function StatsAndBenefits({
  defaultShopStats,
  defaultShopStatsCDF,
  setCurrency,
  currency,
}: Props) {
  const withdrawalHistory: Withdrawal[] = useMemo(
    () => defaultShopStats.withdrawalHistory,
    [defaultShopStats]
  );

  const withdrawalHistoryCDF: Withdrawal[] = useMemo(
    () => defaultShopStatsCDF.withdrawalHistory,
    [defaultShopStatsCDF]
  );

  const stats = useMemo(() => {
    return {
      ...defaultShopStats,
      withdrawalHistory,
    };
  }, [withdrawalHistory, defaultShopStats]);

  const statsCDF = useMemo(() => {
    return {
      ...defaultShopStatsCDF,
      withdrawalHistoryCDF,
    };
  }, [withdrawalHistoryCDF, defaultShopStatsCDF]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const router = useRouter();
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? "https://otekis.vercel.app"
      : "http://localhost:3000";

  const notify_url = `${baseUrl}/api/cinetpay/notify`;

  const handleWithdraw = async () => {
    setLoading(true);
    setMessage(null);
    try {
      if (stats.availableBalance <= 0) {
        setMessage("Aucun solde disponible à retirer.");
        return;
      }

      if (!window.CinetPay) {
        setMessage("Le SDK CinetPay n'est pas chargé.");
        return;
      }

      const transaction_id = uuidv4().toString().replace(/-/g, "");

      const beneficiaries: BeneficiaryType[] = [
        {
          prefix: "243",
          phone: "818878289",
          amount: 1,
          client_transaction_id: transaction_id,
          notify_url,
          // currency: "USD",
          // payment_method: "mobile_money",
        },
      ];

      // ];

      // const apiCinetPayURL = "/api/cinetpay/add-beneficiary";

      const apiCinetPayURL = "/api/cinetpay/retrieve";

      window.CinetPay.setConfig({
        apikey: process.env.CINET_PAY_API_KEY!,
        site_id: process.env.CINET_PAY_SITE_ID!,
        notify_url: notify_url,
        mode: "PRODUCTION",
      });

      const res = await fetch(apiCinetPayURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          beneficiaries,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(`Erreur: ${data.error || "Erreur inconnue"}`);
        toast.error(`Erreur: ${data.error || "Erreur inconnue"}`);
        return;
      }
      if (data.code !== "0") {
        setMessage(`Erreur: ${data.message || "Erreur inconnue"}`);
        toast.error(`Erreur: ${data.message || "Erreur inconnue"}`);
      }

      setMessage(data.data.description || "Retrait effectué avec succès !");
      toast.success(data.data.description || "Retrait effectué avec succès !");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Une erreur survenue lors du retrait; veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  // Colonnes pour TanStack Table + shadcn/ui Table
  const columns = useMemo<ColumnDef<Withdrawal>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        cell: (info) => formatDate(new Date(info.getValue() as Date)),
      },
      {
        accessorKey: "amount",
        header: ` Montant `,
        cell: ({ row }) => {
          const item = row.original;
          const amount = item.amount;
          const amountCurrency = item.currency;

          return (
            <span>
              {returnFormatedMoney(amount)}{" "}
              <span className="text-xs">
                {amountCurrency === "USD" ? "$" : "CDF"}
              </span>
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Statut",
        cell: (info) => (
          <span
            className={`font-semibold ${
              info.getValue() === "traité"
                ? "text-green-600"
                : info.getValue() === "annulé"
                ? "text-destructive"
                : "text-yellow-600"
            }`}
          >
            {info.getValue() as string}
          </span>
        ),
      },
    ],
    []
  );

  const withdraHistoryByCurrency = useMemo(
    () => stats.withdrawalHistory.filter((item) => item.currency === currency),
    [currency, stats.withdrawalHistory]
  );
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data: withdraHistoryByCurrency,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  });

  return (
    <main className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <section className="w-full max-w-5xl space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Statistiques & Bénéfices
        </h1>

        {/* select currency */}
        <div className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Sélectionnez la devise</h2>
          <CurrencyRadioGroup value={currency} onChange={setCurrency} />
        </div>

        {/* Cartes statistiques */}
        {currency === "USD" ? (
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <StatCard
              title="Nombre de ventes"
              value={stats.salesCount.toLocaleString()}
              icon={<ShoppingCart className="w-8 h-8 text-blue-600" />}
              description="Total des ventes réalisées"
              color="text-blue-600"
            />
            <StatCard
              title="Bénéfices totaux"
              value={`${returnFormatedMoney(stats.totalProfit)}`}
              icon={<DollarSign className="w-8 h-8 text-green-600" />}
              description="Somme totale des bénéfices"
              color="text-green-600"
              currency={"$"}
            />
            <StatCard
              title="Solde disponible"
              value={`${returnFormatedMoney(stats.availableBalance)}`}
              icon={<Wallet className="w-8 h-8 text-yellow-600" />}
              description="Montant disponible pour retrait"
              color="text-yellow-600"
              currency={"$"}
            />
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <StatCard
              title="Nombre de ventes"
              value={statsCDF.salesCount.toLocaleString()}
              icon={<ShoppingCart className="w-8 h-8 text-blue-600" />}
              description="Total des ventes réalisées"
              color="text-blue-600"
            />
            <StatCard
              title="Bénéfices totaux"
              value={`${returnFormatedMoney(statsCDF.totalProfit)}`}
              icon={<Banknote className="w-8 h-8 text-green-600" />}
              description="Somme totale des bénéfices"
              color="text-green-600"
              currency="CDF"
            />
            <StatCard
              title="Solde disponible"
              value={`${returnFormatedMoney(statsCDF.availableBalance)}`}
              icon={<Wallet className="w-8 h-8 text-yellow-600" />}
              description="Montant disponible pour retrait"
              color="text-yellow-600"
              currency="CDF"
            />
          </div>
        )}

        {/* Bouton retirer */}
        <div className="flex flex-col items-center">
          <Button
            onClick={handleWithdraw}
            disabled={true /* loading || stats.availableBalance <= 0 */}
            className="inline-flex items-center gap-2 px-8 py-3 font-semibold"
          >
            <ArrowUpRight className="w-5 h-5" />
            {loading ? "Traitement..." : "Retirer mon gain"}
          </Button>
          {message && (
            <p className="mt-3 text-sm text-indigo-700 font-medium">
              {message}
            </p>
          )}
        </div>

        <Separator />

        {/* Table historique des retraits */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900">
            <Clock className="w-6 h-6 text-gray-500" />
            Historique des retraits
          </h2>

          {stats.withdrawalHistory.length === 0 ? (
            <p className="text-gray-500">
              Aucun retrait effectué pour le moment.
            </p>
          ) : (
            <div className="rounded-md border border-gray-200 bg-white shadow-sm overflow-x-auto">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>

                <TableBody>
                  {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        className="hover:bg-gray-50 cursor-default"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        Aucun résultat.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
        <div className="flex items-center justify-end space-x-2 py-4">
          {/* <div className="flex-1 text-sm text-muted-foreground">
                  {table.getFilteredSelectedRowModel().rows.length} of{" "}
                  {table.getFilteredRowModel().rows.length} row(s) selected.
                </div> */}
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Precedent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Suivant
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

// RADIO SELECT
export function CurrencyRadioGroup({
  value,
  onChange,
}: CurrencyRadioGroupProps) {
  return (
    <RadioGroup
      value={value}
      onValueChange={onChange}
      className="flex space-x-6"
    >
      <RadioGroupItem value="USD" id="currency-usd" className="sr-only" />
      <Label
        htmlFor="currency-usd"
        className={`flex cursor-pointer items-center space-x-2 rounded-md border px-4 py-2 transition 
          ${
            value === "USD"
              ? "border-blue-600 bg-blue-50 text-blue-700"
              : "border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
      >
        <DollarSign className="h-5 w-5" />
        <span>USD</span>
      </Label>

      <RadioGroupItem value="CDF" id="currency-cdf" className="sr-only" />
      <Label
        htmlFor="currency-cdf"
        className={`flex cursor-pointer items-center space-x-2 rounded-md border px-4 py-2 transition 
          ${
            value === "CDF"
              ? "border-green-600 bg-green-50 text-green-700"
              : "border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
      >
        <Banknote className="h-5 w-5" />
        <span>CDF</span>
      </Label>
    </RadioGroup>
  );
}
