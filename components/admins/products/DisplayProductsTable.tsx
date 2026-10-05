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
import { Article } from "@/lib/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { deleteObject, ref } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { ProductWithArticle } from "@/types/data";
import { returnDataValue, returnFormatedMoney } from "@/utils/functions";
import { CategoriesData } from "@/utils/data";
import { capitalizeText } from "@/utils/shopFunctions";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ReasonForDeletedProduct } from "@/utils/dataAdd";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

// delete component
const ActionsCell = ({ product }: { product: ProductWithArticle }) => {
  // print produit informations
  const handlePrintProduct = async () => {
    const printInfo = `ID: ${product.id}\nUID: ${
      product.uid
    }\nNom: ${capitalizeText(product.name)}\nCatégorie: ${capitalizeText(
      returnDataValue(product.category, CategoriesData),
    )}\n`;

    // Ouvrir une nouvelle fenêtre
    const printWindow = window.open("", "_blank");

    if (printWindow) {
      // Injecter le contenu dans la nouvelle fenêtre
      printWindow.document.open();
      printWindow.document.writeln(`
        <html>
          <head>
            <title>Impression Produit</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                margin: 20px;
              }
              pre {
                white-space: pre-wrap; /* Permet de gérer les retours à la ligne */
                word-wrap: break-word;
              }
            </style>
          </head>
          <body>
            <h1>Informations du Produit</h1>
            <pre>${printInfo}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();

      // Déclencher l'impression
      printWindow.print();

      // Optionnel : Fermer la fenêtre après impression
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    }
  };

  return (
    <DropdownMenu>
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
            handlePrintProduct();
            // navigator.clipboard.writeText(product.uid)
          }}
        >
          Imprimer les infos
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            window.location.href = `/produits/${product.id}`;
          }}
        >
          Voire
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            window.location.href = `/produits/${product.id}/articles`;
          }}
        >
          Articles
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <ProductToDelete product={product} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Delete product component
const ProductToDelete = ({ product }: { product: ProductWithArticle }) => {
  const [description, setDescription] = useState(
    "Le stock du produit etait inferieur à 1.",
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async (product: ProductWithArticle) => {
    setLoading(true);

    try {
      // delete images
      const images = [product.image, ...product.images];
      images.forEach(
        async (image) => image && (await deleteObject(ref(storage, image))),
      );
      const formData = {
        id: product.id,
        description,
      };

      if (product.category === "digital") {
        // delete digital files
        const digitalFiles = product.Article.map((article) => article.file);
        digitalFiles.forEach(
          async (file) => file && (await deleteObject(ref(storage, file))),
        );
      }

      // send to backend
      const response = await fetch("/api/admins/products/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        toast.error("Erreur lors de la suppression du produit", {
          description:
            "Une erreur s'est produite lors de la suppression du produit, veuillez reessayez plus tard!",
        });
        throw new Error("Erreur lors de la suppression du produit");
      }

      const data = await response.json();

      if (data.error) {
        toast("Erreur lors de la suppression du produit", {
          description: data.error,
        });
        return;
      }

      toast.success("Le produit a été supprimé avec succès");

      router.refresh();
    } catch (error) {
      const err = error as Error;
      toast("Erreur lors de la suppression du produit", {
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger
        className="text-red-500 hover:text-red-600 hover:cursor-pointer
      text-sm px-2
      "
      >
        Supprimer
      </AlertDialogTrigger>
      <AlertDialogContent>
        {/* header */}
        <AlertDialogHeader>
          <AlertDialogTitle>Etes vous vraiment sur?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irreversible. La suppression de ce produit
            <strong> {capitalizeText(product.name)}</strong>, le supprimera de
            notre base de données à tout jamais.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* form desc */}
        <div className="w-full flex flex-col gap-3">
          {/* readson to delete */}
          <RadioGroup
            defaultValue={description}
            onValueChange={(val) => setDescription(val)}
          >
            {ReasonForDeletedProduct.map((reason, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <RadioGroupItem value={reason.value} id={reason.value} />
                <Label htmlFor={reason.value}>{reason.label} </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* footer btns */}
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading || !product}
            onClick={() => handleDelete(product)}
            className="bg-destructive hover:bg-red-600"
          >
            {loading ? "suppression..." : "Continuer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// NAME CELL
function ProductNameCell({ name }: { name: string }) {
  return (
    <div
      className="
        capitalize 
        whitespace-normal 
        wrap-break-word 
        overflow-hidden 

        max-w-[100px]       // mobile
        sm:max-w-40    // sm
        md:max-w-[200px]    // desktop  
        lg:md:max-w-[260px] // larger
        line-clamp-2        
      "
      title={name}
    >
      {name}
    </div>
  );
}

// Columns data
export const Productscolumns = (
  currencySymbol: string,
): ColumnDef<ProductWithArticle>[] => [
  {
    accessorKey: "uid",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          UID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="capitalize">{row.getValue("uid")}</div>,
  },
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => (
      <div className="lowercase">
        {row.getValue("image") ? (
          <Image
            src={row.getValue("image")}
            alt="image du produit"
            width={800}
            height={800}
            priority
            className="object-cover brightness-90 w-14 h-14"
            unoptimized
          />
        ) : (
          "Aucune image"
        )}
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nom
          <ArrowUpDown className="ml-2 h-4 w-4 capitalize" />
        </Button>
      );
    },
    cell: ({ row }) => <ProductNameCell name={row.getValue("name")} />,
  },
  {
    accessorKey: "category",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Categorie
          <ArrowUpDown className="ml-2 h-4 w-4 ca" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("category")}</div>
    ),
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => {
      const product = row.original as ProductWithArticle;
      const articles = product.Article;
      const totalQuantity = articles.reduce((acc: number, article: Article) => {
        return acc + article.stock;
      }, 0);

      return <div>{totalQuantity}</div>;
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("price"));

      // Format the amount as a dollar amount
      const formatted = returnFormatedMoney(amount) + ` ${currencySymbol}`;

      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    size: 80,
    cell: ({ row }) => {
      const product = row.original;
      return <ActionsCell product={product} />;
    },
  },
];

export function ProductDataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
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

  const products = data as ProductWithArticle[];

  const uniqueCategories = Array.from(
    new Set(products.map((dt) => dt.category)),
  );

  return (
    <div className="rounded-md border p-2 ">
      {/* filter top */}
      <div className="flex items-center py-4">
        <Input
          placeholder="Filtrer par nom..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />

        {/* select role */}
        <Select
          onValueChange={(value) => {
            // if value is "all", then clear the filter
            if (value === "all") {
              table.getColumn("category")?.setFilterValue(undefined);
            } else {
              table.getColumn("category")?.setFilterValue(value);
            }
          }}
        >
          <SelectTrigger className="max-w-xs mx-4">
            <SelectValue placeholder="Filtrer par categorie..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les categories</SelectItem>
            {uniqueCategories.map((role) => (
              <SelectItem key={role} value={role} className="capitalize">
                {role}
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
                          header.getContext(),
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
                className=""
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
