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
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

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

import { returnFormatedMoney } from "@/utils/functions";

import { toast } from "sonner";
import { Order, OrderItem } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

export type OrderstableType = Order & {
  orderItems: OrderItem;
  //   shop: Shop;
  //   user: User;
  shopName: string;
  shopId: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  quantity: number;
};

export const columns: ColumnDef<OrderstableType>[] = [
  {
    accessorKey: "id",
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
    cell: ({ row }) => <div className="">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "userName",
    header: "Client",
    cell: ({ row }) => <div className="">{row.getValue("userName")}</div>,
  },
  {
    accessorKey: "paymentStatus",
    header: () => <div className="">Status paiement</div>,
    cell: ({ row }) => {
      const data = row.original;
      // const refNumber = data["paymentRefRefund"];
      const paymentStatus = data.status;

      return (
        <Badge
          className="font-medium capitalize"
          variant={
            paymentStatus === "annulé"
              ? "destructive"
              : paymentStatus.includes("en cours") ||
                  paymentStatus.includes("en attente")
                ? "outline"
                : paymentStatus === "livré"
                  ? "default"
                  : "secondary"
          }
        >
          {paymentStatus}
        </Badge>
      );
    },
  },
  {
    accessorKey: "quantity",
    header: () => <div className="">Quantité</div>,
    cell: ({ row }) => {
      const quantity = row.getValue("quantity") ?? 0;

      // Format 2 digits number
      const formatted = quantity.toString().padStart(2, "0");

      return <div className="">{formatted}</div>;
    },
  },

  {
    accessorKey: "totalAmount",
    header: () => <div className="">Prix total</div>,
    cell: ({ row }) => {
      const order = row.original;
      const totalAmount = order.totalAmount ?? 0;

      // Format 2 digits number
      const formatted = returnFormatedMoney(totalAmount);

      const currencySimbol = order.currency === "USD" ? "$" : "CDF";

      return (
        <div className=" font-semibold">
          {formatted} <span className="text-xs">{currencySimbol}</span>
        </div>
      );
    },
  },

  {
    accessorKey: "createdAt",
    header: () => <div className="text-right">Commandé le</div>,
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
      const order = row.original;

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
                navigator.clipboard.writeText(order.id);
                toast.success(
                  "L'ID de commande a été copié dans le presse-papier"
                );
              }}
            >
              {` Copier l'ID`}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link
                href={`/commandes/id/${order.id}`}
              >{`Voire la commande`}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>Supprimer</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function DataTableClientsOrders({ data }: { data: OrderstableType[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 12,
  });

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

  const uniquesPaymentStatus = Array.from(
    new Set(data.map((dt) => dt.paymentStatus))
  );

  return (
    <div className="w-full">
      <div className="flex items-center py-4 flex-wrap gap-x-4 gap-y-2">
        {/* inpu text */}
        <Input
          placeholder="Filter Numero des commandes..."
          value={(table.getColumn("id")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("id")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />

        {/* select payment status */}
        <Select
          onValueChange={(value) => {
            // if value is "all", then clear the filter
            if (value === "all") {
              table.getColumn("paymentStatus")?.setFilterValue(undefined);
            } else {
              table.getColumn("paymentStatus")?.setFilterValue(value);
            }
          }}
        >
          <SelectTrigger className="md:max-w-xs ">
            <SelectValue placeholder="Filtrer par status de paiement..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les status</SelectItem>
            {uniquesPaymentStatus.map((role) => (
              <SelectItem key={role} value={role} className="capitalize">
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* print */}
        {/* <PrintHistoryOrders orders={data} /> */}

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
