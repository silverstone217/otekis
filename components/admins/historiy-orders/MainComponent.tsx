"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  Printer,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { isEmptyString, returnDataValue } from "@/utils/functions";
import { capitalizeText } from "@/utils/shopFunctions";
import { toast } from "sonner";
import { useState } from "react";

export type HistoryOdersType = {
  id: string;
  name: string;
  productId: string;
  orderId: string | null;
  stock: number | undefined;
  createdAt: Date;
  orderNumber: string;
};

export const columns: ColumnDef<HistoryOdersType>[] = [
  {
    accessorKey: "orderNumber",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Numero de commandes
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="uppercase">{row.getValue("orderNumber")}</div>
    ),
  },
  {
    accessorKey: "name",
    header: "Produit",
    cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
  },

  {
    accessorKey: "stock",
    header: () => <div className="">Stock</div>,
    cell: ({ row }) => {
      const stock = row.getValue("stock") ?? 0;

      // Format 2 digits number
      const formatted = stock.toString().padStart(2, "0");

      return <div className=" font-medium">{formatted}</div>;
    },
  },

  {
    accessorKey: "createdAt",
    header: () => <div className="text-right">Ajouté le</div>,
    cell: ({ row }) => {
      const date: Date = row.getValue("createdAt");

      // Format Date
      const formatted = date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },

  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const item = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(item.id);
                toast.success(
                  "L'ID de paiement a été copié dans le presse-papier"
                );
              }}
            >
              {` Copier l'ID`}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                location.replace("/produits/" + item.productId + "/articles")
              }
            >{`Voire l'article`}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function DataTableHistoryOrders({ data }: { data: HistoryOdersType[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 12 });

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4 flex-wrap gap-x-4 gap-y-2">
        {/* inpu text */}
        <Input
          placeholder="Filter Numero des commandes..."
          value={
            (table.getColumn("orderNumber")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("orderNumber")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />

        {/* print */}
        <PrintHistoryOrders orders={data} />

        {/* columns */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Colonnes <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
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
    </div>
  );
}

// Dialog print historique commandes
type PrintHistoryOrdersType = {
  orders: HistoryOdersType[];
};

const PrintHistoryOrders = ({ orders }: PrintHistoryOrdersType) => {
  const [numberOrder, setNumberOrder] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const ordersToPrint = React.useMemo(
    () =>
      orders &&
      orders.filter((ord) =>
        ord.orderNumber
          .trim()
          .toLocaleLowerCase()
          .includes(numberOrder.trim().toLocaleLowerCase())
      ),
    [numberOrder, orders]
  );

  // handle print data

  const handlePrint = async () => {
    setLoading(true);
    if (ordersToPrint && ordersToPrint.length > 0) {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.error("Erreur survenue", {
          description:
            "Impossible d'ouvrir la fenêtre d'impression. Veuillez vérifier que les pop-ups sont autorisés.",
        });
        return;
      }
      printWindow.document.open();
      const htmlContent = `
          <html>
            <head>
              <title>Liste d'historiques de commandes à imprimer</title>
              <style>
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                th { background: #f7f7f7; }
              </style>
            </head>
            <body>
              <h2>Liste d'historiques de commande (${ordersToPrint.length
                .toLocaleString()
                .padStart(2, "0")}) </h2>
              <table>
                <thead>
                  <tr>
                    <th>№</th>
                    <th>Numero de commande</th>
                    <th>Nom du produit</th>
                    <th>Stock</th>
                    <th>Date d'ajout</th>
                  </tr>
                </thead>
                <tbody>
                  ${ordersToPrint
                    .map(
                      (p, idx) => `
                        <tr>
                          <td>${(idx + 1)
                            .toLocaleString()
                            .padStart(2, "0")}</td>
                          <td>${p.orderNumber.toUpperCase() || ""}</td>
                          <td>${capitalizeText(p.name)}</td>
                          <td>${p.stock?.toLocaleString().padStart(2, "0")}</td>
                          <td>${p.createdAt.toLocaleDateString("fr-Fr")}</td>
                        </tr>
                      `
                    )
                    .join("")}
                </tbody>
              </table>
            </body>
          </html>
        `;
      printWindow.document.writeln(htmlContent);

      printWindow.document.close();

      // Déclencher l'impression
      printWindow.print();

      printWindow.onafterprint = () => {
        printWindow.close();
        //   setSelection("");
        //   setSelected("");
        //   setProducts([]);
        window.location.reload();
      };
    }
    setLoading(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={"outline"}
          className="flex items-center justify-center gap-2"
        >
          <Printer className="shrink-0" />
          <span>Imprimer</span>
        </Button>
      </DialogTrigger>

      {/* content */}
      <DialogContent className="p-8">
        <DialogHeader>
          <DialogTitle>Impression des historiques de commandes</DialogTitle>
          <DialogDescription>
            Entrer le numero de commande ci-dessous pour imprimer une liste.
          </DialogDescription>
        </DialogHeader>

        {/* input and btn */}

        <div className="w-full flex flex-col gap-4">
          {/* input */}
          <Input
            type="text"
            placeholder="Numero de commande"
            autoCapitalize="off"
            autoComplete="historique de commande"
            autoCorrect="off"
            minLength={1}
            value={numberOrder}
            onChange={(e) => setNumberOrder(e.target.value)}
            disabled={loading}
          />

          <div className="w-full flex items-center justify-end gap-x-4 gap-y-2">
            {/* button print */}
            <DialogClose asChild disabled={loading}>
              <Button
                variant={"outline"}
                className="flex items-center justify-center gap-2"
              >
                <X className="shrink-0" />
                <span>Annuler</span>
              </Button>
            </DialogClose>

            {/* button print */}
            <DialogClose
              asChild
              disabled={loading || isEmptyString(numberOrder)}
              onClick={handlePrint}
            >
              <Button className="flex items-center justify-center gap-2">
                <Printer className="shrink-0" />
                <span>Imprimer</span>
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
