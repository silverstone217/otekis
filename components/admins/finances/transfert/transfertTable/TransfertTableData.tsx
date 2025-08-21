"use client";
import React, { useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Shop, WithdrawalHistory } from "@prisma/client";
import PrintWholeTransfertTable from "./PrintWholeTransfertTable";
import { toast } from "sonner";
import { FaSpinner } from "react-icons/fa";
import { PayShopsPopup, PayShopsPopupExcel } from "./PayShopsPopup";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  currencySymbol: "$" | "CDF";
  allWidithdraw: WithdrawalHistory[];
}

export function TransfertDataTable<TData, TValue>({
  columns,
  data,
  currencySymbol,
  allWidithdraw,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 12,
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const [loading, setLoading] = useState(false);

  const handleActualizeFinance = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/cron");

      if (!response.ok) {
        throw new Error(response.statusText);
        return;
      }
      await response.json();

      toast.success("Information actualisée avec succès!");
      location.reload();
    } catch (error) {
      console.log(error);
      toast.error("Une erreur est survenue, veuiller reessayer plus tard.");
    } finally {
      setLoading(false);
    }
  };

  // Extraire catégories uniques pour le filtre
  const shops = data as Shop[];
  //   const uniqueCategories = Array.from(new Set(shops.map((b) => b.category)));
  const currency = currencySymbol === "$" ? "USD" : "CDF";
  return (
    <div className="w-full">
      {/* Filtres */}
      <div className="flex flex-wrap sm:flex-row sm:items-center gap-4 py-3">
        {/* actualise transaction */}
        <Button
          onClick={handleActualizeFinance}
          disabled={loading}
          className=""
        >
          {loading ? <FaSpinner className="animate-spin" /> : <RefreshCw />}
          Actualiser les transactions
        </Button>

        {/* Excel */}
        <PayShopsPopupExcel allWidithdraw={allWidithdraw} currency={currency} />

        {/* create withdraw history */}
        <PayShopsPopup shops={shops} currency={currency} />
        {/* Filtre par nom */}
        <Input
          aria-label="Filtrer par nom"
          placeholder="Filtrer par nom..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(e) =>
            table.getColumn("name")?.setFilterValue(e.target.value)
          }
          className="max-w-sm"
          type="search"
          spellCheck={false}
          autoComplete="off"
        />
        {/* imprimer */}
        <PrintWholeTransfertTable
          shops={shops}
          currencySymbol={currencySymbol}
        />
      </div>

      {/* Table */}
      <div className="rounded-md border border-border shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="select-none">
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
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
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
                  className="h-24 text-center text-muted-foreground"
                >
                  Aucun résultat
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-2 py-4">
        <div className="text-sm text-muted-foreground">
          Page {pagination.pageIndex + 1} sur {table.getPageCount()}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Page précédente"
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Page suivante"
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}
