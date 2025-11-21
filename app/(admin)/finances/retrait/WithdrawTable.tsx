"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Smartphone,
  Banknote,
  BadgeCheck,
  Timer,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { DatePicker } from "./DatePicker";
import { Label } from "@/components/ui/label";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ColumnDef,
  flexRender,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { ActionsTransaction } from "@/components/admins/finances/retrait/ActionsWithdraw";

export type Withdraw = {
  id: string;
  amount: number;
  currency: string;
  date: Date;
  exchange: number;
  status: "traité" | "annulé" | "non-traité" | string;
  paymentPhone: string | null;
  paymentName: string | null;
  transfertID: string | null;
  bankNumber: string | null;
};

type Props = {
  withdraw: Withdraw[];
  type: "benefit" | "delivery";
};

export const statusOptions = [
  { label: "Tous", value: "tous" },
  { label: "Traité", value: "traité" },
  { label: "Annulé", value: "annulé" },
  { label: "Non-traité", value: "non-traité" },
];

// Pour filtrer sur la date (affichage seulement YYYY-MM-DD)
export function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Formatage montant
export function formatMoney(amount: number, currency: string) {
  if (Number.isInteger(amount)) {
    // Entier → pas de décimales
    return (
      amount.toLocaleString("fr-FR") +
      " " +
      (currency === "USD" ? "$" : currency)
    );
  }

  // Float → garder 2 décimales sans arrondir
  const truncated = Math.floor(amount * 100) / 100;
  return (
    truncated.toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) +
    " " +
    (currency === "USD" ? "$" : currency)
  );
}

// Formatage badge status
export function statusBadge(status: string) {
  if (status === "traité")
    return (
      <Badge variant="default" className="gap-1">
        <BadgeCheck className="w-4 h-4" /> Traité
      </Badge>
    );
  if (status === "annulé")
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="w-4 h-4" /> Annulé
      </Badge>
    );
  return (
    <Badge variant="outline" className="gap-1">
      <Timer className="w-4 h-4" /> Non-traité
    </Badge>
  );
}

// Format court date
export function formatDate(date: Date) {
  try {
    return format(date, "dd/MM/yyyy", { locale: fr });
  } catch {
    return date.toLocaleDateString("fr-FR");
  }
}

// Pour filtrer sur la date précise
export function filterDate(itemDate: Date, selected?: Date) {
  return selected ? sameDay(new Date(itemDate), selected) : true;
}

// --------------------------
//           COMPOSANT
// --------------------------

export default function WithdrawTable({ withdraw, type }: Props) {
  // filtres
  const [statusFilter, setStatusFilter] = useState("tous");
  const [dateFilter, setDateFilter] = useState<Date | undefined>();

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10, // nombre de lignes par page
  });

  // filtre les données selon filtres
  const filteredData = useMemo(() => {
    return withdraw
      .filter((item) =>
        statusFilter === "tous" ? true : item.status === statusFilter
      )
      .filter((item) =>
        dateFilter ? sameDay(new Date(item.date), dateFilter) : true
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [withdraw, statusFilter, dateFilter]);

  // definition des columns tanstack
  const columns = useMemo<ColumnDef<Withdraw>[]>(
    () => [
      {
        accessorKey: "date",
        header: () => (
          <div className="flex flex-row items-center gap-1 select-none">
            <Calendar className="w-4 h-4" /> Date
          </div>
        ),
        cell: ({ row }) => {
          const date = row.original.date;

          return <span className="font-mono">{formatDate(date!)}</span>;
        },
        size: 110,
      },
      {
        accessorKey: "amount",
        header: () => <div className="text-right select-none">Montant</div>,
        cell: (info) => (
          <div className="font-semibold text-right">
            {formatMoney(info.row.original.amount, info.row.original.currency)}
          </div>
        ),
        size: 80,
        enableSorting: true,
      },
      {
        id: "paymentMethod",
        header: "Méthode de retrait",
        cell: ({ row }) =>
          row.original.paymentPhone ? (
            <div className="flex items-center gap-1">
              <Smartphone className="w-4 h-4 text-blue-600" />
              Mobile money
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Banknote className="w-4 h-4 text-green-600" />
              Banque
            </div>
          ),
        size: 120,
      },
      {
        accessorKey: "status",
        header: "Statut",
        cell: (info) => statusBadge(info.getValue() as string),
        size: 90,
        enableSorting: true,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <ActionsTransaction transaction={row.original} type={type} />
        ),
        size: 60,
      },
    ],
    [type]
  );

  // creation tableau tanstack avec pagination integrée
  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { pagination },
    onPaginationChange: setPagination,
    manualPagination: false,
  });

  return (
    <div className="w-full py-4 md:p-4 max-w-full overflow-x-hidden">
      <div className="flex flex-col md:flex-row gap-4 md:items-center mb-6 w-full">
        <div className="w-full md:w-1/2 flex items-center gap-2">
          <Label
            htmlFor="date-filter"
            className="whitespace-nowrap md:flex hidden"
          >
            Date du retrait
          </Label>
          <DatePicker
            value={dateFilter}
            onChange={setDateFilter}
            placeholder="Choisir une date"
            clearable
          />
        </div>

        <div className="w-full md:w-1/2 flex items-center gap-2">
          <Label htmlFor="status-filter" className="whitespace-nowrap hidden">
            Statut
          </Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="min-w-[140px]">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(({ label, value }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border bg-white shadow max-w-full">
        <Table className="min-w-[700px] w-full table-auto">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="whitespace-nowrap"
                    style={{ minWidth: header.getSize() }}
                  >
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
            {table.getRowModel().rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={table.getAllColumns().length}>
                  <div className="text-center py-8 text-muted-foreground">
                    Aucun retrait trouvé.
                  </div>
                </TableCell>
              </TableRow>
            )}
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() ? "selected" : undefined}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="whitespace-nowrap"
                    style={{ minWidth: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between space-x-4 mt-4 flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Précédent
        </Button>
        <span className="text-sm text-muted-foreground md:block hidden">
          Page {table.getState().pagination.pageIndex + 1} sur{" "}
          {table.getPageCount()}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Suivant
        </Button>
        <span className="text-sm text-muted-foreground md:hidden">
          Page {table.getState().pagination.pageIndex + 1} sur{" "}
          {table.getPageCount()}
        </span>
      </div>
    </div>
  );
}
