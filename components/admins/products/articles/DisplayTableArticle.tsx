"use client";
import React, { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  VisibilityState,
  ColumnFiltersState,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";
import { Article } from "@prisma/client";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { returnDataValue } from "@/utils/functions";
import { ColorsData } from "@/utils/dataAdd";
import { ModifyArticle, PertesWithoutHOrders } from "./AddOrModifyArticle";
import { toast } from "sonner";
import { deleteItemForProduct } from "@/actions/actions";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

// delete component
const ActionsCell = ({ article }: { article: Article }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  // add state
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const result = await deleteItemForProduct(article.productId, article.id);

      if (result.error) {
        toast.error("Erreur survenue", {
          description: result.message,
        });
      }
      toast.success(result.message);
      router.refresh();
    } catch (error) {
      toast.error("Erreur survenue", {
        description: "Impossible d'effectuer cette action!",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => {
              navigator.clipboard.writeText(article.id);
            }}
          >
            Copier le numero de commande
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          {/* Loss Perte */}
          <DropdownMenuItem className="text-destructive" asChild>
            <PertesWithoutHOrders article={article} />
          </DropdownMenuItem>

          <DropdownMenuItem
            // onClick={() => {
            //   setIsOpen(true); // Ouvre l'AlertDialog
            // }}
            asChild
          >
            {/* Render ModifyArticle outside DropdownMenu */}
            <ModifyArticle
              article={article}
              // open={isOpen}
              // onOpenChange={setIsOpen}
            />
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={loading || !article}
            onClick={() => handleDelete()}
            className="text-red-500 hover:text-red-600 hover:cursor-pointer"
          >
            {`Supprimer l'article`}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export const ArticlesColumns: ColumnDef<Article>[] = [
  {
    accessorKey: "id", // tu peux garder ou enlever cette clé selon la config de ta table
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        №
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="uppercase">
        {(row.index + 1).toString().padStart(2, "0")}
      </div>
    ),
  },
  {
    accessorKey: "color",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Couleur
          <ArrowUpDown className="ml-2 h-4 w-4 capitalize" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize">
        {returnDataValue(row.getValue("color"), ColorsData)}
      </div>
    ),
  },
  {
    accessorKey: "size",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Taille(Volume)
          <ArrowUpDown className="ml-2 h-4 w-4 ca" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="uppercase">{row.getValue("size")}</div>,
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => {
      return <div>{row.getValue("stock")}</div>;
    },
  },

  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const article = row.original;
      return <ActionsCell article={article} />;
    },
  },
];

export function ArticlesDataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
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

  const articles = data as Article[];

  const uniqueColors = Array.from(new Set(articles.map((dt) => dt.color)));

  return (
    <div className="rounded-md border p-2 ">
      {/* filter top */}
      <div className="flex items-center py-4">
        <Input
          placeholder="Filtrer par la taille(volume)..."
          value={(table.getColumn("size")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("size")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />

        {/* select role */}
        <Select
          onValueChange={(value) => {
            // if value is "all", then clear the filter
            if (value === "all") {
              table.getColumn("color")?.setFilterValue(undefined);
            } else {
              table.getColumn("color")?.setFilterValue(value);
            }
          }}
        >
          <SelectTrigger className="max-w-xs mx-4">
            <SelectValue placeholder="Filtrer par couleur..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les couleurs</SelectItem>
            {uniqueColors.map((role) => (
              <SelectItem key={role} value={role!} className="capitalize">
                {returnDataValue(role!, ColorsData)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* colonnes */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Colonnes <ChevronDown className="ml-2 h-4 w-4" />
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

      {/* table colonne */}
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Pas resultats.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        {/* <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} sur{" "}
            {table.getFilteredRowModel().rows.length} ligne(s) selectionnée(s).
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
